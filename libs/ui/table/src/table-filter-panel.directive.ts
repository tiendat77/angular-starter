import { Directive, Signal, TemplateRef, inject } from '@angular/core';

export interface UiTableFilterPanelContext {
  /** The context itself, so `let-ctx` gives `ctx.value()`, `ctx.confirm()`, … */
  $implicit: UiTableFilterPanelContext;
  /** The staged (not yet applied) value. */
  value: Signal<unknown>;
  setValue(value: unknown): void;
  /** Applies the staged value and closes the panel. */
  confirm(): void;
  /** Clears the column filter and closes the panel. */
  reset(): void;
}

/** Custom filter UI: `<ng-template uiTableFilterPanel let-ctx>…</ng-template>` inside `th[uiTableFilter]`. */
@Directive({ selector: 'ng-template[uiTableFilterPanel]' })
export class UiTableFilterPanel {
  readonly templateRef = inject<TemplateRef<UiTableFilterPanelContext>>(TemplateRef);

  static ngTemplateContextGuard(
    _dir: UiTableFilterPanel,
    _ctx: unknown
  ): _ctx is UiTableFilterPanelContext {
    return true;
  }
}
