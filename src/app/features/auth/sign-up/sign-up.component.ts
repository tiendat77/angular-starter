import { NgClass, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '@/core/auth';
import { SvgIcon } from '@libs/svg-icon';
import { BaseComponent } from '@models';
import { PasswordValidators } from './validators';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, NgTemplateOutlet, ReactiveFormsModule, RouterLink, SvgIcon],
})
export class SignUpComponent extends BaseComponent {
  form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', Validators.compose([Validators.required, Validators.email])),
    password: new FormControl(
      '',
      Validators.compose([
        Validators.required,
        Validators.minLength(6),
        PasswordValidators.noWhiteSpace(),
        PasswordValidators.letters(),
        PasswordValidators.digits(),
      ])
    ),
  });

  message: string | null = null;

  private _auth = inject(AuthService);
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _cdr = inject(ChangeDetectorRef);

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  submit() {
    if (this.form.invalid) {
      this.message = 'Please fill in all the fields';
      return;
    }

    let { name, email, password } = this.form.value;
    name = (name ?? '').trim();
    email = (email ?? '').trim();
    password = (password ?? '').trim();

    if (!name || !email || !password) {
      this.form.enable();
      this.message = 'Please fill in all the fields';
      this._cdr.markForCheck();
      return;
    }

    this.form.disable();
    this.message = null;

    this._auth
      .signUp({ name, email, password })
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._redirect();
        },
        error: (error) => {
          console.error(error);

          if (error && error?.status === 400) {
            return this._onSignUpError(error?.error?.detail);
          }

          return this._onServerError();
        },
      });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  private _redirect() {
    const redirectURL =
      this._route.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';

    this._router.navigateByUrl(redirectURL);
  }

  private _onSignUpError(message: string) {
    // Re-enable the form
    this.form.enable();
    this._cdr.markForCheck();

    // Show the alert
    this.message = message ?? 'Unknown error occurred';
  }

  private _onServerError() {
    // Re-enable the form
    this.form.enable();
    this._cdr.markForCheck();

    // Show alert
    this.message = 'Server error';
  }
}
