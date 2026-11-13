/**
 * "More work" is shown as two rows of panels. Each project names its row with
 * `group` and its panel icon with `icon` (WorkIcon.astro draws it).
 * Order here = row order on the page.
 */
export const MORE_WORK_GROUPS = [
  { id: 'cloud-ai', label: 'Cloud, DevOps & AI' },
  { id: 'web-qa', label: 'Web, Automation & SEO' },
] as const;

export type MoreWorkGroupId = (typeof MORE_WORK_GROUPS)[number]['id'];

export const MORE_WORK_GROUP_IDS = MORE_WORK_GROUPS.map((g) => g.id) as [
  MoreWorkGroupId,
  ...MoreWorkGroupId[],
];

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
] as const;

export type WorkIconId = (typeof WORK_ICONS)[number];
