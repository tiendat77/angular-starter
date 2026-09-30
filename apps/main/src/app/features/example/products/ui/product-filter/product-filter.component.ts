import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { UiButtonComponent } from '@libs/ui/button';
import { UiInputDirective } from '@libs/ui/input';
import { UiOptionComponent, UiSelectComponent } from '@libs/ui/select';
import { SvgIcon } from '@libs/ui/svg-icon';

import { ProductStore } from '../../model';

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

  readonly addClicked = output<void>();

  // -----------------------------------------------------------------------------------------------------
  // @ Protected & Private properties
  // -----------------------------------------------------------------------------------------------------

  protected _store = inject(ProductStore);
  private _destroyRef = inject(DestroyRef);
  private _search$ = new Subject<string>();

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this._search$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this._destroyRef))
      .subscribe((keyword) => {
        this._store.setSearch(keyword);
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
    this._store.setCategory(selected);
  }

  onAdd(): void {
    this.addClicked.emit();
  }
}
