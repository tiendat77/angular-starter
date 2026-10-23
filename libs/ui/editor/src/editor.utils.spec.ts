import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { hexColors, normalizeLinkUrl, resolveImageUrl, validateImage } from './editor.utils';

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

describe('hexColors', () => {
  it('writes the text color of a span as #rrggbb', () => {
    expect(hexColors('<p><span style="color: rgb(239, 68, 68);">Hi</span></p>')).toBe(
      '<p><span style="color: #ef4444;">Hi</span></p>'
    );
  });

  it('keeps the other declarations of the style', () => {
    const out = hexColors('<p><span style="font-weight: bold; color: rgb(0, 0, 0);">x</span></p>');

    expect(out).toContain('color: #000000');
    expect(out).toContain('font-weight');
  });

  it('does not touch background-color, other colors formats, or text', () => {
    const html =
      '<p><span style="background-color: rgb(1, 2, 3);">a</span><span style="color: #ef4444">b</span>' +
      '<span style="color: red">c</span> color: rgb(1, 2, 3)</p>';

    expect(hexColors(html)).toBe(html);
  });

  it('converts every colored element', () => {
    expect(
      hexColors(
        '<p><span style="color: rgb(255, 0, 0);">a</span><span style="color: rgb(0, 128, 255);">b</span></p>'
      )
    ).toBe('<p><span style="color: #ff0000;">a</span><span style="color: #0080ff;">b</span></p>');
  });

  it('returns html without colors unchanged', () => {
    expect(hexColors('<p>Hello</p>')).toBe('<p>Hello</p>');
  });
});
