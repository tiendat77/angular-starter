import { Direction } from '@angular/cdk/bidi';
import { InjectionToken, ViewContainerRef } from '@angular/core';
import { UiBottomSheetSnapPoints } from './bottom-sheet.types';

export const BOTTOM_SHEET_DATA = new InjectionToken<unknown>('BOTTOM_SHEET_DATA');

export class UiBottomSheetConfig<D = unknown> {
  /** The view container that serves as the DI parent for the sheet. Does not affect DOM placement. */
  viewContainerRef?: ViewContainerRef;

  /** Text layout direction for the sheet. */
  direction?: Direction;

  /** Data injected into the opened component/template via BOTTOM_SHEET_DATA. */
  data?: D | null = null;

  /** Whether the overlay has a backdrop. */
  hasBackdrop = true;

  /** Blocks backdrop-click, Escape, and drag-past-min-snap dismissal. dismiss() still always works. */
  disableClose = false;

  /** Disables pointer/keyboard resizing. snapTo() remains callable programmatically. */
  disableDrag = false;

  /** Whether the visual drag handle affordance renders. */
  hasDragHandle = true;

  /** Whether focus returns to the trigger element on dismiss. */
  restoreFocus = true;

  /** Ascending fractions (0-1) of viewport height the sheet can be dragged/snapped to. */
  snapPoints: UiBottomSheetSnapPoints = [0.5];

  /** Index into snapPoints the sheet opens at. */
  initialSnapIndex = 0;

  /** Extra class(es) applied to the overlay pane. */
  panelClass?: string | string[];

  /** Extra class applied to the CDK backdrop element. */
  backdropClass?: string = 'ui-bottom-sheet-backdrop';

  /** aria-label applied to the panel's role="dialog" element. */
  ariaLabel: string | null = null;
}

export function BOTTOM_SHEET_DEFAULT_OPTIONS_FACTORY(): UiBottomSheetConfig {
  return new UiBottomSheetConfig();
}

export const BOTTOM_SHEET_DEFAULT_OPTIONS = new InjectionToken<UiBottomSheetConfig>(
  'bottom-sheet-default-options',
  {
    providedIn: 'root',
    factory: BOTTOM_SHEET_DEFAULT_OPTIONS_FACTORY,
  }
);
