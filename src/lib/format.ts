import { hasTodo } from './todo';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2023-05" → "May 2023", "present" → "now"; placeholders pass through. */
export function formatMonth(value: string): string {
  if (value === 'present') return 'now';
  if (hasTodo(value)) return value;
  const m = /^(\d{4})-(\d{2})$/.exec(value);
  if (!m) return value;
  return `${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
}

/** "10 Nov 2026" */
export const formatDay = (date: Date) =>
  new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    date,
  );

/**
 * Astro's file loader returns entries sorted by id, not file order,
 * so lists that have a sequence carry an explicit `order` field.
 */
export const byOrder = <T extends { data: { order: number } }>(a: T, b: T) =>
  a.data.order - b.data.order;
