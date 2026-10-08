import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UiEditorToolButton } from './editor-tool';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector -- an attribute selector on a native element
  selector: 'button[uiEditorAlignRight]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 6h16" />
      <path d="M10 12h10" />
      <path d="M6 18h14" />
    </svg>
  `,
})
export class UiEditorAlignRightButton extends UiEditorToolButton {
  readonly tool = 'align-right';
  protected readonly labelKey = 'alignRight';

  protected run(): void {
    this.editor.chain().focus().setTextAlign('right').run();
  }

  protected override isActive(): boolean {
    return this.editor.isActive({ textAlign: 'right' });
  }
}
