import { IsActiveMatchOptions } from '@angular/router';

export class UtilsHelper {
  static randomId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    let name = '';
    for (let i = 0; i < 10; i++) {
      name += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return name;
  }

  static exactMatchOptions: IsActiveMatchOptions = {
    paths: 'exact',
    fragment: 'ignored',
    matrixParams: 'ignored',
    queryParams: 'exact',
  };

  static subsetMatchOptions: IsActiveMatchOptions = {
    paths: 'subset',
    fragment: 'ignored',
    matrixParams: 'ignored',
    queryParams: 'subset',
  };
}
