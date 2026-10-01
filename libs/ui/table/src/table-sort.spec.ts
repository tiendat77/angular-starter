import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UiTableModule, UiTableQueryParams, UiTableSortOrder } from './public-api';

interface Person {
  id: number;
  name: string;
  age: number;
  city: string;
}

const PEOPLE: Person[] = [
  { id: 1, name: 'Carol', age: 30, city: 'Oslo' },
  { id: 2, name: 'amy', age: 25, city: 'Bergen' },
  { id: 3, name: 'Bob', age: 35, city: 'Aalesund' },
];

@Component({
  imports: [UiTableModule],
  template: `
    <ui-table
      #t="uiTable"
      [data]="people"
      [rowKey]="byId"
      (queryParamsChange)="events.push($event)"
    >
      <table uiTableElement>
        <thead>
          <tr>
            <th
              uiTableSort="name"
              [sortFn]="true"
              [(sortOrder)]="nameOrder"
            >
              Name
            </th>
            <th
              uiTableSort="age"
              [sortFn]="byAge"
              [sortDirections]="['descend', null]"
            >
              Age
            </th>
            <th uiTableSort="city">City</th>
          </tr>
        </thead>
        <tbody>
          @for (p of t.viewData(); track p.id) {
            <tr
              uiTableRow
              [row]="p"
            >
              <td>{{ p.name }}</td>
              <td>{{ p.age }}</td>
              <td>{{ p.city }}</td>
            </tr>
          }
        </tbody>
      </table>
    </ui-table>
  `,
})
class HostComponent {
  readonly people = PEOPLE;
  readonly nameOrder = signal<UiTableSortOrder>(null);
  readonly events: UiTableQueryParams[] = [];
  readonly byId = (p: Person) => p.id;
  readonly byAge = (a: Person, b: Person) => a.age - b.age;
}

async function settle(fixture: ComponentFixture<unknown>): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

describe('Table sorting', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let announce: ReturnType<typeof vi.fn>;
  const el = () => fixture.nativeElement as HTMLElement;
  const header = (i: number) => el().querySelectorAll('thead th')[i] as HTMLElement;
  const sortButton = (i: number) =>
    header(i).querySelector('button.data-table-sort') as HTMLButtonElement;
  const names = () =>
    Array.from(el().querySelectorAll('tr[uiTableRow] td:first-child')).map((td) =>
      td.textContent!.trim()
    );

  async function create(initialOrder: UiTableSortOrder = null) {
    announce = vi.fn().mockResolvedValue(undefined);
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: LiveAnnouncer, useValue: { announce } }],
    });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    host.nameOrder.set(initialOrder);
    await settle(fixture);
  }

  describe('with no initial sort', () => {
    beforeEach(() => create());

    it('renders a sort button holding the header text', () => {
      expect(sortButton(0).textContent).toContain('Name');
      expect(sortButton(0).type).toBe('button');
      expect(header(0).getAttribute('aria-sort')).toBe('none');
    });

    it('cycles ascend → descend → none', async () => {
      sortButton(0).click();
      await settle(fixture);
      expect(header(0).getAttribute('aria-sort')).toBe('ascending');
      expect(names()).toEqual(['amy', 'Bob', 'Carol']);
      expect(host.nameOrder()).toBe('ascend');

      sortButton(0).click();
      await settle(fixture);
      expect(header(0).getAttribute('aria-sort')).toBe('descending');
      expect(names()).toEqual(['Carol', 'Bob', 'amy']);

      sortButton(0).click();
      await settle(fixture);
      expect(header(0).getAttribute('aria-sort')).toBe('none');
      expect(names()).toEqual(['Carol', 'amy', 'Bob']);
    });

    it('keeps a single active column and honours custom directions', async () => {
      sortButton(0).click();
      await settle(fixture);
      sortButton(1).click();
      await settle(fixture);
      expect(header(0).getAttribute('aria-sort')).toBe('none');
      expect(header(1).getAttribute('aria-sort')).toBe('descending');
      expect(names()).toEqual(['Bob', 'Carol', 'amy']);
    });

    it('emits the sort in queryParamsChange', async () => {
      sortButton(0).click();
      await settle(fixture);
      expect(host.events).toEqual([
        { pageIndex: 1, pageSize: 10, sort: { key: 'name', order: 'ascend' }, filters: [] },
      ]);
    });

    it('emits but does not reorder rows for a server-only column', async () => {
      sortButton(2).click();
      await settle(fixture);
      expect(host.events.at(-1)!.sort).toEqual({ key: 'city', order: 'ascend' });
      expect(names()).toEqual(['Carol', 'amy', 'Bob']);
    });

    it('announces sort changes', async () => {
      sortButton(0).click();
      await settle(fixture);
      expect(announce).toHaveBeenCalledWith('Sorted by Name, ascending');
    });
  });

  it('applies an initial [(sortOrder)] without emitting', async () => {
    await create('descend');
    expect(names()).toEqual(['Carol', 'Bob', 'amy']);
    expect(header(0).getAttribute('aria-sort')).toBe('descending');
    expect(host.events).toHaveLength(0);
  });
});
