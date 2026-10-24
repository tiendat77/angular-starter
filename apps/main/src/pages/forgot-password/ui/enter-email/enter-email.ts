import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { of, switchMap, throwError } from 'rxjs';

import { ResponseModel } from '@/shared/api/models';
import { BaseComponent } from '@/shared/lib/base-component';
import { environment } from '@environment';

@Component({
  selector: 'app-forgot-password-enter-email',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './enter-email.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnterEmailComponent extends BaseComponent {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  readonly $message = signal<string | null>(null);
  /** The request is in flight: the form is locked and the submit button disabled. */
  readonly $submitting = signal(false);

  private _httpClient = inject(HttpClient);
  private _router = inject(Router);

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  submit() {
    if (this.form.invalid) {
      return;
    }

    this.$message.set(null);

    let { email } = this.form.value;
    email = (email ?? '').trim();

    if (!email) {
      this.$message.set('Please enter your email address. Let us rescue you!');
      this.form.enable();
      this.$submitting.set(false);
      return;
    }

    this.form.disable();

    this.$submitting.set(true);

    return this._httpClient
      .post<ResponseModel>(`${environment.apiUrl}/authentication/forgot-password`, { email })
      .pipe(
        switchMap((response: any) => {
          if (response.isError) {
            return throwError(() => new Error(response.message || 'An error occurred'));
          }

          return of(response.data);
        }),
        takeUntilDestroyed(this._destroyRef)
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
            this.$message.set("We could't find an account with that email address!");
            this.form.enable();
            this.$submitting.set(false);
            return;
          }

          this.$message.set('An error occurred. Please try again later.');
          this.form.enable();
          this.$submitting.set(false);
        },
      });
  }
}
