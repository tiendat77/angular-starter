import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UI_TABLE } from './public-api';

interface Item {
  id: number;
  name: string;
}

@Component({
  imports: [UI_TABLE],
  template: `
    <ui-table
      #t="uiTable"
      [data]="items"
      [rowKey]="byId"
      selectionMode="multiple"
      [scrollY]="scrollY()"
      scrollX="900px"
    >
      <table uiTableElement>
        <colgroup>
          <col width="48" />
          <col width="200px" />
          <col />
          <col width="120px" />
        </colgroup>
        <thead>
          <tr>
            <th
              uiTableSelectAll
              [left]="true"
            ></th>
            <th
              uiTableSort="name"
              [sortFn]="true"
              [left]="true"
            >
              Name
            </th>
            <th uiTableCell>Notes</th>
            <th
              uiTableCell
              [right]="true"
              align="end"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          @for (it of t.viewData(); track it.id) {
            <tr
              uiTableRow
              [row]="it"
            >
              <td
                uiTableSelect
                [left]="true"
              ></td>
              <td
                uiTableCell
                [left]="true"
              >
                {{ it.name }}
              </td>
              <td
                uiTableCell
                [ellipsis]="true"
              >
                Long note text
              </td>
              <td
                uiTableCell
                [right]="true"
                align="end"
              >
                Edit
              </td>
            </tr>
          }
        </tbody>
      </table>
    </ui-table>
  `,
})
class HostComponent {
  readonly items: Item[] = [
    { id: 1, name: 'One' },
    { id: 2, name: 'Two' },
  ];
  readonly scrollY = signal<string | null>('300px');
  readonly byId = (it: Item) => it.id;
}

@Component({
  imports: [UI_TABLE],
  template: `
    <ui-table [data]="[]">
      <table uiTableElement>
        <colgroup>
          <col />
          <col width="100px" />
        </colgroup>
        <thead>
          <tr>
            <th uiTableCell>A</th>
            <th
              uiTableCell
              [left]="true"
            >
              B
            </th>
          </tr>
        </thead>
      </table>
    </ui-table>
  `,
})
class MissingWidthHostComponent {}

@Component({
  imports: [UI_TABLE],
  template: `
    <ui-table
      #t="uiTable"
      [data]="items"
    >
      <table uiTableElement>
        <colgroup>
          <col width="100px" />
          <col width="100px" />
          @if (showExtra()) {
            <col width="120px" />
          }
          <col width="80px" />
        </colgroup>
        <thead>
          <tr>
            <th uiTableCell>A</th>
            <th uiTableCell>B</th>
            @if (showExtra()) {
              <th uiTableCell>C</th>
            }
            <th
              uiTableCell
              [right]="true"
            >
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          @for (it of t.viewData(); track it.id) {
            <tr
              uiTableRow
              [row]="it"
            >
              <td>{{ it.name }}</td>
              <td>b</td>
              @if (showExtra()) {
                <td>c</td>
              }
              <td
                uiTableCell
                [right]="true"
              >
                Edit
              </td>
            </tr>
          }
        </tbody>
      </table>
    </ui-table>
  `,
})
class ToggleColumnHostComponent {
  readonly items: Item[] = [{ id: 1, name: 'One' }];
  readonly showExtra = signal(false);
}

async function settle(fixture: ComponentFixture<unknown>): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

