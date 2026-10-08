import { DOCUMENT } from '@angular/common';
import {
  AfterContentInit,
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  forwardRef,
  inject,
  Injector,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { UiFormFieldControl } from '@libs/ui/core';
import { Editor, isNodeSelection, JSONContent } from '@tiptap/core';
import { BubbleMenu } from '@tiptap/extension-bubble-menu';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { Placeholder } from '@tiptap/extensions';
import StarterKit from '@tiptap/starter-kit';
import { UiEditorBubbleMenu } from './editor-bubble-menu.component';
import { UiEditorToolbar } from './editor-toolbar.component';
import { UiEditorContext } from './editor.context';
import {
  UI_EDITOR_DEFAULT_BUBBLE_MENU,
  UI_EDITOR_DEFAULT_TOOLBAR,
  UiEditorToolbarItem,
  UiEditorToolId,
} from './editor.tools';
import {
  UI_EDITOR_DEFAULT_LABELS,
  UiEditorFormat,
  UiEditorImageFailure,
  UiEditorImageRejection,
  UiEditorLabels,
  UiEditorUploadHandler,
  UiEditorValue,
} from './editor.types';
import { editorVariants } from './editor.variants';

let nextEditorId = 0;

const DEFAULT_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
const DEFAULT_MAX_IMAGE_SIZE = 5 * 1024 * 1024;

/**
 * Rich-text editor (Tiptap) with a toolbar and a menu over selected text.
 *
 * The form value is an HTML string (default) or the ProseMirror JSON document; an empty document is
 * `''` / `null` so `Validators.required` works. HTML is **not sanitised**: treat it as untrusted
 * wherever it is rendered.
 *
 * Works on its own and inside `ui-form-field`, which finds it through `UiFormFieldControl`.
 * Import it from `@libs/ui/editor`, a separate entrypoint, because Tiptap is large.
 */
@Component({
  selector: 'ui-editor',
  exportAs: 'uiEditor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UiEditor), multi: true },
    { provide: UiFormFieldControl, useExisting: forwardRef(() => UiEditor) },
    { provide: UiEditorContext, useExisting: forwardRef(() => UiEditor) },
  ],
  imports: [UiEditorToolbar, UiEditorBubbleMenu],
  host: {
    class: 'block min-w-0 flex-1',
    '(focusout)': 'onFocusOut($event)',
    '(focusin)': 'onFocusIn()',
  },
  templateUrl: './editor.component.html',
})
export class UiEditor
  extends UiFormFieldControl<UiEditorValue>
  implements ControlValueAccessor, AfterContentInit, UiEditorContext
{
  private readonly _injector = inject(Injector);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _document = inject(DOCUMENT);
  private readonly _host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Resolved in `ngAfterContentInit`, see `UiOtpInput` for why not earlier. */
  private _ngControl: NgControl | null = null;

  private readonly _autoId = `ui-editor-${nextEditorId++}`;

  /** What the control emits. */
  readonly outputFormat = input<UiEditorFormat>('html');
  readonly placeholder = input('');
  readonly disabled = input(false, { transform: booleanAttribute });
  /** CSS length: the writing area is at least this tall. */
  readonly minHeight = input('10rem');
  readonly inputId = input<string>();
  /** Accessible name of the writing area; ignored when `ariaLabelledby` is set. */
  readonly ariaLabel = input<string>();
  readonly ariaLabelledby = input<string>();
  /** Turns a picked image file into its URL. Without it the image menu offers only "from URL". */
  readonly uploadImage = input<UiEditorUploadHandler>();
  /** MIME types the image picker accepts. */
  readonly allowedImageTypes = input<readonly string[]>(DEFAULT_IMAGE_TYPES);
  /** Largest image file in bytes. */
  readonly maxImageSize = input(DEFAULT_MAX_IMAGE_SIZE);
  /**
   * The tools above the writing area, in order; `'separator'` draws a divider. Unknown tools are
   * not accepted by the type, so a typo fails to compile.
   */
  readonly toolbar = input<readonly UiEditorToolbarItem[]>(UI_EDITOR_DEFAULT_TOOLBAR);
  /** The tools in the menu over selected text; an empty list turns that menu off. */
  readonly bubbleMenu = input<readonly UiEditorToolId[]>(UI_EDITOR_DEFAULT_BUBBLE_MENU);
  /** Overrides for the built-in English texts. */
  readonly labels = input<Partial<UiEditorLabels>>({});

  /** A picked image was refused before upload. */
  readonly imageRejected = output<UiEditorImageRejection>();
  /** The upload handler failed. */
  readonly imageFailed = output<UiEditorImageFailure>();

  private readonly _content = viewChild.required<ElementRef<HTMLElement>>('content');
  private readonly _bubble = viewChild.required(UiEditorBubbleMenu);
  private readonly _toolbar = viewChild(UiEditorToolbar);

  private readonly _editor = signal<Editor | null>(null);
  /** The Tiptap instance, once rendered in the browser; for advanced commands. */
  readonly editor = this._editor.asReadonly();

  /** Bumped on every transaction so toolbar state (`isActive`, `can`) re-evaluates. */
  readonly version = signal(0);

  private readonly _value = signal<UiEditorValue>(null);
  private readonly _cvaDisabled = signal(false);
  private readonly _focused = signal(false);
  private readonly _invalid = signal(false);
  private readonly _describedBy = signal<string | null>(null);

  /** Value written before the Tiptap instance exists. */
  private _pending: UiEditorValue = null;

  readonly $value = this._value.asReadonly();
  readonly $disabled = computed(() => this.disabled() || this._cvaDisabled());
  readonly $focused = this._focused.asReadonly();
  readonly $invalid = this._invalid.asReadonly();

  readonly $labels = computed<UiEditorLabels>(() => ({
    ...UI_EDITOR_DEFAULT_LABELS,
    ...this.labels(),
  }));

  /** The element that `ui-form-field` labels: the editable area. */
  override readonly ariaTarget = computed(() => {
    this.version();
    return this._editor()?.view.dom;
  });

  get id(): string {
    return this.inputId() ?? this._autoId;
  }

  protected readonly $frameClass = computed(() =>
    editorVariants({
      invalid: this.$invalid() ? 'true' : 'false',
      disabled: this.$disabled() ? 'true' : 'false',
    })
  );

  private _onChange: (value: UiEditorValue) => void = () => undefined;
  private _onTouched: () => void = () => undefined;

  constructor() {
    super();

    afterNextRender(() => this._create());
    this._destroyRef.onDestroy(() => this._editor()?.destroy());

    effect(() => {
      const editor = this._editor();
      const disabled = this.$disabled();
      if (editor && editor.isEditable === disabled) {
        editor.setEditable(!disabled, false);
      }
    });

    effect(() => {
      const editor = this._editor();
      if (!editor) {
        return;
      }
      const attributes = this._attributes();
      editor.setOptions({ editorProps: { attributes } });
    });
  }

  ngAfterContentInit(): void {
    this._ngControl = this._injector.get(NgControl, null, { optional: true, self: true });
    const control = this._ngControl?.control;
    if (!control) {
      return;
    }

    this._updateInvalid();
    control.events
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this._updateInvalid());
  }

  // UiEditorContext -----------------------------------------------------------------------------

  openLink(): void {
    this._toolbar()?.openLink();
  }

  openImageUrl(): void {
    this._toolbar()?.openImageUrl();
  }

  pickImage(): void {
    this._toolbar()?.pickFile();
  }

  // ControlValueAccessor ------------------------------------------------------------------------

  writeValue(value: UiEditorValue | undefined): void {
    const next = value ?? null;
    this._value.set(next);

    const editor = this._editor();
    if (!editor) {
      this._pending = next;
      return;
    }
    this._setContent(editor, next);
  }

  registerOnChange(fn: (value: UiEditorValue) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._cvaDisabled.set(isDisabled);
  }

  // UiFormFieldControl --------------------------------------------------------------------------

  override setDescribedByIds(ids: string[]): void {
    this._describedBy.set(ids.length ? ids.join(' ') : null);
  }

  // Focus ---------------------------------------------------------------------------------------

  protected onFocusIn(): void {
    this._focused.set(true);
  }

  protected onFocusOut(event: FocusEvent): void {
    // The focused element was removed (e.g. a closed address bar): nobody left the component.
    if (!(event.target as Node).isConnected) {
      return;
    }
    const next = event.relatedTarget as HTMLElement | null;
    // Focus moving to the toolbar, the bubble menu or a menu overlay is still "inside" the editor.
    if (next && (this._host.nativeElement.contains(next) || next.closest('.cdk-overlay-pane'))) {
      return;
    }
    this._focused.set(false);
    this._onTouched();
  }

  // Editor --------------------------------------------------------------------------------------

  private _create(): void {
    // BubbleMenu appends the element when it shows it and removes it when it hides it, but leaves
    // it where Angular rendered it until the first show: take it out of the layout up front.
    const bubble = this._bubble().element;
    bubble.remove();
    // Keep the bubble inside the writing area: floating-ui only flips at the viewport edge, so near
    // the top of the text it would otherwise sit on top of the toolbar and swallow its clicks.
    const boundary = this._content().nativeElement;

    const editor = new Editor({
      element: this._content().nativeElement,
      extensions: [
        StarterKit.configure({
          link: {
            openOnClick: false,
            defaultProtocol: 'https',
            protocols: ['http', 'https', 'mailto', 'tel'],
          },
        }),
        Image,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Placeholder.configure({ placeholder: () => this.placeholder() }),
        BubbleMenu.configure({
          element: bubble,
          options: {
            placement: 'top',
            flip: { boundary, padding: 4 },
            shift: { boundary, padding: 4 },
          },
          // Text (also select-all), not a selected image: formatting makes no sense there.
          shouldShow: ({ editor: current, state }) =>
            current.isEditable &&
            this.bubbleMenu().length > 0 &&
            !state.selection.empty &&
            !isNodeSelection(state.selection),
        }),
      ],
      editable: !this.$disabled(),
      content: this._toContent(this._pending),
      editorProps: { attributes: this._attributes() },
      onTransaction: () => this.version.update((v) => v + 1),
      onUpdate: ({ editor: current }) => this._emit(current),
    });

    this._editor.set(editor);
  }

  private _emit(editor: Editor): void {
    const value = this._read(editor);
    this._value.set(value);
    this._onChange(value);
  }

  private _read(editor: Editor): UiEditorValue {
    if (this.outputFormat() === 'json') {
      return editor.isEmpty ? null : editor.getJSON();
    }
    return editor.isEmpty ? '' : editor.getHTML();
  }

  private _setContent(editor: Editor, value: UiEditorValue): void {
    editor.commands.setContent(this._toContent(value), { emitUpdate: false });
  }

  private _toContent(value: UiEditorValue): string | JSONContent {
    return value ?? '';
  }

  private _attributes(): Record<string, string> {
    const attributes: Record<string, string> = {
      class: 'editor-content',
      id: this.id,
      role: 'textbox',
      'aria-multiline': 'true',
    };

    const labelledby = this.ariaLabelledby();
    if (labelledby) {
      attributes['aria-labelledby'] = labelledby;
    } else {
      attributes['aria-label'] = this.ariaLabel() ?? this.$labels().editor;
    }

    const describedBy = this._describedBy();
    if (describedBy) {
      attributes['aria-describedby'] = describedBy;
    }
    if (this.$invalid()) {
      attributes['aria-invalid'] = 'true';
    }
    if (this.$disabled()) {
      attributes['aria-disabled'] = 'true';
    }
    return attributes;
  }

  private _updateInvalid(): void {
    const ngControl = this._ngControl;
    this._invalid.set(!!ngControl?.invalid && !!ngControl.touched);
  }
}
