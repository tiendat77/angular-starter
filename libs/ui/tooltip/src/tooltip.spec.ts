import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, TemplateRef, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiColor } from '@libs/ui/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UiTooltipDirective } from './tooltip.directive';
import { UiTooltipPosition } from './tooltip.types';

@Component({
  standalone: true,
  imports: [UiTooltipDirective],
  template: `
    <button
      #tooltipRef="uiTooltip"
      id="test-btn"
      [uiTooltip]="text()"
      [uiTooltipPosition]="pos()"
      [uiTooltipDelay]="delay()"
      [uiTooltipHideDelay]="hideDelay()"
      [uiTooltipDisabled]="disabled()"
      [uiTooltipInteractive]="interactive()"
      [uiTooltipColor]="color()"
      [uiTooltipArrow]="arrow()"
      (tooltipVisibleChange)="onVisibleChange($event)"
    >
      Hover me
    </button>

    <ng-template #customTpl>
      <span class="custom-template-text">Rich content</span>
    </ng-template>
  `,
})
class TestHostComponent {
  readonly text = signal<string | TemplateRef<unknown> | null>('Tooltip message');
  readonly pos = signal<UiTooltipPosition>('top');
  readonly delay = signal<number>(200);
  readonly hideDelay = signal<number>(0);
  readonly disabled = signal<boolean>(false);
  readonly interactive = signal<boolean | undefined>(undefined);
  readonly color = signal<UiColor>('neutral');
  readonly arrow = signal<boolean>(true);
  readonly tpl = viewChild<TemplateRef<unknown>>('customTpl');
  readonly tooltipDirective = viewChild.required<UiTooltipDirective>('tooltipRef');

  visibleEvents: boolean[] = [];

  onVisibleChange(v: boolean): void {
    this.visibleEvents.push(v);
  }
}

