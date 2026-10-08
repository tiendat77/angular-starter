import type { JSONContent } from '@tiptap/core';
import type { Observable } from 'rxjs';

/** What the control emits: an HTML string, or the Tiptap/ProseMirror JSON document. */
export type UiEditorFormat = 'html' | 'json';

export type UiEditorValue = string | JSONContent | null;

/** Returns the URL of the uploaded image. Provided by the app: the library knows no backend. */
export type UiEditorUploadHandler = (file: File) => Promise<string> | Observable<string>;

export interface UiEditorImageRejection {
  readonly file: File;
  /** `type`: not in `allowedImageTypes`; `size`: larger than `maxImageSize`. */
  readonly reason: 'type' | 'size';
}

export interface UiEditorImageFailure {
  readonly file: File;
  /** Whatever the upload handler rejected or errored with. */
  readonly error: unknown;
}

/** Every visible and accessible text of the editor (pass a partial object to localise). */
export interface UiEditorLabels {
  /** Accessible name of the writing area. */
  editor: string;
  /** Accessible name of the toolbar. */
  toolbar: string;
  /** Accessible name of the menu over selected text. */
  bubbleMenu: string;
  undo: string;
  /** Heading menu button, and the label of "no heading". */
  paragraph: string;
  heading: string;
  heading1: string;
  heading2: string;
  heading3: string;
  blockquote: string;
  alignLeft: string;
  alignCenter: string;
  alignRight: string;
  bold: string;
  italic: string;
  underline: string;
  clearFormatting: string;
  bulletList: string;
  orderedList: string;
  link: string;
  /** Image menu button. */
  image: string;
  uploadImage: string;
  imageFromUrl: string;
  linkUrl: string;
  imageUrl: string;
  apply: string;
  remove: string;
  cancel: string;
  invalidUrl: string;
  /** Announced while an upload runs. */
  uploading: string;
}

export const UI_EDITOR_DEFAULT_LABELS: Readonly<UiEditorLabels> = {
  editor: 'Rich text editor',
  toolbar: 'Formatting',
  bubbleMenu: 'Selection formatting',
  undo: 'Undo',
  paragraph: 'Paragraph',
  heading: 'Heading',
  heading1: 'Heading 1',
  heading2: 'Heading 2',
  heading3: 'Heading 3',
  blockquote: 'Quote',
  alignLeft: 'Align left',
  alignCenter: 'Align center',
  alignRight: 'Align right',
  bold: 'Bold',
  italic: 'Italic',
  underline: 'Underline',
  clearFormatting: 'Clear formatting',
  bulletList: 'Bullet list',
  orderedList: 'Numbered list',
  link: 'Link',
  image: 'Image',
  uploadImage: 'Upload image',
  imageFromUrl: 'Image from URL',
  linkUrl: 'Link address',
  imageUrl: 'Image address',
  apply: 'Apply',
  remove: 'Remove link',
  cancel: 'Cancel',
  invalidUrl: 'Enter a valid web address (https://…), mailto: or tel: link.',
  uploading: 'Uploading image',
};
