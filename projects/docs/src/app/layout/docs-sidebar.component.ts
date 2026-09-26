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
  templateUrl: './docs-sidebar.component.html',
})
export class DocsSidebarComponent {
  readonly componentItems: NavItem[] = [
    { label: 'Button', path: '/button' },
    { label: 'Form Field & Input', path: '/input' },
    { label: 'Checkbox & Switch', path: '/checkbox' },
    { label: 'Radio Group', path: '/radio' },
    { label: 'SVG Icon', path: '/svg-icon' },
  ];
}
