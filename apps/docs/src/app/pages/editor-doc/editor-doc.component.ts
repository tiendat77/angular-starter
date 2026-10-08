import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UiButtonComponent } from '@libs/ui/button';
import {
  UI_EDITOR_DEFAULT_BUBBLE_MENU,
  UI_EDITOR_DEFAULT_TOOLBAR,
  UiEditor,
  UiEditorFormat,
  UiEditorImageFailure,
  UiEditorImageRejection,
  UiEditorToolbarItem,
  UiEditorValue,
} from '@libs/ui/editor';
import {
  UiErrorDirective,
  UiFormFieldComponent,
  UiHintDirective,
  UiLabelDirective,
} from '@libs/ui/input';
import { ApiRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { PlaygroundComponent } from '../../shared/playground/playground.component';

type ToolbarPreset = 'full' | 'compact' | 'none';

const TOOLBARS: Record<ToolbarPreset, readonly UiEditorToolbarItem[]> = {
  full: UI_EDITOR_DEFAULT_TOOLBAR,
  compact: ['bold', 'italic', 'underline', 'separator', 'bullet-list', 'ordered-list', 'link'],
  none: [],
};

const SAMPLE =
  '<h2>Hello, editor</h2><p>Select some text to get the <strong>bubble menu</strong>, or use the toolbar above. Try a <a href="https://angular.dev">link</a>, a list or a quote.</p><ul><li>Bold, italic, underline</li><li>Headings, lists, alignment</li></ul>';

/** Reads the file into a data URL: a stand-in for a real upload to your backend. */
function fakeUpload(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

@Component({
  selector: 'doc-editor',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    UiButtonComponent,
    UiFormFieldComponent,
    UiLabelDirective,
    UiHintDirective,
    UiErrorDirective,
    UiEditor,
    PlaygroundComponent,
    ApiTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './editor-doc.component.html',
})
export class EditorDocComponent {
  readonly format = signal<UiEditorFormat>('html');
  readonly placeholder = signal('Write something…');
  readonly minHeight = signal('10rem');
  readonly withUpload = signal(true);
  readonly preset = signal<ToolbarPreset>('full');
  readonly bubble = signal(true);

  readonly toolbar = computed(() => TOOLBARS[this.preset()]);
  readonly bubbleMenu = computed(() => (this.bubble() ? UI_EDITOR_DEFAULT_BUBBLE_MENU : []));

  readonly control = new FormControl<UiEditorValue>(SAMPLE);
  readonly upload = fakeUpload;

  readonly articleForm = new FormGroup({
    body: new FormControl<UiEditorValue>('', { validators: [Validators.required] }),
  });
  readonly published = signal<string | null>(null);

  readonly lastImageProblem = signal('');

  readonly valueText = computed(() => {
    this._valueTick();
    const value = this.control.value;
    return value === null || value === '' ? '(empty)' : JSON.stringify(value, null, 2);
  });
  private readonly _valueTick = signal(0);

  constructor() {
    this.control.valueChanges.subscribe(() => this._valueTick.update((v) => v + 1));
  }

  toggleDisabled(disabled: boolean): void {
    if (disabled) {
      this.control.disable();
    } else {
      this.control.enable();
    }
  }

  /** Switching the format changes what is emitted from the next edit on. */
  setFormat(format: UiEditorFormat): void {
    this.format.set(format);
    this._valueTick.update((v) => v + 1);
  }

  onImageRejected(event: UiEditorImageRejection): void {
    this.lastImageProblem.set(
      event.reason === 'type'
        ? `${event.file.name}: only PNG, JPEG, WebP and GIF images are allowed.`
        : `${event.file.name}: larger than 5 MiB.`
    );
  }

  onImageFailed(event: UiEditorImageFailure): void {
    this.lastImageProblem.set(`${event.file.name}: the upload failed.`);
  }

  publish(): void {
    this.articleForm.markAllAsTouched();
    if (this.articleForm.valid) {
      this.published.set(this.articleForm.controls.body.value as string);
    }
  }

  readonly generatedCode = computed(() => {
    const attrs = ['[formControl]="bodyControl"', `outputFormat="${this.format()}"`];
    if (this.placeholder()) attrs.push(`placeholder="${this.placeholder()}"`);
    if (this.minHeight() !== '10rem') attrs.push(`minHeight="${this.minHeight()}"`);
    if (this.preset() === 'compact') {
      attrs.push(
        "[toolbar]=\"['bold', 'italic', 'underline', 'separator', 'bullet-list', 'ordered-list', 'link']\""
      );
    } else if (this.preset() === 'none') {
      attrs.push('[toolbar]="[]"');
    }
    if (!this.bubble()) attrs.push('[bubbleMenu]="[]"');
    if (this.withUpload()) attrs.push('[uploadImage]="upload"');
    return [
      "import { UiEditor } from '@libs/ui/editor';",
      '',
      '<ui-form-field>',
      '  <label uiLabel for="body">Body</label>',
      `  <ui-editor inputId="body" ${attrs.join(' ')} />`,
      '</ui-form-field>',
    ].join('\n');
  });

  readonly reactiveFormsCode = `articleForm = new FormGroup({
  body: new FormControl('', { validators: [Validators.required] }),
});

<ui-form-field>
  <label uiLabel for="body">Body</label>
  <ui-editor inputId="body" formControlName="body" />
  @if (articleForm.controls.body.invalid && articleForm.controls.body.touched) {
    <span uiError>Write something first.</span>
  }
</ui-form-field>`;

  readonly toolbarCode = `<!-- Each tool is a component; list the ones you want, in order -->
<ui-editor [toolbar]="['bold', 'italic', 'separator', 'link']" />

<!-- Same ids for the menu over selected text; [] turns it off -->
<ui-editor [bubbleMenu]="['bold', 'italic', 'link']" />

// Tool ids: undo, heading, blockquote, align-left, align-center, align-right,
// bold, italic, underline, clear, bullet-list, ordered-list, link, image, and 'separator'.`;

  readonly uploadCode = `// Turn the picked file into a URL: any backend, promise or observable.
upload = (file: File) => this.http.post<{ url: string }>('/api/images', body(file)).pipe(map((r) => r.url));

<ui-editor
  [uploadImage]="upload"
  (imageRejected)="toast.error($event.reason === 'size' ? 'Too large' : 'Unsupported type')"
  (imageFailed)="toast.error('Upload failed')"
/>`;

  readonly apiRows: ApiRow[] = [
    {
      name: 'outputFormat',
      type: "'html' | 'json'",
      default: "'html'",
      description:
        'What the form control holds: an HTML string, or the ProseMirror JSON document. An empty document is "" (html) or null (json), so Validators.required works.',
    },
    { name: 'placeholder', type: 'string', default: "''", description: 'Shown while empty.' },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Read-only, toolbar disabled.',
    },
    {
      name: 'minHeight',
      type: 'string',
      default: "'10rem'",
      description: 'CSS length: the writing area is at least this tall.',
    },
    {
      name: 'inputId',
      type: 'string',
      default: 'auto',
      description: 'DOM id of the writing area, so a <label for> names it.',
    },
    {
      name: 'ariaLabel / ariaLabelledby',
      type: 'string',
      default: "'Rich text editor'",
      description: 'Accessible name of the writing area. ariaLabelledby wins.',
    },
    {
      name: 'toolbar',
      type: 'UiEditorToolbarItem[]',
      default: 'UI_EDITOR_DEFAULT_TOOLBAR',
      description:
        'The tools above the text, in order. Ids are typed, so a typo does not compile; "separator" draws a divider; [] shows no toolbar.',
    },
    {
      name: 'bubbleMenu',
      type: 'UiEditorToolId[]',
      default: "['bold', 'italic', 'link']",
      description: 'The tools in the menu over selected text. [] turns the menu off.',
    },
    {
      name: 'uploadImage',
      type: '(file: File) => Promise<string> | Observable<string>',
      description:
        'Turns a picked image into its URL. Without it the image menu offers only "Image from URL".',
    },
    {
      name: 'allowedImageTypes',
      type: 'string[]',
      default: 'png, jpeg, webp, gif',
      description: 'MIME types the image picker accepts.',
    },
    {
      name: 'maxImageSize',
      type: 'number',
      default: '5 MiB',
      description: 'Largest image file, in bytes.',
    },
    {
      name: 'labels',
      type: 'Partial<UiEditorLabels>',
      description: 'Overrides the English texts (toolbar names, menu items, messages) to localise.',
    },
    {
      name: '(imageRejected)',
      type: '{ file, reason: "type" | "size" }',
      description: 'A picked image was refused before upload.',
    },
    {
      name: '(imageFailed)',
      type: '{ file, error }',
      description: 'The upload handler rejected or errored.',
    },
    {
      name: 'editor',
      type: 'Signal<Editor | null>',
      description: 'The Tiptap instance once rendered in the browser, for advanced commands.',
    },
  ];
}
