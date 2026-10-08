import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UiEditorToolButton } from './editor-tool';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector -- an attribute selector on a native element
  selector: 'button[uiEditorItalic]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M19 4h-9" />
      <path d="M14 20H5" />
      <path d="M15 4 9 20" />
    </svg>
  `,
})
export class UiEditorItalicButton extends UiEditorToolButton {
  readonly tool = 'italic';
  protected readonly labelKey = 'italic';

  protected run(): void {
    this.editor.chain().focus().toggleItalic().run();
  }

  protected override isActive(): boolean {
    return this.editor.isActive('italic');
  }
}
