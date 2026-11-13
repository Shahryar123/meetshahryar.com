/**
 * Icons for project panels and the Selected work ring. WorkIcon.astro maps
 * each id to a Lucide icon; content files name one with `icon`.
 */
export const WORK_ICONS = [
  'cloud',
  'migrate',
  'shield',
  'box',
  'sparkles',
  'chat',
  'chart',
  'mail',
  'globe',
  'phone',
  'pen-tool',
  'pencil',
  'search',
  'scan-face',
  'key',
  'server',
] as const;

export type WorkIconId = (typeof WORK_ICONS)[number];
