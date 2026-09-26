import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { UiOptionComponent, UiSelectComponent } from './public-api';
import { key, listbox, optionByText, settle, trigger, triggerBox, type } from './select.testing';

interface User {
  id: number;
  name: string;
}

const USERS: User[] = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Carol' },
  { id: 4, name: 'Dave' },
];

@Component({
  imports: [UiSelectComponent, UiOptionComponent],
  template: `
    <ui-select
      multiple
      searchable
      [maxTagCount]="maxTagCount()"
      [compareWith]="byId"
      [(value)]="value"
    >
      @for (u of users; track u.id) {
        <ui-option
          [value]="u"
          [label]="u.name"
        />
      }
    </ui-select>
  `,
})
class MultipleHostComponent {
  readonly users = USERS;
  readonly value = signal<User[] | null>([]);
  readonly maxTagCount = signal<number | null>(null);
  readonly byId = (a: User, b: User) => a.id === b.id;
}

const tagTexts = () =>
  Array.from(document.querySelectorAll('ui-select .tag')).map((t) =>
    t.firstChild?.textContent?.trim()
  );

describe('UiSelectComponent (multiple)', () => {
  let fixture: ComponentFixture<MultipleHostComponent>;
  let host: MultipleHostComponent;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [MultipleHostComponent] });
    fixture = TestBed.createComponent(MultipleHostComponent);
    host = fixture.componentInstance;
    await settle(fixture);
  });

  it('keeps the panel open, appends picks in order and renders tags', async () => {
    triggerBox().click();
    await settle(fixture);
    optionByText('Carol').click();
    await settle(fixture);
    optionByText('Alice').click();
    await settle(fixture);

    expect(listbox()).not.toBeNull();
    expect(host.value()!.map((u) => u.id)).toEqual([3, 1]);
    expect(tagTexts()).toEqual(['Carol', 'Alice']);
    expect(optionByText('Carol').getAttribute('aria-selected')).toBe('true');
  });

  it('toggles a selected option off when picked again', async () => {
    host.value.set([{ id: 2, name: 'Bob' }]);
    await settle(fixture);
    triggerBox().click();
    await settle(fixture);
    optionByText('Bob').click();
    await settle(fixture);

    expect(host.value()).toEqual([]);
  });

  it('clears the search term after each pick', async () => {
    type(trigger(), 'car');
    await settle(fixture);
    key(trigger(), 'Enter');
    await settle(fixture);

    expect(host.value()!.map((u) => u.id)).toEqual([3]);
    expect(trigger().value).toBe('');
    expect(listbox()).not.toBeNull();
  });

  it('removes a value with the tag × without opening the panel', async () => {
    host.value.set([USERS[0], USERS[1]]);
    await settle(fixture);

    (document.querySelector('ui-select .tag-remove') as HTMLButtonElement).click();
    await settle(fixture);

    expect(host.value()!.map((u) => u.id)).toEqual([2]);
    expect(listbox()).toBeNull();
  });

  it('removes the last value with Backspace on an empty search', async () => {
    host.value.set([USERS[0], USERS[1]]);
    await settle(fixture);
    trigger().focus();
    key(trigger(), 'Backspace');
    await settle(fixture);

    expect(host.value()!.map((u) => u.id)).toEqual([1]);
  });

  it('does not remove a tag with Backspace while search text is present', async () => {
    host.value.set([USERS[0]]);
    await settle(fixture);
    type(trigger(), 'bo');
    await settle(fixture);
    key(trigger(), 'Backspace');
    await settle(fixture);

    expect(host.value()!.map((u) => u.id)).toEqual([1]);
  });

  it('collapses extra tags into +N with maxTagCount', async () => {
    host.maxTagCount.set(2);
    host.value.set([USERS[0], USERS[1], USERS[2], USERS[3]]);
    await settle(fixture);

    expect(tagTexts()).toEqual(['Alice', 'Bob', '+2']);
  });

  it('matches values through compareWith (new objects, same id)', async () => {
    host.value.set([{ id: 2, name: 'Bob (stale copy)' }]);
    await settle(fixture);
    triggerBox().click();
    await settle(fixture);

    expect(optionByText('Bob').getAttribute('aria-selected')).toBe('true');
    expect(tagTexts()).toEqual(['Bob']);
  });

  it('keeps earlier values after a search is typed and cleared, then another pick', async () => {
    host.value.set([USERS[0], USERS[1]]); // Alice, Bob
    await settle(fixture);
    type(trigger(), 'ali');
    await settle(fixture);
    type(trigger(), '');
    await settle(fixture);

    expect(optionByText('Bob').getAttribute('aria-selected')).toBe('true');
    optionByText('Carol').click();
    await settle(fixture);

    expect(host.value()!.map((u) => u.id)).toEqual([1, 2, 3]);
  });

  it('keeps all values when a search hides every selected option, then another pick', async () => {
    host.value.set([USERS[0]]); // Alice
    await settle(fixture);
    type(trigger(), 'zzz');
    await settle(fixture);
    type(trigger(), '');
    await settle(fixture);
    optionByText('Bob').click();
    await settle(fixture);

    expect(host.value()!.map((u) => u.id)).toEqual([1, 2]);
  });
});
