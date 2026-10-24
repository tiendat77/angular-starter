import { NgClass, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthApiService, PasswordValidators } from '@/features/auth';
import { BaseComponent } from '@/shared/lib/base-component';
import { SvgIcon } from '@libs/ui/svg-icon';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.html',
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

  readonly $message = signal<string | null>(null);
  /** The request is in flight: the form is locked and the submit button disabled. */
  readonly $submitting = signal(false);

  private _auth = inject(AuthApiService);
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  submit() {
    if (this.form.invalid) {
      this.$message.set('Please fill in all the fields');
      return;
    }

    let { name, email, password } = this.form.value;
    name = (name ?? '').trim();
    email = (email ?? '').trim();
    password = (password ?? '').trim();

    if (!name || !email || !password) {
      this.form.enable();
      this.$submitting.set(false);
      this.$message.set('Please fill in all the fields');
      return;
    }

    this.form.disable();

    this.$submitting.set(true);
    this.$message.set(null);

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
    this.$submitting.set(false);

    // Show the alert
    this.$message.set(message ?? 'Unknown error occurred');
  }

  private _onServerError() {
    // Re-enable the form
    this.form.enable();
    this.$submitting.set(false);

    // Show alert
    this.$message.set('Server error');
  }
}
