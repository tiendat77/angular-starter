import { normalizeForSearch } from './select-filter';

export interface HighlightSegment {
  text: string;
  match: boolean;
}

/**
 * Splits `text` into plain and matching segments for `term`, matching the same way as
 * `uiDefaultFilter` (case/accent-insensitive) while returning the original characters.
 */
export function splitHighlight(text: string, term: string): HighlightSegment[] {
  if (!text) return [];
  const needle = normalizeForSearch(term.trim());
  if (!needle) return [{ text, match: false }];

  // Normalized haystack plus, for each normalized char, the index of its source char in `text`
  let haystack = '';
  const sourceIndex: number[] = [];
  for (let i = 0; i < text.length; ) {
    const char = String.fromCodePoint(text.codePointAt(i)!);
    for (const normalizedChar of normalizeForSearch(char)) {
      haystack += normalizedChar;
      sourceIndex.push(i);
    }
    i += char.length;
  }

  const segments: HighlightSegment[] = [];
  let cursor = 0;
  let from = 0;
  for (let hit = haystack.indexOf(needle, from); hit !== -1; hit = haystack.indexOf(needle, from)) {
    const start = sourceIndex[hit];
    const lastSource = sourceIndex[hit + needle.length - 1];
    const end = lastSource + String.fromCodePoint(text.codePointAt(lastSource)!).length;

    if (start > cursor) segments.push({ text: text.slice(cursor, start), match: false });
    segments.push({ text: text.slice(start, end), match: true });
    cursor = end;
    from = hit + needle.length;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), match: false });
  return segments;
}
