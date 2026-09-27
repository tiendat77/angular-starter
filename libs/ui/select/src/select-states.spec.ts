import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { UiOptionComponent, UiSelectComponent } from './public-api';
import { key, listbox, optionByText, options, settle, trigger, triggerBox } from './select.testing';

@Component({
  imports: [UiSelectComponent, UiOptionComponent],
  template: `
    <ui-select
      allowClear
      [multiple]="multiple()"
      [disabled]="disabled()"
      [(value)]="value"
      (openedChange)="opened.push($event)"
    >
      <ui-option
        value="apple"
        label="Apple"
      />
      <ui-option
        value="banana"
        label="Banana"
        disabled
      />
      <ui-option
        value="cherry"
        label="Cherry"
      />
    </ui-select>
  `,
})
class StatesHostComponent {
  readonly multiple = signal(false);
  readonly disabled = signal(false);
  readonly value = signal<string | string[] | null>(null);
  readonly opened: boolean[] = [];
}

const clearButton = () => document.querySelector<HTMLButtonElement>('ui-select .select-clear');

describe('UiSelectComponent (clear, disabled, openedChange)', () => {
  let fixture: ComponentFixture<StatesHostComponent>;
  let host: StatesHostComponent;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [StatesHostComponent] });
    fixture = TestBed.createComponent(StatesHostComponent);
    host = fixture.componentInstance;
    await settle(fixture);
  });

  it('shows the clear button only with a value and clears without opening', async () => {
    expect(clearButton()).toBeNull();
    host.value.set('apple');
    await settle(fixture);

    clearButton()!.click();
    await settle(fixture);

    expect(host.value()).toBeNull();
    expect(listbox()).toBeNull();
  });

  it('clears to an empty array in multiple mode', async () => {
    host.multiple.set(true);
    host.value.set(['apple', 'cherry']);
    await settle(fixture);

    clearButton()!.click();
    await settle(fixture);

    expect(host.value()).toEqual([]);
  });

  it('does not open, clear or remove tags when disabled', async () => {
    host.multiple.set(true);
    host.value.set(['apple']);
    host.disabled.set(true);
    await settle(fixture);

    triggerBox().click();
    key(trigger(), 'ArrowDown');
    await settle(fixture);

    expect(listbox()).toBeNull();
    expect(trigger().disabled).toBe(true);
    expect(clearButton()).toBeNull();
    expect(document.querySelector<HTMLButtonElement>('ui-select .tag-remove')!.disabled).toBe(true);
  });

  it('skips disabled options with the keyboard and ignores clicks on them', async () => {
    triggerBox().click();
    await settle(fixture);

    expect(optionByText('Banana').getAttribute('aria-disabled')).toBe('true');
    optionByText('Banana').click();
    await settle(fixture);
    expect(host.value()).toBeNull();

    const visited = new Set<string>();
    for (let i = 0; i < options().length + 1; i++) {
      key(trigger(), 'ArrowDown');
      await settle(fixture);
      const active = options().find((o) => o.getAttribute('data-active') === 'true');
      if (active) visited.add(active.textContent!.trim());
    }
    expect(visited.has('Banana')).toBe(false);
  });

  it('emits openedChange on open and close only', async () => {
    triggerBox().click();
    await settle(fixture);
    key(trigger(), 'Escape');
    await settle(fixture);

    expect(host.opened).toEqual([true, false]);
  });

  it('stretches to its container (host is a full-width block)', () => {
    const hostEl = document.querySelector('ui-select')!;
    expect(hostEl.classList).toContain('w-full');
    expect(hostEl.classList).toContain('min-w-0');
  });

  it('ignores text that reaches a non-searchable input (IME / mobile) and hides the keyboard', async () => {
    host.value.set('apple');
    await settle(fixture);
    expect(trigger().getAttribute('inputmode')).toBe('none');

    trigger().focus();
    trigger().value = 'x';
    trigger().dispatchEvent(
      new InputEvent('input', { bubbles: true, data: 'x', inputType: 'insertCompositionText' })
    );
    await settle(fixture);

    expect(trigger().value).toBe('');
    expect(document.querySelector('ui-select .select-value')?.textContent?.trim()).toBe('Apple');
  });

  it('accepts a single (non-array) value in multiple mode without crashing', async () => {
    host.multiple.set(true);
    host.value.set('apple');
    await settle(fixture);

    const tags = Array.from(document.querySelectorAll('ui-select .tag')).map((t) =>
      t.firstChild?.textContent?.trim()
    );
    expect(tags).toEqual(['Apple']);
  });

  it('renders the clear button as an accessible svg icon, not text', async () => {
    host.value.set('apple');
    await settle(fixture);

    const button = clearButton()!;
    expect(button.getAttribute('aria-label')).toBe('Clear');
    expect(button.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    expect(button.textContent?.trim()).toBe('');
  });
});
