import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { UiButtonComponent } from '@libs/ui/button';
import { UiTableFilterFn, UiTableFilterOption, UiTableModule } from '@libs/ui/table';
import { UiTagComponent } from '@libs/ui/tag';
import { DocUser, makeUsers } from './table-doc.data';

@Component({
  selector: 'doc-table-full-example',
  imports: [UiTableModule, UiTagComponent, UiButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (selected().size > 0) {
      <div
        class="bg-muted text-foreground mb-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm"
      >
        <span>{{ selected().size }} selected</span>
        <button
          uiButton
          variant="danger"
          size="sm"
          (click)="deleteSelected()"
        >
          Delete
        </button>
        <button
          uiButton
          variant="ghost"
          size="sm"
          (click)="selected.set(emptyKeys)"
        >
          Clear
        </button>
      </div>
    }

    <ui-table
      #t="uiTable"
      selectionMode="multiple"
      density="middle"
      scrollY="420px"
      scrollX="1100px"
      [data]="users()"
      [rowKey]="byId"
      [(selectedKeys)]="selected"
    >
      <table uiTableElement>
        <colgroup>
          <col width="48px" />
          <col width="200px" />
          <col />
          <col width="120px" />
          <col width="140px" />
          <col width="90px" />
          <col width="110px" />
        </colgroup>
        <thead>
          <tr>
            <th
              uiTableSelectAll
              [left]="true"
            ></th>
            <th
              uiTableSort="name"
              uiTableFilter="name"
              [sortFn]="true"
              [filterFn]="nameContains"
              [left]="true"
            >
              Name
              <ng-template
                let-ctx
                uiTableFilterPanel
              >
                <div class="flex w-56 flex-col gap-2">
                  <input
                    class="input input-sm w-full"
                    placeholder="Search name"
                    aria-label="Search name"
                    [value]="ctx.value() ?? ''"
                    (input)="ctx.setValue($any($event.target).value)"
                    (keydown.enter)="ctx.confirm()"
                  />
                  <div class="flex justify-between">
                    <button
                      uiButton
                      variant="ghost"
                      size="sm"
                      (click)="ctx.reset()"
                    >
                      Reset
                    </button>
                    <button
                      uiButton
                      size="sm"
                      (click)="ctx.confirm()"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </ng-template>
            </th>
            <th uiTableCell>Email</th>
            <th
              uiTableFilter="role"
              [filters]="roleOptions"
              [filterFn]="roleIn"
            >
              Role
            </th>
            <th
              uiTableFilter="status"
              [filters]="statusOptions"
              [filterMultiple]="false"
              [filterFn]="statusIs"
            >
              Status
            </th>
            <th
              uiTableSort="age"
              align="end"
              [sortFn]="true"
            >
              Age
            </th>
            <th
              uiTableCell
              align="end"
              [right]="true"
            >
              Actions
            </th>
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
                [left]="true"
                [label]="'Select ' + u.name"
              ></td>
              <td
                uiTableCell
                [left]="true"
              >
                {{ u.name }}
              </td>
              <td
                uiTableCell
                [ellipsis]="true"
              >
                {{ u.email }}
              </td>
              <td>{{ u.role }}</td>
              <td>
                <ui-tag [color]="statusColor[u.status]">{{ u.status }}</ui-tag>
              </td>
              <td
                uiTableCell
                align="end"
              >
                {{ u.age }}
              </td>
              <td
                uiTableCell
                align="end"
                [right]="true"
              >
                <button
                  uiButton
                  variant="ghost"
                  size="sm"
                >
                  Edit
                </button>
              </td>
            </tr>
          }
        </tbody>
      </table>
      <ng-template uiTableEmpty>No users match these filters.</ng-template>
    </ui-table>
  `,
})
export class DocTableFullExampleComponent {
  readonly users = signal<DocUser[]>(makeUsers(120));
  readonly emptyKeys: ReadonlySet<number> = new Set();
  readonly selected = signal<ReadonlySet<number>>(this.emptyKeys);
  readonly byId = (user: DocUser) => user.id;
  readonly statusColor = { active: 'success', invited: 'info', suspended: 'warning' } as const;

  readonly roleOptions: UiTableFilterOption[] = [
    { text: 'Admin', value: 'Admin' },
    { text: 'Editor', value: 'Editor' },
    { text: 'Viewer', value: 'Viewer' },
  ];
  readonly statusOptions: UiTableFilterOption[] = [
    { text: 'Active', value: 'active' },
    { text: 'Invited', value: 'invited' },
    { text: 'Suspended', value: 'suspended' },
  ];

  readonly nameContains: UiTableFilterFn<DocUser> = (value, user) =>
    user.name.toLowerCase().includes(String(value).toLowerCase());
  readonly roleIn: UiTableFilterFn<DocUser> = (value, user) =>
    (value as string[]).includes(user.role);
  readonly statusIs: UiTableFilterFn<DocUser> = (value, user) => user.status === value;

  deleteSelected(): void {
    const selected = this.selected();
    this.users.update((users) => users.filter((user) => !selected.has(user.id)));
    this.selected.set(this.emptyKeys);
  }
}
