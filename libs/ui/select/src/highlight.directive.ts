import { computed, Directive, effect, ElementRef, inject, input, Renderer2 } from '@angular/core';
import { splitHighlight } from './highlight-segments';
import { UI_SELECT } from './select.tokens';

/**
 * Renders `text` with every match of the search term wrapped in `<mark class="select-mark">`.
 * The term comes from the surrounding `ui-select`, or from `uiHighlightTerm`.
 * Built with text nodes and elements, never innerHTML.
 */
@Directive({
  selector: '[uiHighlight]',
})
export class UiHighlightDirective {
  readonly text = input.required<string>({ alias: 'uiHighlight' });
  readonly term = input<string | undefined>(undefined, { alias: 'uiHighlightTerm' });

  private readonly _select = inject(UI_SELECT, { optional: true });
  private readonly _renderer = inject(Renderer2);
  private readonly _host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly segments = computed(() =>
    splitHighlight(this.text(), this.term() ?? this._select?.searchTerm() ?? '')
  );

  constructor() {
    effect(() => {
      const host = this._host.nativeElement;
      const segments = this.segments();
      while (host.firstChild) {
        this._renderer.removeChild(host, host.firstChild);
      }
      for (const segment of segments) {
        const text = this._renderer.createText(segment.text);
        if (segment.match) {
          const mark = this._renderer.createElement('mark') as HTMLElement;
          this._renderer.addClass(mark, 'select-mark');
          this._renderer.appendChild(mark, text);
          this._renderer.appendChild(host, mark);
        } else {
          this._renderer.appendChild(host, text);
        }
      }
    });
  }
}
