import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  path: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'doc-sidebar',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './docs-sidebar.component.html',
})
export class DocsSidebarComponent {
  readonly navGroups: NavGroup[] = [
    {
      title: 'Forms',
      items: [
        { label: 'Button', path: '/button' },
        { label: 'Form Field & Input', path: '/input' },
        { label: 'Checkbox & Switch', path: '/checkbox' },
        { label: 'Radio Group', path: '/radio' },
        { label: 'Select', path: '/select' },
        { label: 'Date Picker', path: '/date-picker' },
      ],
    },
    {
      title: 'Overlays & Feedback',
      items: [
        { label: 'Alert', path: '/alert' },
        { label: 'Dialog', path: '/dialog' },
        { label: 'Toast', path: '/toast' },
        { label: 'Bottom Sheet', path: '/bottom-sheet' },
        { label: 'Loader', path: '/loader' },
        { label: 'Spinner & Progress', path: '/progress' },
        { label: 'Tooltip', path: '/tooltip' },
      ],
    },
    {
      title: 'Navigation',
      items: [
        { label: 'Tabs', path: '/tabs' },
        { label: 'Menu / Dropdown', path: '/menu' },
      ],
    },
    {
      title: 'Data & Media',
      items: [
        { label: 'Avatar', path: '/avatar' },
        { label: 'Badge', path: '/badge' },
        { label: 'Card', path: '/card' },
        { label: 'Paginator', path: '/paginator' },
        { label: 'SVG Icon', path: '/svg-icon' },
        { label: 'Table', path: '/table' },
        { label: 'Tag', path: '/tag' },
      ],
    },
  ];
}