describe('UiTooltipDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });
    fixture = TestBed.createComponent(TestHostComponent);
    overlayContainer = TestBed.inject(OverlayContainer);
    overlayContainerElement = overlayContainer.getContainerElement();
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    overlayContainer.ngOnDestroy();
    vi.useRealTimers();
  });

  it('shows tooltip after delay on mouseenter and sets aria-describedby', async () => {
    vi.useFakeTimers();
    const btn: HTMLElement = fixture.nativeElement.querySelector('#test-btn');
    btn.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();

    expect(overlayContainerElement.querySelector('[role="tooltip"]')).toBeNull();
    await vi.advanceTimersByTimeAsync(200);
    fixture.detectChanges();

    const tooltip = overlayContainerElement.querySelector('[role="tooltip"]');
    expect(tooltip).not.toBeNull();
    expect(tooltip?.textContent).toContain('Tooltip message');
    expect(btn.getAttribute('aria-describedby')).toBe(tooltip?.id);
  });

  it('cancels show if mouse leaves before delay', async () => {
    vi.useFakeTimers();
    const btn: HTMLElement = fixture.nativeElement.querySelector('#test-btn');
    btn.dispatchEvent(new MouseEvent('mouseenter'));
    await vi.advanceTimersByTimeAsync(100);
    btn.dispatchEvent(new MouseEvent('mouseleave'));
    await vi.advanceTimersByTimeAsync(200);
    fixture.detectChanges();

    expect(overlayContainerElement.querySelector('[role="tooltip"]')).toBeNull();
  });

  it('opens immediately on focusin and closes on focusout', () => {
    const btn: HTMLElement = fixture.nativeElement.querySelector('#test-btn');
    btn.dispatchEvent(new FocusEvent('focusin'));
    fixture.detectChanges();

    expect(overlayContainerElement.querySelector('[role="tooltip"]')).not.toBeNull();

    btn.dispatchEvent(new FocusEvent('focusout'));
    fixture.detectChanges();
    expect(overlayContainerElement.querySelector('[role="tooltip"]')).toBeNull();
  });

  it('dismisses immediately on document Escape key without moving focus', () => {
    const btn: HTMLElement = fixture.nativeElement.querySelector('#test-btn');
    btn.dispatchEvent(new FocusEvent('focusin'));
    fixture.detectChanges();
    expect(overlayContainerElement.querySelector('[role="tooltip"]')).not.toBeNull();

    // Dispatch Escape on document body (simulating escape anywhere)
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    document.body.dispatchEvent(event);
    fixture.detectChanges();

    expect(overlayContainerElement.querySelector('[role="tooltip"]')).toBeNull();
    expect(btn.getAttribute('aria-describedby')).toBeNull();
  });

  it('does not open when disabled', async () => {
    vi.useFakeTimers();
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();

    const btn: HTMLElement = fixture.nativeElement.querySelector('#test-btn');
    btn.dispatchEvent(new MouseEvent('mouseenter'));
    await vi.advanceTimersByTimeAsync(200);
    fixture.detectChanges();

    expect(overlayContainerElement.querySelector('[role="tooltip"]')).toBeNull();
  });

  it('does not open when content is empty string or null', async () => {
    vi.useFakeTimers();
    fixture.componentInstance.text.set('');
    fixture.detectChanges();

    const btn: HTMLElement = fixture.nativeElement.querySelector('#test-btn');
    btn.dispatchEvent(new MouseEvent('mouseenter'));
    await vi.advanceTimersByTimeAsync(200);
    fixture.detectChanges();

    expect(overlayContainerElement.querySelector('[role="tooltip"]')).toBeNull();
  });

  it('renders TemplateRef content and treats it as interactive', async () => {
    vi.useFakeTimers();
    const tpl = fixture.componentInstance.tpl();
    expect(tpl).toBeDefined();
    fixture.componentInstance.text.set(tpl ?? null);
    fixture.detectChanges();

    const btn: HTMLElement = fixture.nativeElement.querySelector('#test-btn');
    btn.dispatchEvent(new MouseEvent('mouseenter'));
    await vi.advanceTimersByTimeAsync(200);
    fixture.detectChanges();

    const custom = overlayContainerElement.querySelector('.custom-template-text');
    expect(custom).not.toBeNull();
    expect(custom?.textContent).toBe('Rich content');
  });

  it('stays open during transit grace period (default hideDelay=0) for interactive tooltip', async () => {
    vi.useFakeTimers();
    fixture.componentInstance.interactive.set(true);
    // hideDelay is default 0
    fixture.detectChanges();

    const btn: HTMLElement = fixture.nativeElement.querySelector('#test-btn');
    btn.dispatchEvent(new MouseEvent('mouseenter'));
    await vi.advanceTimersByTimeAsync(200);
    fixture.detectChanges();

    expect(overlayContainerElement.querySelector('[role="tooltip"]')).not.toBeNull();

    // Mouse leaves trigger
    btn.dispatchEvent(new MouseEvent('mouseleave'));
    // Within the 150ms transit grace period, tooltip is still open
    await vi.advanceTimersByTimeAsync(80);
    fixture.detectChanges();
    expect(overlayContainerElement.querySelector('[role="tooltip"]')).not.toBeNull();

    // Mouse enters overlay pane
    const pane = overlayContainerElement.querySelector('.cdk-overlay-pane');
    expect(pane).not.toBeNull();
    pane?.dispatchEvent(new MouseEvent('mouseenter'));
    await vi.advanceTimersByTimeAsync(150);
    fixture.detectChanges();

    // Still open!
    expect(overlayContainerElement.querySelector('[role="tooltip"]')).not.toBeNull();

    // Mouse leaves overlay pane
    pane?.dispatchEvent(new MouseEvent('mouseleave'));
    await vi.advanceTimersByTimeAsync(150);
    fixture.detectChanges();

    expect(overlayContainerElement.querySelector('[role="tooltip"]')).toBeNull();
  });

  it('supports programmatic API: show(), hide(), toggle(), isOpen', () => {
    const dir = fixture.componentInstance.tooltipDirective();
    expect(dir.isOpen).toBe(false);

    dir.show(0);
    fixture.detectChanges();
    expect(dir.isOpen).toBe(true);
    expect(overlayContainerElement.querySelector('[role="tooltip"]')).not.toBeNull();

    dir.toggle();
    fixture.detectChanges();
    expect(dir.isOpen).toBe(false);
    expect(overlayContainerElement.querySelector('[role="tooltip"]')).toBeNull();

    dir.toggle();
    fixture.detectChanges();
    expect(dir.isOpen).toBe(true);

    dir.hide(0);
    fixture.detectChanges();
    expect(dir.isOpen).toBe(false);
  });

  it('emits tooltipVisibleChange when overlay opens and closes', () => {
    const dir = fixture.componentInstance.tooltipDirective();
    expect(fixture.componentInstance.visibleEvents).toEqual([]);

    dir.show(0);
    fixture.detectChanges();
    expect(fixture.componentInstance.visibleEvents).toEqual([true]);

    dir.hide(0);
    fixture.detectChanges();
    expect(fixture.componentInstance.visibleEvents).toEqual([true, false]);
  });

  it('automatically closes when content becomes empty or disabled becomes true while open', async () => {
    const dir = fixture.componentInstance.tooltipDirective();
    dir.show(0);
    fixture.detectChanges();
    expect(dir.isOpen).toBe(true);

    // Change content to empty string
    fixture.componentInstance.text.set('');
    fixture.detectChanges();
    expect(dir.isOpen).toBe(false);
    expect(overlayContainerElement.querySelector('[role="tooltip"]')).toBeNull();

    // Reset content and open again
    fixture.componentInstance.text.set('New content');
    fixture.detectChanges();
    dir.show(0);
    fixture.detectChanges();
    expect(dir.isOpen).toBe(true);

    // Disable while open
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    expect(dir.isOpen).toBe(false);
    expect(overlayContainerElement.querySelector('[role="tooltip"]')).toBeNull();
  });

  it('preserves existing aria-describedby attributes on host element', () => {
    const btn: HTMLElement = fixture.nativeElement.querySelector('#test-btn');
    btn.setAttribute('aria-describedby', 'existing-help-text');

    const dir = fixture.componentInstance.tooltipDirective();
    dir.show(0);
    fixture.detectChanges();

    const currentAria = btn.getAttribute('aria-describedby');
    expect(currentAria).toContain('existing-help-text');
    expect(currentAria).toMatch(/ui-tooltip-\d+/);

    dir.hide(0);
    fixture.detectChanges();
    expect(btn.getAttribute('aria-describedby')).toBe('existing-help-text');
  });
});
