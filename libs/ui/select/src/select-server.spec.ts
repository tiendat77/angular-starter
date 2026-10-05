import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { UiOptionComponent, UiSelectComponent } from './public-api';
import {
  listbox,
  optionByText,
  options,
  settle,
  trigger,
  triggerBox,
  type,
} from './select.testing';

interface User {
  id: number;
  name: string;
}

const ALL: User[] = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Alan' },
  { id: 3, name: 'Bob' },
  { id: 4, name: 'Bella' },
];

@Component({
  imports: [UiSelectComponent, UiOptionComponent],
  template: `
    <ui-select
      searchable
      serverSearch
      [multiple]="multiple()"
      [loading]="loading()"
      [compareWith]="byId"
      [(value)]="value"
      (searchChange)="terms.push($event)"
    >
      @for (u of results(); track u.id) {
        <ui-option
          [value]="u"
          [label]="u.name"
        />
      }
    </ui-select>
  `,
})
class ServerHostComponent {
  readonly multiple = signal(false);
  readonly loading = signal(false);
  readonly results = signal<User[]>(ALL.slice(0, 2)); // Alice, Alan
  readonly value = signal<User | User[] | null>(null);
  readonly terms: string[] = [];
  readonly byId = (a: User, b: User) => a.id === b.id;
}

describe('UiSelectComponent (serverSearch)', () => {
  let fixture: ComponentFixture<ServerHostComponent>;
  let host: ServerHostComponent;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [ServerHostComponent] });
    fixture = TestBed.createComponent(ServerHostComponent);
    host = fixture.componentInstance;
    await settle(fixture);
  });

  afterEach(() => vi.useRealTimers());

  it('does not filter client-side and emits the debounced term', async () => {
    vi.useFakeTimers();
    type(trigger(), 'zzz');
    await settle(fixture);

    expect(options().map((o) => o.textContent?.trim())).toEqual(['Alice', 'Alan']);
    await vi.advanceTimersByTimeAsync(300);
    expect(host.terms).toEqual(['zzz']);
  });

  it('shows the loading row instead of options', async () => {
    host.loading.set(true);
    triggerBox().click();
    await settle(fixture);

    expect(listbox()!.querySelector('.select-loading')).not.toBeNull();
    expect(options().length).toBe(0);
  });

  it('keeps the single label after the options are swapped', async () => {
    triggerBox().click();
    await settle(fixture);
    optionByText('Alan').click();
    await settle(fixture);

    host.results.set([ALL[2], ALL[3]]); // Bob, Bella: Alan is gone
    await settle(fixture);

    expect(document.querySelector('ui-select .select-value')?.textContent?.trim()).toBe('Alan');
  });

  it('keeps selected values whose options are gone when picking new ones (multiple)', async () => {
    host.multiple.set(true);
    host.value.set([]);
    await settle(fixture);
    triggerBox().click();
    await settle(fixture);
    optionByText('Alice').click();
    await settle(fixture);

    host.results.set([ALL[2], ALL[3]]); // Bob, Bella
    await settle(fixture);
    optionByText('Bob').click();
    await settle(fixture);

    expect((host.value() as User[]).map((u) => u.id)).toEqual([1, 3]);
    const tags = Array.from(document.querySelectorAll('ui-select .tag')).map((t) =>
      t.firstChild?.textContent?.trim()
    );
    expect(tags).toEqual(['Alice', 'Bob']);
  });
});
