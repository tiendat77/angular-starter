import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { beforeAll, describe, expect, it } from 'vitest';
import { UiEditor } from './editor.component';
import { UI_EDITOR_DEFAULT_TOOLBAR, UiEditorToolbarItem } from './editor.tools';
import { UI_EDITOR_DEFAULT_COLORS, UiEditorColor } from './editor.types';

// ProseMirror measures text with ranges, which jsdom does not implement.
beforeAll(() => {
  const rect = { x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 };
  Range.prototype.getBoundingClientRect = () => ({ ...rect, toJSON: () => rect });
  Range.prototype.getClientRects = () =>
    ({
      length: 0,
      item: () => null,
      [Symbol.iterator]: [][Symbol.iterator],
    }) as unknown as DOMRectList;
  document.elementFromPoint = () => null;
});

@Component({
  standalone: true,
  imports: [UiEditor, ReactiveFormsModule],
  template: `
    <ui-editor
      [formControl]="control"
      [disabled]="disabled()"
      [toolbar]="toolbar()"
      [colors]="colors()"
    />
  `,
})
class Host {
  readonly control = new FormControl<string>('<p>Hello world</p>', { nonNullable: true });
  readonly disabled = signal(false);
  readonly toolbar = signal<readonly UiEditorToolbarItem[]>(['bold', 'color', 'clear']);
  readonly colors = signal<readonly UiEditorColor[]>(UI_EDITOR_DEFAULT_COLORS);
}

async function setup(): Promise<ComponentFixture<Host>> {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture;
}

const root = (f: ComponentFixture<unknown>): HTMLElement => f.nativeElement;
const tool = (f: ComponentFixture<unknown>, id: string): HTMLButtonElement =>
  root(f).querySelector(`.editor-toolbar [data-tool="${id}"]`) as HTMLButtonElement;
const editorOf = (f: ComponentFixture<Host>): UiEditor =>
  f.debugElement.children[0].componentInstance as UiEditor;
const html = (f: ComponentFixture<Host>): string => f.componentInstance.control.value;
const swatches = (): HTMLButtonElement[] =>
  Array.from(document.querySelectorAll<HTMLButtonElement>('.editor-swatch'));

/**
 * The color attributes stored in the document: the hex the user picked, whatever the browser does
 * to the `style` attribute when the HTML is serialised (`hexColors` restores it there).
 */
const storedColors = (f: ComponentFixture<Host>): (string | null)[] => {
  const colors: (string | null)[] = [];
  const walk = (node: { marks?: { attrs?: Record<string, unknown> }[]; content?: unknown[] }) => {
    node.marks?.forEach((m) => colors.push((m.attrs?.['color'] as string) ?? null));
    (node.content as (typeof node)[] | undefined)?.forEach(walk);
  };
  walk(editorOf(f).editor()!.getJSON());
  return colors;
};

/** Selects "Hello". */
function selectHello(fixture: ComponentFixture<Host>): void {
  editorOf(fixture).editor()!.commands.setTextSelection({ from: 1, to: 6 });
  fixture.detectChanges();
}

