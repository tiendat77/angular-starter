import { describe, expect, it } from 'vitest';
import { tabVariants } from './tabs.variants';

describe('tabVariants', () => {
  it('applies default classes (tab, bordered, md, primary, horizontal)', () => {
    const classes = tabVariants();
    expect(classes).toContain('tab');
    expect(classes).toContain('tab-bordered-item');
    expect(classes).toContain('tab-md');
    expect(classes).toContain('tab-color-primary');
    expect(classes).toContain('tab-horizontal');
  });

  it('applies variant modifiers', () => {
    expect(tabVariants({ variant: 'lift' })).toContain('tab-lift-item');
    expect(tabVariants({ variant: 'pill' })).toContain('tab-pill-item');
  });

  it('applies size modifiers', () => {
    expect(tabVariants({ size: 'sm' })).toContain('tab-sm');
    expect(tabVariants({ size: 'lg' })).toContain('tab-lg');
  });

  it('applies semantic color modifiers', () => {
    expect(tabVariants({ color: 'neutral' })).toContain('tab-color-neutral');
    expect(tabVariants({ color: 'error' })).toContain('tab-color-error');
  });

  it('applies orientation modifier', () => {
    expect(tabVariants({ orientation: 'vertical' })).toContain('tab-vertical');
  });
});
