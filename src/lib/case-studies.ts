/**
 * Case-study pages (/work/<id>/) arrive in phase 4. Until a page exists in
 * src/pages/work/, links point at the Selected work section instead, so
 * nothing on the site leads to a 404.
 */
export const hasCaseStudies = Object.keys(import.meta.glob('/src/pages/work/*.astro')).length > 0;

export const caseStudyHref = (id: string): string => (hasCaseStudies ? `/work/${id}/` : '/#work');
