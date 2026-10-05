import {
  afterRenderEffect,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  isDevMode,
  numberAttribute,
  output,
  viewChild,
} from '@angular/core';
import { UiButtonComponent } from '@libs/ui/button';
import { UiSpinnerComponent } from '@libs/ui/progress';
import {
  UiQrCodeLabels,
  UiQrCodeLevel,
  UiQrCodeModules,
  UiQrCodeStatus,
  UiQrCodeType,
} from './qr-code.types';
import {
  buildModulesPath,
  encodeQrCode,
  excavateModules,
  ICON_COVERAGE_LIMIT,
  iconCoverage,
  iconGeometry,
} from './qr-code.utils';
import { qrCodeFrameVariants } from './qr-code.variants';

const DEFAULT_LABELS: UiQrCodeLabels = {
  qrCode: 'QR code',
  loading: 'Loading',
  expired: 'Expired',
  scanned: 'Scanned',
  refresh: 'Refresh',
};

/** Longest value quoted in the accessible name; a URL with a long query would be tiresome to hear. */
const MAX_LABEL_VALUE_LENGTH = 80;

/**
 * QR code drawn on a `<canvas>` or as an `<svg>`, with an optional centred icon and a status
 * overlay (`loading`, `expired` with a refresh button, `scanned`).
 *
 * `size` is the drawn code itself; the frame adds its padding (which is also the quiet zone) and
 * border around it. Colors are literal CSS colors: canvas cannot resolve `var()`/`currentColor`.
 */
@Component({
  selector: 'ui-qr-code',
  exportAs: 'uiQrCode',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiSpinnerComponent, UiButtonComponent],
  host: {
    '[class]': 'hostClass()',
    '[style.background-color]': 'bgColor()',
    '[attr.aria-busy]': 'status() === "loading" ? "true" : null',
  },
  template: `
    @if (encoding(); as encoded) {
      @if (type() === 'svg') {
        <svg
          class="block"
          role="img"
          shape-rendering="crispEdges"
          [attr.aria-label]="$ariaLabel()"
          [attr.width]="size()"
          [attr.height]="size()"
          [attr.viewBox]="viewBox()"
        >
          <path
            [attr.fill]="bgColor()"
            [attr.d]="backgroundPath()"
          />
          <path
            [attr.fill]="color()"
            [attr.d]="foregroundPath()"
          />
          @if (geometry(); as icon) {
            <image
              preserveAspectRatio="none"
              [attr.href]="this.icon()"
              [attr.x]="icon.x"
              [attr.y]="icon.y"
              [attr.width]="icon.w"
              [attr.height]="icon.h"
            />
          }
        </svg>
      } @else {
        <canvas
          #canvas
          class="block"
          role="img"
          [attr.aria-label]="$ariaLabel()"
          [style.width.px]="size()"
          [style.height.px]="size()"
        ></canvas>
      }
    } @else {
      <div
        data-qr-empty
        [style.width.px]="size()"
        [style.height.px]="size()"
      ></div>
    }

    @if (status() !== 'active') {
      <div
        data-qr-overlay
        class="bg-background/90 text-foreground absolute inset-0 flex flex-col items-center justify-center gap-2 p-2 text-center text-sm"
      >
        @switch (status()) {
          @case ('loading') {
            <ui-spinner
              size="lg"
              [label]="$labels().loading"
            />
          }
          @case ('expired') {
            <p aria-hidden="true">{{ $labels().expired }}</p>
            <button
              uiButton
              type="button"
              variant="ghost"
              size="sm"
              (click)="refresh.emit()"
            >
              <svg
                class="icon-size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
              {{ $labels().refresh }}
            </button>
          }
          @case ('scanned') {
            <p aria-hidden="true">{{ $labels().scanned }}</p>
          }
        }
      </div>
    }

    <span
      class="sr-only"
      role="status"
      >{{ $statusText() }}</span
    >
  `,
})
export class UiQrCode {
  /** Text or URL to encode. */
  readonly value = input.required<string>();
  /** Side of the drawn code in CSS pixels, excluding the frame's padding and border. */
  readonly size = input(160, { transform: numberAttribute });
  readonly color = input('#000000');
  readonly bgColor = input('#FFFFFF');
  /** Minimum error correction; raised automatically when that costs no extra size. */
  readonly level = input<UiQrCodeLevel>('M');
  readonly type = input<UiQrCodeType>('canvas');
  /** Image URL or data URI drawn in the middle; the modules behind it are cleared. */
  readonly icon = input<string>();
  /** Side of the icon in CSS pixels. */
  readonly iconSize = input(40, { transform: numberAttribute });
  readonly status = input<UiQrCodeStatus>('active');
  readonly bordered = input(true, { transform: booleanAttribute });
  /** Overrides some or all of the texts (also the way to localise them). */
  readonly labels = input<Partial<UiQrCodeLabels>>({});
  /** Replaces the derived accessible name of the code. */
  readonly ariaLabel = input<string>();

