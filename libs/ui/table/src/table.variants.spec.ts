import { describe, expect, it } from 'vitest';
import { tableVariants } from './table.variants';

describe('tableVariants', () => {
  it('defaults to the default density without modifiers', () => {
    const classes = tableVariants().split(' ');
    expect(classes).toContain('data-table');
    expect(classes).toContain('data-table-default');
    expect(classes).not.toContain('data-table-bordered');
    expect(classes).not.toContain('data-table-striped');
  });

  it('maps density, bordered and striped', () => {
    expect(tableVariants({ density: 'compact' })).toContain('data-table-compact');
    expect(tableVariants({ density: 'middle' })).toContain('data-table-middle');
    expect(tableVariants({ bordered: true, striped: true })).toContain('data-table-bordered');
    expect(tableVariants({ bordered: true, striped: true })).toContain('data-table-striped');
  });

  it('appends extra classes', () => {
    expect(tableVariants({}, 'my-table')).toMatch(/my-table$/);
  });
});
