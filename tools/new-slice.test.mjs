import assert from 'node:assert/strict';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import { casings, isKebab, planFiles, render, resolveOptions } from './new-slice.lib.mjs';

const TEMPLATES = join(import.meta.dirname, 'templates');

describe('isKebab', () => {
  for (const name of ['products', 'product-list', 'v2', 'a1-b2']) {
    it(`accepts ${name}`, () => assert.equal(isKebab(name), true));
  }
  for (const name of [
    '',
    'Product',
    'product_list',
    'product--list',
    '-a',
    'a-',
    '1a',
    'a b',
    'a/b',
  ]) {
    it(`rejects "${name}"`, () => assert.equal(isKebab(name), false));
  }
});

describe('casings', () => {
  it('derives every casing from the kebab name', () => {
    assert.deepEqual(casings('product-list'), {
      kebab: 'product-list',
      Pascal: 'ProductList',
      camel: 'productList',
      Title: 'Product list',
    });
  });
});

describe('render', () => {
  it('replaces every placeholder, including repeats', () => {
    assert.equal(render('__a__-__b__-__a__', { a: '1', b: '2' }), '1-2-1');
  });

  it('throws on a placeholder it has no value for, so a template typo cannot slip through', () => {
    assert.throws(() => render('x __nope__', { a: '1' }), /nope/);
  });

  it('leaves text without placeholders alone', () => {
    assert.equal(render('const a = b__c;', {}), 'const a = b__c;');
  });
});

describe('resolveOptions', () => {
  it('accepts every kind with a valid name', () => {
    for (const kind of ['page', 'feature', 'entity']) {
      assert.deepEqual(resolveOptions({ kind, name: 'invoice-list' }), {
        kind,
        name: 'invoice-list',
      });
    }
  });

  it('rejects an invalid or missing name', () => {
    assert.throws(() => resolveOptions({ kind: 'page', name: 'InvoiceList' }), /kebab-case/);
    assert.throws(() => resolveOptions({ kind: 'page' }), /kebab-case/);
  });

  it('rejects an unknown kind', () => {
    assert.throws(() => resolveOptions({ kind: 'widget', name: 'x' }), /kind/i);
  });
});

describe('planFiles', () => {
  const files = (kind, name) =>
    Object.fromEntries(
      planFiles({ templatesDir: TEMPLATES, kind, name }).map((f) => [f.rel, f.content])
    );

  it('renders file names and contents for a page, and strips .tpl', () => {
    const out = files('page', 'invoice-list');
    assert.deepEqual(Object.keys(out).sort(), [
      'index.ts',
      'routes.ts',
      'ui/invoice-list/invoice-list.html',
      'ui/invoice-list/invoice-list.spec.ts',
      'ui/invoice-list/invoice-list.ts',
    ]);
    assert.match(out['ui/invoice-list/invoice-list.ts'], /export class InvoiceListComponent/);
    assert.match(out['ui/invoice-list/invoice-list.ts'], /selector: 'invoice-list'/);
    assert.match(out['routes.ts'], /from '\.\/ui\/invoice-list\/invoice-list'/);
    assert.match(out['ui/invoice-list/invoice-list.html'], /Invoice list/);
  });

  it('renders a feature', () => {
    const feature = files('feature', 'invoice-filter');
    assert.ok('ui/invoice-filter/invoice-filter.ts' in feature);
    assert.match(feature['ui/index.ts'], /export \* from '\.\/invoice-filter'/);
  });

  it('renders an entity', () => {
    const entity = files('entity', 'invoice');
    assert.deepEqual(Object.keys(entity).sort(), [
      'api/index.ts',
      'api/invoice-api.service.ts',
      'index.ts',
      'model/index.ts',
      'model/invoice.model.spec.ts',
      'model/invoice.model.ts',
    ]);
    assert.match(
      entity['api/invoice-api.service.ts'],
      /class InvoiceApiService extends BaseApiService<InvoiceModel>/
    );
    assert.match(entity['model/invoice.model.ts'], /export const InvoiceSchema/);
  });

  it('leaves no placeholder behind in any file of any kind', () => {
    for (const kind of ['page', 'feature', 'entity']) {
      for (const [rel, content] of Object.entries(files(kind, 'two-words'))) {
        assert.doesNotMatch(content, /__\w+__/, `${kind}/${rel}`);
        assert.doesNotMatch(rel, /__|\.tpl$/, `${kind}/${rel}`);
      }
    }
  });
});
