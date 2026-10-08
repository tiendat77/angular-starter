import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UiEditorToolButton } from './editor-tool';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector -- an attribute selector on a native element
  selector: 'button[uiEditorBulletList]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M9 6h12" />
      <path d="M9 12h12" />
      <path d="M9 18h12" />
      <path d="M4 6h.01" />
      <path d="M4 12h.01" />
      <path d="M4 18h.01" />
    </svg>
  `,
})
export class UiEditorBulletListButton extends UiEditorToolButton {
  readonly tool = 'bullet-list';
  protected readonly labelKey = 'bulletList';

  protected run(): void {
    this.editor.chain().focus().toggleBulletList().run();
  }

  protected override isActive(): boolean {
    return this.editor.isActive('bulletList');
  }
}
