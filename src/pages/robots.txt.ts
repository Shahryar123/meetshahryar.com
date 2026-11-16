import type { APIRoute } from 'astro';

/** Allow everything; point crawlers at the sitemap and LLM tools at llms.txt. */
export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://example.com');
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${new URL('sitemap-index.xml', base)}`,
    '',
    `# Plain-text summary for LLMs: ${new URL('llms.txt', base)}`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
