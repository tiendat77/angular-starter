import { Component, TemplateRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { UiTooltipComponent } from './tooltip.component';

@Component({
  standalone: true,
  template: `<ng-template #customTpl><span class="custom-content">Hello Rich</span></ng-template>`,
})
class TestHostComponent {
  readonly tpl = viewChild.required<TemplateRef<unknown>>('customTpl');
}

describe('UiTooltipComponent', () => {
  let fixture: ComponentFixture<UiTooltipComponent>;
  let component: UiTooltipComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [UiTooltipComponent, TestHostComponent],
    });
    fixture = TestBed.createComponent(UiTooltipComponent);
    component = fixture.componentInstance;
  });

  it('renders string content with tooltip role and id', () => {
    component.id.set('test-tip-1');
    component.content.set('Simple message');
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const tooltipEl = el.querySelector('[role="tooltip"]');
    expect(tooltipEl).not.toBeNull();
    expect(tooltipEl?.id).toBe('test-tip-1');
    expect(tooltipEl?.textContent).toContain('Simple message');
  });

  it('renders TemplateRef content when provided', () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();
    component.content.set(hostFixture.componentInstance.tpl());
    fixture.detectChanges();

    const custom = fixture.nativeElement.querySelector('.custom-content');
    expect(custom).not.toBeNull();
    expect(custom?.textContent).toBe('Hello Rich');
  });

  it('renders arrow element when arrow is true and sets data-placement', () => {
    component.arrow.set(true);
    component.placement.set('bottom');
    fixture.detectChanges();

    const arrow = fixture.nativeElement.querySelector('.tooltip-arrow');
    expect(arrow).not.toBeNull();
    const tooltipEl = fixture.nativeElement.querySelector('[role="tooltip"]');
    expect(tooltipEl?.getAttribute('data-placement')).toBe('bottom');
  });

  it('reactively updates variant classes when signals change', () => {
    component.id.set('reactive-tip');
    component.content.set('Status');
    component.color.set('primary');
    component.size.set('sm');
    component.interactive.set(true);
    fixture.detectChanges();

    const tooltipEl = fixture.nativeElement.querySelector('[role="tooltip"]');
    expect(tooltipEl?.className).toContain('tooltip-primary');
    expect(tooltipEl?.className).toContain('tooltip-sm');
    expect(tooltipEl?.className).toContain('tooltip-interactive');

    component.color.set('error');
    fixture.detectChanges();
    expect(tooltipEl?.className).toContain('tooltip-error');
    expect(tooltipEl?.className).not.toContain('tooltip-primary');
  });
});