async function openPanel(fixture: ComponentFixture<Host>): Promise<void> {
  tool(fixture, 'color').click();
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

function press(element: HTMLElement, key: string): void {
  element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

describe('UiEditor color tool', () => {
  it('is not in the default toolbar', async () => {
    expect(UI_EDITOR_DEFAULT_TOOLBAR).not.toContain('color');

    const fixture = await setup();
    fixture.componentInstance.toolbar.set(UI_EDITOR_DEFAULT_TOOLBAR);
    fixture.detectChanges();

    expect(tool(fixture, 'color')).toBeNull();
  });

  it('is a labelled button that opens a dialog-like panel', async () => {
    const fixture = await setup();
    const button = tool(fixture, 'color');

    expect(button.getAttribute('aria-label')).toBe('Text color');
    expect(button.getAttribute('aria-haspopup')).toBe('dialog');
    await openPanel(fixture);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(swatches()).toHaveLength(10);
    expect(document.querySelector('.editor-color-action')?.textContent?.trim()).toBe(
      'Default color'
    );
    expect(document.querySelector('.editor-color-custom input[type="color"]')).not.toBeNull();
  });

  it('stores the picked color inline, as the hex it was picked with', async () => {
    const fixture = await setup();
    selectHello(fixture);
    await openPanel(fixture);

    swatches()[0].click();
    fixture.detectChanges();

    expect(storedColors(fixture)).toEqual(['#ef4444']);
    expect(html(fixture)).toBe('<p><span style="color: #ef4444;">Hello</span> world</p>');
    // the panel closes after a pick
    expect(document.querySelector('.editor-color-panel')).toBeNull();
  });

  it('shows the current color on the button and marks its swatch', async () => {
    const fixture = await setup();
    selectHello(fixture);
    const bar = (): HTMLElement => tool(fixture, 'color').querySelector('.editor-color-bar')!;

    expect(bar().style.getPropertyValue('--editor-color')).toBe('');
    await openPanel(fixture);
    swatches()[5].click();
    fixture.detectChanges();

    expect(bar().style.getPropertyValue('--editor-color')).toBe('#3b82f6');
    await openPanel(fixture);
    expect(swatches().map((s) => s.getAttribute('aria-pressed'))).toEqual(
      swatches().map((_, i) => (i === 5 ? 'true' : 'false'))
    );
  });

  it('removes the color with "Default color"', async () => {
    const fixture = await setup();
    selectHello(fixture);
    await openPanel(fixture);
    swatches()[2].click();
    fixture.detectChanges();
    expect(storedColors(fixture)).toEqual(['#eab308']);

    await openPanel(fixture);
    document.querySelector<HTMLButtonElement>('.editor-color-action')!.click();
    fixture.detectChanges();

    expect(html(fixture)).toBe('<p>Hello world</p>');
  });

  it('applies any color from the native picker', async () => {
    const fixture = await setup();
    selectHello(fixture);
    await openPanel(fixture);

    const input = document.querySelector<HTMLInputElement>('.editor-color-custom input')!;
    input.value = '#123abc';
    input.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();

    expect(storedColors(fixture)).toEqual(['#123abc']);
    expect(html(fixture)).toContain('style="color: #123abc;"');
  });

  it('keeps a hex color through a reload of the content', async () => {
    const fixture = await setup();
    fixture.componentInstance.control.setValue('<p><span style="color: #8b5cf6">Hi</span></p>');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(storedColors(fixture)).toEqual(['#8b5cf6']);
  });

  it('is reset by clear formatting', async () => {
    const fixture = await setup();
    selectHello(fixture);
    await openPanel(fixture);
    swatches()[0].click();
    fixture.detectChanges();

    selectHello(fixture);
    tool(fixture, 'clear').click();
    fixture.detectChanges();

    expect(html(fixture)).toBe('<p>Hello world</p>');
  });

  it('uses the palette it is given', async () => {
    const fixture = await setup();
    fixture.componentInstance.colors.set([
      { value: '#111111', label: 'Ink' },
      { value: '#eeeeee', label: 'Paper' },
    ]);
    fixture.detectChanges();
    await openPanel(fixture);

    expect(swatches().map((s) => s.getAttribute('aria-label'))).toEqual(['Ink', 'Paper']);
  });

  it('is disabled with the editor', async () => {
    const fixture = await setup();
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();

    expect(tool(fixture, 'color').disabled).toBe(true);
  });

  describe('keyboard', () => {
    it('starts on the first swatch and moves over the grid', async () => {
      const fixture = await setup();
      selectHello(fixture);
      await openPanel(fixture);
      const all = swatches();

      expect(document.activeElement).toBe(all[0]);
      press(all[0], 'ArrowRight');
      expect(document.activeElement).toBe(all[1]);
      press(all[1], 'ArrowDown');
      expect(document.activeElement).toBe(all[6]);
      press(all[6], 'ArrowUp');
      expect(document.activeElement).toBe(all[1]);
      press(all[1], 'End');
      expect(document.activeElement).toBe(all[9]);
      press(all[9], 'Home');
      expect(document.activeElement).toBe(all[0]);
      // exactly one tab stop in the grid
      expect(all.filter((s) => s.tabIndex === 0)).toHaveLength(1);
    });

    it('starts on the selected swatch', async () => {
      const fixture = await setup();
      selectHello(fixture);
      await openPanel(fixture);
      swatches()[3].click();
      fixture.detectChanges();

      // Tiptap's `focus()` is applied a frame later; let it settle before the panel opens again.
      await new Promise((resolve) => setTimeout(resolve, 50));
      await openPanel(fixture);

      expect(document.activeElement).toBe(swatches()[3]);
    });

    it('picks with Enter or Space (a native button click)', async () => {
      const fixture = await setup();
      selectHello(fixture);
      await openPanel(fixture);

      (document.activeElement as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(storedColors(fixture)).toEqual(['#ef4444']);
    });
  });
});
