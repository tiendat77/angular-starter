import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiButtonComponent } from '@libs/ui/button';
import { UiColor } from '@libs/ui/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { UiBadgeAnchorDirective } from './badge-anchor.directive';
import { UiBadgeComponent } from './badge.component';
import { UiBadgePosition, UiBadgeSize } from './badge.types';

@Component({
  imports: [UiBadgeComponent],
  template: `
    <ui-badge
      [count]="count()"
      [max]="max()"
      [showZero]="showZero()"
      [dot]="dot()"
      [color]="color()"
      [size]="size()"
    />
  `,
})
class InlineHostComponent {
  readonly count = signal<number | string | null>(5);
  readonly max = signal(99);
  readonly showZero = signal(false);
  readonly dot = signal(false);
  readonly color = signal<UiColor>('error');
  readonly size = signal<UiBadgeSize>('md');
}

@Component({
  imports: [UiButtonComponent, UiBadgeAnchorDirective],
  template: `
    @if (show()) {
      <button
        uiButton
        variant="ghost"
        [uiBadge]="count()"
        [uiBadgeDot]="dot()"
        [uiBadgeHidden]="hidden()"
        [uiBadgePosition]="position()"
        [uiBadgeDescription]="description()"
        uiBadgeOverlap="circular"
      >
        Inbox
      </button>
    }
  `,
})
class AnchorHostComponent {
  readonly show = signal(true);
  readonly count = signal<number | null>(3);
  readonly dot = signal(false);
  readonly hidden = signal(false);
  readonly position = signal<UiBadgePosition>('top-end');
  readonly description = signal('3 unread');
}

@Component({
  imports: [UiBadgeAnchorDirective],
  template: `<img
    alt=""
    uiBadge
    uiBadgeDot
  />`,
})
class ImgHostComponent {}

describe('UiBadgeComponent (inline)', () => {
  let fixture: ComponentFixture<InlineHostComponent>;
  let host: InlineHostComponent;
  let el: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [InlineHostComponent] });
    fixture = TestBed.createComponent(InlineHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    el = fixture.nativeElement.querySelector('ui-badge');
  });

  it('shows the count with default classes', () => {
    expect(el.textContent!.trim()).toBe('5');
    for (const c of ['badge', 'badge-error', 'badge-md']) expect(el.classList).toContain(c);
    expect(el.hasAttribute('hidden')).toBe(false);
  });

  it('caps at max', () => {
    host.count.set(120);
    fixture.detectChanges();
    expect(el.textContent!.trim()).toBe('99+');

    host.max.set(9);
    host.count.set(10);
    fixture.detectChanges();
    expect(el.textContent!.trim()).toBe('9+');
  });

  it('hides when there is nothing to show', () => {
    host.count.set(0);
    fixture.detectChanges();
    expect(el.hasAttribute('hidden')).toBe(true);

    host.showZero.set(true);
    fixture.detectChanges();
    expect(el.hasAttribute('hidden')).toBe(false);
    expect(el.textContent!.trim()).toBe('0');

    host.count.set(null);
    fixture.detectChanges();
    expect(el.hasAttribute('hidden')).toBe(true);
  });

  it('renders an empty visible dot', () => {
    host.count.set(null);
    host.dot.set(true);
    fixture.detectChanges();
    expect(el.hasAttribute('hidden')).toBe(false);
    expect(el.textContent!.trim()).toBe('');
    expect(el.classList).toContain('badge-dot');
  });

  it('maps color and size', () => {
    host.color.set('success');
    host.size.set('sm');
    fixture.detectChanges();
    expect(el.classList).toContain('badge-success');
    expect(el.classList).toContain('badge-sm');
  });
});

describe('UiBadgeAnchorDirective', () => {
  let fixture: ComponentFixture<AnchorHostComponent>;
  let host: AnchorHostComponent;

  const button = () => fixture.nativeElement.querySelector('button') as HTMLButtonElement;
  const badges = () => button().querySelectorAll<HTMLElement>('span.badge');
  const describedText = () => {
    const id = button().getAttribute('aria-describedby');
    return id ? document.getElementById(id)?.textContent : null;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AnchorHostComponent] });
    fixture = TestBed.createComponent(AnchorHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('appends exactly one decorative badge to the host and keeps the host classes', () => {
    expect(badges().length).toBe(1);
    const badge = badges()[0];
    expect(badge.textContent).toBe('3');
    expect(badge.getAttribute('aria-hidden')).toBe('true');
    for (const c of ['badge-overlay', 'badge-top-end', 'badge-circular', 'badge-error']) {
      expect(badge.classList).toContain(c);
    }
    // uiButton's own [class] binding must not wipe badge-anchor
    expect(button().classList).toContain('badge-anchor');
    expect(button().classList).toContain('btn');
  });

  it('updates the badge in place', () => {
    host.count.set(120);
    host.position.set('bottom-start');
    fixture.detectChanges();
    expect(badges().length).toBe(1);
    expect(badges()[0].textContent).toBe('99+');
    expect(badges()[0].classList).toContain('badge-bottom-start');
    expect(badges()[0].classList).not.toContain('badge-top-end');
    expect(button().classList).toContain('badge-anchor');
  });

  it('hides for 0, null and uiBadgeHidden; a dot shows without a count', () => {
    host.count.set(0);
    fixture.detectChanges();
    expect(badges()[0].hidden).toBe(true);

    host.dot.set(true);
    fixture.detectChanges();
    expect(badges()[0].hidden).toBe(false);
    expect(badges()[0].classList).toContain('badge-dot');

    host.hidden.set(true);
    fixture.detectChanges();
    expect(badges()[0].hidden).toBe(true);
  });

  it('describes the host while visible and follows description changes', () => {
    expect(describedText()).toBe('3 unread');

    host.description.set('4 unread');
    fixture.detectChanges();
    expect(describedText()).toBe('4 unread');
  });

  it('drops the description when the badge hides', () => {
    host.count.set(0);
    fixture.detectChanges();
    expect(button().hasAttribute('aria-describedby')).toBe(false);
  });

  it('cleans up the description when destroyed', () => {
    const id = button().getAttribute('aria-describedby')!;
    expect(document.getElementById(id)).not.toBeNull();

    host.show.set(false);
    fixture.detectChanges();
    expect(document.getElementById(id)).toBeNull();
  });
});

describe('UiBadgeAnchorDirective (void host)', () => {
  it('throws on elements that cannot have children', () => {
    TestBed.configureTestingModule({ imports: [ImgHostComponent] });
    expect(() => {
      const fixture = TestBed.createComponent(ImgHostComponent);
      fixture.detectChanges();
    }).toThrowError(/uiBadge.*IMG/);
  });
});
