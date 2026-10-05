import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import {
  UiHighlightDirective,
  UiOptionComponent,
  UiSelectComponent,
  UiSelectEmptyDirective,
  UiSelectFilterFn,
  UiSelectOptionRef,
} from './public-api';
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

interface Fruit {
  id: string;
  name: string;
  color: string;
}

const FRUITS: Fruit[] = [
  { id: 'apple', name: 'Apple', color: 'red' },
  { id: 'banana', name: 'Banana', color: 'yellow' },
  { id: 'blueberry', name: 'Blueberry', color: 'blue' },
  { id: 'cherry', name: 'Cherry', color: 'red' },
];

@Component({
  imports: [UiSelectComponent, UiOptionComponent, UiSelectEmptyDirective, UiHighlightDirective],
  template: `
    <ui-select
      searchable
      [filterFn]="filterFn()"
      [(value)]="value"
      (searchChange)="searches.push($event)"
    >
      @for (f of fruits; track f.id) {
        <ui-option
          [value]="f.id"
          [label]="f.name"
        />
      }
      @if (customEmpty()) {
        <ng-template
          uiSelectEmpty
          let-term
          ><span class="custom-empty">Nothing for {{ term }}</span></ng-template
        >
      }
    </ui-select>
    <span
      class="standalone"
      uiHighlightTerm="an"
      [uiHighlight]="'Banana'"
    ></span>
  `,
})
class SearchHostComponent {
  readonly fruits = FRUITS;
  readonly value = signal<string | null>(null);
  readonly filterFn = signal<UiSelectFilterFn<string> | undefined>(undefined);
  readonly customEmpty = signal(false);
  readonly searches: string[] = [];
}

describe('UiSelectComponent (searchChange)', () => {
  let fixture: ComponentFixture<SearchHostComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [SearchHostComponent] });
    fixture = TestBed.createComponent(SearchHostComponent);
    await settle(fixture);
  });

  afterEach(() => vi.useRealTimers());

  it('filters options while typing and highlights the match', async () => {
    type(trigger(), 'ber');
    await settle(fixture);

    expect(listbox()).not.toBeNull();
    expect(options().map((o) => o.textContent?.trim())).toEqual(['Blueberry']);
    expect(options()[0].querySelector('mark.select-mark')?.textContent).toBe('ber');
  });

  it('shows the default empty text with the term', async () => {
    type(trigger(), 'kiwi');
    await settle(fixture);

    expect(options().length).toBe(0);
    expect(listbox()!.querySelector('.select-empty')?.textContent?.trim()).toBe(
      'No results for "kiwi"'
    );
  });

  it('renders a custom empty template with the term', async () => {
    fixture.componentInstance.customEmpty.set(true);
    await settle(fixture);
    type(trigger(), 'kiwi');
    await settle(fixture);

    expect(listbox()!.querySelector('.custom-empty')?.textContent).toBe('Nothing for kiwi');
  });

  it('uses a custom filterFn with (term, optionRef)', async () => {
    const calls: [string, UiSelectOptionRef<string>][] = [];
    fixture.componentInstance.filterFn.set((term, option) => {
      calls.push([term, option]);
      return FRUITS.find((f) => f.id === option.value)!.color === term;
    });
    await settle(fixture);
    type(trigger(), 'red');
    await settle(fixture);

    expect(options().map((o) => o.textContent?.trim())).toEqual(['Apple', 'Cherry']);
    expect(calls[0]).toEqual(['red', { value: 'apple', label: 'Apple', disabled: false }]);
  });

  it('selects a visible option with Enter after filtering (never a hidden one)', async () => {
    key(trigger(), 'ArrowDown');
    await settle(fixture);
    key(trigger(), 'ArrowDown');
    await settle(fixture); // active is now a non-cherry option
    type(trigger(), 'cher');
    await settle(fixture);
    key(trigger(), 'Enter');
    await settle(fixture);

    expect(fixture.componentInstance.value()).toBe('cherry');
  });

  it('clears the term after a pick and shows the selected label', async () => {
    type(trigger(), 'ban');
    await settle(fixture);
    key(trigger(), 'Enter');
    await settle(fixture);

    expect(fixture.componentInstance.value()).toBe('banana');
    expect(trigger().value).toBe('');
    expect(triggerBox().querySelector('.select-value')?.textContent?.trim()).toBe('Banana');
  });

  it('keeps the panel open and the value when the term hides the selected option', async () => {
    fixture.componentInstance.value.set('apple');
    await settle(fixture);
    type(trigger(), 'ban');
    await settle(fixture);

    expect(listbox()).not.toBeNull();
    expect(fixture.componentInstance.value()).toBe('apple');
  });

  it('shows the selected option as selected again after a search is cleared', async () => {
    fixture.componentInstance.value.set('cherry');
    await settle(fixture);
    type(trigger(), 'an');
    await settle(fixture);
    type(trigger(), '');
    await settle(fixture);

    expect(optionByText('Cherry').getAttribute('aria-selected')).toBe('true');
  });

  it('clears the term when the panel closes without a pick', async () => {
    type(trigger(), 'ban');
    await settle(fixture);
    key(trigger(), 'Escape');
    await settle(fixture);

    expect(trigger().value).toBe('');
    expect(listbox()).toBeNull();
  });

  it('emits (searchChange) debounced by 300ms', async () => {
    vi.useFakeTimers();
    type(trigger(), 'b');
    await settle(fixture);
    type(trigger(), 'bl');
    await settle(fixture);
    expect(fixture.componentInstance.searches).toEqual([]);

    await vi.advanceTimersByTimeAsync(300);
    expect(fixture.componentInstance.searches).toEqual(['bl']);
  });

  it('highlights standalone with uiHighlightTerm', () => {
    const marks = Array.from(document.querySelectorAll('.standalone mark')).map(
      (m) => m.textContent
    );
    expect(marks).toEqual(['an', 'an']);
    expect(document.querySelector('.standalone')!.textContent).toBe('Banana');
  });
});
