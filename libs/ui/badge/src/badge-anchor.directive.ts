import { AriaDescriber } from '@angular/cdk/a11y';
import {
  booleanAttribute,
  computed,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  isDevMode,
  numberAttribute,
  Renderer2,
} from '@angular/core';
import { UiColor } from '@libs/ui/core';
import { UiBadgeOverlap, UiBadgePosition, UiBadgeSize } from './badge.types';
import { formatBadgeCount } from './badge.utils';
import { badgeOverlayVariants, badgeVariants } from './badge.variants';

/** Elements that cannot render a child badge. */
const VOID_HOSTS = new Set(['IMG', 'INPUT', 'TEXTAREA', 'SELECT', 'BR', 'HR']);

/**
 * Overlays a count or dot on its host (Material `matBadge` style). The badge span is decorative;
 * `uiBadgeDescription` is what assistive technology announces, via `aria-describedby`.
 */
@Directive({
  selector: '[uiBadge]',
  host: { class: 'badge-anchor' },
})
export class UiBadgeAnchorDirective {
  private readonly _host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly _renderer = inject(Renderer2);
  private readonly _describer = inject(AriaDescriber);

  readonly content = input<number | string | null>(null, { alias: 'uiBadge' });
  readonly max = input(99, { alias: 'uiBadgeMax', transform: numberAttribute });
  readonly showZero = input(false, { alias: 'uiBadgeShowZero', transform: booleanAttribute });
  readonly dot = input(false, { alias: 'uiBadgeDot', transform: booleanAttribute });
  readonly color = input<UiColor>('error', { alias: 'uiBadgeColor' });
  readonly size = input<UiBadgeSize>('md', { alias: 'uiBadgeSize' });
  readonly position = input<UiBadgePosition>('top-end', { alias: 'uiBadgePosition' });
  readonly overlap = input<UiBadgeOverlap>('rectangular', { alias: 'uiBadgeOverlap' });
  readonly hidden = input(false, { alias: 'uiBadgeHidden', transform: booleanAttribute });
  readonly description = input('', { alias: 'uiBadgeDescription' });

  private readonly _text = computed(() =>
    this.dot() ? '' : formatBadgeCount(this.content(), this.max(), this.showZero())
  );
  private readonly _visible = computed(() => !this.hidden() && (this.dot() || this._text() !== ''));
  private readonly _class = computed(() =>
    badgeVariants(
      { color: this.color(), size: this.dot() ? 'dot' : this.size() },
      badgeOverlayVariants({ position: this.position(), overlap: this.overlap() })
    )
  );

  private readonly _badge: HTMLElement;
  private _describedAs = '';

  constructor() {
    if (isDevMode() && VOID_HOSTS.has(this._host.tagName)) {
      throw new Error(
        `uiBadge cannot be placed on <${this._host.tagName}>: it can't contain the badge. Wrap it in an element.`
      );
    }

    this._badge = this._renderer.createElement('span');
    this._renderer.setAttribute(this._badge, 'aria-hidden', 'true');
    this._renderer.appendChild(this._host, this._badge);

    effect(() => {
      this._badge.textContent = this._text();
      this._badge.className = this._class();
      this._badge.hidden = !this._visible();
    });

    effect(() => {
      const next = this._visible() ? this.description().trim() : '';
      if (next === this._describedAs) return;
      if (this._describedAs) this._describer.removeDescription(this._host, this._describedAs);
      if (next) this._describer.describe(this._host, next);
      this._describedAs = next;
    });

    inject(DestroyRef).onDestroy(() => {
      if (this._describedAs) this._describer.removeDescription(this._host, this._describedAs);
      this._renderer.removeChild(this._host, this._badge);
    });
  }
}
