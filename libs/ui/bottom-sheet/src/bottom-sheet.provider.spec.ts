import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { provideBottomSheet } from './bottom-sheet.provider';
import { UiBottomSheet } from './bottom-sheet.service';

describe('provideBottomSheet', () => {
  it('eagerly instantiates UiBottomSheet at bootstrap', () => {
    let instantiated: UiBottomSheet | null = null;
    const spyProviders = provideBottomSheet();

    TestBed.configureTestingModule({ providers: [spyProviders] });
    // ENVIRONMENT_INITIALIZER providers run when the environment injector is created;
    // TestBed's root injector is created lazily on first inject(), so trigger it once
    // and confirm the singleton is already the one the initializer created.
    instantiated = TestBed.inject(UiBottomSheet);

    expect(instantiated).toBeInstanceOf(UiBottomSheet);
  });
});
