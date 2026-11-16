import type { APIRoute } from 'astro';
import { buildLlmsTxt, textResponse } from '@/lib/llms';

/** Everything in llms.txt plus project details, role highlights and the FAQ. */
export const GET: APIRoute = async ({ site }) =>
  textResponse(await buildLlmsTxt(site ?? new URL('https://example.com'), true));
