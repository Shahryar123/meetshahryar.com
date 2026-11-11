import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORY_IDS } from './lib/categories';

/**
 * A placeholder for content you haven't written yet, e.g. "[year]".
 * Any field that accepts `todo` renders it with a visible TODO style,
 * and `npm run todos` lists every one left in src/content.
 */
const todo = z.string().regex(/^\[.+\]$/, 'Placeholders look like "[something]"');

const category = z.enum(CATEGORY_IDS);
const url = z.url().or(todo);
const yearMonth = z
  .string()
  .regex(/^\d{4}-\d{2}$/, 'Use YYYY-MM')
  .or(todo);

/** Featured projects: each one gets a case study at /work/<file name>/. */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      client: z.string(),
      confidential: z.boolean().default(false),
      year: z.number().int().or(todo),
      categories: z.array(category).min(1),
      role: z.string(),
      /** What it is, in one or two lines. Shown in the work index. */
      summary: z.string(),
      /** The headline result for the case study. Real numbers only. */
      result: z.string(),
      timeline: z.string().optional(),
      problem: z.string(),
      approach: z.array(z.string()).min(1),
      results: z.array(z.string()).default([]),
      stack: z.array(z.string()).min(1),
      links: z
        .object({ live: url.optional(), repo: url.optional(), demo: url.optional() })
        .default({}),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      featured: z.boolean().default(true),
      /** Position in the work index, lowest first. */
      order: z.number().int(),
    }),
});

/** Smaller projects, listed under "More work" without a case study. */
const moreWork = defineCollection({
  loader: file('./src/content/more-work.yaml'),
  schema: z.object({
    order: z.number().int(),
    title: z.string(),
    summary: z.string(),
    categories: z.array(category).min(1),
    year: z.number().int().or(todo).optional(),
    status: z.string().optional(),
    url: url.optional(),
  }),
});

const services = defineCollection({
  loader: file('./src/content/services.yaml'),
  schema: z.object({
    // The entry id must be a category id (cloud, security, ai, data, web, automation).
    name: z.string(),
    summary: z.string(),
    /** One line, shown when a hero node is hovered or focused. */
    tooltip: z.string(),
    deliverables: z.array(z.string()).min(1),
    tools: z.array(z.string()).min(1),
    proofProjects: z.array(reference('projects')).default([]),
  }),
});

const experience = defineCollection({
  loader: file('./src/content/experience.yaml'),
  schema: z.object({
    order: z.number().int(),
    company: z.string(),
    role: z.string(),
    start: yearMonth,
    end: yearMonth.or(z.literal('present')),
    location: z.string().optional(),
    highlights: z.array(z.string()).min(1),
    stack: z.array(z.string()).default([]),
  }),
});

const education = defineCollection({
  loader: file('./src/content/education.yaml'),
  schema: z.object({
    order: z.number().int(),
    degree: z.string(),
    institution: z.string(),
    year: z.number().int().or(todo),
  }),
});

const certifications = defineCollection({
  loader: file('./src/content/certifications.yaml'),
  schema: ({ image }) =>
    z.object({
      order: z.number().int(),
      name: z.string(),
      issuer: z.string(),
      /** The site that issued it, when that isn't the issuer (e.g. Coursera). Cards are headed by this. */
      platform: z.string().optional(),
      issueDate: yearMonth,
      expiryDate: yearMonth.or(z.literal('none')).optional(),
      credentialId: z.string(),
      verifyUrl: url,
      badge: image().optional(),
      /** Scan of the certificate itself, shown as a thumbnail that links to the full image. */
      certificate: image().optional(),
    }),
});

const testimonials = defineCollection({
  loader: file('./src/content/testimonials.yaml'),
  schema: ({ image }) =>
    z.object({
      quote: z.string(),
      name: z.string(),
      role: z.string(),
      company: z.string(),
      photo: image().optional(),
      linkedin: z.url().optional(),
    }),
});

const faq = defineCollection({
  loader: file('./src/content/faq.yaml'),
  schema: z.object({ order: z.number().int(), question: z.string(), answer: z.string() }),
});

/** "How I work": a real sequence, so the steps are numbered. */
const process = defineCollection({
  loader: file('./src/content/process.yaml'),
  schema: z.object({
    order: z.number().int(),
    title: z.string(),
    body: z.string(),
    /** What the client has at the end of the step, shown as a chip, e.g. "Written plan + costs". */
    outcome: z.string().optional(),
    /** Set on the first step of each phase, e.g. "Plan & build"; shown as "Phase 1 · Plan & build". */
    phase: z.string().optional(),
  }),
});

/** Technical notes in MDX. The Writing section hides itself while this is empty. */
const writing = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    published: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

/** Single entry with id "main": who you are and how to reach you. */
const site = defineCollection({
  loader: file('./src/content/site.yaml'),
  schema: z.object({
    firstName: z.string(),
    surname: z.string(),
    title: z.string(),
    valueLine: z.string(),
    valueLineLong: z.string(),
    availability: z.string(),
    regions: z.string(),
    email: z.email().or(todo),
    location: z.object({ city: z.string(), country: z.string() }),
    /** IANA time zone for the live clock, e.g. "Europe/London". */
    timezone: z.string(),
    utcOffset: z.string(),
    employer: z.string(),
    links: z.object({
      github: z.url(),
      linkedin: url,
      calendly: url,
      repo: url,
    }),
    /** Paragraphs, or { quote } for a pull quote. */
    about: z.array(z.string().or(z.object({ quote: z.string() }))).min(1),
    /** About terminal: `ls clouds/` lists these as folders. */
    clouds: z.array(z.string()).min(1),
    contact: z.object({
      invitation: z.string(),
      budgets: z.array(z.string()).min(1),
    }),
  }),
});

export const collections = {
  projects,
  moreWork,
  services,
  experience,
  education,
  certifications,
  testimonials,
  faq,
  process,
  writing,
  site,
};
