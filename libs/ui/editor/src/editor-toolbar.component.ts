import { NgComponentOutlet } from '@angular/common';
import {
  afterEveryRender,
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { UiEditorContext } from './editor.context';
import { UI_EDITOR_TOOLS, UiEditorToolbarItem } from './editor.tools';
import { UiEditorImageFailure, UiEditorImageRejection } from './editor.types';
import { normalizeLinkUrl, resolveImageUrl, validateImage } from './editor.utils';

type BarMode = 'link' | 'image';

let nextToolbarId = 0;

/**
 * The row of tools above the writing area, rendered from the `toolbar` config, plus the inline bar
 * used to type a link or an image address and the file input behind "Upload image". Internal:
 * `UiEditor` renders it.
 *
 * Keyboard users get one tab stop for the whole toolbar and move between tools with the arrow
 * keys, Home and End (roving tabindex, applied to the DOM after every render so a disabled tool is
 * never the stop).
 */
@Component({
  selector: 'ui-editor-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgComponentOutlet],
  host: {
    class: 'contents',
    '(keydown)': 'onKeydown($event)',
    '(focusin)': 'onFocusIn($event)',
  },
  templateUrl: './editor-toolbar.component.html',
})
export class UiEditorToolbar {
  protected readonly context = inject(UiEditorContext);
  private readonly _injector = inject(Injector);
  private readonly _host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly items = input.required<readonly UiEditorToolbarItem[]>();
  readonly allowedImageTypes = input.required<readonly string[]>();
  readonly maxImageSize = input.required<number>();

  readonly imageRejected = output<UiEditorImageRejection>();
  readonly imageFailed = output<UiEditorImageFailure>();

  private readonly _barInput = viewChild<ElementRef<HTMLInputElement>>('barInput');
  private readonly _fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly tools = UI_EDITOR_TOOLS;
  protected readonly barErrorId = `ui-editor-bar-error-${nextToolbarId++}`;

  protected readonly bar = signal<BarMode | null>(null);
  protected readonly barValue = signal('');
  protected readonly barError = signal('');
  protected readonly uploading = signal(false);

  /** The tool that was focused last; it is the tab stop while it stays enabled. */
  private _current = '';

  constructor() {
    afterEveryRender(() => this._syncTabStops());
  }

  // Roving tabindex -----------------------------------------------------------------------------

  private _buttons(): HTMLButtonElement[] {
    return Array.from(
      this._host.nativeElement.querySelectorAll<HTMLButtonElement>('.editor-toolbar [data-tool]')
    );
  }

  private _syncTabStops(): void {
    const buttons = this._buttons();
    const enabled = buttons.filter((b) => !b.disabled);
    const stop = enabled.find((b) => b.dataset['tool'] === this._current) ?? enabled[0];
    for (const button of buttons) {
      const tabIndex = button === stop ? 0 : -1;
      if (button.tabIndex !== tabIndex) {
        button.tabIndex = tabIndex;
      }
    }
  }

  protected onFocusIn(event: FocusEvent): void {
    const id = (event.target as HTMLElement).closest<HTMLElement>('[data-tool]')?.dataset['tool'];
    if (id) {
      this._current = id;
      this._syncTabStops();
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(event.key)) {
      return;
    }
    const buttons = this._buttons().filter((b) => !b.disabled);
    const index = buttons.indexOf(event.target as HTMLButtonElement);
    if (index < 0 || !buttons.length) {
      return;
    }
    event.preventDefault();
    const last = buttons.length - 1;
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? last
          : event.key === 'ArrowRight'
            ? (index + 1) % buttons.length
            : (index - 1 + buttons.length) % buttons.length;
    buttons[next].focus();
  }

  // Link and image address bar ------------------------------------------------------------------

  /** Opens the bar to add, change or remove the link under the selection. */
  openLink(): void {
    const editor = this.context.editor();
    if (!editor || (editor.state.selection.empty && !editor.isActive('link'))) {
      return;
    }
    this._openBar('link', (editor.getAttributes('link')['href'] as string) ?? '');
  }

  /** Opens the bar to insert an image by URL. */
  openImageUrl(): void {
    this._openBar('image', '');
  }

  /** Opens the file picker. */
  pickFile(): void {
    this._fileInput().nativeElement.click();
  }

  protected isLinkActive(): boolean {
    this.context.version();
    return this.context.editor()?.isActive('link') ?? false;
  }

  protected onBarInput(event: Event): void {
    this.barValue.set((event.target as HTMLInputElement).value);
    this.barError.set('');
  }

  protected onBarKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.closeBar();
    }
  }

  protected applyBar(): void {
    const mode = this.bar();
    const href = this._normalize(mode, this.barValue());
    if (!mode || href === null) {
      this.barError.set(this.context.$labels().invalidUrl);
      return;
    }

    const chain = this.context.editor()!.chain().focus();
    if (mode === 'link') {
      chain.extendMarkRange('link').setLink({ href }).run();
    } else {
      chain.setImage({ src: href }).run();
    }
    this.closeBar();
  }

  protected removeLink(): void {
    this.context.editor()!.chain().focus().extendMarkRange('link').unsetLink().run();
    this.closeBar();
  }

  /**
   * Closes the bar and puts the caret back in the text. The focus moves first, and synchronously
   * (`view.focus()`, unlike the command, which waits a frame): removing a focused input would fire
   * a `focusout` with no target, which the editor would read as "left the component".
   */
  protected closeBar(): void {
    this.context.editor()?.view.focus();
    this.bar.set(null);
    this.barValue.set('');
    this.barError.set('');
  }

  private _normalize(mode: BarMode | null, input: string): string | null {
    const href = normalizeLinkUrl(input);
    // An image address must be something a browser can load: no mailto: / tel:.
    return mode === 'image' && href !== null && /^(mailto|tel):/i.test(href) ? null : href;
  }

  private _openBar(mode: BarMode, value: string): void {
    this.barError.set('');
    this.barValue.set(value);
    this.bar.set(mode);
    afterNextRender(
      () => {
        const input = this._barInput()?.nativeElement;
        input?.focus();
        input?.select();
      },
      { injector: this._injector }
    );
  }

  // Image upload --------------------------------------------------------------------------------

  protected onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    const handler = this.context.uploadImage();
    if (!file || !handler) {
      return;
    }

    const reason = validateImage(file, this.allowedImageTypes(), this.maxImageSize());
    if (reason) {
      this.imageRejected.emit({ file, reason });
      return;
    }

    const editor = this.context.editor()!;
    this.uploading.set(true);
    resolveImageUrl(handler(file))
      .then((src) => {
        if (!editor.isDestroyed) {
          editor.chain().focus().setImage({ src, alt: file.name }).run();
        }
      })
      .catch((error: unknown) => this.imageFailed.emit({ file, error }))
      .finally(() => this.uploading.set(false));
  }
}
