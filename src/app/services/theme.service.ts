import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';

import { STORAGE_KEYS } from '@configs/storage.config';
import { ColorSchemeType } from '@models';

import { fromEvent, Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  scheme$ = signal<ColorSchemeType>('system');

  set scheme(scheme: ColorSchemeType) {
    if (scheme === 'system') {
      this.scheme$.set(scheme);
      localStorage.removeItem(STORAGE_KEYS.SCHEME);

      this._listener = this._getListener().subscribe((scheme) => {
        this._reflect(scheme);
      });
    } else {
      this.scheme$.set(scheme);
      localStorage.setItem(STORAGE_KEYS.SCHEME, scheme);

      this._listener?.unsubscribe();
      this._reflect(scheme);
    }
  }

  private _listener: Subscription;
  private _document = inject<Document>(DOCUMENT);

  constructor() {
    this._initialize();
  }

  private _initialize() {
    let scheme = localStorage.getItem(STORAGE_KEYS.SCHEME) as ColorSchemeType;
    if (scheme && !['dark', 'light', 'system'].includes(scheme)) {
      scheme = this._getSystemScheme();
    }

    this.scheme = scheme || 'system';
  }

  private _reflect(scheme: 'dark' | 'light') {
    this._document.firstElementChild?.setAttribute('data-theme', scheme);
  }

  private _getSystemScheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private _getListener(): Observable<'dark' | 'light'> {
    return fromEvent(window.matchMedia('(prefers-color-scheme: dark)'), 'change').pipe(
      map((event: any) => (event.matches ? 'dark' : 'light')),
      startWith<'dark' | 'light'>(this._getSystemScheme())
    );
  }
}
