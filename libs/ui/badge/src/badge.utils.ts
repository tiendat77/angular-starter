/**
 * Text shown in a badge. Numbers above `max` become "{max}+"; 0 is hidden unless `showZero`;
 * strings pass through; null, '', negative and non-finite numbers give ''.
 */
export function formatBadgeCount(
  count: number | string | null | undefined,
  max = 99,
  showZero = false
): string {
  if (count === null || count === undefined || count === '') return '';
  if (typeof count === 'string') return count;
  if (!Number.isFinite(count) || count < 0) return '';
  if (count === 0 && !showZero) return '';
  return count > max ? `${max}+` : String(Math.floor(count));
}
