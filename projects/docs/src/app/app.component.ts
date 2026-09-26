import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsLayoutComponent } from './layout/docs-layout.component';

@Component({
  selector: 'doc-root',
  imports: [DocsLayoutComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<doc-layout />',
})
export class AppComponent {}
