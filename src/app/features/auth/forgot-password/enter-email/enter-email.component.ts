import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { of, switchMap, takeUntil, throwError } from 'rxjs';

import { BaseComponent } from '@models';
import { ResponseModel } from '@/api/models';
import { environment } from '@environment';

@Component({
  selector: 'app-forgot-password-enter-email',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './enter-email.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnterEmailComponent extends BaseComponent {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  message: string | null = null;

  private _httpClient = inject(HttpClient);
  private _router = inject(Router);
  private _cdr = inject(ChangeDetectorRef);

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  submit() {
    if (this.form.invalid) {
      return;
    }

    this.message = null;

    let { email } = this.form.value;
    email = (email ?? '').trim();

    if (!email) {
      this.message = 'Please enter your email address. Let us rescue you!';
      this.form.enable();
      this._cdr.markForCheck();
      return;
    }

    this.form.disable();

    return this._httpClient
      .post<ResponseModel>(`${environment.apiUrl}/authentication/forgot-password`, { email })
      .pipe(
        switchMap((response: any) => {
          if (response.isError) {
            return throwError(() => new Error(response.message || 'An error occurred'));
          }

          return of(response.data);
        }),
        takeUntil(this._destroyed$)
      )
      .subscribe({
        next: () => {
          this._router.navigate(['/forgot-password/email-sent'], {
            queryParams: { email },
          });
        },
        error: (error) => {
          console.error(error);

          if (error && error?.status === 404) {
            this.message = "We could't find an account with that email address!";
            this._cdr.markForCheck();
            this.form.enable();
            return;
          }

          this.message = 'An error occurred. Please try again later.';
          this._cdr.markForCheck();
          this.form.enable();
        },
      });
  }
}
