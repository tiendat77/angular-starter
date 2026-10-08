import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UiMenuDirective, UiMenuItemDirective, UiMenuTriggerDirective } from '@libs/ui/menu';
import { UiEditorTool } from './editor-tool';

/** The image menu: upload (when the app gave an `uploadImage` handler) or insert by URL. */
@Component({
  selector: 'ui-editor-image-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiMenuTriggerDirective, UiMenuDirective, UiMenuItemDirective],
  host: { class: 'contents' },
  template: `
    <button
      type="button"
      class="editor-button"
      tabindex="-1"
      [attr.data-tool]="tool"
      [attr.aria-label]="label()"
      [attr.title]="label()"
      [uiMenuTriggerFor]="menu"
      [uiMenuDisabled]="isDisabled()"
      [disabled]="isDisabled()"
      (mousedown)="$event.preventDefault()"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
        <path d="M9 10h.01" />
        <path d="m21 15-5-5L5 21" />
      </svg>
    </button>

    <ng-template #menu>
      <div
        uiMenu
        [attr.aria-label]="label()"
      >
        @if (context.uploadImage()) {
          <button
            uiMenuItem
            (click)="context.pickImage()"
          >
            {{ context.$labels().uploadImage }}
          </button>
        }
        <button
          uiMenuItem
          (click)="context.openImageUrl()"
        >
          {{ context.$labels().imageFromUrl }}
        </button>
      </div>
    </ng-template>
  `,
})
export class UiEditorImageButton extends UiEditorTool {
  readonly tool = 'image';
  protected readonly labelKey = 'image';
}
