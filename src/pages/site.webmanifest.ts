import type { APIRoute } from 'astro';
import { getSite } from '@/lib/site';
import { clean } from '@/lib/todo';

/** Web app manifest: name and icons for "Add to home screen". Icons come from `npm run images`. */
export const GET: APIRoute = async () => {
  const site = await getSite();
  const name = [site.firstName, clean(site.surname)].filter(Boolean).join(' ');
  const manifest = {
    name: `${name}, ${site.title}`,
    short_name: site.firstName,
    description: site.valueLine,
    start_url: '/',
    display: 'browser',
    background_color: '#e6efec',
    theme_color: '#0f2a2e',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { 'Content-Type': 'application/manifest+json' },
  });
};
