import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DocsHeaderComponent } from './docs-header.component';
import { DocsSidebarComponent } from './docs-sidebar.component';

@Component({
  selector: 'doc-layout',
  imports: [RouterOutlet, DocsHeaderComponent, DocsSidebarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './docs-layout.component.html',
})
export class DocsLayoutComponent {}
