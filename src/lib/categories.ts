/**
 * The one list of work areas. Hero nodes, service rows, work filters and
 * project tags all read from here, so their names can never drift apart.
 * Order = card order in the hero.
 */
export const CATEGORIES = [
  { id: 'cloud', label: 'Cloud & DevOps' },
  { id: 'security', label: 'Security' },
  { id: 'ai', label: 'AI & RAG' },
  { id: 'data', label: 'Data' },
  { id: 'web', label: 'Web' },
  { id: 'automation', label: 'Automation & QA' },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id) as [CategoryId, ...CategoryId[]];

export const categoryLabel = (id: CategoryId): string =>
  CATEGORIES.find((c) => c.id === id)?.label ?? id;
