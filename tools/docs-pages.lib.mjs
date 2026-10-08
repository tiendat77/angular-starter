import { copyFileSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * "/angular-starter", "angular-starter/" or "/" become "/angular-starter/" or "/": the form Angular's
 * `--base-href` needs (a leading and a trailing slash).
 */
export function normalizeBaseHref(input) {
  const trimmed = (input ?? '/').trim().replace(/^\/+|\/+$/g, '');
  return trimmed ? `/${trimmed}/` : '/';
}

/**
 * Makes a built Angular app (`dist/<app>/browser`) deployable to GitHub Pages:
 * - `404.html`: a copy of `index.html`. Pages has no SPA fallback, it serves `404.html` for any path
 *   it does not know (e.g. a reload on `/angular-starter/button`), and the router takes it from there.
 * - `.nojekyll`: stops Pages from running Jekyll over the files.
 */
export function finalizeForPages(dir) {
  const index = join(dir, 'index.html');
  if (!existsSync(index)) {
    throw new Error(`No index.html in ${dir}: build the app first.`);
  }
  copyFileSync(index, join(dir, '404.html'));
  writeFileSync(join(dir, '.nojekyll'), '');
}
