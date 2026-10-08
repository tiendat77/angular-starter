import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, inject, input } from '@angular/core';
import { UiEditorContext } from './editor.context';
import { UI_EDITOR_TOOLS, UiEditorToolId } from './editor.tools';

/**
 * The small menu that floats over selected text. Internal: `UiEditor` renders it and hands its
 * element to Tiptap's BubbleMenu extension, which positions and shows it. Its tools come from the
 * `bubbleMenu` config and are the same components the toolbar uses.
 *
 * It is a pointer convenience (its tools are not tab stops); the toolbar offers the same commands
 * to keyboard users.
 */
@Component({
  selector: 'ui-editor-bubble-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgComponentOutlet],
  host: {
    class: 'editor-bubble',
    role: 'toolbar',
    '[attr.aria-label]': 'context.$labels().bubbleMenu',
  },
  templateUrl: './editor-bubble-menu.component.html',
})
export class UiEditorBubbleMenu {
  protected readonly context = inject(UiEditorContext);

  readonly tools = input.required<readonly UiEditorToolId[]>();

  /** What Tiptap's BubbleMenu moves and shows. */
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly registry = UI_EDITOR_TOOLS;
}
