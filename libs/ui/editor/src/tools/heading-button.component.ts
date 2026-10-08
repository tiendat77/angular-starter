import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { UiMenuDirective, UiMenuItemDirective, UiMenuTriggerDirective } from '@libs/ui/menu';
import { UiEditorTool } from './editor-tool';

type HeadingLevel = 1 | 2 | 3;

/** The paragraph / heading menu. Its host is a wrapper: the button inside opens a `UiMenu`. */
@Component({
  selector: 'ui-editor-heading-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiMenuTriggerDirective, UiMenuDirective, UiMenuItemDirective],
  host: { class: 'contents' },
  template: `
    <button
      type="button"
      class="editor-button editor-button-wide"
      tabindex="-1"
      [attr.data-tool]="tool"
      [attr.aria-label]="label()"
      [uiMenuTriggerFor]="menu"
      [uiMenuDisabled]="isDisabled()"
      [disabled]="isDisabled()"
      (mousedown)="$event.preventDefault()"
    >
      <span>{{ currentLabel() }}</span>
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>

    <ng-template #menu>
      <div
        uiMenu
        [attr.aria-label]="label()"
      >
        <button
          uiMenuItem
          (click)="setParagraph()"
        >
          {{ context.$labels().paragraph }}
        </button>
        @for (level of levels; track level) {
          <button
            uiMenuItem
            (click)="setHeading(level)"
          >
            {{ headingText(level) }}
          </button>
        }
      </div>
    </ng-template>
  `,
})
export class UiEditorHeadingButton extends UiEditorTool {
  readonly tool = 'heading';
  protected readonly labelKey = 'heading';

  protected readonly levels: readonly HeadingLevel[] = [1, 2, 3];

  /** The first block of the selection decides (`isActive` would need every block to match). */
  protected readonly currentLabel = computed(() => {
    this.context.version();
    const { doc, selection } = this.editor.state;
    let level = 0;
    let found = false;
    doc.nodesBetween(selection.from, selection.to, (node) => {
      if (found || !node.isTextblock) {
        return !found;
      }
      found = true;
      level = node.type.name === 'heading' ? (node.attrs['level'] as number) : 0;
      return false;
    });
    return level ? this.headingText(level) : this.context.$labels().paragraph;
  });

  protected headingText(level: number): string {
    const labels = this.context.$labels();
    return level === 1 ? labels.heading1 : level === 2 ? labels.heading2 : labels.heading3;
  }

  protected setParagraph(): void {
    this.editor.chain().focus().setParagraph().run();
  }

  protected setHeading(level: HeadingLevel): void {
    this.editor.chain().focus().setHeading({ level }).run();
  }
}
