#!/usr/bin/env node
/**
 * Prints what is in the *initial* bundle of the Angular app, from the esbuild metafile that
 * `ng build --stats-json` writes (dist/<app>/stats.json).
 *
 *   node .ci/analyze-bundle.mjs [path/to/stats.json] [--top=15]
 *
 * Initial = the main / polyfills / scripts / styles outputs plus everything they import
 * statically. Dynamic imports (lazy routes) are listed separately.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const args = process.argv.slice(2);
const statsPath = args.find((a) => !a.startsWith('--')) ?? 'dist/main/stats.json';
const top = Number(args.find((a) => a.startsWith('--top='))?.split('=')[1] ?? 15);

if (!fs.existsSync(statsPath)) {
  console.error(`Not found: ${statsPath}\nRun "npm run analyze" (it builds with --stats-json first).`);
  process.exit(1);
}

const { outputs } = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
const browserDir = path.join(path.dirname(statsPath), 'browser');

const fmt = (bytes) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(2)} MB` : `${(bytes / 1024).toFixed(1)} kB`;
const pad = (s, n) => String(s).padEnd(n);
const padl = (s, n) => String(s).padStart(n);

function gzipSize(file) {
  const full = path.join(browserDir, file);
  return fs.existsSync(full) ? zlib.gzipSync(fs.readFileSync(full)).length : null;
}

// --- which outputs are initial ---------------------------------------------------------------------
const roots = Object.keys(outputs).filter((f) => /^(main|polyfills|scripts|styles)-/.test(f));
const initial = new Set();
const visit = (file) => {
  if (initial.has(file) || !outputs[file]) return;
  initial.add(file);
  for (const imp of outputs[file].imports ?? []) {
    if (imp.kind === 'import-statement') visit(imp.path);
  }
};
roots.forEach(visit);

const files = Object.keys(outputs).filter((f) => !f.endsWith('.map'));
const initialFiles = files.filter((f) => initial.has(f)).sort((a, b) => outputs[b].bytes - outputs[a].bytes);
const lazyFiles = files.filter((f) => !initial.has(f)).sort((a, b) => outputs[b].bytes - outputs[a].bytes);

// --- initial chunks --------------------------------------------------------------------------------
console.log('\nInitial chunks (downloaded before the app starts)\n');
console.log(`${pad('file', 34)}${padl('raw', 12)}${padl('gzip', 12)}`);
let rawTotal = 0;
let gzTotal = 0;
for (const f of initialFiles) {
  const raw = outputs[f].bytes;
  const gz = gzipSize(f);
  rawTotal += raw;
  gzTotal += gz ?? 0;
  console.log(`${pad(f, 34)}${padl(fmt(raw), 12)}${padl(gz == null ? '-' : fmt(gz), 12)}`);
}
console.log(`${pad('Initial total', 34)}${padl(fmt(rawTotal), 12)}${padl(fmt(gzTotal), 12)}`);

// --- what is inside them ---------------------------------------------------------------------------
function groupOf(input) {
  const nm = input.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/);
  if (nm) return nm[1];
  if (input.startsWith('angular:script/global:')) return `angular.json "scripts" → ${input.slice('angular:script/global:'.length)}`;
  if (input.startsWith('angular:')) return input;
  const lib = input.match(/^libs\/([^/]+)\/([^/]+)/);
  if (lib) return `libs/${lib[1]}/${lib[2]}`;
  const layer = input.match(/^apps\/([^/]+)\/src\/([^/]+)\/?([^/]*)/);
  if (layer) return `apps/${layer[1]}/${layer[2]}${layer[3] && !layer[3].includes('.') ? '/' + layer[3] : ''}`;
  return input;
}

const groups = new Map();
for (const f of initialFiles) {
  for (const [input, info] of Object.entries(outputs[f].inputs ?? {})) {
    const key = groupOf(input);
    groups.set(key, (groups.get(key) ?? 0) + info.bytesInOutput);
  }
  // CSS / script outputs without per-input detail
  if (!Object.keys(outputs[f].inputs ?? {}).length) {
    groups.set(f, (groups.get(f) ?? 0) + outputs[f].bytes);
  }
}
const measured = [...groups.values()].reduce((a, b) => a + b, 0);

console.log(`\nLargest contributors to the initial bundle (top ${top}, raw bytes after minification)\n`);
console.log(`${pad('source', 58)}${padl('size', 12)}${padl('share', 8)}`);
[...groups.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, top)
  .forEach(([key, bytes]) => {
    console.log(`${pad(key.length > 56 ? key.slice(0, 55) + '…' : key, 58)}${padl(fmt(bytes), 12)}${padl(((bytes / measured) * 100).toFixed(1) + '%', 8)}`);
  });

// --- lazy chunks -----------------------------------------------------------------------------------
console.log(`\nLazy chunks (loaded on demand): ${lazyFiles.length} files, ${fmt(lazyFiles.reduce((a, f) => a + outputs[f].bytes, 0))} total. Largest:\n`);
for (const f of lazyFiles.slice(0, 5)) {
  const owners = Object.entries(outputs[f].inputs ?? {})
    .sort((a, b) => b[1].bytesInOutput - a[1].bytesInOutput)
    .slice(0, 2)
    .map(([input]) => groupOf(input))
    .join(', ');
  console.log(`${pad(f, 34)}${padl(fmt(outputs[f].bytes), 12)}  ${owners}`);
}

console.log('\nTip: "npm run analyze" also writes dist/main/stats.html, an interactive treemap of every chunk.\n');
