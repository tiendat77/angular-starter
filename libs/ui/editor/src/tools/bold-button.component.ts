import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UiEditorToolButton } from './editor-tool';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector -- an attribute selector on a native element
  selector: 'button[uiEditorBold]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M7 5h6a3.5 3.5 0 0 1 0 7H7z" />
      <path d="M7 12h7a3.5 3.5 0 0 1 0 7H7z" />
    </svg>
  `,
})
export class UiEditorBoldButton extends UiEditorToolButton {
  readonly tool = 'bold';
  protected readonly labelKey = 'bold';

  protected run(): void {
    this.editor.chain().focus().toggleBold().run();
  }

  protected override isActive(): boolean {
    return this.editor.isActive('bold');
  }
}
