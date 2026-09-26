import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  path: string;
}

@Component({
  selector: 'doc-sidebar',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside
      class="border-border bg-background sticky top-14 h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r p-6"
    >
      <div class="mb-6">
        <h4 class="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
          Components
        </h4>
        <nav class="space-y-1">
          @for (item of componentItems; track item.path) {
            <a
              routerLinkActive="bg-muted text-foreground font-medium"
              class="text-muted-foreground hover:bg-muted/60 hover:text-foreground flex items-center rounded-md px-3 py-2 text-sm transition-colors"
              [routerLink]="item.path"
            >
              {{ item.label }}
            </a>
          }
        </nav>
      </div>
    </aside>
  `,
})
export class DocsSidebarComponent {
  readonly componentItems: NavItem[] = [
    { label: 'Button', path: '/button' },
    { label: 'Form Field & Input', path: '/input' },
    { label: 'Checkbox & Switch', path: '/checkbox' },
    { label: 'Radio Group', path: '/radio' },
  ];
}
