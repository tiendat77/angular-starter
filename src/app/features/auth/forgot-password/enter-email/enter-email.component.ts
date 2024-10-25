import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { takeUntil } from 'rxjs';
import { AuthService } from '@/core/auth';
import { BaseComponent } from '@models';

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

    this._auth
      .forgotPassword(email)
      .pipe(takeUntil(this._destroyed$))
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
