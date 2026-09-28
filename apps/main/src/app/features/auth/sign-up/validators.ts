import { AbstractControl, ValidatorFn } from '@angular/forms';

export class PasswordValidators {
  static noWhiteSpace = (): ValidatorFn => {
    return (control: AbstractControl): Record<string, any> => {
      if (!control.value) {
        return null as any;
      }

      const valid = !String(control.value ?? '').includes(' ');

      return valid ? (null as any) : { whitespaces: true };
    };
  };

  static letters = (): ValidatorFn => {
    return (control: AbstractControl): Record<string, any> => {
      if (!control.value) {
        return null as any;
      }

      const valid = RegExp('(?=.*[a-zA-Z])').test(control.value);

      return valid ? (null as any) : { letters: true };
    };
  };

  static digits = (): ValidatorFn => {
    return (control: AbstractControl): Record<string, any> => {
      if (!control.value) {
        return null as any;
      }

      const valid = RegExp('(?=.*[0-9])').test(control.value);

      return valid ? (null as any) : { digits: true };
    };
  };
}
