import type { ImageMetadata } from 'astro';

/**
 * Your photo is optional at build time: drop `me.jpg` (or .jpeg/.png/.webp)
 * into src/assets and it appears in the hero and About. Until then, a
 * visible placeholder renders instead.
 */
const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/me.{jpg,jpeg,png,webp}', {
  eager: true,
});

export const photo: ImageMetadata | undefined = Object.values(files)[0]?.default;

/** Hero artwork: you on a dark brush stroke, transparent canvas (1000×860). */
const heroFiles = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/shahryar-brush-dark.{png,webp}',
  { eager: true },
);
export const heroPhoto: ImageMetadata | undefined = Object.values(heroFiles)[0]?.default ?? photo;

/**
 * The same artwork with the paint lifted to #1F4D54, for the dark theme: the
 * original paint is exactly the dark page colour (#0F2A2E) and would vanish.
 */
const heroDarkFiles = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/shahryar-brush-light.{png,webp}',
  { eager: true },
);
export const heroPhotoOnDark: ImageMetadata | undefined = Object.values(heroDarkFiles)[0]?.default;

export const PHOTO_ALT = 'Shahryar, DevOps and Cloud Engineer';
