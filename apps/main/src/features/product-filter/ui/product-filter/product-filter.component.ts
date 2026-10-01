import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ProductCategory } from '@/entities/product';
import { UiButtonComponent } from '@libs/ui/button';
import { UiInputDirective } from '@libs/ui/input';
import { UiOptionComponent, UiSelectComponent } from '@libs/ui/select';
import { SvgIcon } from '@libs/ui/svg-icon';

@Component({
  selector: 'product-filter',
  templateUrl: './product-filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    UiButtonComponent,
    UiInputDirective,
    UiSelectComponent,
    UiOptionComponent,
    SvgIcon,
  ],
})
export class ProductFilterComponent implements OnInit {
  // -----------------------------------------------------------------------------------------------------
  // @ Public properties
  // -----------------------------------------------------------------------------------------------------

  /** Current search keyword. */
  readonly search = input('');

  /** Selected category slug (empty for all). */
  readonly category = input<string | null>(null);

  /** Categories offered by the select. */
  readonly categories = input<readonly ProductCategory[]>([]);

  /** Emits the (debounced) keyword whenever the user types. */
  readonly searchChange = output<string>();

  /** Emits the selected category slug, empty for "all". */
  readonly categoryChange = output<string>();

  readonly addClicked = output<void>();

  // -----------------------------------------------------------------------------------------------------
  // @ Protected & Private properties
  // -----------------------------------------------------------------------------------------------------

  private _destroyRef = inject(DestroyRef);
  private _search$ = new Subject<string>();

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this._search$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this._destroyRef))
      .subscribe((keyword) => {
        this.searchChange.emit(keyword);
      });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  onSearchChange(keyword: string): void {
    this._search$.next(keyword);
  }

  onCategoryChange(category: string | string[] | null): void {
    const selected = Array.isArray(category) ? category[0] || '' : category || '';
    this.categoryChange.emit(selected);
  }

  onAdd(): void {
    this.addClicked.emit();
  }
}
