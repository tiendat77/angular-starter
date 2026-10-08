import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UiEditorToolButton } from './editor-tool';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector -- an attribute selector on a native element
  selector: 'button[uiEditorClearFormat]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 7V4h16v3" />
      <path d="M9 20h6" />
      <path d="M12 4v8" />
      <path d="M4 20 20 4" />
    </svg>
  `,
})
export class UiEditorClearFormatButton extends UiEditorToolButton {
  readonly tool = 'clear';
  protected readonly labelKey = 'clearFormatting';

  protected run(): void {
    this.editor.chain().focus().unsetAllMarks().clearNodes().run();
  }
}
