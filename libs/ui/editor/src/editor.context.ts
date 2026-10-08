import { Signal } from '@angular/core';
import { Editor } from '@tiptap/core';
import { UiEditorLabels, UiEditorUploadHandler } from './editor.types';

/**
 * What the toolbar buttons need from the editor they sit in. `UiEditor` provides it, so a button
 * (rendered dynamically from the `toolbar` / `bubbleMenu` config) takes no inputs at all.
 */
export abstract class UiEditorContext {
  /** `null` until the Tiptap instance exists (it is created after the first render). */
  abstract readonly editor: Signal<Editor | null>;
  /** Changes on every transaction: reading it makes `isActive` / `can` re-evaluate. */
  abstract readonly version: Signal<number>;
  abstract readonly $labels: Signal<UiEditorLabels>;
  abstract readonly $disabled: Signal<boolean>;
  abstract readonly uploadImage: Signal<UiEditorUploadHandler | undefined>;

  /** Opens the address bar to add, change or remove the link under the selection. */
  abstract openLink(): void;
  /** Opens the address bar to insert an image by URL. */
  abstract openImageUrl(): void;
  /** Opens the file picker; the toolbar validates and uploads what is picked. */
  abstract pickImage(): void;
}
