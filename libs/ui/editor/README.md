# Editor

A rich-text (WYSIWYG) editor on [Tiptap](https://tiptap.dev): a toolbar, a menu over selected text, links, images (by URL or upload), headings, lists, quotes, alignment. A form control that works with `formControl`, `ngModel` and inside `ui-form-field`.

Tiptap is large, so this entrypoint is separate: import it where you use it (a lazy route), and install its packages (they are optional peers of `@libs/ui`):

```bash
npm i @tiptap/core @tiptap/pm @tiptap/starter-kit @tiptap/extensions \
      @tiptap/extension-image @tiptap/extension-text-align @tiptap/extension-bubble-menu
```

```ts
import { UiEditor } from '@libs/ui/editor';
```

## Usage

```html
<ui-form-field>
  <label uiLabel for="body">Article</label>
  <ui-editor inputId="body" [formControl]="body" placeholder="Write the article…" />
  @if (body.invalid && body.touched) { <span uiError>Write something first.</span> }
</ui-form-field>
```

The value is an HTML string (`outputFormat="html"`, the default) or the Tiptap JSON document (`"json"`). An empty document is `''` (html) or `null` (json), so `Validators.required` works.

**HTML is not sanitised.** Treat it as untrusted wherever you show it: Angular's `[innerHTML]` sanitises it, and a server that stores and re-serves it must do the same. Links accept only `http`, `https`, `mailto` and `tel`.

Choose the tools, in order (`'separator'` draws a divider):

```html
<ui-editor [toolbar]="['bold', 'italic', 'separator', 'bullet-list', 'link']" [bubbleMenu]="[]" />
```

Tools: `undo`, `heading`, `blockquote`, `align-left`, `align-center`, `align-right`, `bold`, `italic`, `underline`, `clear`, `bullet-list`, `ordered-list`, `link`, `image`. `UI_EDITOR_DEFAULT_TOOLBAR` and `UI_EDITOR_DEFAULT_BUBBLE_MENU` are the defaults.

Image upload: the library knows no backend; give it a function that turns a file into a URL (a promise or an observable):

```ts
upload = (file: File) => this.http.post<{ url: string }>('/api/images', toForm(file)).pipe(map((r) => r.url));
```

```html
<ui-editor
  [uploadImage]="upload"
  (imageRejected)="toast.error($event.reason === 'size' ? 'Too large' : 'Unsupported type')"
  (imageFailed)="toast.error('Upload failed')"
/>
```

Without `uploadImage` the image menu offers only "Image from URL". A picked file is checked first (type and size).

## API

| Input               | Type                                                    | Default                      | Description                                                                 |
| ------------------- | ------------------------------------------------------- | ---------------------------- | --------------------------------------------------------------------------- |
| `outputFormat`      | `'html' \| 'json'`                                      | `'html'`                     | What the form control holds.                                                |
| `placeholder`       | `string`                                                | `''`                         | Shown while empty.                                                          |
| `disabled`          | `boolean`                                               | `false`                      | Read-only, toolbar disabled. Also set by the form.                          |
| `minHeight`         | `string`                                                | `'10rem'`                    | CSS length: the writing area is at least this tall.                         |
| `toolbar`           | `UiEditorToolbarItem[]`                                 | `UI_EDITOR_DEFAULT_TOOLBAR`  | Tools above the text, in order; `[]` shows none.                            |
| `bubbleMenu`        | `UiEditorToolId[]`                                      | `['bold', 'italic', 'link']` | Tools in the menu over selected text; `[]` turns it off.                    |
| `uploadImage`       | `(file: File) => Promise<string> \| Observable<string>` | –                            | Turns a picked image into its URL.                                          |
| `allowedImageTypes` | `string[]`                                              | png, jpeg, webp, gif         | MIME types the image picker accepts.                                        |
| `maxImageSize`      | `number`                                                | `5242880` (5 MiB)            | Largest image file in bytes.                                                |
| `inputId`           | `string`                                                | auto                         | DOM id of the writing area, so a `<label for>` names it.                    |
| `ariaLabel`         | `string`                                                | `'Rich text editor'`         | Accessible name of the writing area (ignored when `ariaLabelledby` is set). |
| `ariaLabelledby`    | `string`                                                | –                            | Id of an element that names it.                                             |
| `labels`            | `Partial<UiEditorLabels>`                               | English                      | Every text of the toolbar, menus and messages. Use it to localise.          |

| Output          | Type                                       | Description                               |
| --------------- | ------------------------------------------ | ----------------------------------------- |
| `imageRejected` | `{ file: File, reason: 'type' \| 'size' }` | A picked image was refused before upload. |
| `imageFailed`   | `{ file: File, error: unknown }`           | The upload handler failed.                |

`editor` is a `Signal<Editor | null>`: the Tiptap instance, once it is rendered in the browser, for advanced commands (`editor()?.chain().focus().toggleBold().run()`).

Keyboard: the toolbar is one tab stop; Arrow Left / Right, Home and End move between tools. `Escape` closes the link bar.
