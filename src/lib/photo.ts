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

export const PHOTO_ALT = 'Shahryar, DevOps and Cloud Engineer';
