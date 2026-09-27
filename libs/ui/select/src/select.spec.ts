import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { UiOptionComponent, UiSelectComponent } from './public-api';
import {
  key,
  listbox,
  optionByText,
  options,
  settle,
  trigger,
  triggerBox,
  type,
} from './select.testing';

@Component({
  imports: [UiSelectComponent, UiOptionComponent],
  template: `
    <ui-select
      placeholder="Pick a fruit"
      [(value)]="value"
    >
      <ui-option
        value="apple"
        label="Apple"
      />
      <ui-option
        value="banana"
        label="Banana"
      />
      <ui-option
        value="cherry"
        label="Cherry"
        ><b class="custom">Cherry!</b></ui-option
      >
    </ui-select>
  `,
})
class SingleHostComponent {
  readonly value = signal<string | null>(null);
}

describe('UiSelectComponent (single, aria + overlay)', () => {
  let fixture: ComponentFixture<SingleHostComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [SingleHostComponent] });
    fixture = TestBed.createComponent(SingleHostComponent);
    await settle(fixture);
  });

  it('renders a collapsed combobox input with the placeholder', () => {
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(trigger().getAttribute('placeholder')).toBe('Pick a fruit');
    expect(listbox()).toBeNull();
  });

  it('opens on click and renders the declared options inside the listbox', async () => {
    triggerBox().click();
    await settle(fixture);

    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(listbox()).not.toBeNull();
    expect(options().map((o) => o.textContent?.trim())).toEqual(['Apple', 'Banana', 'Cherry!']);
    expect(listbox()!.querySelector('.custom')).not.toBeNull();
  });

  it('moves the active descendant with the keyboard and selects with Enter', async () => {
    key(trigger(), 'ArrowDown');
    await settle(fixture);
    key(trigger(), 'ArrowDown');
    await settle(fixture);

    const activeId = trigger().getAttribute('aria-activedescendant');
    const active = options().find((o) => o.getAttribute('data-active') === 'true')!;
    expect(activeId).toBe(active.id);

    const expected = active.textContent!.trim().toLowerCase().replace('!', '');
    key(trigger(), 'Enter');
    await settle(fixture);

    expect(fixture.componentInstance.value()).toBe(expected);
    expect(listbox()).toBeNull();
  });

  it('selects on option click, closes, and shows the label', async () => {
    triggerBox().click();
    await settle(fixture);
    optionByText('Banana').click();
    await settle(fixture);

    expect(fixture.componentInstance.value()).toBe('banana');
    expect(listbox()).toBeNull();
    expect(document.querySelector('ui-select .select-value')?.textContent?.trim()).toBe('Banana');
  });

  it('keeps the value when the already-selected option is picked again', async () => {
    fixture.componentInstance.value.set('banana');
    await settle(fixture);
    triggerBox().click();
    await settle(fixture);
    optionByText('Banana').click();
    await settle(fixture);

    expect(fixture.componentInstance.value()).toBe('banana');
    expect(listbox()).toBeNull();
  });

  it('opens with Enter and Space when not searchable', async () => {
    key(trigger(), 'Enter');
    await settle(fixture);
    expect(listbox()).not.toBeNull();

    key(trigger(), 'Escape');
    await settle(fixture);
    expect(listbox()).toBeNull();

    key(trigger(), ' ');
    await settle(fixture);
    expect(listbox()).not.toBeNull();
  });

  it('blocks typing when not searchable', async () => {
    type(trigger(), 'ban');
    await settle(fixture);

    expect(trigger().value).toBe('');
  });
});
