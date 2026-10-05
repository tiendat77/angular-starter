#!/usr/bin/env node
/**
 * Runs the same gates as .github/workflows/ci.yml, in the same order, so "passes locally" and
 * "passes in CI" mean the same thing: `npm run verify`.
 *
 * `build:libs` writes `packages/`, which the tsconfig paths resolve before the library sources, so
 * it runs last and the folder is always removed afterwards (a stale copy would mask later edits).
 */
import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

const steps = [
  ['Lint', 'npm run lint:ci'],
  ['Test (app, ui, tools)', 'npm run test:ci'],
  ['Build app', 'npx ng build main'],
  ['Build docs', 'npx ng build docs'],
  ['Build libraries', 'npm run build:libs'],
];

const results = [];
let failed = false;

try {
  for (const [name, command] of steps) {
    console.log(`\n▶ ${name}: ${command}\n`);
    const start = Date.now();
    const { status } = spawnSync(command, { cwd: root, stdio: 'inherit', shell: true });
    results.push({ name, ok: status === 0, seconds: Math.round((Date.now() - start) / 1000) });
    if (status !== 0) {
      failed = true;
      break;
    }
  }
} finally {
  rmSync(resolve(root, 'packages'), { recursive: true, force: true });
}

console.log('\nSummary');
for (const { name, ok, seconds } of results) {
  console.log(`  ${ok ? '✅' : '❌'} ${name} (${seconds}s)`);
}
process.exit(failed ? 1 : 0);
