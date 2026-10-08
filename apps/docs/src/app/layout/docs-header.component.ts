import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DocsSidebarState } from './docs-sidebar-state';

@Component({
  selector: 'doc-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './docs-header.component.html',
})
export class DocsHeaderComponent {
  protected readonly sidebar = inject(DocsSidebarState);

  readonly isDark = signal(false);

  toggleTheme(): void {
    const nextDark = !this.isDark();
    this.isDark.set(nextDark);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', nextDark ? 'dark' : 'light');
    }
  }
}
