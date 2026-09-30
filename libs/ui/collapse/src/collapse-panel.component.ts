import { AccordionContent, AccordionPanel, AccordionTrigger } from '@angular/aria/accordion';
import { CommonModule } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  effect,
  inject,
  input,
  model,
  signal,
  untracked,
} from '@angular/core';
import {
  UiCollapseContentDirective,
  UiCollapseExtraDirective,
  UiCollapseHeaderDirective,
  UiCollapseIconDirective,
} from './collapse.directives';
import { UI_COLLAPSE } from './collapse.tokens';
import { UiCollapseIconPosition, UiCollapsePanelId, UiCollapseVariant } from './collapse.types';
import { collapsePanelVariants } from './collapse.variants';

let _nextPanelId = 0;

@Component({
  selector: 'ui-collapse-panel',
  exportAs: 'uiCollapsePanel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, AccordionTrigger, AccordionPanel, AccordionContent],
  host: {
    class: 'block',
  },
  template: `
    <div class="ui-collapse-panel">
      <button
        #ariaTrigger="ngAccordionTrigger"
        type="button"
        ngAccordionTrigger
        [id]="headerId()"
        [panel]="ariaPanel"
        [disabled]="isDisabled()"
        [class]="$headerClasses()"
        [(expanded)]="expanded"
      >
        @if ($iconPosition() === 'left') {
          @if (showArrow()) {
            <span
              class="ui-collapse-icon inline-flex items-center transition-transform duration-200"
              [class.rotate-90]="expanded()"
            >
              @if (customIcon()) {
                <ng-container [ngTemplateOutlet]="customIcon()!.templateRef" />
              } @else {
                <svg
                  class="h-4 w-4 fill-none stroke-current stroke-2"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              }
            </span>
          }

          <div class="flex flex-1 items-center gap-2">
            @if (customHeader()) {
              <ng-container [ngTemplateOutlet]="customHeader()!.templateRef ?? null" />
            } @else {
              <span>{{ header() }}</span>
            }
          </div>

          @if (customExtra() || extra()) {
            <div
              tabindex="-1"
              class="ui-collapse-extra ml-auto flex items-center"
              (click)="$event.stopPropagation()"
              (keydown)="$event.stopPropagation()"
            >
              @if (customExtra()) {
                <ng-container [ngTemplateOutlet]="customExtra()!.templateRef ?? null" />
              } @else {
                <span>{{ extra() }}</span>
              }
            </div>
          }
        } @else {
          @if (showArrow()) {
            <span
              class="ui-collapse-icon inline-flex items-center transition-transform duration-200"
              [class.rotate-90]="expanded()"
            >
              @if (customIcon()) {
                <ng-container [ngTemplateOutlet]="customIcon()!.templateRef" />
              } @else {
                <svg
                  class="h-4 w-4 fill-none stroke-current stroke-2"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              }
            </span>
          }

          @if (customExtra() || extra()) {
            <div
              tabindex="-1"
              class="ui-collapse-extra flex items-center"
              (click)="$event.stopPropagation()"
              (keydown)="$event.stopPropagation()"
            >
              @if (customExtra()) {
                <ng-container [ngTemplateOutlet]="customExtra()!.templateRef ?? null" />
              } @else {
                <span>{{ extra() }}</span>
              }
            </div>
          }

          <div class="flex flex-1 items-center gap-2">
            @if (customHeader()) {
              <ng-container [ngTemplateOutlet]="customHeader()!.templateRef ?? null" />
            } @else {
              <span>{{ header() }}</span>
            }
          </div>
        }
      </button>

      <div
        #ariaPanel="ngAccordionPanel"
        ngAccordionPanel
        [id]="contentId()"
      >
        <ng-template ngAccordionContent />
        <div
          class="grid transition-[grid-template-rows] duration-200 ease-out"
          [class.grid-rows-[1fr]]="expanded()"
          [class.grid-rows-[0fr]]="!expanded()"
        >
          <div class="overflow-hidden">
            <div [class]="$contentClasses()">
              @if (customContent()) {
                @if ($hasExpandedOnce() || expanded()) {
                  <ng-container [ngTemplateOutlet]="customContent()!.templateRef" />
                }
              } @else {
                <ng-content />
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class UiCollapsePanel {
  protected readonly _collapse = inject(UI_COLLAPSE, { optional: true });
  private readonly _defaultId = `ui-collapse-panel-${_nextPanelId++}`;

  readonly id = input<UiCollapsePanelId>(this._defaultId);
  readonly header = input<string>('');
  readonly extra = input<string>('');
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly showArrow = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly expanded = model<boolean>(false);

  readonly customHeader = contentChild(UiCollapseHeaderDirective);
  readonly customExtra = contentChild(UiCollapseExtraDirective);
  readonly customContent = contentChild(UiCollapseContentDirective);
  readonly customIcon = contentChild(UiCollapseIconDirective);

  readonly $hasExpandedOnce = signal(false);

  readonly isDisabled = computed(() => {
    return this.disabled() || (this._collapse ? this._collapse.$disabled() : false);
  });

  readonly $variant = computed<UiCollapseVariant>(() => {
    return this._collapse ? this._collapse.$variant() : 'bordered';
  });

  readonly $iconPosition = computed<UiCollapseIconPosition>(() => {
    return this._collapse ? this._collapse.$expandIconPosition() : 'left';
  });

  readonly headerId = computed(() => `ui-collapse-header-${this.id()}`);
  readonly contentId = computed(() => `ui-collapse-content-${this.id()}`);

  readonly $headerClasses = computed(() => {
    return collapsePanelVariants({
      variant: this.$variant(),
      iconPosition: this.$iconPosition(),
    });
  });

  readonly $contentClasses = computed(() => {
    const variant = this.$variant();
    switch (variant) {
      case 'bordered':
        return 'p-4 border-t border-border bg-muted/30';
      case 'frameless':
        return 'p-4 border-t border-border';
      case 'ghost':
        return 'p-4 border-0';
    }
  });

  constructor() {
    effect(() => {
      if (this.expanded()) {
        this.$hasExpandedOnce.set(true);
      }
    });

    if (this._collapse) {
      effect((onCleanup) => {
        const id = this.id();
        if (!this._collapse) return;

        const unregister = untracked(() =>
          this._collapse!.registerPanel(id, (val) => {
            if (this.expanded() !== val) {
              this.expanded.set(val);
            }
          })
        );

        onCleanup(() => {
          unregister();
        });
      });

      effect(() => {
        const id = this.id();
        const isExp = this.expanded();
        untracked(() => {
          if (this._collapse && this._collapse.isPanelActive(id) !== isExp) {
            (
              this._collapse as unknown as {
                notifyPanelExpanded: (id: UiCollapsePanelId, exp: boolean) => void;
              }
            ).notifyPanelExpanded(id, isExp);
          }
        });
      });
    }
  }
}
