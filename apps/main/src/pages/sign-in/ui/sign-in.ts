import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthApiService } from '@/features/auth';
import { BaseComponent } from '@/shared/lib/base-component';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule],
})
export class SignInComponent extends BaseComponent {
  form = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
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
      return;
    }

    this.form.disable();

    this.$submitting.set(true);
    this.$message.set(null);

    let { username, password } = this.form.value;
    username = (username ?? '').trim();
    password = (password ?? '').trim();

    this._auth
      .signIn({ username, password })
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._redirect();
        },
        error: (error) => {
          console.error(error);

          if (error && error?.status === 401) {
            return this._onSignInError();
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

  private _onSignInError() {
    // Re-enable the form
    this.form.enable();
    this.$submitting.set(false);

    // Reset the form
    this.form?.get('password')?.patchValue(null);
    this.form?.get('password')?.markAsUntouched();

    // Show the alert
    this.$message.set('Invalid username or password');
  }

  private _onServerError() {
    // Re-enable the form
    this.form.enable();
    this.$submitting.set(false);

    // Show alert
    this.$message.set('Server error');
  }
}
