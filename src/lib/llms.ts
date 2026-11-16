/**
 * Builds /llms.txt and /llms-full.txt (https://llmstxt.org) from the same
 * content collections the site renders, so they never drift from the page.
 * Anything still a "[placeholder]" is left out.
 */
import { getCollection } from 'astro:content';
import { getSite } from '@/lib/site';
import { CATEGORY_IDS, categoryLabel } from '@/lib/categories';
import { clean, hasTodo, isEmail, isHttpUrl } from '@/lib/todo';

const filled = <T>(items: T[]) => items.filter((v) => !hasTodo(v));
const byOrder = <T extends { data: { order: number } }>(a: T, b: T) => a.data.order - b.data.order;
/** "2025-09" → "Sep 2025"; placeholders → "". */
const monthYear = (ym: string) => {
  if (ym === 'present') return 'present';
  if (hasTodo(ym)) return '';
  const date = new Date(`${ym}-01T00:00:00Z`);
  return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });
};

export async function buildLlmsTxt(siteUrl: URL, full: boolean): Promise<string> {
  const site = await getSite();
  const url = (path: string) => new URL(path, siteUrl).toString();
  const name = [site.firstName, clean(site.surname)].filter(Boolean).join(' ');

  const [projects, moreWork, services, experience, education, certs, faq] = await Promise.all([
    getCollection('projects', (p) => p.data.featured),
    getCollection('moreWork'),
    getCollection('services'),
    getCollection('experience'),
    getCollection('education'),
    getCollection('certifications'),
    getCollection('faq'),
  ]);

  const out: string[] = [];
  const line = (s = '') => out.push(s);

  line(`# ${name}`);
  line();
  line(`> ${name} is a ${site.title} based in ${site.location.city}, ${site.location.country} (${site.utcOffset}). ${site.valueLineLong}`);
  line();
  line(`Currently at ${site.employer}. Has worked with clients in the ${site.regions}.`);
  if (!hasTodo(site.availability)) line(`Availability: ${site.availability}.`);
  line();

  // ---- Services ----
  line('## Services');
  line();
  const categoryOrder = CATEGORY_IDS as readonly string[];
  services.sort((a, b) => categoryOrder.indexOf(a.id) - categoryOrder.indexOf(b.id));
  for (const s of services) {
    const summary = hasTodo(s.data.summary) ? '' : `: ${s.data.summary}`;
    line(`- [${s.data.name}](${url('/#services')})${summary}`);
    if (full) {
      const deliverables = filled(s.data.deliverables);
      const tools = filled(s.data.tools);
      if (deliverables.length) line(`  - Deliverables: ${deliverables.join('; ')}`);
      if (tools.length) line(`  - Tools: ${tools.join('; ')}`);
    }
  }
  line();

  // ---- Selected work ----
  line('## Selected work');
  line();
  for (const p of projects.sort(byOrder)) {
    const d = p.data;
    const client = d.confidential ? 'confidential client' : clean(d.client);
    const meta = [client, typeof d.year === 'number' ? String(d.year) : ''].filter(Boolean).join(', ');
    line(`- [${d.title}](${url('/#work')})${meta ? ` (${meta})` : ''}: ${d.summary}`);
    if (full) {
      line(`  - Areas: ${d.categories.map(categoryLabel).join(', ')}`);
      if (!hasTodo(d.role)) line(`  - Role: ${d.role}`);
      if (!hasTodo(d.problem)) line(`  - Problem: ${d.problem}`);
      line(`  - Approach: ${filled(d.approach).join('; ')}`);
      const results = filled([d.result, ...d.results]);
      if (results.length) line(`  - Results: ${results.join('; ')}`);
      line(`  - Stack: ${d.stack.join(', ')}`);
    }
  }
  line();

  if (full) {
    line('## More work');
    line();
    for (const m of moreWork.sort(byOrder)) {
      const stack = m.data.stack.length ? ` (${m.data.stack.join(', ')})` : '';
      // Drop inline placeholders such as "[your role]: " from the summary.
      const summary = m.data.summary.replace(/\[[^\]\n]+\]:?\s*/g, '').trim();
      line(`- ${m.data.title}: ${summary}${stack}`);
    }
    line();
  }

  // ---- Experience ----
  line('## Experience');
  line();
  for (const e of experience.sort(byOrder)) {
    const d = e.data;
    const dates = [monthYear(d.start), monthYear(d.end)].filter(Boolean).join(' – ');
    line(`- ${d.role}, ${d.company} (${dates})`);
    if (full) for (const h of filled(d.highlights)) line(`  - ${h}`);
  }
  line();

  // ---- Education & certifications ----
  line('## Education and certifications');
  line();
  for (const ed of education.sort(byOrder)) {
    const year = typeof ed.data.year === 'number' ? `, ${ed.data.year}` : '';
    line(`- ${ed.data.degree}, ${ed.data.institution}${year}`);
  }
  for (const c of certs.sort(byOrder)) {
    const issuer = c.data.platform ? `${c.data.issuer} via ${c.data.platform}` : c.data.issuer;
    const label = `${c.data.name} (${issuer}, ${monthYear(c.data.issueDate)})`;
    line(isHttpUrl(c.data.verifyUrl) ? `- [${label}](${c.data.verifyUrl})` : `- ${label}`);
  }
  line();

  if (full) {
    const answered = faq.sort(byOrder).filter((f) => !hasTodo(f.data.answer));
    if (answered.length) {
      line('## FAQ');
      line();
      for (const f of answered) {
        line(`### ${f.data.question}`);
        line();
        line(f.data.answer);
        line();
      }
    }
  }

  // ---- Contact ----
  line('## Contact');
  line();
  if (isEmail(site.email)) line(`- Email: ${site.email}`);
  line(`- [Contact form](${url('/#contact')})`);
  line(`- [GitHub](${site.links.github})`);
  if (isHttpUrl(site.links.linkedin)) line(`- [LinkedIn](${site.links.linkedin})`);
  if (isHttpUrl(site.links.calendly)) line(`- [Book a call](${site.links.calendly})`);
  line(`- [CV (PDF)](${url('/Muhammad_Shahryar_Software_Engineer.pdf')})`);
  line();

  if (!full) {
    line('## Optional');
    line();
    line(`- [Full version](${url('/llms-full.txt')}): every project, role highlight and FAQ answer in one file`);
    line();
  }

  return out.join('\n');
}

export const textResponse = (body: string) =>
  new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
