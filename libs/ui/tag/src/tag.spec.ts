import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiColor } from '@libs/ui/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { UiTagIconDirective } from './tag-icon.directive';
import { UiTagComponent } from './tag.component';
import { UiTagAppearance, UiTagSize } from './tag.types';

@Component({
  imports: [UiTagComponent, UiTagIconDirective],
  template: `
    <div class="row">
      <ui-tag
        [color]="color()"
        [appearance]="appearance()"
        [size]="size()"
        [removable]="removable()"
        [removeLabel]="removeLabel()"
        [checkable]="checkable()"
        [disabled]="disabled()"
        [(checked)]="checked"
        (removed)="removedCount = removedCount + 1"
      >
        <svg uiTagIcon></svg>
        Draft
      </ui-tag>
    </div>
  `,
})
class TagHostComponent {
  readonly color = signal<UiColor>('neutral');
  readonly appearance = signal<UiTagAppearance>('soft');
  readonly size = signal<UiTagSize>('md');
  readonly removable = signal(false);
  readonly removeLabel = signal('Remove');
  readonly checkable = signal(false);
  readonly disabled = signal(false);
  readonly checked = signal(false);
  removedCount = 0;
}

@Component({
  imports: [UiTagComponent],
  template: `<ui-tag
    removable
    checkable
    >Bad</ui-tag
  >`,
})
class InvalidTagHostComponent {}

/** Accessible name computed from aria-labelledby, like a screen reader would. */
function nameFromLabelledBy(root: HTMLElement, el: Element): string {
  return el
    .getAttribute('aria-labelledby')!
    .split(' ')
    .map((id) => root.querySelector(`#${id}`)!.textContent!.trim())
    .join(' ');
}

describe('UiTagComponent', () => {
  let fixture: ComponentFixture<TagHostComponent>;
  let host: TagHostComponent;
  let root: HTMLElement;
  let el: HTMLElement;

  const removeButton = () => el.querySelector<HTMLButtonElement>('.tag-remove');
  const key = (target: Element, k: string) => {
    const event = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    fixture.detectChanges();
    return event;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TagHostComponent] });
    fixture = TestBed.createComponent(TagHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    root = fixture.nativeElement;
    el = root.querySelector('ui-tag')!;
  });

  it('renders a plain neutral md tag by default', () => {
    for (const c of ['tag', 'tag-neutral', 'tag-md']) expect(el.classList).toContain(c);
    expect(el.classList).not.toContain('tag-outline');
    expect(el.classList).not.toContain('tag-solid');
    expect(el.hasAttribute('role')).toBe(false);
    expect(el.hasAttribute('tabindex')).toBe(false);
    expect(removeButton()).toBeNull();
  });

  it('maps color, appearance and size to classes', () => {
    host.color.set('success');
    host.appearance.set('outline');
    host.size.set('lg');
    fixture.detectChanges();
    for (const c of ['tag-success', 'tag-outline', 'tag-lg']) expect(el.classList).toContain(c);
  });

  it('puts the icon slot first, with its class', () => {
    const icon = el.querySelector('[uiTagIcon]')!;
    expect(icon.classList).toContain('tag-icon');
    expect(el.firstElementChild).toBe(icon);
    expect(el.querySelector('.tag-label')!.textContent!.trim()).toBe('Draft');
  });

  it('removable: the × is named "Remove <label>" and emits removed', () => {
    host.removable.set(true);
    fixture.detectChanges();
    expect(nameFromLabelledBy(root, removeButton()!)).toBe('Remove Draft');

    removeButton()!.click();
    expect(host.removedCount).toBe(1);

    key(removeButton()!, 'Delete');
    key(removeButton()!, 'Backspace');
    expect(host.removedCount).toBe(3);

    host.removeLabel.set('Delete');
    fixture.detectChanges();
    expect(nameFromLabelledBy(root, removeButton()!)).toBe('Delete Draft');
  });

  it('removing does not click the surrounding row', () => {
    // Listener added in code, not the template, so the spec doesn't need a clickable <div>
    let rowClicks = 0;
    root.querySelector('.row')!.addEventListener('click', () => rowClicks++);
    host.removable.set(true);
    fixture.detectChanges();
    removeButton()!.click();
    expect(host.removedCount).toBe(1);
    expect(rowClicks).toBe(0);
  });

  it('disabled blocks remove', () => {
    host.removable.set(true);
    host.disabled.set(true);
    fixture.detectChanges();
    expect(removeButton()!.disabled).toBe(true);
    expect(el.getAttribute('aria-disabled')).toBe('true');
    expect(el.classList).toContain('tag-disabled');
    removeButton()!.click();
    expect(host.removedCount).toBe(0);
  });

  it('checkable: toggles on click, Enter and Space with aria-pressed', () => {
    host.checkable.set(true);
    fixture.detectChanges();
    expect(el.getAttribute('role')).toBe('button');
    expect(el.getAttribute('tabindex')).toBe('0');
    expect(el.getAttribute('aria-pressed')).toBe('false');
    expect(el.classList).toContain('tag-checkable');
    expect(el.classList).toContain('tag-outline');

    el.click();
    fixture.detectChanges();
    expect(host.checked()).toBe(true);
    expect(el.getAttribute('aria-pressed')).toBe('true');
    expect(el.classList).toContain('tag-solid');

    key(el, 'Enter');
    expect(host.checked()).toBe(false);

    const space = key(el, ' ');
    expect(host.checked()).toBe(true);
    expect(space.defaultPrevented).toBe(true);
  });

  it('disabled checkable is not focusable and does not toggle', () => {
    host.checkable.set(true);
    host.disabled.set(true);
    fixture.detectChanges();
    expect(el.getAttribute('tabindex')).toBe('-1');
    el.click();
    fixture.detectChanges();
    expect(host.checked()).toBe(false);
  });
});

describe('UiTagComponent (invalid)', () => {
  it('throws when removable and checkable are combined', () => {
    TestBed.configureTestingModule({ imports: [InvalidTagHostComponent] });
    expect(() => {
      const fixture = TestBed.createComponent(InvalidTagHostComponent);
      fixture.detectChanges();
    }).toThrowError(/removable.*checkable/);
  });
});
