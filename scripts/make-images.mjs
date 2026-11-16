/**
 * Draws the social share image and the app icons into public/:
 *   og-image.png (1200×630), apple-touch-icon.png (180), icon-192.png,
 *   icon-512.png, icon-maskable-512.png, favicon.ico (32, PNG inside).
 *
 * Run `npm run images` after changing your name, title, value line or the hero
 * artwork. Text comes from src/content/site.yaml; the photo is
 * src/assets/shahryar-brush-dark.png. Uses Playwright's Chromium.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { parse } from 'yaml';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root));
const dataUri = async (path, type) =>
  `data:${type};base64,${(await read(path)).toString('base64')}`;

const site = parse(await read('src/content/site.yaml').then(String)).main;
const isTodo = (s) => typeof s === 'string' && /\[[^\]\n]+\]/.test(s);
const name = [site.firstName, isTodo(site.surname) ? '' : site.surname].filter(Boolean).join(' ');
const domain = new URL(
  /site:\s*'([^']+)'/.exec(await read('astro.config.mjs').then(String))?.[1] ??
    'https://example.com',
).host;

const font = await dataUri(
  'node_modules/@fontsource-variable/mona-sans/files/mona-sans-latin-wdth-normal.woff2',
  'font/woff2',
);
const photo = await dataUri('src/assets/shahryar-brush-dark.png', 'image/png');

const C = {
  page: '#e6efec',
  ink: '#0f2a2e',
  muted: '#4a6662',
  accent: '#1f6f6a',
  signal: '#ffb224',
};
const base = `
  @font-face { font-family: Mona; src: url(${font}) format('woff2'); font-weight: 200 900; font-stretch: 75% 125%; }
  * { box-sizing: border-box; margin: 0; }
  html, body { width: 100%; height: 100%; }
  body { font-family: Mona, sans-serif; color: ${C.ink}; -webkit-font-smoothing: antialiased; }
`;

const ogHtml = `<!doctype html><html><head><style>${base}
  body { background: ${C.page}; display: grid; grid-template-columns: 1fr 520px; overflow: hidden; }
  .text { padding: 78px 0 64px 76px; display: flex; flex-direction: column; }
  .bar { width: 72px; height: 9px; border-radius: 99px; background: ${C.signal}; }
  .eyebrow { margin-top: 20px; color: ${C.accent}; font-size: 22px; font-weight: 650; font-stretch: 112%; letter-spacing: 0.14em; text-transform: uppercase; }
  h1 { margin-top: 18px; font-size: 86px; line-height: 0.95; font-weight: 850; font-stretch: 112%; letter-spacing: -0.02em; }
  .line { margin-top: 28px; max-width: 30ch; color: ${C.muted}; font-size: 27px; line-height: 1.35; }
  .domain { margin-top: auto; font-size: 24px; font-weight: 650; }
  .photo { position: relative; }
  .photo img { position: absolute; width: 700px; left: -110px; bottom: -12px; }
</style></head><body>
  <div class="text">
    <div class="bar"></div>
    <p class="eyebrow">${site.title}</p>
    <h1>${name.replace(' ', '<br>')}</h1>
    <p class="line">${site.valueLine}</p>
    <p class="domain">${domain}</p>
  </div>
  <div class="photo"><img src="${photo}" alt=""></div>
</body></html>`;

/** The favicon's "S" tile. `inset` shrinks the letter for maskable icons (safe zone). */
const iconHtml = (rounded, inset = 1) => `<!doctype html><html><head><style>${base}
  body { display: grid; place-items: center; background: ${rounded ? 'transparent' : C.ink}; }
  .tile { width: 100%; height: 100%; display: grid; place-items: center; background: ${C.ink};
    border-radius: ${rounded ? '22%' : '0'}; }
  .s { color: ${C.page}; font-weight: 850; font-stretch: 125%; font-size: ${62 * inset}vw; line-height: 1; margin-top: -4%; }
</style></head><body><div class="tile"><span class="s">S</span></div></body></html>`;

const browser = await chromium.launch();
const shot = async (html, w, h, transparent = false) => {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot({ omitBackground: transparent });
  await page.close();
  return png;
};

const out = (file, buf) => writeFile(new URL(`public/${file}`, root), buf);

await out('og-image.png', await shot(ogHtml, 1200, 630));
// Apple adds its own rounded corners, so the touch icon is a full square.
await out('apple-touch-icon.png', await shot(iconHtml(false), 180, 180));
await out('icon-192.png', await shot(iconHtml(true), 192, 192, true));
await out('icon-512.png', await shot(iconHtml(true), 512, 512, true));
await out('icon-maskable-512.png', await shot(iconHtml(false, 0.7), 512, 512));

// favicon.ico for browsers and crawlers that request it directly: one 32px PNG inside.
const png32 = await shot(iconHtml(true), 32, 32, true);
const ico = Buffer.alloc(22);
ico.writeUInt16LE(0, 0); // reserved
ico.writeUInt16LE(1, 2); // type: icon
ico.writeUInt16LE(1, 4); // one image
ico.writeUInt8(32, 6); // width
ico.writeUInt8(32, 7); // height
ico.writeUInt16LE(1, 10); // colour planes
ico.writeUInt16LE(32, 12); // bits per pixel
ico.writeUInt32LE(png32.length, 14);
ico.writeUInt32LE(22, 18); // data offset
await out('favicon.ico', Buffer.concat([ico, png32]));

await browser.close();
console.log(
  'Wrote og-image.png, apple-touch-icon.png, icon-192/512.png, icon-maskable-512.png, favicon.ico to public/',
);
