import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface ApiRow {
  name: string;
  type: string;
  default?: string;
  description: string;
}

@Component({
  selector: 'doc-api-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './api-table.component.html',
})
export class ApiTableComponent {
  readonly title = input('API Reference');
  readonly rows = input.required<ApiRow[]>();
}
