import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DomExportHelper } from './dom-export.helper';
import { DomExportError } from './dom-export.model';

const domToBlob = vi.fn();

vi.mock('modern-screenshot', () => ({
  domToBlob: (...args: unknown[]) => domToBlob(...args),
  domToForeignObjectSvg: vi.fn(),
}));

function createElement(width: number, height: number, background = '') {
  const element = document.createElement('div');

  element.style.backgroundColor = background;
  Object.defineProperty(element, 'offsetWidth', { value: width });
  Object.defineProperty(element, 'offsetHeight', { value: height });
  document.body.append(element);

  return element;
}

describe('DomExportHelper', () => {
  beforeEach(() => {
    domToBlob.mockReset();
    domToBlob.mockResolvedValue(new Blob(['x'], { type: 'image/png' }));
    document.body.innerHTML = '';
  });

  it('rejects an element without size', async () => {
    const error = await DomExportHelper.toBlob(createElement(0, 0)).catch((e) => e);

    expect(error).toBeInstanceOf(DomExportError);
    expect(error.code).toBe('EMPTY');
  });

  it('lowers the scale so the canvas stays within the browser limit', async () => {
    await DomExportHelper.toBlob(createElement(4000, 2000), { scale: 4 });

    const { scale } = domToBlob.mock.calls[0][1];
    expect(scale).toBeLessThan(2);
    expect(4000 * 2000 * scale ** 2).toBeLessThanOrEqual(16_777_216);
  });

  it('rejects an element that is too large even at the minimum scale', async () => {
    const error = await DomExportHelper.toBlob(createElement(20000, 20000)).catch((e) => e);

    expect(error.code).toBe('TOO_LARGE');
  });

  it('leaves out nodes with data-export-ignore and applies the custom filter', async () => {
    await DomExportHelper.toBlob(createElement(100, 100), {
      filter: (node) => !(node instanceof Element && node.classList.contains('skip')),
    });

    const { filter } = domToBlob.mock.calls[0][1];
    const ignored = document.createElement('div');
    const skipped = document.createElement('div');
    ignored.setAttribute('data-export-ignore', '');
    skipped.className = 'skip';

    expect(filter(ignored)).toBe(false);
    expect(filter(skipped)).toBe(false);
    expect(filter(document.createElement('div'))).toBe(true);
    expect(filter(document.createTextNode('text'))).toBe(true);
  });

  it('takes the first opaque background of the ancestors', async () => {
    const parent = createElement(200, 200, 'rgb(1, 2, 3)');
    const child = document.createElement('div');
    Object.defineProperty(child, 'offsetWidth', { value: 100 });
    Object.defineProperty(child, 'offsetHeight', { value: 100 });
    parent.append(child);

    await DomExportHelper.toBlob(child);

    expect(domToBlob.mock.calls[0][1].backgroundColor).toBe('rgb(1, 2, 3)');
  });

  it('uses white for jpeg when nothing is opaque, and keeps png transparent when asked', async () => {
    await DomExportHelper.toBlob(createElement(100, 100), { format: 'jpeg' });
    await DomExportHelper.toBlob(createElement(100, 100), { background: null });

    expect(domToBlob.mock.calls[0][1]).toMatchObject({
      backgroundColor: '#fff',
      type: 'image/jpeg',
    });
    expect(domToBlob.mock.calls[1][1].backgroundColor).toBeNull();
  });

  it('wraps render failures', async () => {
    domToBlob.mockRejectedValue(new Error('boom'));

    const error = await DomExportHelper.toBlob(createElement(100, 100)).catch((e) => e);

    expect(error.code).toBe('RENDER_FAILED');
    expect(error.cause).toBeInstanceOf(Error);
  });
});
