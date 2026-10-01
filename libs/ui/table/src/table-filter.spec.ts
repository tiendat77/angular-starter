import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { UiTableFilterFn, UiTableModule, UiTableQueryParams } from './public-api';

interface Member {
  id: number;
  name: string;
  status: 'active' | 'inactive';
  role: 'admin' | 'user';
  team: string;
}

const MEMBERS: Member[] = [
  { id: 1, name: 'Alice', status: 'active', role: 'admin', team: 'A' },
  { id: 2, name: 'Bruno', status: 'inactive', role: 'user', team: 'B' },
  { id: 3, name: 'Chen', status: 'active', role: 'user', team: 'A' },
];

@Component({
  imports: [UiTableModule],
  template: `
    <ui-table
      #t="uiTable"
      [data]="members"
      [rowKey]="byId"
      (queryParamsChange)="events.push($event)"
    >
      <table uiTableElement>
        <thead>
          <tr>
            <th
              uiTableFilter="name"
              [filterFn]="nameContains"
            >
              Name
              <ng-template
                uiTableFilterPanel
                let-ctx
              >
                <input
                  class="name-search"
                  [value]="ctx.value() ?? ''"
                  (input)="ctx.setValue($any($event.target).value)"
                />
                <button
                  class="name-apply"
                  type="button"
                  (click)="ctx.confirm()"
                >
                  Search
                </button>
              </ng-template>
            </th>
            <th
              uiTableFilter="status"
              [filters]="statusOptions"
              [filterFn]="statusIn"
            >
              Status
            </th>
            <th
              uiTableFilter="role"
              [filters]="roleOptions"
              [filterMultiple]="false"
              [filterFn]="roleIs"
            >
              Role
            </th>
            <th
              uiTableFilter="team"
              [filters]="teamOptions"
            >
              Team
            </th>
          </tr>
        </thead>
        <tbody>
          @for (m of t.viewData(); track m.id) {
            <tr
              uiTableRow
              [row]="m"
            >
              <td>{{ m.name }}</td>
              <td>{{ m.status }}</td>
              <td>{{ m.role }}</td>
              <td>{{ m.team }}</td>
            </tr>
          }
        </tbody>
      </table>
    </ui-table>
  `,
})
class HostComponent {
  readonly members = MEMBERS;
  readonly events: UiTableQueryParams[] = [];
  readonly byId = (m: Member) => m.id;
  readonly statusOptions = [
    { text: 'Active', value: 'active' },
    { text: 'Inactive', value: 'inactive' },
  ];
  readonly roleOptions = [
    { text: 'Admin', value: 'admin' },
    { text: 'User', value: 'user' },
  ];
  readonly teamOptions = [{ text: 'Team A', value: 'A' }];
  readonly statusIn: UiTableFilterFn<Member> = (value, row) =>
    (value as string[]).includes(row.status);
  readonly roleIs: UiTableFilterFn<Member> = (value, row) => row.role === value;
  readonly nameContains: UiTableFilterFn<Member> = (value, row) =>
    row.name.toLowerCase().includes(String(value).toLowerCase());
}

async function settle(fixture: ComponentFixture<unknown>): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

