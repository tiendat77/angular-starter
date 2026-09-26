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

  it('should render the title and message with the type accent', () => {
    service.success('Your changes have been saved.', 'Saved');
    TestBed.tick();

    const toastEl = document.querySelector('toast')!;
    expect(toastEl.textContent).toContain('Saved');
    expect(toastEl.textContent).toContain('Your changes have been saved.');
    expect(toastEl.querySelector('[role="alert"]')?.classList).toContain('border-success');
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
