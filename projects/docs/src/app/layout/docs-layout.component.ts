import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DocsHeaderComponent } from './docs-header.component';
import { DocsSidebarComponent } from './docs-sidebar.component';

@Component({
  selector: 'doc-layout',
  imports: [RouterOutlet, DocsHeaderComponent, DocsSidebarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-background text-foreground flex min-h-screen flex-col">
      <doc-header />
      <div class="mx-auto flex w-full max-w-7xl flex-1">
        <doc-sidebar />
        <main class="flex-1 overflow-y-auto p-8">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class DocsLayoutComponent {}
