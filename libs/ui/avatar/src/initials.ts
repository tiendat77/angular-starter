/** First user-perceived character, so combining marks and emoji stay whole. */
function firstGrapheme(word: string): string {
  if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
    const segments = new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(word);
    const first = segments[Symbol.iterator]().next();
    return first.done ? '' : first.value.segment;
  }
  return Array.from(word)[0] ?? '';
}

/** "Nguyễn Văn An" → "NA", "linh" → "L", blank → "". */
export function getInitials(name: string | null | undefined): string {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  const first = firstGrapheme(words[0]);
  const last = words.length > 1 ? firstGrapheme(words[words.length - 1]) : '';
  return (first + last).toLocaleUpperCase();
}
