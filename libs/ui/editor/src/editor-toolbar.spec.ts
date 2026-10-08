import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { UiEditorBubbleMenu } from './editor-bubble-menu.component';
import { UiEditor } from './editor.component';
import {
  UI_EDITOR_DEFAULT_BUBBLE_MENU,
  UI_EDITOR_DEFAULT_TOOLBAR,
  UiEditorToolbarItem,
  UiEditorToolId,
} from './editor.tools';
import {
  UiEditorImageFailure,
  UiEditorImageRejection,
  UiEditorUploadHandler,
} from './editor.types';

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
      [uploadImage]="upload()"
      [toolbar]="toolbar()"
      [bubbleMenu]="bubbleMenu()"
      [maxImageSize]="maxImageSize()"
      (imageRejected)="rejected.push($event)"
      (imageFailed)="failed.push($event)"
    />
  `,
})
class Host {
  readonly control = new FormControl<string>('<p>Hello world</p>', { nonNullable: true });
  readonly disabled = signal(false);
  readonly upload = signal<UiEditorUploadHandler | undefined>(undefined);
  readonly toolbar = signal<readonly UiEditorToolbarItem[]>(UI_EDITOR_DEFAULT_TOOLBAR);
  readonly bubbleMenu = signal<readonly UiEditorToolId[]>(UI_EDITOR_DEFAULT_BUBBLE_MENU);
  readonly maxImageSize = signal(1024);
  readonly rejected: UiEditorImageRejection[] = [];
  readonly failed: UiEditorImageFailure[] = [];
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

async function flush(fixture: ComponentFixture<unknown>): Promise<void> {
  await fixture.whenStable();
  fixture.detectChanges();
}

/** Selects "Hello". Not `selectAll`: an AllSelection also covers the trailing empty paragraph. */
function selectAll(fixture: ComponentFixture<Host>): void {
  editorOf(fixture).editor()!.commands.setTextSelection({ from: 1, to: 6 });
  fixture.detectChanges();
}

/** Waits for async work (an upload) and re-renders until `check` stops throwing. */
async function until(fixture: ComponentFixture<unknown>, check: () => void): Promise<void> {
  await vi.waitFor(() => {
    fixture.detectChanges();
    check();
  });
}

function type(fixture: ComponentFixture<unknown>, value: string): HTMLInputElement {
  const input = root(fixture).querySelector('.editor-bar-input') as HTMLInputElement;
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  fixture.detectChanges();
  return input;
}

const file = (name: string, type: string, size = 10): File =>
  new File([new Uint8Array(size)], name, { type });

function pick(fixture: ComponentFixture<unknown>, files: File[]): void {
  const input = root(fixture).querySelector('input[type="file"]') as HTMLInputElement;
  Object.defineProperty(input, 'files', { value: files, configurable: true });
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

describe('UiEditorToolbar', () => {
  it('is a named toolbar', async () => {
    const fixture = await setup();
    const toolbar = root(fixture).querySelector('[role="toolbar"].editor-toolbar')!;
    expect(toolbar.getAttribute('aria-label')).toBe('Formatting');
  });

  it('toggles bold and reports it with aria-pressed', async () => {
    const fixture = await setup();
    selectAll(fixture);
    expect(tool(fixture, 'bold').getAttribute('aria-pressed')).toBe('false');
    tool(fixture, 'bold').click();
    fixture.detectChanges();
    expect(html(fixture)).toContain('<strong>Hello</strong>');
    expect(tool(fixture, 'bold').getAttribute('aria-pressed')).toBe('true');
  });

  it('does not take the mouse focus from the editor', async () => {
    const fixture = await setup();
    const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    tool(fixture, 'bold').dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('applies italic, underline, quote, lists and alignment', async () => {
    const fixture = await setup();
    selectAll(fixture);
    for (const id of ['italic', 'underline', 'blockquote']) {
      tool(fixture, id).click();
    }
    expect(html(fixture)).toMatch(/<blockquote>.*<em>.*<u>/s);
    tool(fixture, 'blockquote').click();
    tool(fixture, 'bullet-list').click();
    expect(html(fixture)).toContain('<ul>');
    tool(fixture, 'bullet-list').click();
    tool(fixture, 'ordered-list').click();
    expect(html(fixture)).toContain('<ol>');
    tool(fixture, 'ordered-list').click();
    tool(fixture, 'align-center').click();
    fixture.detectChanges();
    expect(html(fixture)).toContain('text-align: center');
    expect(tool(fixture, 'align-center').getAttribute('aria-pressed')).toBe('true');
  });

  it('clears formatting', async () => {
    const fixture = await setup();
    selectAll(fixture);
    tool(fixture, 'bold').click();
    tool(fixture, 'blockquote').click();
    tool(fixture, 'clear').click();
    expect(html(fixture)).not.toMatch(/strong|blockquote/);
  });

  it('enables undo only when there is something to undo', async () => {
    const fixture = await setup();
    expect(tool(fixture, 'undo').disabled).toBe(true);
    selectAll(fixture);
    tool(fixture, 'bold').click();
    fixture.detectChanges();
    expect(tool(fixture, 'undo').disabled).toBe(false);
    tool(fixture, 'undo').click();
    expect(html(fixture)).toBe('<p>Hello world</p>');
  });

  it('disables every tool while the editor is disabled', async () => {
    const fixture = await setup();
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    const buttons = Array.from(
      root(fixture).querySelectorAll<HTMLButtonElement>('.editor-toolbar [data-tool]')
    );
    expect(buttons.length).toBeGreaterThan(10);
    expect(buttons.every((b) => b.disabled)).toBe(true);
  });

  describe('configurable toolbar', () => {
    const ids = (f: ComponentFixture<unknown>): (string | null)[] =>
      Array.from(root(f).querySelectorAll('.editor-toolbar > *')).map((e) =>
        e.getAttribute('role') === 'separator'
          ? 'separator'
          : (e.querySelector('[data-tool]') ?? e).getAttribute('data-tool')
      );

    it('renders the default tools in the default order', async () => {
      const fixture = await setup();
      expect(ids(fixture)).toEqual([...UI_EDITOR_DEFAULT_TOOLBAR]);
    });

    it('renders only the configured tools, with separators', async () => {
      const fixture = await setup();
      fixture.componentInstance.toolbar.set(['bold', 'separator', 'link']);
      fixture.detectChanges();
      await flush(fixture);
      expect(ids(fixture)).toEqual(['bold', 'separator', 'link']);
      selectAll(fixture);
      tool(fixture, 'bold').click();
      expect(html(fixture)).toContain('<strong>');
    });

    it('keeps a working tab stop when undo is not in the toolbar', async () => {
      const fixture = await setup();
      fixture.componentInstance.toolbar.set(['bold', 'italic']);
      fixture.detectChanges();
      await flush(fixture);
      expect(tool(fixture, 'bold').tabIndex).toBe(0);
      expect(tool(fixture, 'italic').tabIndex).toBe(-1);
    });

    it('renders no toolbar tools for an empty list', async () => {
      const fixture = await setup();
      fixture.componentInstance.toolbar.set([]);
      fixture.detectChanges();
      await flush(fixture);
      expect(root(fixture).querySelectorAll('.editor-toolbar [data-tool]').length).toBe(0);
    });
  });

  describe('keyboard', () => {
    it('keeps one tab stop for the whole toolbar', async () => {
      const fixture = await setup();
      const stops = Array.from(
        root(fixture).querySelectorAll<HTMLButtonElement>('.editor-toolbar [data-tool]')
      ).filter((b) => b.tabIndex === 0);
      expect(stops.length).toBe(1);
      // undo is disabled on a fresh document: a disabled button must not be the tab stop
      expect(tool(fixture, 'undo').disabled).toBe(true);
      expect(stops[0].disabled).toBe(false);
    });

    it('moves with the arrow keys, skipping disabled tools, and wraps', async () => {
      const fixture = await setup();
      const press = (el: HTMLElement, key: string): void => {
        el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
      };
      // undo is disabled, so the first enabled tool is the heading menu button
      const heading = tool(fixture, 'heading');
      heading.focus();
      press(heading, 'ArrowRight');
      expect(document.activeElement).toBe(tool(fixture, 'blockquote'));
      press(document.activeElement as HTMLElement, 'ArrowLeft');
      expect(document.activeElement).toBe(heading);
      press(heading, 'ArrowLeft');
      expect(document.activeElement).toBe(tool(fixture, 'image')); // wrapped past undo
      press(document.activeElement as HTMLElement, 'Home');
      expect(document.activeElement).toBe(heading);
      press(heading, 'End');
      expect(document.activeElement).toBe(tool(fixture, 'image'));
    });

    it('makes the focused tool the tab stop', async () => {
      const fixture = await setup();
      tool(fixture, 'italic').focus();
      fixture.detectChanges();
      expect(tool(fixture, 'italic').tabIndex).toBe(0);
      expect(tool(fixture, 'undo').tabIndex).toBe(-1);
    });
  });

  describe('heading menu', () => {
    it('shows the current block and sets a heading', async () => {
      const fixture = await setup();
      selectAll(fixture);
      expect(tool(fixture, 'heading').textContent).toContain('Paragraph');
      tool(fixture, 'heading').click();
      fixture.detectChanges();
      const items = Array.from(document.querySelectorAll<HTMLElement>('[role="menuitem"]'));
      expect(items.map((i) => i.textContent?.trim())).toEqual([
        'Paragraph',
        'Heading 1',
        'Heading 2',
        'Heading 3',
      ]);
      items[2].click();
      fixture.detectChanges();
      expect(html(fixture)).toContain('<h2');
      expect(tool(fixture, 'heading').textContent).toContain('Heading 2');
    });
  });

  describe('link', () => {
    it('is unavailable without a selection', async () => {
      const fixture = await setup();
      expect(tool(fixture, 'link').disabled).toBe(true);
      selectAll(fixture);
      expect(tool(fixture, 'link').disabled).toBe(false);
    });

    it('opens an address bar, focuses it, and applies a normalised link', async () => {
      const fixture = await setup();
      selectAll(fixture);
      tool(fixture, 'link').click();
      fixture.detectChanges();
      await flush(fixture);
      const input = root(fixture).querySelector('.editor-bar-input') as HTMLInputElement;
      expect(input).not.toBeNull();
      expect(document.activeElement).toBe(input);

      type(fixture, 'example.com');
      (root(fixture).querySelector('.editor-bar') as HTMLFormElement).dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true })
      );
      fixture.detectChanges();
      expect(html(fixture)).toContain('href="https://example.com"');
      expect(root(fixture).querySelector('.editor-bar')).toBeNull();
      expect(tool(fixture, 'link').getAttribute('aria-pressed')).toBe('true');
    });

    it('refuses an unsafe address and explains why', async () => {
      const fixture = await setup();
      selectAll(fixture);
      tool(fixture, 'link').click();
      fixture.detectChanges();
      const input = type(fixture, 'javascript:alert(1)');
      (root(fixture).querySelector('.editor-bar') as HTMLFormElement).dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true })
      );
      fixture.detectChanges();
      expect(html(fixture)).not.toContain('<a');
      expect(input.getAttribute('aria-invalid')).toBe('true');
      expect(root(fixture).querySelector('[role="alert"]')?.textContent).toContain('valid');
      type(fixture, 'https://ok.dev'); // typing clears the error
      expect(root(fixture).querySelector('[role="alert"]')).toBeNull();
    });

    it('closes on Escape', async () => {
      const fixture = await setup();
      selectAll(fixture);
      tool(fixture, 'link').click();
      fixture.detectChanges();
      const input = type(fixture, 'x');
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      fixture.detectChanges();
      expect(root(fixture).querySelector('.editor-bar')).toBeNull();
    });

    it('edits and removes an existing link', async () => {
      const fixture = await setup();
      fixture.componentInstance.control.setValue(
        '<p><a href="https://old.dev">Hello world</a></p>'
      );
      fixture.detectChanges();
      editorOf(fixture).editor()!.commands.setTextSelection(3);
      fixture.detectChanges();
      tool(fixture, 'link').click();
      fixture.detectChanges();
      const input = root(fixture).querySelector('.editor-bar-input') as HTMLInputElement;
      expect(input.value).toBe('https://old.dev');
      const remove = Array.from(
        root(fixture).querySelectorAll<HTMLButtonElement>('.editor-bar button')
      ).find((b) => b.textContent?.includes('Remove link'))!;
      remove.click();
      fixture.detectChanges();
      expect(html(fixture)).not.toContain('<a');
      expect(root(fixture).querySelector('.editor-bar')).toBeNull();
    });
  });

  describe('image', () => {
    const openImageMenu = (fixture: ComponentFixture<Host>): HTMLElement[] => {
      tool(fixture, 'image').click();
      fixture.detectChanges();
      return Array.from(document.querySelectorAll<HTMLElement>('[role="menuitem"]'));
    };

    it('offers only "from URL" without an upload handler', async () => {
      const fixture = await setup();
      const items = openImageMenu(fixture);
      expect(items.map((i) => i.textContent?.trim())).toEqual(['Image from URL']);
    });

    it('inserts an image from a URL, and refuses mailto:', async () => {
      const fixture = await setup();
      openImageMenu(fixture)[0].click();
      fixture.detectChanges();
      await flush(fixture);
      type(fixture, 'mailto:a@b.dev');
      (root(fixture).querySelector('.editor-bar') as HTMLFormElement).dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true })
      );
      fixture.detectChanges();
      expect(html(fixture)).not.toContain('<img');
      type(fixture, 'https://img.dev/a.png');
      (root(fixture).querySelector('.editor-bar') as HTMLFormElement).dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true })
      );
      fixture.detectChanges();
      expect(html(fixture)).toContain('<img src="https://img.dev/a.png"');
    });

    it('uploads a picked file through the handler (promise)', async () => {
      const fixture = await setup();
      let finish!: (url: string) => void;
      const handler = vi.fn(
        () =>
          new Promise<string>((resolve) => {
            finish = resolve;
          })
      );
      fixture.componentInstance.upload.set(handler);
      fixture.detectChanges();
      expect(openImageMenu(fixture).map((i) => i.textContent?.trim())).toContain('Upload image');

      const picked = file('up.png', 'image/png');
      pick(fixture, [picked]);
      fixture.detectChanges();
      expect(root(fixture).querySelector('.editor-toolbar')!.getAttribute('aria-busy')).toBe(
        'true'
      );
      expect(root(fixture).querySelector('[role="status"]')?.textContent).toContain('Uploading');
      finish('https://cdn.dev/up.png');
      await until(fixture, () => {
        expect(
          root(fixture).querySelector('.editor-toolbar')!.getAttribute('aria-busy')
        ).toBeNull();
      });
      expect(handler).toHaveBeenCalledWith(picked);
      expect(html(fixture)).toContain('src="https://cdn.dev/up.png"');
      expect(html(fixture)).toContain('alt="up.png"');
      expect(root(fixture).querySelector('[role="status"]')).toBeNull();
    });

    it('accepts an observable from the handler', async () => {
      const fixture = await setup();
      fixture.componentInstance.upload.set(() => of('https://cdn.dev/obs.png'));
      fixture.detectChanges();
      pick(fixture, [file('o.png', 'image/png')]);
      await until(fixture, () => expect(html(fixture)).toContain('src="https://cdn.dev/obs.png"'));
    });

    it('rejects a wrong type or an oversized file before uploading', async () => {
      const fixture = await setup();
      const handler = vi.fn(() => Promise.resolve('x'));
      fixture.componentInstance.upload.set(handler);
      fixture.detectChanges();
      const pdf = file('a.pdf', 'application/pdf');
      const big = file('b.png', 'image/png', 4096);
      pick(fixture, [pdf]);
      pick(fixture, [big]);
      await flush(fixture);
      expect(handler).not.toHaveBeenCalled();
      expect(fixture.componentInstance.rejected).toEqual([
        { file: pdf, reason: 'type' },
        { file: big, reason: 'size' },
      ]);
      expect(html(fixture)).not.toContain('<img');
    });

    it('reports a failed upload and recovers', async () => {
      const fixture = await setup();
      const boom = new Error('boom');
      fixture.componentInstance.upload.set(() => Promise.reject(boom));
      fixture.detectChanges();
      const picked = file('f.png', 'image/png');
      pick(fixture, [picked]);
      await until(fixture, () => {
        expect(
          root(fixture).querySelector('.editor-toolbar')!.getAttribute('aria-busy')
        ).toBeNull();
      });
      expect(fixture.componentInstance.failed).toEqual([{ file: picked, error: boom }]);
    });
  });

  describe('bubble menu', () => {
    // Tiptap's BubbleMenu keeps the element out of the document until it shows it.
    const bubbleOf = (f: ComponentFixture<Host>): HTMLElement =>
      f.debugElement.query(By.directive(UiEditorBubbleMenu)).nativeElement;

    it('is out of the layout until Tiptap shows it', async () => {
      const fixture = await setup();
      expect(bubbleOf(fixture).isConnected).toBe(false);
    });

    it('has bold, italic and link, named and wired to the editor', async () => {
      const fixture = await setup();
      const bubble = bubbleOf(fixture);
      expect(bubble.getAttribute('aria-label')).toBe('Selection formatting');
      const buttons = Array.from(bubble.querySelectorAll('button'));
      expect(buttons.map((b) => b.getAttribute('aria-label'))).toEqual(['Bold', 'Italic', 'Link']);

      selectAll(fixture);
      buttons[0].click();
      fixture.detectChanges();
      expect(html(fixture)).toContain('<strong>');
      expect(buttons[0].getAttribute('aria-pressed')).toBe('true');
    });

    it('renders the configured tools', async () => {
      const fixture = await setup();
      fixture.componentInstance.bubbleMenu.set(['underline', 'link']);
      fixture.detectChanges();
      await flush(fixture);
      const names = Array.from(bubbleOf(fixture).querySelectorAll('button')).map((b) =>
        b.getAttribute('aria-label')
      );
      expect(names).toEqual(['Underline', 'Link']);
    });

    it('is switched off by an empty list', async () => {
      const fixture = await setup();
      fixture.componentInstance.bubbleMenu.set([]);
      fixture.detectChanges();
      await flush(fixture);
      expect(bubbleOf(fixture).querySelectorAll('button').length).toBe(0);
    });

    it('has no tab stops: it is a pointer convenience', async () => {
      const fixture = await setup();
      const stops = Array.from(bubbleOf(fixture).querySelectorAll('button')).filter(
        (b) => b.tabIndex === 0
      );
      expect(stops.length).toBe(0);
    });

    it('hands the link button over to the toolbar address bar', async () => {
      const fixture = await setup();
      selectAll(fixture);
      bubbleOf(fixture).querySelectorAll('button')[2].click();
      fixture.detectChanges();
      expect(root(fixture).querySelector('.editor-bar')).not.toBeNull();
    });
  });
});
