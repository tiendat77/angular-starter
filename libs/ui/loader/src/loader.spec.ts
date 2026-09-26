import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { LoaderService } from './public-api';

describe('LoaderService', () => {
  let service: LoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoaderService);
  });

  afterEach(() => service.hide());

  it('should show a single loader with a backdrop', () => {
    const first = service.show();
    const second = service.show();
    TestBed.tick();

    expect(second).toBe(first);
    expect(document.querySelectorAll('loader').length).toBe(1);
    expect(document.querySelector('.cdk-overlay-backdrop')).not.toBeNull();
  });

  it('should remove the loader on hide()', () => {
    service.show();
    TestBed.tick();

    service.hide();
    TestBed.tick();

    expect(document.querySelector('loader')).toBeNull();
  });
});
