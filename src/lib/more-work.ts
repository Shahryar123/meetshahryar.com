/**
 * "More work" is shown as two rows of panels. Each project names its row with
 * `group`; icons are in work-icons.ts.
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
