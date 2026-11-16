import type { APIRoute } from 'astro';
import { getSite } from '@/lib/site';
import { isEmail } from '@/lib/todo';

/**
 * RFC 9116 security.txt: how to report a security problem with this site.
 * Expires is set a year after each build, so any deploy keeps it valid.
 */
export const GET: APIRoute = async ({ site: siteUrl }) => {
  const site = await getSite();
  const base = siteUrl ?? new URL('https://example.com');
  const expires = new Date();
  expires.setUTCFullYear(expires.getUTCFullYear() + 1);

  const lines = [
    ...(isEmail(site.email) ? [`Contact: mailto:${site.email}`] : []),
    `Contact: ${new URL('/#contact', base)}`,
    `Expires: ${expires.toISOString().replace(/\.\d{3}Z$/, 'Z')}`,
    'Preferred-Languages: en',
    `Canonical: ${new URL('/.well-known/security.txt', base)}`,
    '',
  ];
  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
