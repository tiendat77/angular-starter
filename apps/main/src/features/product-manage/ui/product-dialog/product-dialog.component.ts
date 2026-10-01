import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { UiButtonComponent } from '@libs/ui/button';
import { UiInputDirective, UiTextareaDirective } from '@libs/ui/input';
import { UiOptionComponent, UiSelectComponent } from '@libs/ui/select';
import { SvgIcon } from '@libs/ui/svg-icon';

import {
  ProductCategory,
  ProductFormModel,
  ProductFormSchema,
  ProductModel,
} from '@/entities/product';

export interface ProductDialogData {
  product?: ProductModel;
  categories: ProductCategory[];
}

@Component({
  selector: 'product-dialog',
  templateUrl: './product-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    UiButtonComponent,
    UiInputDirective,
    UiTextareaDirective,
    UiSelectComponent,
    UiOptionComponent,
    SvgIcon,
  ],
})
export class ProductDialogComponent {
  // -----------------------------------------------------------------------------------------------------
  // @ Public properties
  // -----------------------------------------------------------------------------------------------------

  readonly data = inject<ProductDialogData>(DIALOG_DATA, { optional: true });
  readonly dialogRef = inject(DialogRef<ProductFormModel | null>);

  readonly isEdit = computed(() => !!this.data?.product);
  readonly dialogTitle = computed(() =>
    this.isEdit() ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'
  );
  readonly errorMessage = signal<string | null>(null);

  readonly form: FormGroup;

  // -----------------------------------------------------------------------------------------------------
  // @ Private properties
  // -----------------------------------------------------------------------------------------------------

  private _fb = inject(FormBuilder);

  // -----------------------------------------------------------------------------------------------------
  // @ Constructor
  // -----------------------------------------------------------------------------------------------------

  constructor() {
    const product = this.data?.product;
    this.form = this._fb.group({
      title: [product?.title || '', [Validators.required]],
      category: [product?.category || '', [Validators.required]],
      price: [product?.price ?? 0, [Validators.required, Validators.min(0)]],
      stock: [product?.stock ?? 0, [Validators.required, Validators.min(0)]],
      description: [product?.description || ''],
    });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  onCategoryChange(cat: string | string[] | null): void {
    const selected = Array.isArray(cat) ? cat[0] || '' : cat || '';
    this.form.get('category')?.setValue(selected);
    this.form.get('category')?.markAsDirty();
  }

  onSave(): void {
    const formValues = {
      ...this.form.value,
      price: Number(this.form.value.price),
      stock: Number(this.form.value.stock),
    };

    const parseResult = ProductFormSchema.safeParse(formValues);
    if (!parseResult.success) {
      this.form.markAllAsTouched();
      for (const issue of parseResult.error.issues) {
        const field = issue.path[0] as string;
        if (field && this.form.get(field)) {
          this.form.get(field)?.setErrors({ zod: issue.message });
        }
      }
      const firstIssue = parseResult.error.issues[0]?.message;
      this.errorMessage.set(firstIssue || 'Dữ liệu không hợp lệ.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    this.dialogRef.close(parseResult.data);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
