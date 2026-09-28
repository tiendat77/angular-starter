import { describe, expect, it } from 'vitest';
import { UiBottomSheetConfig } from './bottom-sheet-config';

describe('UiBottomSheetConfig', () => {
  it('has enterprise-safe defaults', () => {
    const config = new UiBottomSheetConfig();

    expect(config.hasBackdrop).toBe(true);
    expect(config.disableClose).toBe(false);
    expect(config.disableDrag).toBe(false);
    expect(config.hasDragHandle).toBe(true);
    expect(config.restoreFocus).toBe(true);
    expect(config.snapPoints).toEqual([0.5]);
    expect(config.initialSnapIndex).toBe(0);
    expect(config.backdropClass).toBe('ui-bottom-sheet-backdrop');
    expect(config.ariaLabel).toBeNull();
    expect(config.data).toBeNull();
  });
});
