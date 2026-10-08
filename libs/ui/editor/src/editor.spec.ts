import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { UiFormFieldComponent, UiLabelDirective } from '@libs/ui/input';
import { JSONContent } from '@tiptap/core';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { UiEditor } from './editor.component';
import { UiEditorFormat } from './editor.types';

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
      [outputFormat]="format()"
      [placeholder]="placeholder()"
      [disabled]="disabled()"
      [ariaLabel]="ariaLabel()"
    />
  `,
})
class ReactiveHost {
  readonly control = new FormControl<string | JSONContent | null>('<p>Hello</p>', {
    validators: [Validators.required],
  });
  readonly format = signal<UiEditorFormat>('html');
  readonly placeholder = signal('Write here');
  readonly disabled = signal(false);
  readonly ariaLabel = signal<string | undefined>(undefined);
}

@Component({
  standalone: true,
  imports: [UiEditor, UiFormFieldComponent, UiLabelDirective, ReactiveFormsModule],
  template: `
    <ui-form-field>
      <label uiLabel>Body</label>
      <ui-editor [formControl]="control" />
    </ui-form-field>
  `,
})
class FormFieldHost {
  readonly control = new FormControl<string | JSONContent | null>('', [Validators.required]);
}

async function setup<T>(host: new () => T): Promise<ComponentFixture<T>> {
  const fixture = TestBed.createComponent(host);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture;
}

function area(fixture: ComponentFixture<unknown>): HTMLElement {
  return fixture.nativeElement.querySelector('.ProseMirror') as HTMLElement;
}

describe('UiEditor', () => {
  it('renders the written value in the editable area', async () => {
    const fixture = await setup(ReactiveHost);
    expect(area(fixture).innerHTML).toContain('Hello');
  });

  it('exposes the Tiptap instance once rendered', async () => {
    const fixture = await setup(ReactiveHost);
    const editor = fixture.debugElement.children[0].componentInstance as UiEditor;
    expect(editor.editor()).not.toBeNull();
  });

  it('shows a value written after creation without emitting it back', async () => {
    const fixture = await setup(ReactiveHost);
    const changes = vi.fn();
    fixture.componentInstance.control.valueChanges.subscribe(changes);
    fixture.componentInstance.control.setValue('<h1>Title</h1>');
    fixture.detectChanges();
    expect(area(fixture).querySelector('h1')?.textContent).toBe('Title');
    expect(changes).toHaveBeenCalledTimes(1); // the setValue itself, not an echo
  });

  it('emits HTML after a user edit', async () => {
    const fixture = await setup(ReactiveHost);
    const editor = fixture.debugElement.children[0].componentInstance as UiEditor;
    editor.editor()!.commands.setContent('<p>x</p>', { emitUpdate: true });
    expect(fixture.componentInstance.control.value).toBe('<p>x</p>');
  });

  it('emits "" for an empty document in html format', async () => {
    const fixture = await setup(ReactiveHost);
    const editor = fixture.debugElement.children[0].componentInstance as UiEditor;
    editor.editor()!.commands.clearContent(true);
    expect(fixture.componentInstance.control.value).toBe('');
    expect(fixture.componentInstance.control.valid).toBe(false);
  });

  it('emits JSON, and null when empty, in json format', async () => {
    const fixture = await setup(ReactiveHost);
    fixture.componentInstance.format.set('json');
    fixture.detectChanges();
    const editor = fixture.debugElement.children[0].componentInstance as UiEditor;
    editor.editor()!.commands.setContent('<p>x</p>', { emitUpdate: true });
    expect((fixture.componentInstance.control.value as JSONContent).type).toBe('doc');
    editor.editor()!.commands.clearContent(true);
    expect(fixture.componentInstance.control.value).toBeNull();
  });

  it('accepts a JSON document as input', async () => {
    const fixture = await setup(ReactiveHost);
    fixture.componentInstance.control.setValue({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'From JSON' }] }],
    });
    fixture.detectChanges();
    expect(area(fixture).textContent).toContain('From JSON');
  });

  it('is not an echo for an image-only document (not empty)', async () => {
    const fixture = await setup(ReactiveHost);
    const editor = fixture.debugElement.children[0].componentInstance as UiEditor;
    editor.editor()!.commands.clearContent();
    editor.editor()!.commands.setImage({ src: 'https://example.com/a.png' });
    expect(fixture.componentInstance.control.value).toContain('<img');
  });

  it('gives the editable area a textbox role and an accessible name', async () => {
    const fixture = await setup(ReactiveHost);
    expect(area(fixture).getAttribute('role')).toBe('textbox');
    expect(area(fixture).getAttribute('aria-multiline')).toBe('true');
    expect(area(fixture).getAttribute('aria-label')).toBe('Rich text editor');
    fixture.componentInstance.ariaLabel.set('Body');
    fixture.detectChanges();
    expect(area(fixture).getAttribute('aria-label')).toBe('Body');
  });

  it('is read-only while disabled and flags the frame', async () => {
    const fixture = await setup(ReactiveHost);
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    expect(area(fixture).getAttribute('contenteditable')).toBe('false');
    expect(area(fixture).getAttribute('aria-disabled')).toBe('true');
    expect(fixture.nativeElement.querySelector('.editor-disabled')).not.toBeNull();
  });

  it('follows FormControl.disable()', async () => {
    const fixture = await setup(ReactiveHost);
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(area(fixture).getAttribute('contenteditable')).toBe('false');
  });

  it('marks the control touched when focus leaves the whole component', async () => {
    const fixture = await setup(ReactiveHost);
    const host = fixture.nativeElement.querySelector('ui-editor') as HTMLElement;
    host.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
    expect(fixture.componentInstance.control.touched).toBe(true);
  });

  it('does not mark touched when focus stays inside the component', async () => {
    const fixture = await setup(ReactiveHost);
    const host = fixture.nativeElement.querySelector('ui-editor') as HTMLElement;
    host.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: area(fixture) }));
    expect(fixture.componentInstance.control.touched).toBe(false);
  });

  it('shows the invalid state only once touched', async () => {
    const fixture = await setup(FormFieldHost);
    const frame = () => fixture.nativeElement.querySelector('.editor-invalid');
    expect(frame()).toBeNull();
    fixture.componentInstance.control.markAsTouched();
    fixture.detectChanges();
    expect(frame()).not.toBeNull();
    expect(area(fixture).getAttribute('aria-invalid')).toBe('true');
  });

  it('is labelled by ui-form-field', async () => {
    const fixture = await setup(FormFieldHost);
    const label = fixture.nativeElement.querySelector('label') as HTMLLabelElement;
    expect(label.getAttribute('for')).toBe(area(fixture).id);
  });

  it('destroys the Tiptap instance with the component', async () => {
    const fixture = await setup(ReactiveHost);
    const editor = (fixture.debugElement.children[0].componentInstance as UiEditor).editor()!;
    fixture.destroy();
    expect(editor.isDestroyed).toBe(true);
  });
});
