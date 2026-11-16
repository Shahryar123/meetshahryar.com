<?php
/**
 * Contact form endpoint: receives the form as JSON and emails it through the
 * Hostinger mailbox over authenticated SMTP (no libraries needed).
 *
 * Settings and the mailbox password live in contact-config.php, OUTSIDE the
 * web root, next to public_html (see server/contact-config.example.php):
 *   domains/<your-domain>/contact-config.php
 *   domains/<your-domain>/public_html/api/contact.php   <- this file
 * Until that file exists the endpoint answers 503, and the form tells the
 * visitor to use the email address on the page instead.
 *
 * Protection: POST + JSON only, same-origin check, honeypot, field limits,
 * header-injection-safe headers, and a per-IP rate limit.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');

function respond(int $status, array $body): never
{
    http_response_code($status);
    echo json_encode($body);
    exit;
}

// ---- Config ----------------------------------------------------------------

$configPath = getenv('CONTACT_CONFIG') ?: dirname(__DIR__, 2) . '/contact-config.php';
$config = is_file($configPath) ? require $configPath : null;
if (!is_array($config) || empty($config['smtp_host']) || empty($config['to']) || empty($config['from'] ?? $config['smtp_user'] ?? null)) {
    respond(503, ['ok' => false, 'error' => 'not_configured']);
}

// ---- Request checks --------------------------------------------------------

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, ['ok' => false, 'error' => 'method_not_allowed']);
}

// Only accept posts from this site's own pages (browsers always send Origin on fetch POST).
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = $config['allowed_origins'] ?? [];
$originHost = strtolower((string) parse_url($origin, PHP_URL_HOST));
$ownHost = strtolower(preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST'] ?? ''));
$originOk = $allowed ? in_array($origin, $allowed, true) : ($originHost !== '' && $originHost === $ownHost);
if (!$originOk) {
    respond(403, ['ok' => false, 'error' => 'forbidden']);
}

$raw = file_get_contents('php://input', false, null, 0, 20000);
$data = json_decode($raw ?: '', true);
if (!is_array($data)) {
    respond(400, ['ok' => false, 'error' => 'bad_request']);
}

// Honeypot filled: a bot. Pretend it worked.
if (trim((string) ($data['website'] ?? '')) !== '') {
    respond(200, ['ok' => true]);
}

// ---- Validation ------------------------------------------------------------

/** One-line field: control characters (including CR/LF) removed, trimmed, length-capped. */
function line(mixed $v, int $max): string
{
    $s = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', (string) $v) ?? '';
    return mb_substr(trim($s), 0, $max);
}

$name = line($data['name'] ?? '', 100);
$email = line($data['email'] ?? '', 254);
$projectType = line($data['projectType'] ?? '', 100);
$budget = line($data['budget'] ?? '', 100);
$message = trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]+/u', '', (string) ($data['message'] ?? '')) ?? '');

$errors = [];
if ($name === '') $errors[] = 'name';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'email';
if ($projectType === '') $errors[] = 'projectType';
if (mb_strlen($message) < 20 || mb_strlen($message) > 5000) $errors[] = 'message';
if ($errors) {
    respond(422, ['ok' => false, 'error' => 'invalid', 'fields' => $errors]);
}

// ---- Rate limit (per IP, file-based) ---------------------------------------

$limit = (int) ($config['rate_limit']['max'] ?? 5);
$window = (int) ($config['rate_limit']['window'] ?? 3600);
$dir = $config['rate_limit_dir'] ?? (dirname($configPath) . '/contact-ratelimit');
if (!is_dir($dir)) @mkdir($dir, 0700, true);
if (!is_dir($dir) || !is_writable($dir)) $dir = sys_get_temp_dir();

$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$file = $dir . '/rl-' . hash('sha256', $ip . '|contact') . '.json';
$now = time();
$fh = fopen($file, 'c+');
if ($fh) {
    flock($fh, LOCK_EX);
    $hits = json_decode(stream_get_contents($fh) ?: '[]', true) ?: [];
    $hits = array_values(array_filter($hits, fn ($t) => is_int($t) && $t > $now - $window));
    if (count($hits) >= $limit) {
        flock($fh, LOCK_UN);
        fclose($fh);
        header('Retry-After: ' . $window);
        respond(429, ['ok' => false, 'error' => 'rate_limited']);
    }
    $hits[] = $now;
    ftruncate($fh, 0);
    rewind($fh);
    fwrite($fh, json_encode($hits));
    flock($fh, LOCK_UN);
    fclose($fh);
}

// ---- Compose ---------------------------------------------------------------

