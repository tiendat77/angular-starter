import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'doc-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './docs-header.component.html',
})
export class DocsHeaderComponent {
  readonly isDark = signal(false);

  toggleTheme(): void {
    const nextDark = !this.isDark();
    this.isDark.set(nextDark);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', nextDark ? 'dark' : 'light');
    }
  }
}
