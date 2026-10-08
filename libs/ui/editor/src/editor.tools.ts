import { Type } from '@angular/core';
import { UiEditorAlignCenterButton } from './tools/align-center-button.component';
import { UiEditorAlignLeftButton } from './tools/align-left-button.component';
import { UiEditorAlignRightButton } from './tools/align-right-button.component';
import { UiEditorBlockquoteButton } from './tools/blockquote-button.component';
import { UiEditorBoldButton } from './tools/bold-button.component';
import { UiEditorBulletListButton } from './tools/bullet-list-button.component';
import { UiEditorClearFormatButton } from './tools/clear-format-button.component';
import { UiEditorHeadingButton } from './tools/heading-button.component';
import { UiEditorImageButton } from './tools/image-button.component';
import { UiEditorItalicButton } from './tools/italic-button.component';
import { UiEditorLinkButton } from './tools/link-button.component';
import { UiEditorOrderedListButton } from './tools/ordered-list-button.component';
import { UiEditorUnderlineButton } from './tools/underline-button.component';
import { UiEditorUndoButton } from './tools/undo-button.component';

/** Every built-in tool, as written in the `toolbar` and `bubbleMenu` inputs. */
export type UiEditorToolId =
  | 'undo'
  | 'heading'
  | 'blockquote'
  | 'align-left'
  | 'align-center'
  | 'align-right'
  | 'bold'
  | 'italic'
  | 'underline'
  | 'clear'
  | 'bullet-list'
  | 'ordered-list'
  | 'link'
  | 'image';

/** A tool, or a thin divider between groups. */
export type UiEditorToolbarItem = UiEditorToolId | 'separator';

/** Tool id -> the component that renders it (each is one button, or the wrapper of a menu). */
export const UI_EDITOR_TOOLS: Readonly<Record<UiEditorToolId, Type<unknown>>> = {
  undo: UiEditorUndoButton,
  heading: UiEditorHeadingButton,
  blockquote: UiEditorBlockquoteButton,
  'align-left': UiEditorAlignLeftButton,
  'align-center': UiEditorAlignCenterButton,
  'align-right': UiEditorAlignRightButton,
  bold: UiEditorBoldButton,
  italic: UiEditorItalicButton,
  underline: UiEditorUnderlineButton,
  clear: UiEditorClearFormatButton,
  'bullet-list': UiEditorBulletListButton,
  'ordered-list': UiEditorOrderedListButton,
  link: UiEditorLinkButton,
  image: UiEditorImageButton,
};

export const UI_EDITOR_DEFAULT_TOOLBAR: readonly UiEditorToolbarItem[] = [
  'undo',
  'separator',
  'heading',
  'blockquote',
  'align-left',
  'align-center',
  'align-right',
  'separator',
  'bold',
  'italic',
  'underline',
  'clear',
  'separator',
  'bullet-list',
  'ordered-list',
  'separator',
  'link',
  'image',
];

export const UI_EDITOR_DEFAULT_BUBBLE_MENU: readonly UiEditorToolId[] = ['bold', 'italic', 'link'];
