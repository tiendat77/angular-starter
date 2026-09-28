import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiBottomSheet } from '@libs/ui/bottom-sheet';
import { UiButtonComponent } from '@libs/ui/button';
import { ApiRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { PlaygroundComponent } from '../../shared/playground/playground.component';

@Component({
  selector: 'doc-bottom-sheet',
  imports: [FormsModule, UiButtonComponent, PlaygroundComponent, ApiTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bottom-sheet-doc.component.html',
})
export class BottomSheetDocComponent {
  private readonly _bottomSheet = inject(UiBottomSheet);
  private readonly _sheetContentTpl = viewChild.required<TemplateRef<unknown>>('sheetContentTpl');

  readonly snapPointsInput = signal('0.4, 0.9');
  readonly hasBackdrop = signal(true);
  readonly disableClose = signal(false);
  readonly disableDrag = signal(false);
  readonly hasDragHandle = signal(true);
  readonly ariaLabel = signal('Filter products');
  readonly lastResult = signal<string | null>(null);

  readonly snapPoints = computed(() => {
    const parsed = this.snapPointsInput()
      .split(',')
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isFinite(value) && value > 0 && value <= 1);
    return parsed.length > 0 ? parsed : [0.5];
  });

  readonly generatedCode = computed(
    () => `private readonly _bottomSheet = inject(UiBottomSheet);

this._bottomSheet.open(sheetContentTemplate, {
  snapPoints: [${this.snapPoints().join(', ')}],
  hasBackdrop: ${this.hasBackdrop()},
  disableClose: ${this.disableClose()},
  disableDrag: ${this.disableDrag()},
  hasDragHandle: ${this.hasDragHandle()},
  ariaLabel: '${this.ariaLabel()}',
});`
  );

  readonly apiRows: ApiRow[] = [
    {
      name: 'open()',
      type: '<T, D, R>(componentOrTemplateRef, config?) => UiBottomSheetRef<T, R>',
      description: 'Opens a bottom sheet. Replaces any currently open sheet.',
    },
    {
      name: 'dismiss()',
      type: '(result?) => void',
      description: 'Dismisses the currently open sheet.',
    },
    {
      name: 'snapPoints',
      type: 'number[]',
      default: '[0.5]',
      description: 'Ascending fractions (0-1) of viewport height the sheet can snap to.',
    },
    {
      name: 'initialSnapIndex',
      type: 'number',
      default: '0',
      description: 'Index into snapPoints the sheet opens at.',
    },
    {
      name: 'hasBackdrop',
      type: 'boolean',
      default: 'true',
      description: 'Whether the overlay has a backdrop.',
    },
    {
      name: 'disableClose',
      type: 'boolean',
      default: 'false',
      description: 'Blocks backdrop-click, Escape, and drag-past-min-snap dismissal.',
    },
    {
      name: 'disableDrag',
      type: 'boolean',
      default: 'false',
      description: 'Disables pointer/keyboard resizing. snapTo() still works programmatically.',
    },
    {
      name: 'hasDragHandle',
      type: 'boolean',
      default: 'true',
      description: 'Whether the drag handle affordance renders.',
    },
    {
      name: 'UiBottomSheetRef.snapTo()',
      type: '(index: number) => void',
      description: 'Programmatically animates to a snap index.',
    },
    {
      name: 'UiBottomSheetRef.afterDismissed()',
      type: 'Observable<R | undefined>',
      description: 'Resolves with the dismiss() result, or undefined if dismissed by the user.',
    },
    {
      name: 'BOTTOM_SHEET_DEFAULT_OPTIONS',
      type: 'InjectionToken<UiBottomSheetConfig>',
      description: 'Provide app-wide defaults for every sheet.',
    },
  ];

  open(): void {
    const ref = this._bottomSheet.open(this._sheetContentTpl(), {
      snapPoints: this.snapPoints(),
      hasBackdrop: this.hasBackdrop(),
      disableClose: this.disableClose(),
      disableDrag: this.disableDrag(),
      hasDragHandle: this.hasDragHandle(),
      ariaLabel: this.ariaLabel(),
    });

    ref.afterDismissed().subscribe((result) => {
      this.lastResult.set(typeof result === 'string' ? result : 'dismissed (no result)');
    });
  }
}
