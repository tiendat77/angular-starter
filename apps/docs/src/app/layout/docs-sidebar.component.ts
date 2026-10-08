import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DocsSidebarState } from './docs-sidebar-state';

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
  host: { '(document:keydown.escape)': 'state.close()' },
  templateUrl: './docs-sidebar.component.html',
})
export class DocsSidebarComponent {
  protected readonly state = inject(DocsSidebarState);

  readonly navGroups: NavGroup[] = [
    {
      title: 'Foundations',
      items: [{ label: 'Theme', path: '/theme' }],
    },
    {
      title: 'Forms',
      items: [
        { label: 'Button', path: '/button' },
        { label: 'Form Field & Input', path: '/input' },
        { label: 'OTP Input', path: '/otp-input' },
        { label: 'Editor', path: '/editor' },
        { label: 'Slider', path: '/slider' },
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
        { label: 'Collapse / Accordion', path: '/collapse' },
      ],
    },
    {
      title: 'Data & Media',
      items: [
        { label: 'Avatar', path: '/avatar' },
        { label: 'Badge', path: '/badge' },
        { label: 'Card', path: '/card' },
        { label: 'QR Code', path: '/qr-code' },
        { label: 'Paginator', path: '/paginator' },
        { label: 'SVG Icon', path: '/svg-icon' },
        { label: 'Table', path: '/table' },
        { label: 'Tag', path: '/tag' },
      ],
    },
  ];
}
