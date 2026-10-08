import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { normalizeLinkUrl, resolveImageUrl, validateImage } from './editor.utils';

describe('normalizeLinkUrl', () => {
  it.each([
    ['https://example.com', 'https://example.com'],
    ['http://example.com/a?b=1#c', 'http://example.com/a?b=1#c'],
    ['HTTPS://Example.com', 'HTTPS://Example.com'],
    ['mailto:someone@example.com', 'mailto:someone@example.com'],
    ['tel:+84123456789', 'tel:+84123456789'],
    ['/docs/intro', '/docs/intro'],
    ['#section', '#section'],
    ['  https://example.com  ', 'https://example.com'],
  ])('keeps the valid link %s', (input, expected) => {
    expect(normalizeLinkUrl(input)).toBe(expected);
  });

  it.each([
    ['example.com', 'https://example.com'],
    ['www.example.com/path', 'https://www.example.com/path'],
    ['sub.example.co.uk?q=1', 'https://sub.example.co.uk?q=1'],
    ['localhost', 'https://localhost'],
    ['localhost:4200/app', 'https://localhost:4200/app'],
  ])('adds https:// to the bare address %s', (input, expected) => {
    expect(normalizeLinkUrl(input)).toBe(expected);
  });

  it.each([
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    'data:text/html;base64,AAAA',
    'vbscript:msgbox(1)',
    'file:///etc/passwd',
    'ftp://example.com',
    '//evil.example.com',
    'not a url',
    'foo bar.com',
    'https://exa mple.com',
    'mailto:',
    '',
    '   ',
  ])('rejects %j', (input) => {
    expect(normalizeLinkUrl(input)).toBeNull();
  });
});

describe('validateImage', () => {
  const allowed = ['image/png', 'image/jpeg'];
  const file = (type: string, size: number) => ({ type, size }) as File;

  it('accepts an allowed type within the size limit', () => {
    expect(validateImage(file('image/png', 100), allowed, 1000)).toBeNull();
  });

  it('is case-insensitive about the type and accepts a file exactly at the limit', () => {
    expect(validateImage(file('IMAGE/PNG', 1000), allowed, 1000)).toBeNull();
  });

  it('rejects a type that is not allowed', () => {
    expect(validateImage(file('image/svg+xml', 10), allowed, 1000)).toBe('type');
    expect(validateImage(file('', 10), allowed, 1000)).toBe('type');
  });

  it('rejects a file over the limit', () => {
    expect(validateImage(file('image/png', 1001), allowed, 1000)).toBe('size');
  });

  it('reports the type first when both are wrong', () => {
    expect(validateImage(file('text/plain', 9999), allowed, 1000)).toBe('type');
  });
});

describe('resolveImageUrl', () => {
  it('passes a promise through', async () => {
    await expect(resolveImageUrl(Promise.resolve('/a.png'))).resolves.toBe('/a.png');
  });

  it('takes the first value of an observable', async () => {
    await expect(resolveImageUrl(of('/b.png', '/ignored.png'))).resolves.toBe('/b.png');
  });

  it('rejects when the promise rejects, and when the observable completes without a value', async () => {
    await expect(resolveImageUrl(Promise.reject(new Error('nope')))).rejects.toThrow('nope');
    await expect(resolveImageUrl(of() as never)).rejects.toThrow();
  });

  it('rejects an empty url', async () => {
    await expect(resolveImageUrl(Promise.resolve(''))).rejects.toThrow(/url/i);
  });
});
