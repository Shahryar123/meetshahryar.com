import { execSync } from 'node:child_process';

/** Runs at build time only (imported from .astro frontmatter). */
const sh = (cmd: string) => {
  try {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return '';
  }
};

const fullSha = process.env.GITHUB_SHA || sh('git rev-parse HEAD');

export const build = {
  commit: fullSha.slice(0, 7) || 'unknown',
  fullSha,
  date: new Date(),
};
