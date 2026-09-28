import { Tab } from '@angular/aria/tabs';
import { Directive, computed, inject, input } from '@angular/core';
import { UiColor } from '@libs/ui/core';
import { UiTabListDirective } from './tab-list.directive';
import { UI_TABS_CONTEXT } from './tabs.types';
import { tabVariants } from './tabs.variants';

@Directive({
  selector: '[uiTab]',
  exportAs: 'uiTab',
  standalone: true,
  hostDirectives: [
    {
      directive: Tab,
      inputs: ['value', 'disabled', 'id'],
    },
  ],
  host: {
    '[class]': 'classes()',
  },
})
export class UiTabDirective {
  private readonly context = inject(UI_TABS_CONTEXT, { optional: true });
  private readonly tabList = inject(UiTabListDirective, { optional: true });
  readonly tab = inject(Tab);

  readonly uiTabColor = input<UiColor | undefined>(undefined);

  readonly classes = computed(() => {
    return tabVariants({
      variant: this.context?.variant() ?? 'bordered',
      size: this.context?.size() ?? 'md',
      color: this.uiTabColor() ?? this.context?.color() ?? 'primary',
      orientation:
        this.tabList?.effectiveOrientation() ?? this.context?.orientation() ?? 'horizontal',
    });
  });
}