$from = $config['from'] ?? $config['smtp_user'];
$to = $config['to'];
// RFC 2047 encoded words, folded so no line passes 76 characters.
$encode = fn (string $s) => mb_encode_mimeheader($s, 'UTF-8', 'B', "\r\n");
$host = preg_replace('/[^a-z0-9.-]/i', '', $ownHost) ?: 'localhost';

$body = implode("\r\n", [
    'New message from the contact form on ' . $host,
    '',
    'Name:         ' . $name,
    'Email:        ' . $email,
    'Project type: ' . $projectType,
    'Budget:       ' . ($budget !== '' ? $budget : '(not given)'),
    '',
    'Message:',
    preg_replace('/\r\n?|\n/', "\r\n", $message),
    '',
    '--',
    'Reply to this email to answer ' . $name . ' directly.',
    'Sent ' . gmdate('Y-m-d H:i') . ' UTC from IP ' . $ip,
]);

$headers = [
    'Date: ' . date(DATE_RFC2822),
    'From: ' . $encode($config['from_name'] ?? 'Portfolio contact form') . ' <' . $from . '>',
    'To: <' . $to . '>',
    'Reply-To: ' . $encode($name) . ' <' . $email . '>',
    'Subject: ' . $encode('New enquiry: ' . $projectType . ' (' . $name . ')'),
    'Message-ID: <' . bin2hex(random_bytes(12)) . '@' . $host . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
];
$mime = implode("\r\n", $headers) . "\r\n\r\n" . rtrim(chunk_split(base64_encode($body), 76, "\r\n"));

// ---- Send over SMTP --------------------------------------------------------

/** Minimal SMTP client: SSL (465), STARTTLS (587) or plain (local testing), AUTH LOGIN. */
function smtp_send(array $c, string $from, string $to, string $mime): void
{
    $secure = $c['smtp_secure'] ?? 'ssl';
    $port = (int) ($c['smtp_port'] ?? ($secure === 'ssl' ? 465 : 587));
    $remote = ($secure === 'ssl' ? 'ssl://' : 'tcp://') . $c['smtp_host'] . ':' . $port;
    $ctx = stream_context_create(['ssl' => ['verify_peer' => true, 'verify_peer_name' => true]]);
    $s = @stream_socket_client($remote, $errno, $errstr, 15, STREAM_CLIENT_CONNECT, $ctx);
    if (!$s) throw new RuntimeException("connect failed: $errstr ($errno)");
    stream_set_timeout($s, 15);

    $read = function () use ($s): array {
        $text = '';
        while (($l = fgets($s, 1024)) !== false) {
            $text .= $l;
            if (strlen($l) < 4 || $l[3] !== '-') break; // last line of a multi-line reply
        }
        return [(int) substr($text, 0, 3), $text];
    };
    // $label replaces the command in error logs (keeps credentials and message text out of them).
    $cmd = function (?string $line, array $expect, ?string $label = null) use ($s, $read): void {
        if ($line !== null) fwrite($s, $line . "\r\n");
        [$code, $text] = $read();
        if (!in_array($code, $expect, true)) {
            throw new RuntimeException('SMTP ' . ($label ?? $line ?? 'greeting') . ' -> ' . trim($text));
        }
    };

    $ehlo = 'EHLO ' . (gethostname() ?: 'localhost');
    $cmd(null, [220]);
    $cmd($ehlo, [250]);
    if ($secure === 'starttls') {
        $cmd('STARTTLS', [220]);
        if (!stream_socket_enable_crypto($s, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            throw new RuntimeException('STARTTLS failed');
        }
        $cmd($ehlo, [250]);
    }
    if (!empty($c['smtp_user'])) {
        $cmd('AUTH LOGIN', [334]);
        $cmd(base64_encode($c['smtp_user']), [334], 'AUTH user');
        $cmd(base64_encode($c['smtp_pass'] ?? ''), [235], 'AUTH password');
    }
    $cmd("MAIL FROM:<$from>", [250]);
    $cmd("RCPT TO:<$to>", [250, 251]);
    $cmd('DATA', [354]);
    // Dot-stuffing: a line that starts with "." gets a second one.
    $cmd(preg_replace('/^\./m', '..', $mime) . "\r\n.", [250], 'message body');
    fwrite($s, "QUIT\r\n");
    fclose($s);
}

try {
    smtp_send($config, $from, $to, $mime);
} catch (Throwable $e) {
    error_log('contact.php: ' . $e->getMessage());
    respond(502, ['ok' => false, 'error' => 'send_failed']);
}

respond(200, ['ok' => true]);
