/**
 * Builds the docs app for GitHub Pages: `npm run docs:pages -- /angular-starter/`.
 * The argument is the base href, i.e. the path the site is served under (`/<repository>/` for a
 * project site; `/` for a user site or a custom domain).
 */
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { finalizeForPages, normalizeBaseHref } from './docs-pages.lib.mjs';

const ROOT = join(import.meta.dirname, '..');
const baseHref = normalizeBaseHref(process.argv[2]);

const build = spawnSync('npx', ['ng', 'build', 'docs', '--base-href', baseHref], {
  cwd: ROOT,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

const out = join(ROOT, 'dist/docs/browser');
finalizeForPages(out);
console.log(`\nDocs ready for GitHub Pages in ${out} (base href ${baseHref})`);
