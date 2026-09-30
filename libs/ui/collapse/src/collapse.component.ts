import { AccordionGroup } from '@angular/aria/accordion';
import { CommonModule } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  input,
  model,
  untracked,
} from '@angular/core';
import { UI_COLLAPSE } from './collapse.tokens';
import {
  UiCollapseActiveIds,
  UiCollapseContext,
  UiCollapseIconPosition,
  UiCollapsePanelId,
  UiCollapseVariant,
} from './collapse.types';
import { collapseVariants } from './collapse.variants';

@Component({
  selector: 'ui-collapse',
  exportAs: 'uiCollapse',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  hostDirectives: [
    {
      directive: AccordionGroup,
      inputs: ['softDisabled', 'wrap'],
    },
  ],
  host: {
    '[class]': '$containerClasses()',
  },
  template: '<ng-content />',
  providers: [
    {
      provide: UI_COLLAPSE,
      useExisting: forwardRef(() => UiCollapse),
    },
  ],
})
export class UiCollapse implements UiCollapseContext {
  private readonly _panels = new Map<UiCollapsePanelId, (expanded: boolean) => void>();

  readonly accordion = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly variant = input<UiCollapseVariant>('bordered');
  readonly bordered = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly ghost = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly expandIconPosition = input<UiCollapseIconPosition>('left');
  readonly activeIds = model<UiCollapseActiveIds>(null);
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });

  readonly $accordion = this.accordion;
  readonly $expandIconPosition = this.expandIconPosition;
  readonly $disabled = this.disabled;

  readonly $variant = computed<UiCollapseVariant>(() => {
    if (this.ghost()) {
      return 'ghost';
    }
    if (!this.bordered() && this.variant() === 'bordered') {
      return 'frameless';
    }
    return this.variant();
  });

  readonly $containerClasses = computed(() => {
    return collapseVariants({ variant: this.$variant() });
  });

  constructor() {
    // Synchronize activeIds to panels
    effect(() => {
      this.activeIds();
      untracked(() => {
        for (const [id, setExpanded] of this._panels) {
          setExpanded(this.isPanelActive(id));
        }
      });
    });
  }

  isPanelActive(id: UiCollapsePanelId): boolean {
    const active = this.activeIds();
    if (active === null || active === undefined) {
      return false;
    }
    if (Array.isArray(active)) {
      return active.includes(id);
    }
    return active === id;
  }

  togglePanel(id: UiCollapsePanelId): void {
    if (this.isPanelActive(id)) {
      this.collapsePanel(id);
    } else {
      this.expandPanel(id);
    }
  }

  expandPanel(id: UiCollapsePanelId): void {
    if (this.accordion()) {
      for (const [panelId, setExpanded] of this._panels) {
        if (panelId !== id) {
          setExpanded(false);
        }
      }
      const active = this.activeIds();
      if (Array.isArray(active)) {
        this.activeIds.set([id]);
      } else {
        this.activeIds.set(id);
      }
    } else {
      const current = this._getActiveIdsArray();
      if (!current.includes(id)) {
        this.activeIds.set([...current, id]);
      }
    }
  }

  collapsePanel(id: UiCollapsePanelId): void {
    if (this.accordion()) {
      const active = this.activeIds();
      if (active === id) {
        this.activeIds.set(null);
      } else if (Array.isArray(active) && active.includes(id)) {
        this.activeIds.set([]);
      }
    } else {
      const current = this._getActiveIdsArray();
      this.activeIds.set(current.filter((item) => item !== id));
    }
  }

  registerPanel(id: UiCollapsePanelId, setExpanded: (expanded: boolean) => void): () => void {
    this._panels.set(id, setExpanded);
    if (this.isPanelActive(id)) {
      setExpanded(true);
    }
    return () => {
      this._panels.delete(id);
    };
  }

  notifyPanelExpanded(id: UiCollapsePanelId, expanded: boolean): void {
    if (expanded) {
      this.expandPanel(id);
    } else {
      this.collapsePanel(id);
    }
  }

  private _getActiveIdsArray(): UiCollapsePanelId[] {
    const active = this.activeIds();
    if (active === null || active === undefined) {
      return [];
    }
    if (Array.isArray(active)) {
      return [...active];
    }
    return [active];
  }
}
