import { describe, expect, it } from 'vitest';
import { splitHighlight } from './highlight-segments';

describe('splitHighlight', () => {
  it('returns one plain segment for an empty term', () => {
    expect(splitHighlight('Apple', '')).toEqual([{ text: 'Apple', match: false }]);
  });

  it('returns no segments for empty text', () => {
    expect(splitHighlight('', 'a')).toEqual([]);
  });

  it('marks every non-overlapping match', () => {
    expect(splitHighlight('banana', 'an')).toEqual([
      { text: 'b', match: false },
      { text: 'an', match: true },
      { text: 'an', match: true },
      { text: 'a', match: false },
    ]);
  });

  it('handles matches at the start and the end', () => {
    expect(splitHighlight('abcab', 'ab')).toEqual([
      { text: 'ab', match: true },
      { text: 'c', match: false },
      { text: 'ab', match: true },
    ]);
  });

  it('matches accent-insensitively but keeps the original characters', () => {
    expect(splitHighlight('Nguyễn Văn A', 'nguyen')).toEqual([
      { text: 'Nguyễn', match: true },
      { text: ' Văn A', match: false },
    ]);
    expect(splitHighlight('Trần Đức', 'duc')).toEqual([
      { text: 'Trần ', match: false },
      { text: 'Đức', match: true },
    ]);
  });

  it('treats regex characters in the term as plain text', () => {
    expect(splitHighlight('a(b)*c', '(b)*')).toEqual([
      { text: 'a', match: false },
      { text: '(b)*', match: true },
      { text: 'c', match: false },
    ]);
  });

  it('returns the whole text unmarked when nothing matches', () => {
    expect(splitHighlight('Apple', 'x')).toEqual([{ text: 'Apple', match: false }]);
  });
});
