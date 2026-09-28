import { TabList } from '@angular/aria/tabs';
import { Directive, computed, inject, input } from '@angular/core';
import { UI_TABS_CONTEXT, UiTabsOrientation } from './tabs.types';

@Directive({
  selector: '[uiTabList]',
  exportAs: 'uiTabList',
  standalone: true,
  hostDirectives: [
    {
      directive: TabList,
      inputs: ['wrap', 'selectedTab', 'selectionMode'],
      outputs: ['selectedTabChange'],
    },
  ],
  host: {
    '[class]': 'classes()',
  },
})
export class UiTabListDirective {
  private readonly context = inject(UI_TABS_CONTEXT, { optional: true });
  private readonly tabList = inject(TabList);

  readonly orientation = input<UiTabsOrientation | undefined>(undefined);
  readonly softDisabled = input<boolean>(false);

  readonly effectiveOrientation = computed<UiTabsOrientation>(() => {
    return this.orientation() ?? this.context?.orientation() ?? 'horizontal';
  });

  readonly classes = computed(() => {
    const v = this.context?.variant() ?? 'bordered';
    const s = this.context?.size() ?? 'md';
    const o = this.effectiveOrientation();
    return `tabs tabs-${v} tabs-${s} tabs-${o}`;
  });

  constructor() {
    // Bridge context and library defaults into @angular/aria/tabs internals:
    // 1. By default, softDisabled in @angular/aria/tabs is true (roving tabindex lands on disabled tabs).
    //    We default softDisabled to false so disabled tabs are properly skipped during keyboard arrow navigation.
    // 2. TabList initializes its pattern once at property instantiation; dynamically updating orientation
    //    and softDisabled signals ensures vertical arrow keys (ArrowUp/Down) and skip logic function seamlessly.
    const tabListAny = this.tabList as unknown as {
      orientation?: () => UiTabsOrientation;
      softDisabled?: () => boolean;
      _pattern?: {
        orientation?: () => UiTabsOrientation;
        inputs?: {
          orientation?: () => UiTabsOrientation;
          softDisabled?: () => boolean;
        };
        focusBehavior?: {
          inputs?: {
            softDisabled?: () => boolean;
          };
        };
      };
    };

    tabListAny.orientation = this.effectiveOrientation;
    tabListAny.softDisabled = this.softDisabled;

    const pattern = tabListAny._pattern;
    if (pattern) {
      pattern.orientation = this.effectiveOrientation;
      if (pattern.inputs) {
        pattern.inputs.orientation = this.effectiveOrientation;
        pattern.inputs.softDisabled = this.softDisabled;
      }
      if (pattern.focusBehavior?.inputs) {
        pattern.focusBehavior.inputs.softDisabled = this.softDisabled;
      }
    }
  }
}
