import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UiEditorToolButton } from './editor-tool';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector -- an attribute selector on a native element
  selector: 'button[uiEditorBlockquote]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 17V9.5A2.5 2.5 0 0 1 6.5 7H9" />
      <path d="M4 13h5v4H4z" />
      <path d="M14 17V9.5A2.5 2.5 0 0 1 16.5 7H19" />
      <path d="M14 13h5v4h-5z" />
    </svg>
  `,
})
export class UiEditorBlockquoteButton extends UiEditorToolButton {
  readonly tool = 'blockquote';
  protected readonly labelKey = 'blockquote';

  protected run(): void {
    this.editor.chain().focus().toggleBlockquote().run();
  }

  protected override isActive(): boolean {
    return this.editor.isActive('blockquote');
  }
}
