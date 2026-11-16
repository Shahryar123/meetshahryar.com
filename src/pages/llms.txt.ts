import type { APIRoute } from 'astro';
import { buildLlmsTxt, textResponse } from '@/lib/llms';

/** Short summary for LLMs (https://llmstxt.org). */
export const GET: APIRoute = async ({ site }) =>
  textResponse(await buildLlmsTxt(site ?? new URL('https://example.com'), false));
