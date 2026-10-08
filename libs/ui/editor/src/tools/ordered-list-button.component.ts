import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UiEditorToolButton } from './editor-tool';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector -- an attribute selector on a native element
  selector: 'button[uiEditorOrderedList]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M10 6h11" />
      <path d="M10 12h11" />
      <path d="M10 18h11" />
      <path d="M4 6h1v4" />
      <path d="M4 10h2" />
      <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
    </svg>
  `,
})
export class UiEditorOrderedListButton extends UiEditorToolButton {
  readonly tool = 'ordered-list';
  protected readonly labelKey = 'orderedList';

  protected run(): void {
    this.editor.chain().focus().toggleOrderedList().run();
  }

  protected override isActive(): boolean {
    return this.editor.isActive('orderedList');
  }
}