  /** Emitted when the button on the `expired` overlay is clicked. */
  readonly refresh = output<void>();

  private readonly _canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  protected readonly encoding = computed(() => encodeQrCode(this.value(), this.level()));
  protected readonly numModules = computed(() => this.encoding()?.modules.length ?? 0);

  protected readonly viewBox = computed(() => `0 0 ${this.numModules()} ${this.numModules()}`);
  protected readonly backgroundPath = computed(
    () => `M0 0h${this.numModules()}v${this.numModules()}H0z`
  );

  protected readonly geometry = computed(() =>
    this.icon() && this.numModules() > 0
      ? iconGeometry(this.numModules(), this.size(), this.iconSize())
      : null
  );
  private readonly _drawnModules = computed<UiQrCodeModules>(() => {
    const encoding = this.encoding();
    const geometry = this.geometry();
    if (!encoding) {
      return [];
    }
    return geometry ? excavateModules(encoding.modules, geometry.excavation) : encoding.modules;
  });
  protected readonly foregroundPath = computed(() => buildModulesPath(this._drawnModules()));

  protected readonly $labels = computed<UiQrCodeLabels>(() => ({
    ...DEFAULT_LABELS,
    ...this.labels(),
  }));
  protected readonly $statusText = computed(() => {
    const labels = this.$labels();
    switch (this.status()) {
      case 'loading':
        return labels.loading;
      case 'expired':
        return labels.expired;
      case 'scanned':
        return labels.scanned;
      default:
        return '';
    }
  });
  protected readonly $ariaLabel = computed(() => {
    const custom = this.ariaLabel();
    if (custom) {
      return custom;
    }
    const qrCode = this.$labels().qrCode;
    if (this.status() !== 'active') {
      return `${qrCode} (${this.$statusText()})`;
    }
    const value = this.value();
    if (!value) {
      return qrCode;
    }
    const shown =
      value.length > MAX_LABEL_VALUE_LENGTH ? `${value.slice(0, MAX_LABEL_VALUE_LENGTH)}…` : value;
    return `${qrCode}: ${shown}`;
  });

  protected readonly hostClass = computed(() =>
    qrCodeFrameVariants({ bordered: this.bordered() ? 'true' : 'false' })
  );

  constructor() {
    // Runs after render, so it never runs on the server (no canvas there).
    afterRenderEffect((onCleanup) => {
      const canvas = this._canvas()?.nativeElement;
      const encoding = this.encoding();
      if (!canvas || !encoding) {
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }

      const size = this.size();
      const color = this.color();
      const bgColor = this.bgColor();
      const icon = this.icon();
      const geometry = this.geometry();
      const numModules = encoding.modules.length;
      const pixelRatio = globalThis.devicePixelRatio || 1;

      // Assigning the canvas size also resets the context, so every paint starts from a clean one.
      const paint = (modules: UiQrCodeModules): void => {
        canvas.width = canvas.height = Math.round(size * pixelRatio);
        const scale = (size * pixelRatio) / numModules;
        ctx.scale(scale, scale);
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, numModules, numModules);
        ctx.fillStyle = color;
        if (typeof Path2D !== 'undefined') {
          ctx.fill(new Path2D(buildModulesPath(modules)));
        } else {
          modules.forEach((row, y) =>
            row.forEach((dark, x) => {
              if (dark) {
                ctx.fillRect(x, y, 1, 1);
              }
            })
          );
        }
      };

      if (!icon || !geometry) {
        paint(encoding.modules);
        return;
      }

      paint(this._drawnModules());
      const image = new Image();
      image.crossOrigin = 'anonymous';
      // A load that finishes after the inputs changed must not draw over the newer code.
      let current = true;
      onCleanup(() => (current = false));
      image.onload = () => {
        if (current) {
          ctx.drawImage(image, geometry.x, geometry.y, geometry.w, geometry.h);
        }
      };
      image.onerror = () => {
        // Without the icon the cleared modules would be a hole; redraw the code whole so it scans.
        if (current) {
          paint(encoding.modules);
        }
      };
      image.src = icon;
    });

    effect(() => {
      if (!isDevMode()) {
        return;
      }
      const encoding = this.encoding();
      if (!encoding) {
        console.warn('ui-qr-code: the value is too long to encode as a QR code.');
        return;
      }
      const geometry = this.geometry();
      if (
        geometry &&
        iconCoverage(encoding.modules.length, geometry.excavation) >
          ICON_COVERAGE_LIMIT[encoding.level]
      ) {
        console.warn(
          `ui-qr-code: the icon covers more of the code than error correction level ${encoding.level} ` +
            'can restore, so the code may not scan. Use a smaller iconSize, a higher level or a larger size.'
        );
      }
    });
  }
}
