import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { UiButtonComponent } from '@libs/ui/button';
import { SvgIcon } from '@libs/ui/svg-icon';
import { UiTagComponent } from '@libs/ui/tag';

import { ProductModel } from '../../model';

@Component({
  selector: 'product-detail-dialog',
  templateUrl: './product-detail-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DecimalPipe, UiButtonComponent, UiTagComponent, SvgIcon],
})
export class ProductDetailDialogComponent {
  // -----------------------------------------------------------------------------------------------------
  // @ Public properties
  // -----------------------------------------------------------------------------------------------------

  readonly product = inject<ProductModel>(DIALOG_DATA);
  readonly dialogRef = inject(DialogRef<void>);

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  onClose(): void {
    this.dialogRef.close();
  }
}
