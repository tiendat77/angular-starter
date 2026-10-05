import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UiQrCode } from './qr-code.component';
import { UiQrCodeLabels, UiQrCodeLevel, UiQrCodeStatus, UiQrCodeType } from './qr-code.types';
import {
  buildModulesPath,
  encodeQrCode,
  excavateModules,
  ICON_COVERAGE_LIMIT,
  iconCoverage,
  iconGeometry,
} from './qr-code.utils';

describe('qr-code utils', () => {
  describe('buildModulesPath', () => {
    it('merges horizontal runs of dark modules into one rectangle each', () => {
      expect(buildModulesPath([[true, true, false, true]])).toBe('M0 0h2v1h-2zM3 0h1v1h-1z');
    });

    it('offsets every run by its row and column', () => {
      expect(
        buildModulesPath([
          [false, false],
          [false, true],
        ])
      ).toBe('M1 1h1v1h-1z');
    });

    it('returns an empty path for a code with no dark modules', () => {
      expect(buildModulesPath([[false, false]])).toBe('');
    });
  });

  describe('encodeQrCode', () => {
    it('produces a square grid whose size matches a QR version (4n + 17)', () => {
      const encoding = encodeQrCode('https://example.com', 'M');
      expect(encoding).not.toBeNull();
      const size = encoding!.modules.length;
      expect((size - 17) % 4).toBe(0);
      expect(encoding!.modules.every((row) => row.length === size)).toBe(true);
    });

    it('draws the three finder patterns', () => {
      const { modules } = encodeQrCode('hello', 'L')!;
      const last = modules.length - 1;
      for (const [r, c] of [
        [0, 0],
        [0, last],
        [last, 0],
      ]) {
        expect(modules[r][c]).toBe(true);
      }
    });

    it('is deterministic', () => {
      expect(encodeQrCode('same', 'Q')).toEqual(encodeQrCode('same', 'Q'));
    });

    it('never reports a lower error correction level than requested', () => {
      const order: UiQrCodeLevel[] = ['L', 'M', 'Q', 'H'];
      for (const level of order) {
        expect(order.indexOf(encodeQrCode('abc', level)!.level)).toBeGreaterThanOrEqual(
          order.indexOf(level)
        );
      }
    });

    it('grows with the amount of data', () => {
      const small = encodeQrCode('a', 'M')!.modules.length;
      const large = encodeQrCode('a'.repeat(400), 'M')!.modules.length;
      expect(large).toBeGreaterThan(small);
    });

    it('returns null instead of throwing when the text is too long', () => {
      expect(encodeQrCode('a'.repeat(10000), 'H')).toBeNull();
    });
  });

  describe('iconGeometry', () => {
    it('centres the icon and scales it from pixels to modules', () => {
      const geometry = iconGeometry(29, 160, 40);
      expect(geometry.w).toBeCloseTo((40 * 29) / 160);
      expect(geometry.h).toBeCloseTo(geometry.w);
      expect(geometry.x + geometry.w / 2).toBeCloseTo(29 / 2);
      expect(geometry.y + geometry.h / 2).toBeCloseTo(29 / 2);
    });

    it('excavates whole modules that fully contain the icon', () => {
      const { x, y, w, h, excavation } = iconGeometry(29, 160, 40);
      expect(Number.isInteger(excavation.x) && Number.isInteger(excavation.w)).toBe(true);
      expect(excavation.x).toBeLessThanOrEqual(x);
      expect(excavation.y).toBeLessThanOrEqual(y);
      expect(excavation.x + excavation.w).toBeGreaterThanOrEqual(x + w);
      expect(excavation.y + excavation.h).toBeGreaterThanOrEqual(y + h);
    });
  });

  describe('excavateModules', () => {
    it('clears only the modules inside the rectangle and keeps the input intact', () => {
      const grid = [
        [true, true, true],
        [true, true, true],
        [true, true, true],
      ];
      const result = excavateModules(grid, { x: 1, y: 1, w: 1, h: 2 });
      expect(result).toEqual([
        [true, true, true],
        [true, false, true],
        [true, false, true],
      ]);
      expect(grid[1][1]).toBe(true);
    });
  });

  describe('iconCoverage', () => {
    it('is the share of modules the excavation covers', () => {
      expect(iconCoverage(10, { x: 0, y: 0, w: 5, h: 2 })).toBeCloseTo(0.1);
    });

    it('limits grow with the error correction level', () => {
      expect(ICON_COVERAGE_LIMIT.L).toBeLessThan(ICON_COVERAGE_LIMIT.M);
      expect(ICON_COVERAGE_LIMIT.M).toBeLessThan(ICON_COVERAGE_LIMIT.Q);
      expect(ICON_COVERAGE_LIMIT.Q).toBeLessThan(ICON_COVERAGE_LIMIT.H);
    });
  });
});

