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
        { label: 'Loader', path: '/loader' },
        { label: 'Spinner & Progress', path: '/progress' },
      ],
    },
    {
      title: 'Data & Media',
      items: [
        { label: 'Paginator', path: '/paginator' },
        { label: 'SVG Icon', path: '/svg-icon' },
        { label: 'Tag', path: '/tag' },
      ],
    },
  ];
}
