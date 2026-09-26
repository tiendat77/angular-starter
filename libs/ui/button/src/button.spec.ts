import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
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
