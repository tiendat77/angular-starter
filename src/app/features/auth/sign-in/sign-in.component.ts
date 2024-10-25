import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { takeUntil } from 'rxjs';
import { AuthService } from '@/core/auth';
import { BaseComponent } from '@models';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
})
export class SignInComponent extends BaseComponent {
  form = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
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
      return;
    }

    this.form.disable();
    this.message = null;

    let { username, password } = this.form.value;
    username = (username ?? '').trim();
    password = (password ?? '').trim();

    this._auth
      .signIn({ username, password })
      .pipe(takeUntil(this._destroyed$))
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
    this._cdr.markForCheck();

    // Reset the form
    this.form?.get('password')?.patchValue(null);
    this.form?.get('password')?.markAsUntouched();

    // Show the alert
    this.message = 'Invalid username or password';
  }

  private _onServerError() {
    // Re-enable the form
    this.form.enable();
    this._cdr.markForCheck();

    // Show alert
    this.message = 'Server error';
  }
}
