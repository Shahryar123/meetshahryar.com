/**
 * Content-Security-Policy for the static build, sent as a real HTTP header by
 * Hostinger (Apache/LiteSpeed) through dist/.htaccess.
 *
 * After `astro build`, this hashes every inline script in every HTML page and
 * replaces the `# @csp-header` line in dist/.htaccess with the policy. Hashes
 * change whenever a script changes, so the policy is rebuilt on every build.
 *
 * Why not Astro's built-in `security.csp`: it writes a <meta> tag (which can't
 * carry frame-ancestors) and hashes <style> blocks, which makes browsers ignore
 * 'unsafe-inline' and block the style="--var: …" attributes this site uses.
 *
 * Adding a third-party service (e.g. a form API)? Pass its origin in the
 * matching option, e.g. cspHtaccess({ connectSrc: ['https://api.web3forms.com'] }).
 */
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const MARKER = '# @csp-header';
const JS_TYPES = new Set(['', 'module', 'text/javascript', 'application/javascript']);

async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith('.html'))
    .map((e) => join(e.parentPath, e.name));
}

/** sha256 hashes of the inline (executable) scripts in one HTML document. */
function scriptHashes(html) {
  const hashes = [];
  for (const [, attrs = '', body] of html.matchAll(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
    if (/\ssrc\s*=/.test(attrs)) continue;
    const type = /\stype\s*=\s*["']?([^"'\s>]+)/.exec(attrs)?.[1]?.toLowerCase() ?? '';
    if (!JS_TYPES.has(type)) continue; // e.g. application/ld+json: data, not code
    hashes.push(`'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`);
  }
  return hashes;
}

/**
 * @param {{ connectSrc?: string[], imgSrc?: string[], scriptSrc?: string[], frameSrc?: string[] }} [options]
 * @returns {import('astro').AstroIntegration}
 */
export default function cspHtaccess(options = {}) {
  return {
    name: 'csp-htaccess',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const hashes = new Set();
        for (const file of await htmlFiles(root)) {
          for (const h of scriptHashes(await readFile(file, 'utf8'))) hashes.add(h);
        }

        const list = (...sources) => sources.flat().filter(Boolean).join(' ');
        const policy = [
          `default-src 'self'`,
          `script-src ${list("'self'", [...hashes].sort(), options.scriptSrc ?? [])}`,
          // style="" attributes (CSS variables) need 'unsafe-inline'; see the note above.
          `style-src 'self' 'unsafe-inline'`,
          `img-src ${list("'self'", 'data:', options.imgSrc ?? [])}`,
          `font-src 'self'`,
          `connect-src ${list("'self'", options.connectSrc ?? [])}`,
          `frame-src ${options.frameSrc?.length ? list(options.frameSrc) : "'none'"}`,
          `manifest-src 'self'`,
          `object-src 'none'`,
          `base-uri 'self'`,
          `form-action 'self'`,
          `frame-ancestors 'none'`,
          `upgrade-insecure-requests`,
        ].join('; ');

        const htaccessPath = join(root, '.htaccess');
        const htaccess = await readFile(htaccessPath, 'utf8');
        if (!htaccess.includes(MARKER)) {
          throw new Error(`csp-htaccess: "${MARKER}" line not found in public/.htaccess`);
        }
        await writeFile(
          htaccessPath,
          htaccess.replace(MARKER, `Header always set Content-Security-Policy "${policy}"`),
        );
        logger.info(`Content-Security-Policy written to .htaccess (${hashes.size} script hashes)`);
      },
    },
  };
}
