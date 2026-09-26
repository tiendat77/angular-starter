import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { UiButtonDirective } from './button.directive';

@Component({
  standalone: true,
  imports: [UiButtonDirective],
  template: `
    <button
      uiButton
      [variant]="variant()"
      [size]="size()"
      [loading]="loading()"
      [disabled]="disabled()"
    >
      Click me
    </button>
  `,
})
class TestHostComponent {
  readonly variant = signal<'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'>('primary');
  readonly size = signal<'sm' | 'md' | 'lg' | 'icon'>('md');
  readonly loading = signal(false);
  readonly disabled = signal(false);
}

describe('UiButtonDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let buttonEl: HTMLButtonElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestHostComponent] });
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    buttonEl = fixture.nativeElement.querySelector('button');
  });

  it('should apply primary variant and md size classes', () => {
    expect(buttonEl.className).toContain('bg-primary');
    expect(buttonEl.className).toContain('h-10');
  });

  it('should reflect loading state and aria-busy', () => {
    fixture.componentInstance.loading.set(true);
    fixture.detectChanges();
    expect(buttonEl.getAttribute('aria-busy')).toBe('true');
  });

  it('should disable button when disabled signal is true', () => {
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    expect(buttonEl.disabled).toBe(true);
    expect(buttonEl.getAttribute('aria-disabled')).toBe('true');
  });
});

// `<a>` has no native `disabled` DOM property/attribute, so a disabled
// `a[uiButton]` relies entirely on `aria-disabled` (for the visual/AT-facing
// signal) and on the directive's own click interception (for actually
// blocking navigation) — this is the harder case called out in the plan's
// review focus, and is exercised separately from the `<button>` case above.
@Component({
  standalone: true,
  imports: [UiButtonDirective],
  template: `
    <a
      uiButton
      href="https://example.com"
      [disabled]="disabled()"
      >Link</a
    >
  `,
})
class AnchorTestHostComponent {
  readonly disabled = signal(true);
}

describe('UiButtonDirective (anchor)', () => {
  let fixture: ComponentFixture<AnchorTestHostComponent>;
  let anchorEl: HTMLAnchorElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AnchorTestHostComponent] });
    fixture = TestBed.createComponent(AnchorTestHostComponent);
    fixture.detectChanges();
    anchorEl = fixture.nativeElement.querySelector('a');
  });

  it('should mark a disabled anchor as aria-disabled and intercept clicks', () => {
    expect(anchorEl.getAttribute('aria-disabled')).toBe('true');
    // No native `disabled` property/attribute exists on <a> — confirm we
    // didn't (incorrectly) try to set one.
    expect(anchorEl.hasAttribute('disabled')).toBe(false);

    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');
    anchorEl.dispatchEvent(clickEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(clickEvent.defaultPrevented).toBe(true);
  });

  it('should allow clicks through when not disabled', () => {
    fixture.componentInstance.disabled.set(false);
    fixture.detectChanges();

    expect(anchorEl.getAttribute('aria-disabled')).toBeNull();

    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    anchorEl.dispatchEvent(clickEvent);

    expect(clickEvent.defaultPrevented).toBe(false);
  });
});
