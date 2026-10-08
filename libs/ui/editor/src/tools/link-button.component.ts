import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UiEditorToolButton } from './editor-tool';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector -- an attribute selector on a native element
  selector: 'button[uiEditorLink]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  `,
})
export class UiEditorLinkButton extends UiEditorToolButton {
  readonly tool = 'link';
  protected readonly labelKey = 'link';

  protected run(): void {
    this.context.openLink();
  }

  protected override isActive(): boolean {
    return this.editor.isActive('link');
  }

  protected override can(): boolean {
    return !this.editor.state.selection.empty || this.editor.isActive('link');
  }
}
