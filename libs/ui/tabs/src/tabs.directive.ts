import { Tabs } from '@angular/aria/tabs';
import { Directive, computed, inject, input } from '@angular/core';
import { UiColor } from '@libs/ui/core';
import {
  UI_TABS_CONFIG,
  UI_TABS_CONTEXT,
  UiTabsContext,
  UiTabsOrientation,
  UiTabsSize,
  UiTabsVariant,
} from './tabs.types';

@Directive({
  selector: '[uiTabs]',
  exportAs: 'uiTabs',
  standalone: true,
  hostDirectives: [Tabs],
  providers: [
    {
      provide: UI_TABS_CONTEXT,
      useExisting: UiTabsDirective,
    },
  ],
})
export class UiTabsDirective implements UiTabsContext {
  private readonly config = inject(UI_TABS_CONFIG, { optional: true });

  readonly uiTabs = input<UiTabsVariant | '' | undefined>(undefined);
  readonly uiTabsVariant = input<UiTabsVariant | undefined>(undefined);

  readonly variant = computed<UiTabsVariant>(() => {
    const shorthand = this.uiTabs();
    if (shorthand) {
      return shorthand;
    }
    return this.uiTabsVariant() ?? this.config?.variant ?? 'bordered';
  });

  readonly uiTabsSize = input<UiTabsSize | undefined>(undefined);
  readonly size = computed<UiTabsSize>(() => {
    return this.uiTabsSize() ?? this.config?.size ?? 'md';
  });

  readonly uiTabsOrientation = input<UiTabsOrientation | undefined>(undefined);
  readonly orientation = computed<UiTabsOrientation>(() => {
    return this.uiTabsOrientation() ?? this.config?.orientation ?? 'horizontal';
  });

  readonly uiTabsColor = input<UiColor | undefined>(undefined);
  readonly color = computed<UiColor>(() => {
    return this.uiTabsColor() ?? this.config?.color ?? 'primary';
  });
}
