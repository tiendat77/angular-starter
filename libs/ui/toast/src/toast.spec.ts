import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { ToastService } from './public-api';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
    service = TestBed.inject(ToastService);
  });

  afterEach(() => service.dismiss());

  it('should render the title and message on a soft background of the type color', () => {
    service.success('Your changes have been saved.', 'Saved');
    TestBed.tick();

    const toastEl = document.querySelector('toast')!;
    expect(toastEl.textContent).toContain('Saved');
    expect(toastEl.textContent).toContain('Your changes have been saved.');
    expect(toastEl.querySelector('[role="alert"]')?.classList).toContain(
      '[--alert-color:var(--color-success)]'
    );
  });

  describe('panel look', () => {
    const types = ['info', 'success', 'warning', 'error'] as const;

    const panelOf = (type: (typeof types)[number]) => {
      service[type]('A message', 'A title');
      TestBed.tick();
      return document.querySelector('toast [role="alert"]') as HTMLElement;
    };

    it.each(types)('tints the %s toast with its own status color', (type) => {
      const classes = panelOf(type).classList;
      expect(classes).toContain(`[--alert-color:var(--color-${type})]`);
      // ...and with no other type's color
      for (const other of types.filter((t) => t !== type)) {
        expect(classes).not.toContain(`[--alert-color:var(--color-${other})]`);
      }
    });

    it.each(types)('keeps the %s tint opaque, so the page never shows through', (type) => {
      expect(panelOf(type).classList).toContain('[--alert-surface:var(--color-background)]');
    });

    it.each(types)('keeps the %s text in the foreground color, not the status color', (type) => {
      expect(panelOf(type).classList).toContain('[--alert-fg:var(--color-foreground)]');
    });

    it.each(types)('has neither the old muted fill nor the accent border on %s', (type) => {
      const classes = Array.from(panelOf(type).classList);
      expect(classes).not.toContain('bg-muted');
      expect(classes).not.toContain('border-l-4');
      expect(classes.filter((c) => /^border-(info|success|warning|error)$/.test(c))).toEqual([]);
    });

    it('stays an alert region', () => {
      expect(panelOf('error').getAttribute('role')).toBe('alert');
    });

    it('colors the dismiss icon with a library token, not an app-only class', () => {
      panelOf('info');
      const icon = document.querySelector('toast button svg') as SVGElement;
      expect(icon.classList).toContain('text-muted-foreground');
      expect(icon.classList).not.toContain('text-hint');
    });
  });

  it('should emit afterDismissed and remove the toast on dismiss()', async () => {
    const ref = service.error('Something went wrong');
    TestBed.tick();

    const dismissed = firstValueFrom(ref.afterDismissed());
    ref.dismiss();
    TestBed.tick();
    await dismissed;

    expect(document.querySelector('toast')).toBeNull();
  });
});
