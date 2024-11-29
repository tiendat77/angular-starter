import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
} from '@angular/core';

import { NgClass, NgTemplateOutlet } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { SvgIcon } from '@libs/svg-icon';
import { of, switchMap, takeUntil, throwError } from 'rxjs';

import { ResponseModel } from '@/api/models';
import { environment } from '@environment';
import { BaseComponent } from '@models';
import { PasswordValidators } from '../sign-up/validators';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [NgClass, NgTemplateOutlet, ReactiveFormsModule, SvgIcon],
  templateUrl: './reset-password.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent extends BaseComponent implements OnInit {
  form = new FormGroup(
    {
      newPassword: new FormControl(
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(6),
          PasswordValidators.noWhiteSpace(),
          PasswordValidators.letters(),
          PasswordValidators.digits(),
        ])
      ),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    {
      validators: this.matchPasswordValidator.bind(this),
    }
  );

  email: string | null = null;
  token: string | null = null;
  message: string | null = null;

  private _httpClient = inject(HttpClient);
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _cdr = inject(ChangeDetectorRef);

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  ngOnInit() {
    this.email = this._route.snapshot.queryParamMap.get('email') || null;
    this.token = this._route.snapshot.queryParamMap.get('token') || null;

    if (!this.email || !this.token) {
      this._router.navigate(['/reset-password/invalid-link']);
    }
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  matchPasswordValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  submit() {
    /**
     * Validate the form
     */
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.message = 'Please fix the errors on the form';
      this._cdr.markForCheck();
      return;
    }

    this.message = null;

    let { newPassword, confirmPassword } = this.form.value;
    newPassword = (newPassword ?? '').trim();
    confirmPassword = (confirmPassword ?? '').trim();

    if (!newPassword || !confirmPassword || newPassword !== confirmPassword) {
      this.message = 'Invalid form';
      this._cdr.markForCheck();
      return;
    }

    /**
     * Call the API to reset the password
     */
    this.form.disable();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this._httpClient
      .post<ResponseModel>(
        `${environment.apiUrl}/authentication/reset-password`,
        { password: newPassword },
        { headers }
      )
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
          this._router.navigate(['/reset-password/reset-success']);
        },
        error: (error) => {
          console.error(error);

          if (error && error?.status === 401) {
            this.message = 'Your reset password link has expired. Please start over.';
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