@Component({
  standalone: true,
  imports: [UiQrCode],
  template: `
    <ui-qr-code
      [value]="value()"
      [size]="size()"
      [color]="color()"
      [bgColor]="bgColor()"
      [level]="level()"
      [type]="type()"
      [icon]="icon()"
      [iconSize]="iconSize()"
      [status]="status()"
      [bordered]="bordered()"
      [labels]="labels()"
      [ariaLabel]="ariaLabel()"
      (refresh)="refreshSpy()"
    />
  `,
})
class HostComponent {
  readonly value = signal('https://example.com');
  readonly size = signal(160);
  readonly color = signal('#000000');
  readonly bgColor = signal('#FFFFFF');
  readonly level = signal<UiQrCodeLevel>('M');
  readonly type = signal<UiQrCodeType>('canvas');
  readonly icon = signal<string | undefined>(undefined);
  readonly iconSize = signal(40);
  readonly status = signal<UiQrCodeStatus>('active');
  readonly bordered = signal(true);
  readonly labels = signal<Partial<UiQrCodeLabels>>({});
  readonly ariaLabel = signal<string | undefined>(undefined);
  readonly refreshSpy = vi.fn();
}

interface FakeContext {
  fillStyles: string[];
  scale: ReturnType<typeof vi.fn>;
  fillRect: ReturnType<typeof vi.fn>;
  drawImage: ReturnType<typeof vi.fn>;
  fill: ReturnType<typeof vi.fn>;
  clearRect: ReturnType<typeof vi.fn>;
  setTransform: ReturnType<typeof vi.fn>;
}

function createFakeContext(): FakeContext {
  const fillStyles: string[] = [];
  const ctx = {
    fillStyles,
    scale: vi.fn(),
    fillRect: vi.fn(),
    drawImage: vi.fn(),
    fill: vi.fn(),
    clearRect: vi.fn(),
    setTransform: vi.fn(),
  } as FakeContext;
  Object.defineProperty(ctx, 'fillStyle', {
    set: (value: string) => fillStyles.push(value),
    get: () => fillStyles[fillStyles.length - 1],
  });
  return ctx;
}

class FakeImage {
  static instances: FakeImage[] = [];
  crossOrigin = '';
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src = '';
  constructor() {
    FakeImage.instances.push(this);
  }
}

