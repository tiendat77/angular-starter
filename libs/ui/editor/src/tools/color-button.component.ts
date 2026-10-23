import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  viewChild,
} from '@angular/core';
import { UiMenuTriggerDirective } from '@libs/ui/menu';
import { UiEditorTool } from './editor-tool';

/** Swatches per row, which is also what the arrow keys step over (`editor-swatches` in the CSS). */
const COLUMNS = 5;
const HEX = /^#[0-9a-f]{6}$/i;

/**
 * The text-color menu. Its host is a wrapper: the button inside opens a panel with the palette
 * swatches, a "Default color" button and the native color picker for any other color.
 *
 * The color is stored inline, as the value it was picked with: `<span style="color: #ef4444">`.
 */
@Component({
  selector: 'ui-editor-color-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiMenuTriggerDirective],
  host: { class: 'contents' },
  template: `
    <button
      type="button"
      class="editor-button"
      tabindex="-1"
      aria-haspopup="dialog"
      [attr.data-tool]="tool"
      [attr.aria-label]="label()"
      [attr.title]="label()"
      [uiMenuTriggerFor]="panel"
      [uiMenuDisabled]="isDisabled()"
      [disabled]="isDisabled()"
      (mousedown)="$event.preventDefault()"
      (menuOpened)="focusSwatch()"
    >
      <span class="editor-color-icon">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path d="m6 16 6-12 6 12" />
          <path d="M8.5 12h7" />
        </svg>
        <span
          class="editor-color-bar"
          [style.--editor-color]="current()"
        ></span>
      </span>
    </button>

    <ng-template
      #panel
      let-menu
    >
      <div
        class="editor-color-panel"
        role="group"
        [attr.aria-label]="label()"
        (keydown)="onKeydown($event)"
      >
        <div
          #swatches
          class="editor-swatches"
        >
          @for (color of context.colors(); track color.value) {
            <button
              type="button"
              class="editor-swatch"
              [style.background-color]="color.value"
              [attr.aria-label]="color.label"
              [attr.title]="color.label"
              [attr.aria-pressed]="isSelected(color.value)"
              [attr.tabindex]="isStop(color.value) ? 0 : -1"
              (click)="apply(color.value, menu)"
            ></button>
          }
        </div>
        <button
          type="button"
          class="editor-color-action"
          (click)="reset(menu)"
        >
          {{ context.$labels().defaultColor }}
        </button>
        <label class="editor-color-custom">
          <span>{{ context.$labels().customColor }}</span>
          <input
            type="color"
            [value]="customValue()"
            (change)="apply($any($event.target).value, menu)"
          />
        </label>
      </div>
    </ng-template>
  `,
})
export class UiEditorColorButton extends UiEditorTool {
  readonly tool = 'color';
  protected readonly labelKey = 'textColor';

  private readonly _injector = inject(Injector);
  private readonly _swatches = viewChild<ElementRef<HTMLElement>>('swatches');

  /** The color of the text at the selection, as stored (`null`: the default color). */
  protected readonly current = computed<string | null>(() => {
    this.context.version();
    return (this.editor.getAttributes('textStyle')['color'] as string | null | undefined) || null;
  });

  /** The native picker needs `#rrggbb`; any other stored value starts it at black. */
  protected readonly customValue = computed(() => {
    const current = this.current();
    return current && HEX.test(current) ? current.toLowerCase() : '#000000';
  });

  /** The swatch that is the tab stop: the selected one, else the first. */
  private readonly _stop = computed(() => {
    const colors = this.context.colors();
    return colors.find((c) => this._same(c.value, this.current()))?.value ?? colors[0]?.value;
  });

  protected isSelected(value: string): 'true' | 'false' {
    return this._same(value, this.current()) ? 'true' : 'false';
  }

  protected isStop(value: string): boolean {
    return value === this._stop();
  }

  protected apply(value: string, menu: { close(): void }): void {
    this.editor.chain().focus().setColor(value).run();
    menu.close();
  }

  protected reset(menu: { close(): void }): void {
    this.editor.chain().focus().unsetColor().run();
    menu.close();
  }

  /** Called when the panel opens: the keyboard starts on the current swatch. */
  protected focusSwatch(): void {
    // The panel is rendered by now, but the view query only refreshes with the next render.
    afterNextRender(
      () =>
        this._buttons()
          .find((b) => b.tabIndex === 0)
          ?.focus(),
      { injector: this._injector }
    );
  }

  /** Arrow keys move over the grid, Home / End jump to its ends. */
  protected onKeydown(event: KeyboardEvent): void {
    const buttons = this._buttons();
    const index = buttons.indexOf(event.target as HTMLButtonElement);
    if (index < 0) {
      return;
    }

    const last = buttons.length - 1;
    const next = {
      ArrowRight: Math.min(index + 1, last),
      ArrowLeft: Math.max(index - 1, 0),
      ArrowDown: Math.min(index + COLUMNS, last),
      ArrowUp: Math.max(index - COLUMNS, 0),
      Home: 0,
      End: last,
    }[event.key];

    if (next !== undefined) {
      event.preventDefault();
      for (const [i, button] of buttons.entries()) {
        button.tabIndex = i === next ? 0 : -1;
      }
      buttons[next].focus();
    }
  }

  private _buttons(): HTMLButtonElement[] {
    return Array.from(this._swatches()?.nativeElement.querySelectorAll('button') ?? []);
  }

  private _same(a: string, b: string | null): boolean {
    return !!b && a.toLowerCase() === b.toLowerCase();
  }
}
