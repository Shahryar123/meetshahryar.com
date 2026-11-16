<?php
/**
 * Contact form settings. Copy this file to contact-config.php, fill it in, and
 * upload it NEXT TO public_html (never inside it), e.g. with hPanel File Manager:
 *
 *   domains/<your-domain>/contact-config.php      <- here
 *   domains/<your-domain>/public_html/            <- the site
 *
 * contact-config.php is git-ignored and never goes into the deploy zip.
 * Create the mailbox first in hPanel -> Emails.
 */
return [
    // Hostinger's outgoing mail server. Port 465 = SSL.
    'smtp_host' => 'smtp.hostinger.com',
    'smtp_port' => 465,
    'smtp_secure' => 'ssl', // 'ssl' (465) or 'starttls' (587)

    // The mailbox that sends the notifications, and its password.
    'smtp_user' => 'hello@your-domain.com',
    'smtp_pass' => 'mailbox-password-here',

    // Sender shown on the notification (must be the mailbox above for SPF/DKIM).
    'from' => 'hello@your-domain.com',
    'from_name' => 'Portfolio contact form',

    // Where enquiries are delivered. "Reply" answers the visitor directly.
    'to' => 'you@example.com',

    // Optional: exact origins allowed to post. Leave empty to allow only the
    // site's own host (works on the temporary domain and the real one).
    'allowed_origins' => [],

    // At most `max` messages per IP in `window` seconds.
    'rate_limit' => ['max' => 5, 'window' => 3600],

    // Optional: key for hashing IPs in the rate-limit records. Defaults to one
    // derived from the mailbox password. Any long random string works.
    // 'rate_limit_secret' => '',
];