describe('Fixed columns and sticky header', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  const el = () => fixture.nativeElement as HTMLElement;
  const headerCells = () => Array.from(el().querySelectorAll('thead th')) as HTMLElement[];
  const firstRowCells = () =>
    Array.from(el().querySelectorAll('tr[uiTableRow]:first-child td')) as HTMLElement[];
  const container = () => el().querySelector('.data-table-container') as HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    await settle(fixture);
  });

  it('positions left and right fixed cells from declared widths', () => {
    const [select, name, notes, actions] = headerCells();
    expect(select.classList).toContain('data-table-cell-fix-left');
    expect(select.style.left).toBe('0px');
    expect(name.style.left).toBe('48px');
    expect(notes.classList).not.toContain('data-table-cell-fix-left');
    expect(actions.classList).toContain('data-table-cell-fix-right');
    expect(actions.style.right).toBe('0px');
    expect(firstRowCells()[1].style.left).toBe('48px');
  });

  it('marks the edge cells for the scroll shadow', () => {
    const [select, name, , actions] = headerCells();
    expect(select.hasAttribute('data-fix-edge')).toBe(false);
    expect(name.getAttribute('data-fix-edge')).toBe('left');
    expect(actions.getAttribute('data-fix-edge')).toBe('right');
    expect(firstRowCells()[1].getAttribute('data-fix-edge')).toBe('left');
  });

  it('applies align and ellipsis', () => {
    expect(headerCells()[3].style.textAlign).toBe('end');
    expect(firstRowCells()[2].classList).toContain('data-table-cell-ellipsis');
  });

  it('turns on the sticky header and horizontal scroll', async () => {
    expect(container().hasAttribute('data-scroll-y')).toBe(true);
    expect(container().style.maxHeight).toBe('300px');
    expect((el().querySelector('table') as HTMLElement).style.minWidth).toBe('900px');

    host.scrollY.set(null);
    await settle(fixture);
    expect(container().hasAttribute('data-scroll-y')).toBe(false);
  });

  it('reflects horizontal scroll position on the container', () => {
    const box = container();
    Object.defineProperty(box, 'scrollWidth', { configurable: true, value: 1000 });
    Object.defineProperty(box, 'clientWidth', { configurable: true, value: 500 });
    Object.defineProperty(box, 'scrollLeft', { configurable: true, writable: true, value: 0 });

    box.dispatchEvent(new Event('scroll'));
    expect(box.hasAttribute('data-scroll-left')).toBe(false);
    expect(box.hasAttribute('data-scroll-right')).toBe(true);

    box.scrollLeft = 500;
    box.dispatchEvent(new Event('scroll'));
    expect(box.hasAttribute('data-scroll-left')).toBe(true);
    expect(box.hasAttribute('data-scroll-right')).toBe(false);
  });
});

describe('Fixed column width warnings', () => {
  afterEach(() => vi.restoreAllMocks());

  it('warns once when a fixed column cannot be positioned', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    TestBed.configureTestingModule({ imports: [MissingWidthHostComponent] });
    const fixture = TestBed.createComponent(MissingWidthHostComponent);
    await settle(fixture);
    await settle(fixture);
    const widthWarnings = warn.mock.calls.filter(([message]) =>
      String(message).includes('needs a declared width')
    );
    expect(widthWarnings).toHaveLength(1);
    expect(String(widthWarnings[0][0])).toContain('Column 0');
  });
});

describe('Fixed columns with toggled columns', () => {
  it('re-positions fixed cells when a column is inserted with @if', async () => {
    TestBed.configureTestingModule({ imports: [ToggleColumnHostComponent] });
    const fixture = TestBed.createComponent(ToggleColumnHostComponent);
    await settle(fixture);
    const el = fixture.nativeElement as HTMLElement;
    const actionHeader = () => Array.from(el.querySelectorAll('thead th')).at(-1) as HTMLElement;
    const actionCell = () => el.querySelector('tr[uiTableRow] td:last-child') as HTMLElement;
    expect(actionHeader().style.right).toBe('0px');

    fixture.componentInstance.showExtra.set(true);
    await settle(fixture);
    await settle(fixture);

    expect(actionHeader().style.right).toBe('0px');
    expect(actionCell().style.right).toBe('0px');
    expect(actionHeader().getAttribute('data-fix-edge')).toBe('right');
    expect(actionCell().getAttribute('data-fix-edge')).toBe('right');
  });
});
