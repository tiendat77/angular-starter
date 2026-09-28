export function isEmptyFilterValue(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  );
}

function compareDefined(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

/** Default cell comparator. `null`/`undefined` always sort last, whatever the direction. */
export function compareValues(a: unknown, b: unknown, order: 'ascend' | 'descend'): number {
  const aNil = a === null || a === undefined;
  const bNil = b === null || b === undefined;
  if (aNil || bNil) return aNil === bNil ? 0 : aNil ? 1 : -1;

  const result = compareDefined(a, b);
  return order === 'descend' && result !== 0 ? -result : result;
}