describe('UiQrCode', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let root: HTMLElement;
  let ctx: FakeContext;

  const frame = () => root.querySelector('ui-qr-code') as HTMLElement;
  const svg = () => root.querySelector('svg[role="img"]') as SVGSVGElement | null;
  const canvas = () => root.querySelector('canvas') as HTMLCanvasElement | null;
  const overlay = () => root.querySelector('[data-qr-overlay]') as HTMLElement | null;
  const statusRegion = () => root.querySelector('[role="status"]') as HTMLElement;
  const render = () => {
    fixture.detectChanges();
    TestBed.tick();
    fixture.detectChanges();
  };
  const expectedModules = () => encodeQrCode(host.value(), host.level())!.modules.length;
  const darkModuleCount = () =>
    encodeQrCode(host.value(), host.level())!.modules.flat().filter(Boolean).length;

  beforeEach(() => {
    ctx = createFakeContext();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      ctx as unknown as CanvasRenderingContext2D
    );
    FakeImage.instances = [];
    vi.stubGlobal('Image', FakeImage);
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    root = fixture.nativeElement;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('frame', () => {
    it('is bordered and rounded by default and follows the background color', () => {
      host.bgColor.set('#ffeedd');
      render();
      expect(frame().className).toContain('border-border');
      expect(frame().className).toContain('rounded-lg');
      expect(frame().style.backgroundColor).toBe('rgb(255, 238, 221)');
    });

    it('drops the border when `bordered` is false', () => {
      host.bordered.set(false);
      render();
      expect(frame().className).not.toContain('border-border');
    });
  });

  describe('canvas renderer', () => {
    it('renders a canvas sized in CSS pixels, not an svg', () => {
      render();
      expect(canvas()).toBeTruthy();
      expect(svg()).toBeNull();
      expect(canvas()!.style.width).toBe('160px');
      expect(canvas()!.style.height).toBe('160px');
    });

    it('backs the canvas with device pixels', () => {
      vi.stubGlobal('devicePixelRatio', 2);
      render();
      expect(canvas()!.width).toBe(320);
      expect(canvas()!.height).toBe(320);
    });

    it('fills the background first, then every dark module', () => {
      render();
      const n = expectedModules();
      expect(ctx.fillRect.mock.calls[0]).toEqual([0, 0, n, n]);
      expect(ctx.fillStyles.slice(0, 2)).toEqual(['#FFFFFF', '#000000']);
      expect(ctx.fillRect).toHaveBeenCalledTimes(1 + darkModuleCount());
      expect(ctx.scale).toHaveBeenCalledWith(160 / n, 160 / n);
    });

    it('uses Path2D when the browser has it', () => {
      const paths: string[] = [];
      vi.stubGlobal(
        'Path2D',
        class {
          constructor(d: string) {
            paths.push(d);
          }
        }
      );
      render();
      expect(ctx.fill).toHaveBeenCalledTimes(1);
      expect(paths[0]).toBe(buildModulesPath(encodeQrCode(host.value(), host.level())!.modules));
    });

    it('redraws when value, colors or size change', () => {
      render();
      ctx.fillRect.mockClear();
      host.value.set('another value');
      host.color.set('#112233');
      render();
      expect(ctx.fillStyles).toContain('#112233');
      expect(ctx.fillRect).toHaveBeenCalled();
    });

    it('switches to svg and back', () => {
      render();
      host.type.set('svg');
      render();
      expect(canvas()).toBeNull();
      expect(svg()).toBeTruthy();
      host.type.set('canvas');
      render();
      expect(canvas()).toBeTruthy();
      expect(svg()).toBeNull();
    });
  });

  describe('canvas icon', () => {
    beforeEach(() => {
      host.icon.set('data:image/svg+xml,logo');
    });

    it('loads the icon with CORS enabled and draws it centred once it has loaded', () => {
      render();
      const image = FakeImage.instances.at(-1)!;
      expect(image.src).toBe('data:image/svg+xml,logo');
      expect(image.crossOrigin).toBe('anonymous');
      expect(ctx.drawImage).not.toHaveBeenCalled();
      image.onload!();
      const geometry = iconGeometry(expectedModules(), 160, 40);
      expect(ctx.drawImage).toHaveBeenCalledWith(
        image,
        geometry.x,
        geometry.y,
        geometry.w,
        geometry.h
      );
    });

    it('clears the modules behind the icon', () => {
      render();
      const n = expectedModules();
      const full = darkModuleCount();
      const drawn = ctx.fillRect.mock.calls.length - 1;
      expect(n).toBeGreaterThan(0);
      expect(drawn).toBeLessThan(full);
    });

    it('redraws the full code if the icon cannot be loaded, so it still scans', () => {
      render();
      const image = FakeImage.instances.at(-1)!;
      ctx.fillRect.mockClear();
      image.onerror!();
      expect(ctx.fillRect).toHaveBeenCalledTimes(1 + darkModuleCount());
      expect(ctx.drawImage).not.toHaveBeenCalled();
    });

    it('ignores an icon that finishes loading after it was replaced', () => {
      render();
      const stale = FakeImage.instances.at(-1)!;
      host.icon.set('data:image/svg+xml,other');
      render();
      stale.onload!();
      expect(ctx.drawImage).not.toHaveBeenCalled();
      FakeImage.instances.at(-1)!.onload!();
      expect(ctx.drawImage).toHaveBeenCalledTimes(1);
    });

    it('loads no image when there is no icon', () => {
      host.icon.set(undefined);
      render();
      expect(FakeImage.instances.length).toBe(0);
    });
  });

  describe('svg renderer', () => {
    beforeEach(() => host.type.set('svg'));

    it('renders an svg in module units sized in pixels', () => {
      render();
      const n = expectedModules();
      expect(svg()!.getAttribute('viewBox')).toBe(`0 0 ${n} ${n}`);
      expect(svg()!.getAttribute('width')).toBe('160');
      expect(svg()!.getAttribute('height')).toBe('160');
    });

    it('draws a background and one merged foreground path in the given colors', () => {
      host.color.set('#112233');
      host.bgColor.set('#ddeeff');
      render();
      const [background, foreground] = Array.from(svg()!.querySelectorAll('path'));
      expect(background.getAttribute('fill')).toBe('#ddeeff');
      expect(foreground.getAttribute('fill')).toBe('#112233');
      expect(foreground.getAttribute('d')).toBe(
        buildModulesPath(encodeQrCode(host.value(), host.level())!.modules)
      );
    });

    it('renders the icon centred and clears the modules behind it', () => {
      host.icon.set('data:image/svg+xml,logo');
      render();
      const image = svg()!.querySelector('image')!;
      const geometry = iconGeometry(expectedModules(), 160, 40);
      expect(image.getAttribute('href')).toBe('data:image/svg+xml,logo');
      expect(Number(image.getAttribute('x'))).toBeCloseTo(geometry.x);
      expect(Number(image.getAttribute('width'))).toBeCloseTo(geometry.w);
      const foreground = svg()!.querySelectorAll('path')[1].getAttribute('d');
      expect(foreground).toBe(
        buildModulesPath(
          excavateModules(encodeQrCode(host.value(), host.level())!.modules, geometry.excavation)
        )
      );
    });

    it('renders no image without an icon', () => {
      render();
      expect(svg()!.querySelector('image')).toBeNull();
    });

    it('scales the icon with iconSize', () => {
      host.icon.set('data:image/svg+xml,logo');
      host.iconSize.set(20);
      render();
      const geometry = iconGeometry(expectedModules(), 160, 20);
      expect(Number(svg()!.querySelector('image')!.getAttribute('width'))).toBeCloseTo(geometry.w);
    });
  });

  describe('text that cannot be encoded', () => {
    it('renders an empty frame of the right size and warns instead of throwing', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      host.value.set('a'.repeat(10000));
      render();
      expect(canvas()).toBeNull();
      expect(svg()).toBeNull();
      expect(root.querySelector('[data-qr-empty]')).toBeTruthy();
      expect(warn).toHaveBeenCalled();
    });
  });

  describe('status overlay', () => {
    it('shows no overlay while active', () => {
      render();
      expect(overlay()).toBeNull();
      expect(statusRegion().textContent?.trim()).toBe('');
      expect(frame().hasAttribute('aria-busy')).toBe(false);
    });

    it('shows the spinner and marks the frame busy while loading', () => {
      host.status.set('loading');
      render();
      expect(overlay()!.querySelector('[role="progressbar"]')).toBeTruthy();
      expect(overlay()!.querySelector('button')).toBeNull();
      expect(frame().getAttribute('aria-busy')).toBe('true');
      expect(statusRegion().textContent?.trim()).toBe('Loading');
    });

    it('shows the expired text and a refresh button', () => {
      host.status.set('expired');
      render();
      const button = overlay()!.querySelector('button')!;
      expect(button.textContent).toContain('Refresh');
      expect(button.getAttribute('type')).toBe('button');
      expect(overlay()!.textContent).toContain('Expired');
      expect(statusRegion().textContent?.trim()).toBe('Expired');
    });

    it('emits `refresh` when the button is clicked, and only then', () => {
      host.status.set('expired');
      render();
      expect(host.refreshSpy).not.toHaveBeenCalled();
      overlay()!.querySelector('button')!.click();
      expect(host.refreshSpy).toHaveBeenCalledTimes(1);
    });

    it('shows the scanned text without a button', () => {
      host.status.set('scanned');
      render();
      expect(overlay()!.textContent).toContain('Scanned');
      expect(overlay()!.querySelector('button')).toBeNull();
      expect(overlay()!.querySelector('[role="progressbar"]')).toBeNull();
    });

    it('hides the visible overlay text from assistive tech (the status region announces it)', () => {
      host.status.set('expired');
      render();
      const text = overlay()!.querySelector('p')!;
      expect(text.getAttribute('aria-hidden')).toBe('true');
    });

    it('removes the overlay when the status returns to active', () => {
      host.status.set('expired');
      render();
      host.status.set('active');
      render();
      expect(overlay()).toBeNull();
      expect(statusRegion().textContent?.trim()).toBe('');
    });

    it('uses custom labels', () => {
      host.status.set('expired');
      host.labels.set({ expired: 'Het is verlopen', refresh: 'Vernieuwen' });
      render();
      expect(overlay()!.textContent).toContain('Het is verlopen');
      expect(overlay()!.querySelector('button')!.textContent).toContain('Vernieuwen');
      expect(statusRegion().textContent?.trim()).toBe('Het is verlopen');
    });
  });

  describe('accessibility', () => {
    it('names the canvas after the encoded value', () => {
      render();
      expect(canvas()!.getAttribute('role')).toBe('img');
      expect(canvas()!.getAttribute('aria-label')).toBe('QR code: https://example.com');
    });

    it('names the svg the same way', () => {
      host.type.set('svg');
      render();
      expect(svg()!.getAttribute('aria-label')).toBe('QR code: https://example.com');
    });

    it('does not make the host an image, so the refresh button stays reachable', () => {
      host.status.set('expired');
      render();
      expect(frame().getAttribute('role')).toBeNull();
    });

    it('describes the status instead of the value when not active', () => {
      host.status.set('expired');
      render();
      expect(canvas()!.getAttribute('aria-label')).toBe('QR code (Expired)');
    });

    it('truncates a long value in the label', () => {
      host.value.set('x'.repeat(200));
      render();
      const label = canvas()!.getAttribute('aria-label')!;
      expect(label.length).toBeLessThan(120);
      expect(label.endsWith('…')).toBe(true);
    });

    it('lets ariaLabel and labels.qrCode override the label', () => {
      host.labels.set({ qrCode: 'Code QR' });
      render();
      expect(canvas()!.getAttribute('aria-label')).toBe('Code QR: https://example.com');
      host.ariaLabel.set('Scan to pay');
      render();
      expect(canvas()!.getAttribute('aria-label')).toBe('Scan to pay');
    });
  });
});
