import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { UI_TABLE, UiTableSelectionMode } from './public-api';

interface User {
  id: number;
  name: string;
}

const makeUsers = () =>
  Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `User ${i + 1}` }));

@Component({
  imports: [UI_TABLE],
  template: `
    <ui-table
      #t="uiTable"
      [data]="data()"
      [rowKey]="byId"
      [selectionMode]="mode()"
      [(selectedKeys)]="selected"
      [(pageIndex)]="page"
    >
      <table uiTableElement>
        <thead>
          <tr>
            <th uiTableSelectAll></th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          @for (u of t.viewData(); track u.id) {
            <tr
              uiTableRow
              [row]="u"
            >
              <td
                uiTableSelect
                [disabled]="u.id === 3"
                [label]="'Select ' + u.name"
              ></td>
              <td>{{ u.name }}</td>
            </tr>
          }
        </tbody>
      </table>
    </ui-table>
  `,
})
class HostComponent {
  readonly data = signal<User[]>(makeUsers());
  readonly mode = signal<UiTableSelectionMode>('multiple');
  readonly selected = signal<ReadonlySet<number>>(new Set());
  readonly page = signal(1);
  readonly byId = (u: User) => u.id;
}

async function settle(fixture: ComponentFixture<unknown>): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

describe('Table selection', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  const el = () => fixture.nativeElement as HTMLElement;
  const master = () => el().querySelector('th[uiTableSelectAll] input') as HTMLInputElement;
  const rowInputs = () =>
    Array.from(el().querySelectorAll('td[uiTableSelect] input')) as HTMLInputElement[];
  const rows = () => Array.from(el().querySelectorAll('tr[uiTableRow]'));

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    await settle(fixture);
  });

  it('labels the checkboxes', () => {
    expect(master().getAttribute('aria-label')).toBe('Select all rows on this page');
    expect(rowInputs()[0].getAttribute('aria-label')).toBe('Select User 1');
  });

  it('selects a row, marks it selected and makes the master indeterminate', async () => {
    rowInputs()[0].click();
    await settle(fixture);
    expect([...host.selected()]).toEqual([1]);
    expect(rows()[0].getAttribute('aria-selected')).toBe('true');
    expect(rows()[0].hasAttribute('data-selected')).toBe(true);
    expect(master().indeterminate).toBe(true);
  });

  it('master toggles every enabled row on the page and skips disabled ones', async () => {
    master().click();
    await settle(fixture);
    expect([...host.selected()].sort((a, b) => a - b)).toEqual([1, 2, 4, 5, 6, 7, 8, 9, 10]);
    expect(master().checked).toBe(true);
    expect(rowInputs()[2].disabled).toBe(true);

    master().click();
    await settle(fixture);
    expect(host.selected().size).toBe(0);
  });

  it('keeps selection from other pages', async () => {
    rowInputs()[0].click();
    await settle(fixture);
    host.page.set(2);
    await settle(fixture);
    expect(master().checked).toBe(false);
    expect(master().indeterminate).toBe(false);
    master().click();
    await settle(fixture);
    expect(host.selected().has(1)).toBe(true);
    expect(host.selected().has(11)).toBe(true);
  });

  it('keeps rows selected when data is refetched as new objects', async () => {
    rowInputs()[1].click();
    await settle(fixture);
    host.data.set(makeUsers());
    await settle(fixture);
    expect(rows()[1].getAttribute('aria-selected')).toBe('true');
    expect(rowInputs()[1].checked).toBe(true);
  });

  it('uses radios and hides the master in single mode', async () => {
    host.mode.set('single');
    await settle(fixture);
    expect(master()).toBeNull();
    const radios = rowInputs();
    expect(radios[0].type).toBe('radio');
    radios[1].click();
    await settle(fixture);
    radios[3].click();
    await settle(fixture);
    expect([...host.selected()]).toEqual([4]);
  });
});

@Component({
  imports: [UI_TABLE],
  template: `
    <ui-table
      [data]="[]"
      selectionMode="multiple"
    >
      <table uiTableElement></table>
    </ui-table>
  `,
})
class MissingKeyHostComponent {}

describe('Table selection config', () => {
  it('throws when selection is on without rowKey', () => {
    TestBed.configureTestingModule({ imports: [MissingKeyHostComponent] });
    const fixture = TestBed.createComponent(MissingKeyHostComponent);
    expect(() => fixture.detectChanges()).toThrow(/rowKey is required/);
  });
});
