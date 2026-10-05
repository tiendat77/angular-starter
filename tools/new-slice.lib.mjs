/**
 * Pure logic of the slice generator (name rules and template rendering). The CLI in
 * `new-slice.mjs` only adds the file system and the process around it. Tested by
 * `new-slice.test.mjs` (`node --test tools/`).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

export const KINDS = ['page', 'feature', 'entity'];

const KEBAB_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

export function isKebab(name) {
  return KEBAB_PATTERN.test(name);
}

export function casings(name) {
  const words = name.split('-');
  const Pascal = words.map((w) => w[0].toUpperCase() + w.slice(1)).join('');
  return {
    kebab: name,
    Pascal,
    camel: Pascal[0].toLowerCase() + Pascal.slice(1),
    Title: words.join(' ').replace(/^./, (c) => c.toUpperCase()),
  };
}

/** Replaces `__name__` placeholders; an unknown one is an error, so template typos fail loudly. */
export function render(text, vars) {
  return text.replace(/__([A-Za-z]+)__/g, (match, key) => {
    if (!(key in vars)) {
      throw new Error(`Unknown placeholder ${match}`);
    }
    return vars[key];
  });
}

/** Validates the command line. */
export function resolveOptions({ kind, name }) {
  if (!KINDS.includes(kind)) {
    throw new Error(`Unknown kind "${kind}". Use one of: ${KINDS.join(', ')}.`);
  }
  if (!name || !isKebab(name)) {
    throw new Error(
      `"${name ?? ''}" is not a valid name: use kebab-case (lowercase letters, digits and single dashes, starting with a letter), e.g. "invoice-list".`
    );
  }
  return { kind, name };
}

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

/** Renders every template of `kind`: returns `{ rel, content }` with `rel` relative to the slice. */
export function planFiles({ templatesDir, kind, name }) {
  const vars = casings(name);
  const kindDir = join(templatesDir, kind);

  return [...walk(kindDir)]
    .map((file) => {
      const rel = relative(kindDir, file).split(sep).join('/');
      return {
        rel: render(rel.replace(/\.tpl$/, ''), vars),
        content: render(readFileSync(file, 'utf8'), vars),
      };
    })
    .sort((a, b) => a.rel.localeCompare(b.rel));
}
