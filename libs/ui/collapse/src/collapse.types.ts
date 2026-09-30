import { Signal } from '@angular/core';

export type UiCollapseVariant = 'bordered' | 'frameless' | 'ghost';
export type UiCollapseIconPosition = 'left' | 'right';
export type UiCollapsePanelId = string | number;
export type UiCollapseActiveIds = UiCollapsePanelId | UiCollapsePanelId[] | null;

export interface UiCollapseContext {
  $variant: Signal<UiCollapseVariant>;
  $expandIconPosition: Signal<UiCollapseIconPosition>;
  $disabled: Signal<boolean>;
  $accordion: Signal<boolean>;
  isPanelActive(id: UiCollapsePanelId): boolean;
  togglePanel(id: UiCollapsePanelId): void;
  registerPanel(id: UiCollapsePanelId, setExpanded: (expanded: boolean) => void): () => void;
}
