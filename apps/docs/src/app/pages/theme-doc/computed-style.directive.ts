import {
  afterNextRender,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { ThemeObserver } from './theme-observer.service';

const COLOR_PROPERTIES = new Set(['background-color', 'color', 'border-color']);

/**
 * Exposes what the browser actually computed for the element (`value()`), so the Theme page shows
 * the real, current value of a token instead of a copy that could drift from the CSS.
 *
 * `docComputed="font-size,line-height"` joins several properties with " / ". Colors are shown as
 * hex (or `rgba()` when translucent). It refreshes when the theme is toggled.
 *
 * @example
 * <div class="bg-primary" docComputed="background-color" #c="docComputed">{{ c.value() }}</div>
 */
@Directive({
  selector: '[docComputed]',
  exportAs: 'docComputed',
})
export class ComputedStyleDirective {
  private readonly _element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly _theme = inject(ThemeObserver);

  /** One CSS property, or several separated by commas. */
  readonly docComputed = input.required<string>();

  private readonly _value = signal('');
  readonly value = this._value.asReadonly();

  constructor() {
    // Reading computed style needs the element rendered with its classes, hence after render
    afterNextRender(() => this._read());
    effect(() => {
      this._theme.version();
      this.docComputed();
      queueMicrotask(() => this._read());
    });
  }

  private _read(): void {
    const style = getComputedStyle(this._element);
    this._value.set(
      this.docComputed()
        .split(',')
        .map((property) => format(property.trim(), style.getPropertyValue(property.trim())))
        .join(' / ')
    );
  }
}

function format(property: string, raw: string): string {
  const value = raw.trim();
  if (COLOR_PROPERTIES.has(property)) {
    return toHex(value);
  }
  if (property === 'font-family') {
    return value.split(',')[0].replace(/["']/g, '').trim();
  }
  if (property === 'box-shadow') {
    return visibleShadows(value);
  }
  return value;
}

/**
 * A computed `box-shadow` also lists Tailwind's empty ring and inset placeholders
 * (`rgba(0, 0, 0, 0) 0px 0px 0px 0px`); keep only the shadows that actually draw something.
 */
function visibleShadows(value: string): string {
  const layers = value.split(/,(?![^(]*\))/).map((layer) => layer.trim());
  const drawn = layers.filter(
    (layer) => !layer.includes('inset') && !/ 0px 0px 0px 0px$/.test(layer)
  );
  return drawn.length ? drawn.join(', ') : 'none';
}

/** Any CSS color (rgb, oklab, color-mix result, ...) to `#RRGGBB`, or `rgba(...)` when translucent. */
function toHex(color: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    return color;
  }
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  if (a === 0) {
    return 'transparent';
  }
  if (a < 255) {
    return `rgba(${r}, ${g}, ${b}, ${+(a / 255).toFixed(2)})`;
  }
  return (
    '#' +
    [r, g, b]
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}
