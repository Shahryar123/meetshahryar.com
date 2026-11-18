// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import cspHtaccess from './integrations/csp-htaccess.mjs';

// Fontsource's Latin subset (includes General Punctuation for dashes and curly quotes).
/** @type {[string, ...string[]]} */
const LATIN = [
  'U+0000-00FF',
  'U+0131',
  'U+0152-0153',
  'U+02BB-02BC',
  'U+02C6',
  'U+02DA',
  'U+02DC',
  'U+0304',
  'U+0308',
  'U+0329',
  'U+2000-206F',
  'U+20AC',
  'U+2122',
  'U+2191',
  'U+2193',
  'U+2212',
  'U+2215',
  'U+FEFF',
  'U+FFFD',
];

export default defineConfig({
  // Production domain (confirmed 2026-11-17). Sitemap, robots.txt, llms.txt, share tags and JSON-LD use it.
  site: 'https://meetshahryar.com',
  integrations: [mdx(), sitemap({ filter: (page) => !page.includes('/certificates/') }), cspHtaccess()],
  fonts: [
    {
      // Self-hosted Mona Sans with both axes: wdth 75–125, wght 200–900.
      provider: fontProviders.local(),
      name: 'Mona Sans',
      cssVariable: '--font-mona',
      fallbacks: ['sans-serif'],
      options: {
        variants: [
          {
            src: ['@fontsource-variable/mona-sans/files/mona-sans-latin-wdth-normal.woff2'],
            weight: '200 900',
            style: 'normal',
            stretch: '75% 125%',
            display: 'swap',
            unicodeRange: LATIN,
          },
        ],
      },
    },
  ],
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Component scripts ship as .js files, never inline: fewer CSP hashes, and
      // the ClientRouter then has no reason to inject a data: script (blocked by the CSP).
      // Other assets keep Vite's default limit (undefined = default).
      assetsInlineLimit: (filePath) => (filePath.endsWith('.js') ? false : undefined),
    },
  },
});