describe('Table filtering', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  const el = () => fixture.nativeElement as HTMLElement;
  const trigger = (i: number) =>
    el()
      .querySelectorAll('thead th')
      [i].querySelector('.data-table-filter-trigger') as HTMLButtonElement;
  const panel = () =>
    document.querySelector('.cdk-overlay-container [role="dialog"]') as HTMLElement | null;
  const panelButton = (text: string) =>
    Array.from(panel()!.querySelectorAll('button')).find((b) => b.textContent!.trim() === text)!;
  const names = () =>
    Array.from(el().querySelectorAll('tr[uiTableRow] td:first-child')).map((td) =>
      td.textContent!.trim()
    );

  async function openFilter(i: number) {
    trigger(i).focus();
    trigger(i).click();
    await settle(fixture);
  }

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    await settle(fixture);
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((node) => node.remove());
  });

  it('renders an accessible trigger', () => {
    expect(trigger(1).getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger(1).getAttribute('aria-expanded')).toBe('false');
    expect(trigger(1).getAttribute('aria-label')).toBe('Filter Status');
  });

  it('stages list choices until OK, then filters, marks the trigger active and emits', async () => {
    await openFilter(1);
    expect(trigger(1).getAttribute('aria-expanded')).toBe('true');
    expect(panel()!.getAttribute('aria-label')).toBe('Filter Status');

    (panel()!.querySelectorAll('input[type="checkbox"]')[0] as HTMLInputElement).click();
    await settle(fixture);
    expect(names()).toEqual(['Alice', 'Bruno', 'Chen']);

    panelButton('OK').click();
    await settle(fixture);
    expect(panel()).toBeNull();
    expect(names()).toEqual(['Alice', 'Chen']);
    expect(trigger(1).hasAttribute('data-active')).toBe(true);
    expect(host.events.at(-1)).toEqual({
      pageIndex: 1,
      pageSize: 10,
      sort: null,
      filters: [{ key: 'status', value: ['active'] }],
    });
  });

  it('resets a column filter', async () => {
    await openFilter(1);
    (panel()!.querySelectorAll('input[type="checkbox"]')[1] as HTMLInputElement).click();
    panelButton('OK').click();
    await settle(fixture);
    expect(names()).toEqual(['Bruno']);

    await openFilter(1);
    panelButton('Reset').click();
    await settle(fixture);
    expect(names()).toEqual(['Alice', 'Bruno', 'Chen']);
    expect(trigger(1).hasAttribute('data-active')).toBe(false);
    expect(host.events.at(-1)!.filters).toEqual([]);
  });

  it('discards staged choices on Escape and returns focus to the trigger', async () => {
    await openFilter(1);
    (panel()!.querySelectorAll('input[type="checkbox"]')[1] as HTMLInputElement).click();
    await settle(fixture);
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await settle(fixture);

    expect(panel()).toBeNull();
    expect(names()).toEqual(['Alice', 'Bruno', 'Chen']);
    expect(document.activeElement).toBe(trigger(1));

    await openFilter(1);
    const boxes = panel()!.querySelectorAll(
      'input[type="checkbox"]'
    ) as NodeListOf<HTMLInputElement>;
    expect(boxes[1].checked).toBe(false);
  });

  it('closes without applying on outside click', async () => {
    await openFilter(1);
    (panel()!.querySelectorAll('input[type="checkbox"]')[0] as HTMLInputElement).click();
    (document.querySelector('.cdk-overlay-backdrop') as HTMLElement).click();
    await settle(fixture);
    expect(panel()).toBeNull();
    expect(names()).toEqual(['Alice', 'Bruno', 'Chen']);
  });

  it('uses radios for single-choice filters', async () => {
    await openFilter(2);
    const radios = panel()!.querySelectorAll('input[type="radio"]') as NodeListOf<HTMLInputElement>;
    expect(radios).toHaveLength(2);
    radios[0].click();
    panelButton('OK').click();
    await settle(fixture);
    expect(names()).toEqual(['Alice']);
    expect(host.events.at(-1)!.filters).toEqual([{ key: 'role', value: 'admin' }]);
  });

  it('renders a custom panel template with confirm()', async () => {
    await openFilter(0);
    const input = panel()!.querySelector('.name-search') as HTMLInputElement;
    input.value = 'ch';
    input.dispatchEvent(new Event('input'));
    (panel()!.querySelector('.name-apply') as HTMLButtonElement).click();
    await settle(fixture);
    expect(names()).toEqual(['Chen']);
  });

  it('emits but does not filter locally for a column without filterFn', async () => {
    await openFilter(3);
    (panel()!.querySelectorAll('input[type="checkbox"]')[0] as HTMLInputElement).click();
    panelButton('OK').click();
    await settle(fixture);
    expect(host.events.at(-1)!.filters).toEqual([{ key: 'team', value: ['A'] }]);
    expect(names()).toEqual(['Alice', 'Bruno', 'Chen']);
  });
});
