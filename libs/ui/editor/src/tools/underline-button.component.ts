import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UiEditorToolButton } from './editor-tool';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector -- an attribute selector on a native element
  selector: 'button[uiEditorUnderline]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M6 4v6a6 6 0 0 0 12 0V4" />
      <path d="M4 20h16" />
    </svg>
  `,
})
export class UiEditorUnderlineButton extends UiEditorToolButton {
  readonly tool = 'underline';
  protected readonly labelKey = 'underline';

  protected run(): void {
    this.editor.chain().focus().toggleUnderline().run();
  }

  protected override isActive(): boolean {
    return this.editor.isActive('underline');
  }
}
