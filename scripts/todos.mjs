#!/usr/bin/env node
/**
 * Lists every content placeholder still to fill in.
 *
 * A placeholder is "[something]" inside a double-quoted string in
 * src/content (YAML files and MDX frontmatter). It also reports a missing
 * photo and missing project covers. Run: npm run todos
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const root = process.cwd();
const contentDir = join(root, 'src', 'content');

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

// A double-quoted string, or a single-quoted one that is exactly a placeholder.
const QUOTED = /"((?:[^"\\]|\\.)*)"|'(\[[^\]\n]+\])'/g;
const PLACEHOLDER = /\[[^\]\n]+\]/g;

const found = [];
for (const file of walk(contentDir).filter((f) => /\.(ya?ml|mdx?)$/.test(f))) {
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, index) => {
    if (line.trim().startsWith('#')) return;
    for (const quoted of line.matchAll(QUOTED)) {
      for (const match of (quoted[1] ?? quoted[2]).matchAll(PLACEHOLDER)) {
        found.push({
          file: relative(root, file).split(sep).join('/'),
          line: index + 1,
          placeholder: match[0],
        });
      }
    }
  });
}

const missing = [];
const photoExts = ['jpg', 'jpeg', 'png', 'webp'];
if (!photoExts.some((ext) => existsSync(join(root, 'src', 'assets', `me.${ext}`)))) {
  missing.push('src/assets/me.jpg (your photo, used in the hero and About)');
}
const projectsDir = join(contentDir, 'projects');
for (const file of readdirSync(projectsDir).filter((f) => /\.mdx?$/.test(f))) {
  const text = readFileSync(join(projectsDir, file), 'utf8');
  if (!/^cover:/m.test(text)) missing.push(`cover image for src/content/projects/${file}`);
}

const byFile = Object.groupBy(found, (t) => t.file);
for (const [file, items] of Object.entries(byFile)) {
  console.log(`\n${file}`);
  for (const t of items) console.log(`  ${String(t.line).padStart(4)}  ${t.placeholder}`);
}
if (missing.length) {
  console.log('\nMissing files');
  for (const m of missing) console.log(`        ${m}`);
}
console.log(`\n${found.length} placeholders, ${missing.length} missing files.`);
