import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PageEvent, Paginator } from '@libs/ui/paginator';
import { beforeEach, describe, expect, it } from 'vitest';
import { UiTable, UiTableModule, UiTableQueryParams } from './public-api';

interface User {
  id: number;
  name: string;
}

const USERS: User[] = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `User ${i + 1}` }));

@Component({
  imports: [UiTableModule, Paginator],
  template: `
    <ui-table
      #t="uiTable"
      [data]="data()"
      [rowKey]="byId"
      [loading]="loading()"
      [frontPagination]="front()"
      [total]="total()"
      [(pageIndex)]="page"
      [(pageSize)]="size"
      (queryParamsChange)="events.push($event)"
    >
      <table uiTableElement>
        <thead>
          <tr>
            <th>Name</th>
            <th>Id</th>
          </tr>
        </thead>
        <tbody>
          @for (u of t.viewData(); track u.id) {
            <tr
              uiTableRow
              [row]="u"
            >
              <td>{{ u.name }}</td>
              <td>{{ u.id }}</td>
            </tr>
          }
        </tbody>
      </table>
      @if (customEmpty()) {
        <ng-template uiTableEmpty><span class="custom-empty">Nothing here</span></ng-template>
      }
    </ui-table>
    <!-- The table no longer renders a paginator; consumers place their own next to it -->
    <paginator
      [length]="t.store.total()"
      [pageIndex]="t.store.currentPage()"
      [pageSize]="size()"
      [pageSizeOptions]="[10, 20, 50, 100]"
      (page)="onPage($event, t)"
    />
  `,
})
class HostComponent {
  readonly data = signal<User[]>(USERS);
  readonly loading = signal(false);
  readonly front = signal(true);
  readonly total = signal<number | undefined>(undefined);
  readonly customEmpty = signal(false);
  readonly page = signal(1);
  readonly size = signal(10);
  readonly events: UiTableQueryParams[] = [];
  readonly byId = (u: User) => u.id;

  onPage(event: PageEvent, table: UiTable<User, number>): void {
    const pageSize = Number(event.pageSize);
    if (pageSize !== this.size()) table.store.setPageSize(pageSize);
    else table.store.setPage(event.pageIndex);
  }
}

async function settle(fixture: ComponentFixture<unknown>): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

describe('UiTable', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  const el = () => fixture.nativeElement as HTMLElement;
  const bodyRows = () => Array.from(el().querySelectorAll('tbody:not([uitablestatebody]) tr'));
  const table = () =>
    fixture.debugElement.query(By.directive(UiTable)).componentInstance as UiTable;
  const paginator = () =>
    fixture.debugElement.query(By.directive(Paginator)).componentInstance as Paginator;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    await settle(fixture);
  });

  it('renders the first page and applies table classes', () => {
    expect(bodyRows()).toHaveLength(10);
    expect(bodyRows()[0].textContent).toContain('User 1');
    const tableEl = el().querySelector('table')!;
    expect(tableEl.classList).toContain('data-table');
    expect(tableEl.classList).toContain('data-table-default');
    expect(bodyRows()[0].classList).toContain('data-table-row');
  });

  it('changes page from the paginator and emits once', async () => {
    paginator().nextPage();
    await settle(fixture);
    expect(host.page()).toBe(2);
    expect(bodyRows()[0].textContent).toContain('User 11');
    expect(host.events).toEqual([{ pageIndex: 2, pageSize: 10, sort: null, filters: [] }]);
  });

  it('resets to page 1 and emits once when the page size changes', async () => {
    host.page.set(2);
    await settle(fixture);
    paginator()._changePageSize(20);
    await settle(fixture);
    expect(host.size()).toBe(20);
    expect(host.page()).toBe(1);
    expect(bodyRows()).toHaveLength(20);
    expect(host.events).toEqual([{ pageIndex: 1, pageSize: 20, sort: null, filters: [] }]);
  });

  it('does not emit when inputs change programmatically', async () => {
    host.page.set(3);
    await settle(fixture);
    expect(bodyRows().map((r) => r.textContent)).toEqual([
      expect.stringContaining('User 21'),
      expect.stringContaining('User 22'),
      expect.stringContaining('User 23'),
      expect.stringContaining('User 24'),
      expect.stringContaining('User 25'),
    ]);
    expect(host.events).toHaveLength(0);
  });

  it('shows server data as given and uses total, falling back to data length', async () => {
    host.front.set(false);
    host.data.set(USERS.slice(0, 7));
    host.page.set(4);
    await settle(fixture);
    expect(bodyRows()).toHaveLength(7);
    expect(table().store.total()).toBe(7);
    expect(table().store.currentPage()).toBe(4);

    host.total.set(95);
    await settle(fixture);
    expect(table().store.total()).toBe(95);
    expect(paginator().length).toBe(95);
  });

  it('shows the loading mask over existing rows', async () => {
    host.loading.set(true);
    await settle(fixture);
    expect(el().querySelector('.data-table-loading-mask ui-spinner')).not.toBeNull();
    expect(el().querySelector('table')!.getAttribute('aria-busy')).toBe('true');
    expect(bodyRows()).toHaveLength(10);
  });

  it('shows skeleton rows on the first load', async () => {
    host.data.set([]);
    host.loading.set(true);
    await settle(fixture);
    const skeletonRows = el().querySelectorAll('tbody[uitablestatebody] tr');
    expect(skeletonRows).toHaveLength(10);
    expect(skeletonRows[0].querySelectorAll('.data-table-skeleton')).toHaveLength(2);
    expect(el().querySelector('.data-table-loading-mask')).toBeNull();
  });

  it('renders the default and custom empty states across all columns', async () => {
    host.data.set([]);
    await settle(fixture);
    const cell = el().querySelector('tbody[uitablestatebody] td.data-table-empty')!;
    expect(cell.getAttribute('colspan')).toBe('2');
    expect(cell.textContent).toContain('No data');

    host.customEmpty.set(true);
    await settle(fixture);
    expect(el().querySelector('.custom-empty')?.textContent).toBe('Nothing here');
  });

  it('places the state tbody inside the table, after the consumer tbody', () => {
    const tableEl = el().querySelector('table')!;
    const bodies = Array.from(tableEl.tBodies);
    expect(bodies.at(-1)!.hasAttribute('uitablestatebody')).toBe(true);
  });
});
