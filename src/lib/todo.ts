/**
 * Content placeholders are written in square brackets, e.g. "[surname]".
 * They render with a visible TODO style and are listed by `npm run todos`.
 */
const TODO_RE = /\[[^\]\n]+\]/g;

const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string,
  );

export const hasTodo = (value: unknown): boolean =>
  typeof value === 'string' && /\[[^\]\n]+\]/.test(value);

/** Escaped HTML with every [placeholder] wrapped in <span class="todo">. */
export const todoHtml = (value: string): string =>
  escapeHtml(value).replace(TODO_RE, (m) => `<span class="todo">${m}</span>`);

/** For places that can't show a placeholder (titles, meta tags): drop it. */
export const clean = (value: string | undefined): string => (value && !hasTodo(value) ? value : '');

export const isHttpUrl = (value: string | undefined): value is string =>
  !!value && /^https?:\/\//.test(value) && !hasTodo(value);

export const isEmail = (value: string | undefined): value is string =>
  !!value && /^[^\s@[\]]+@[^\s@[\]]+\.[^\s@[\]]+$/.test(value);
