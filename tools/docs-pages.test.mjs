import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { finalizeForPages, normalizeBaseHref } from './docs-pages.lib.mjs';

describe('normalizeBaseHref', () => {
  it('adds the missing slashes', () => {
    assert.equal(normalizeBaseHref('angular-starter'), '/angular-starter/');
    assert.equal(normalizeBaseHref('/angular-starter'), '/angular-starter/');
    assert.equal(normalizeBaseHref('angular-starter/'), '/angular-starter/');
    assert.equal(normalizeBaseHref('/angular-starter/'), '/angular-starter/');
  });

  it('keeps a nested path', () => {
    assert.equal(normalizeBaseHref('org/site'), '/org/site/');
  });

  it('is "/" for the root, empty or missing', () => {
    assert.equal(normalizeBaseHref('/'), '/');
    assert.equal(normalizeBaseHref(''), '/');
    assert.equal(normalizeBaseHref(undefined), '/');
  });
});

describe('finalizeForPages', () => {
  const withDir = (run) => {
    const dir = mkdtempSync(join(tmpdir(), 'docs-pages-'));
    try {
      run(dir);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  };

  it('copies index.html to 404.html and adds .nojekyll', () => {
    withDir((dir) => {
      writeFileSync(join(dir, 'index.html'), '<base href="/x/"><app-root></app-root>');
      finalizeForPages(dir);
      assert.equal(
        readFileSync(join(dir, '404.html'), 'utf8'),
        readFileSync(join(dir, 'index.html'), 'utf8')
      );
      assert.ok(existsSync(join(dir, '.nojekyll')));
    });
  });

  it('fails clearly when the app was not built', () => {
    withDir((dir) => {
      assert.throws(() => finalizeForPages(dir), /No index\.html/);
    });
  });
});
