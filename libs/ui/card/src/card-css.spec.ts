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

const css = readFileSync(resolve(process.cwd(), 'libs/ui/styles/components/card.css'), 'utf8');

describe('card.css', () => {
  // Custom properties inherit: an appearance that leaves one unset picks it up from an enclosing
  // card (or from a hovered interactive parent), so every appearance sets all three.
  it.each(['card-outline', 'card-elevated', 'card-filled'])(
    '%s sets --card-bg, --card-border and --card-shadow so nested cards do not inherit them',
    (name) => {
      const body = utilityBody(css, name);
      for (const prop of ['--card-bg', '--card-border', '--card-shadow']) {
        expect(body).toContain(`${prop}:`);
      }
    }
  );
});
