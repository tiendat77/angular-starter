import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { filter, switchMap } from 'rxjs/operators';

import { UiButtonComponent } from '@libs/ui/button';
import { DialogService } from '@libs/ui/dialog';
import { PageEvent, Paginator } from '@libs/ui/paginator';
import { SvgIcon } from '@libs/ui/svg-icon';
import { UI_TABLE } from '@libs/ui/table';
import { UiTagComponent } from '@libs/ui/tag';
import { ToastService } from '@libs/ui/toast';

import { ProductFormModel, ProductModel, ProductStore } from '../../model';
import { ProductDetailDialogComponent } from '../product-detail-dialog';
import { ProductDialogComponent } from '../product-dialog';
import { ProductFilterComponent } from '../product-filter';

@Component({
  selector: 'product-list',
  templateUrl: './product-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe,
    DecimalPipe,
    UI_TABLE,
    Paginator,
    ProductFilterComponent,
    UiButtonComponent,
    UiTagComponent,
    SvgIcon,
  ],
})
export class ProductListComponent implements OnInit {
  // -----------------------------------------------------------------------------------------------------
  // @ Protected & Private properties
  // -----------------------------------------------------------------------------------------------------

  protected _store = inject(ProductStore);
  private _destroyRef = inject(DestroyRef);
  private _dialog = inject(DialogService);
  private _toast = inject(ToastService);

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this._store.loadCategories();
    this._store.loadProducts();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  onAddProduct(): void {
    const dialogRef = this._dialog.open<ProductDialogComponent, any, ProductFormModel>(
      ProductDialogComponent,
      {
        data: {
          categories: this._store.$categories(),
        },
      }
    );

    dialogRef.closed
      .pipe(
        filter((result): result is ProductFormModel => !!result),
        switchMap((result) => this._store.createProduct(result)),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe({
        next: () => {
          this._toast.success('Thêm sản phẩm thành công!');
        },
        error: (err) => {
          this._toast.error(err?.message || 'Không thể thêm sản phẩm');
        },
      });
  }

  onEditProduct(product: ProductModel): void {
    const dialogRef = this._dialog.open<ProductDialogComponent, any, ProductFormModel>(
      ProductDialogComponent,
      {
        data: {
          product,
          categories: this._store.$categories(),
        },
      }
    );

    dialogRef.closed
      .pipe(
        filter((result): result is ProductFormModel => !!result),
        switchMap((result) => this._store.updateProduct(product.id, result)),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe({
        next: () => {
          this._toast.success('Cập nhật sản phẩm thành công!');
        },
        error: (err) => {
          this._toast.error(err?.message || 'Không thể cập nhật sản phẩm');
        },
      });
  }

  onViewDetail(product: ProductModel): void {
    this._dialog.open(ProductDetailDialogComponent, {
      data: product,
    });
  }

  onDeleteProduct(product: ProductModel): void {
    const confirmRef = this._dialog.confirm({
      title: 'Xác nhận xóa sản phẩm',
      message: `Bạn có chắc chắn muốn xóa sản phẩm <strong>"${product.title}"</strong>?<br>Thao tác này sẽ gửi yêu cầu mock DELETE đến server.`,
      type: 'warning',
    });

    confirmRef.closed
      .pipe(
        filter(Boolean),
        switchMap(() => this._store.deleteProduct(product.id)),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe({
        next: () => {
          this._toast.success('Đã xóa sản phẩm thành công!');
        },
        error: (err) => {
          this._toast.error(err?.message || 'Không thể xóa sản phẩm');
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this._store.setPage(event.pageIndex, event.pageSize);
  }
}
