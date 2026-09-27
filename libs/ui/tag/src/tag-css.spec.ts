/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/** Body of one `@utility <name> { … }` block (top-level declarations and nested rules). */
function utilityBody(css: string, name: string): string {
  const start = css.indexOf(`@utility ${name} {`);
  if (start < 0) throw new Error(`@utility ${name} not found`);
  let depth = 0;
  for (let i = css.indexOf('{', start); i < css.length; i++) {
    if (css[i] === '{') depth++;
    if (css[i] === '}' && --depth === 0) return css.slice(start, i + 1);
  }
  throw new Error(`@utility ${name} is not closed`);
}

const css = readFileSync(resolve(process.cwd(), 'libs/ui/styles/components/tag.css'), 'utf8');

describe('tag.css', () => {
  it('the × takes its colors from --tag-remove-* variables (muted by default)', () => {
    const body = utilityBody(css, 'tag-remove');
    expect(body).toContain('color: var(--tag-remove-fg, var(--color-muted-foreground))');
    expect(body).toContain('color: var(--tag-remove-hover-fg, var(--color-foreground))');
  });

  it('a solid tag draws the × in its own text color, so it stays visible on the fill', () => {
    const body = utilityBody(css, 'tag-solid');
    expect(body).toContain('--tag-remove-fg: currentColor');
    expect(body).toContain('--tag-remove-hover-fg: currentColor');
  });
});
