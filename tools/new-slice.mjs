#!/usr/bin/env node
/**
 * Creates a Feature-Sliced slice of `apps/main` from the templates in `tools/templates`:
 *
 *   npm run new:page    -- <name>
 *   npm run new:feature -- <name>
 *   npm run new:entity  -- <name>
 *
 * Add `--dry-run` to see what would be written. See docs/superpowers/specs/2026-10-05-scale-readiness-design.md.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, resolve } from 'node:path';
import { parseArgs } from 'node:util';

import { planFiles, resolveOptions } from './new-slice.lib.mjs';

const require = createRequire(import.meta.url);
const ROOT = resolve(import.meta.dirname, '..');
const SRC = join(ROOT, 'apps/main/src');
const TEMPLATES = join(import.meta.dirname, 'templates');
const LAYER = { page: 'pages', feature: 'features', entity: 'entities' };

const USAGE = `Usage:
  npm run new:page    -- <name> [--dry-run]
  npm run new:feature -- <name> [--dry-run]
  npm run new:entity  -- <name> [--dry-run]

Options:
  --dry-run   print what would be created, write nothing
  -h, --help  show this help

<name> is kebab-case, e.g. invoice-list.`;

function fail(message) {
  console.error(`\n❌ ${message}\n`);
  process.exit(1);
}

// `npm run new:page foo --dry-run` (no `--`) makes npm itself consume the flag and hand it to the
// script only as this env var; honour it, so a dry run can never silently write files.
const dryRun = process.env.npm_config_dry_run === 'true';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    'dry-run': { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
});

if (values.help || positionals.length === 0) {
  console.log(USAGE);
  process.exit(values.help ? 0 : 1);
}

let options;
try {
  options = resolveOptions({ kind: positionals[0], name: positionals[1] });
} catch (error) {
  fail(error.message);
}
const { kind, name } = options;

const targetDir = join(SRC, LAYER[kind], name);
if (existsSync(targetDir)) {
  fail(`${relative(ROOT, targetDir)} already exists; nothing was changed.`);
}

const files = planFiles({ templatesDir: TEMPLATES, ...options });

console.log(
  `\n${values['dry-run'] || dryRun ? 'Would create' : 'Creating'} ${relative(ROOT, targetDir)}/`
);
for (const { rel } of files) {
  console.log(`  + ${rel}`);
}

if (values['dry-run'] || dryRun) {
  process.exit(0);
}

const written = files.map(({ rel, content }) => {
  const path = join(targetDir, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
  return path;
});

// Sorts imports and normalises formatting the same way the commit hook would
spawnSync(process.execPath, [require.resolve('prettier/bin/prettier.cjs'), '--write', ...written], {
  cwd: ROOT,
  stdio: 'ignore',
});

console.log('\n✅ Done. Next:');
if (kind === 'page') {
  console.log(`  - add the route in apps/main/src/app/app.routes.ts:
      { path: '${name}', loadChildren: () => import('@/pages/${name}') },
  - if it belongs in the sidebar, add an item in apps/main/src/widgets/layouts/config/navigation.config.ts`);
}
console.log('  - build your slice, then run `npm run verify`\n');
