import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UiEditorToolButton } from './editor-tool';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector -- an attribute selector on a native element
  selector: 'button[uiEditorUndo]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
    </svg>
  `,
})
export class UiEditorUndoButton extends UiEditorToolButton {
  readonly tool = 'undo';
  protected readonly labelKey = 'undo';

  protected run(): void {
    this.editor.chain().focus().undo().run();
  }

  protected override can(): boolean {
    return this.editor.can().undo();
  }
}
