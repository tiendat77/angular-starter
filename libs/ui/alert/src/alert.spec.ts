import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiColor } from '@libs/ui/core';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  UiAlertActionsDirective,
  UiAlertIconDirective,
  UiAlertTitleDirective,
} from './alert-parts.directive';
import { UiAlertComponent } from './alert.component';
import { UiAlertAppearance, UiAlertRole } from './alert.types';

@Component({
  imports: [UiAlertComponent, UiAlertTitleDirective, UiAlertActionsDirective],
  template: `
    <ui-alert
      [color]="color()"
      [appearance]="appearance()"
      [icon]="icon()"
      [banner]="banner()"
      [dismissible]="dismissible()"
      [role]="role()"
      [(open)]="open"
      (closed)="onClosed()"
    >
      <span uiAlertTitle>Heads up</span>
      Body text
      <div uiAlertActions><button type="button">Act</button></div>
    </ui-alert>
  `,
})
class AlertHostComponent {
  readonly color = signal<UiColor>('neutral');
  readonly appearance = signal<UiAlertAppearance>('soft');
  readonly icon = signal(true);
  readonly banner = signal(false);
  readonly dismissible = signal(false);
  readonly role = signal<UiAlertRole | null>(null);
  readonly open = signal(true);
  closedCount = 0;

  onClosed(): void {
    this.closedCount++;
  }
}

@Component({
  imports: [UiAlertComponent, UiAlertIconDirective],
  template: `
    <ui-alert color="success">
      <svg
        uiAlertIcon
        data-testid="custom-icon"
      ></svg>
      Saved.
    </ui-alert>
  `,
})
class CustomIconHostComponent {}

describe('UiAlertComponent', () => {
  let fixture: ComponentFixture<AlertHostComponent>;
  let host: AlertHostComponent;
  let el: HTMLElement;

  const iconSvg = () => el.querySelector('.alert-icon svg');
  const closeButton = () => el.querySelector<HTMLButtonElement>('.alert-close');

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AlertHostComponent] });
    fixture = TestBed.createComponent(AlertHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    el = fixture.nativeElement.querySelector('ui-alert');
  });

  it('renders a neutral soft status alert by default', () => {
    for (const c of ['alert', 'alert-row', 'alert-neutral', 'alert-soft']) {
      expect(el.classList).toContain(c);
    }
    expect(el.classList).not.toContain('alert-banner');
    expect(el.getAttribute('role')).toBe('status');
    expect(iconSvg()).toBeNull();
    expect(closeButton()).toBeNull();
    expect(el.hasAttribute('hidden')).toBe(false);
  });

  it('picks role alert for error and warning, status otherwise', () => {
    host.color.set('error');
    fixture.detectChanges();
    expect(el.getAttribute('role')).toBe('alert');

    host.color.set('warning');
    fixture.detectChanges();
    expect(el.getAttribute('role')).toBe('alert');

    host.color.set('success');
    fixture.detectChanges();
    expect(el.getAttribute('role')).toBe('status');
  });

  it('lets role be overridden, and none removes it', () => {
    host.role.set('alert');
    fixture.detectChanges();
    expect(el.getAttribute('role')).toBe('alert');

    host.role.set('none');
    fixture.detectChanges();
    expect(el.hasAttribute('role')).toBe(false);
  });

  it('shows the default icon for the color unless icon is false', () => {
    host.color.set('error');
    fixture.detectChanges();
    expect(iconSvg()!.querySelector('path')!.getAttribute('d')).toContain('M10 14l2-2');

    host.color.set('info');
    fixture.detectChanges();
    expect(iconSvg()!.querySelector('path')!.getAttribute('d')).toContain('M13 16h-1v-4h-1');

    host.icon.set(false);
    fixture.detectChanges();
    expect(iconSvg()).toBeNull();
  });

  it('maps appearance and banner to classes', () => {
    host.color.set('info');
    host.appearance.set('solid');
    host.banner.set(true);
    fixture.detectChanges();
    expect(el.classList).toContain('alert-info');
    expect(el.classList).toContain('alert-solid');
    expect(el.classList).toContain('alert-banner');
    expect(el.classList).not.toContain('alert-soft');
  });

  it('dismisses: hides, updates open and emits closed', () => {
    host.dismissible.set(true);
    fixture.detectChanges();
    expect(closeButton()!.getAttribute('aria-label')).toBe('Dismiss');

    closeButton()!.click();
    fixture.detectChanges();
    expect(el.hasAttribute('hidden')).toBe(true);
    expect(host.open()).toBe(false);
    expect(host.closedCount).toBe(1);

    host.open.set(true);
    fixture.detectChanges();
    expect(el.hasAttribute('hidden')).toBe(false);
  });

  it('places title and actions in the body with their classes', () => {
    const body = el.querySelector('.alert-description')!;
    expect(body.querySelector('[uiAlertTitle]')!.classList).toContain('alert-title');
    expect(body.querySelector('[uiAlertActions]')!.classList).toContain('alert-actions');
    expect(body.textContent).toContain('Body text');
  });
});

describe('UiAlertComponent (custom icon)', () => {
  it('replaces the default icon with a projected uiAlertIcon', () => {
    TestBed.configureTestingModule({ imports: [CustomIconHostComponent] });
    const fixture = TestBed.createComponent(CustomIconHostComponent);
    fixture.detectChanges();
    const iconSlot = fixture.nativeElement.querySelector('ui-alert .alert-icon');
    expect(iconSlot.querySelector('[data-testid="custom-icon"]')).not.toBeNull();
    expect(iconSlot.querySelectorAll('svg').length).toBe(1);
  });
});
