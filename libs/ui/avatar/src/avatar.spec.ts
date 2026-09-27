import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiBadgeAnchorDirective } from '@libs/ui/badge';
import { UiSize } from '@libs/ui/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { UiAvatarGroupComponent } from './avatar-group.component';
import { UiAvatarComponent } from './avatar.component';
import { UiAvatarShape } from './avatar.types';

@Component({
  imports: [UiAvatarComponent, UiBadgeAnchorDirective],
  template: `
    <ui-avatar
      uiBadge
      uiBadgeDot
      uiBadgeColor="success"
      [src]="src()"
      [alt]="alt()"
      [name]="name()"
      [size]="size()"
      [shape]="shape()"
    />
  `,
})
class AvatarHostComponent {
  readonly src = signal<string | null>(null);
  readonly alt = signal<string | null>(null);
  readonly name = signal<string | null>('Nguyễn Văn An');
  readonly size = signal<UiSize | undefined>(undefined);
  readonly shape = signal<UiAvatarShape | undefined>(undefined);
}

@Component({
  imports: [UiAvatarComponent],
  template: `<ui-avatar><span class="team">T</span></ui-avatar>`,
})
class ContentHostComponent {}

@Component({
  imports: [UiAvatarComponent, UiAvatarGroupComponent],
  template: `
    <ui-avatar-group
      [max]="max()"
      size="sm"
    >
      @for (n of names; track n; let i = $index) {
        <ui-avatar
          [name]="n"
          [size]="i === 0 ? 'xl' : undefined"
        />
      }
    </ui-avatar-group>
  `,
})
class GroupHostComponent {
  readonly names = ['Linh Tran', 'An Nguyen', 'Bao Le', 'Chi Pham', 'Dung Vo'];
  readonly max = signal<number | null>(3);
}

describe('UiAvatarComponent', () => {
  let fixture: ComponentFixture<AvatarHostComponent>;
  let host: AvatarHostComponent;
  let el: HTMLElement;

  const img = () => el.querySelector<HTMLImageElement>('img.avatar-image');
  const initials = () => el.querySelector('.avatar-initials');
  const fire = (target: Element, type: 'load' | 'error') => {
    target.dispatchEvent(new Event(type));
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AvatarHostComponent] });
    fixture = TestBed.createComponent(AvatarHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    el = fixture.nativeElement.querySelector('ui-avatar');
  });

  it('shows initials and is a named image', () => {
    expect(initials()!.textContent!.trim()).toBe('NA');
    expect(el.getAttribute('role')).toBe('img');
    expect(el.getAttribute('aria-label')).toBe('Nguyễn Văn An');
    expect(el.classList).toContain('avatar');
    expect(el.classList).toContain('avatar-md');
  });

  it('falls back to the default icon and is decorative without a name', () => {
    host.name.set(null);
    fixture.detectChanges();
    expect(initials()).toBeNull();
    expect(el.querySelector('.avatar-icon')).not.toBeNull();
    expect(el.hasAttribute('role')).toBe(false);
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });

  it('keeps the fallback under the image until it loads', () => {
    host.src.set('/u/42.jpg');
    fixture.detectChanges();
    expect(img()).not.toBeNull();
    expect(img()!.getAttribute('alt')).toBe('');
    expect(initials()).not.toBeNull();

    fire(img()!, 'load');
    expect(initials()).toBeNull();
    expect(img()!.classList).toContain('avatar-image-loaded');
    expect(el.getAttribute('aria-label')).toBe('Nguyễn Văn An');
  });

  it('falls back to initials when the image fails, and retries when src changes', () => {
    host.src.set('/broken.jpg');
    fixture.detectChanges();
    fire(img()!, 'error');
    expect(img()).toBeNull();
    expect(initials()!.textContent!.trim()).toBe('NA');

    host.src.set('/u/43.jpg');
    fixture.detectChanges();
    expect(img()).not.toBeNull();
  });

  it('uses alt as the accessible name; alt="" makes it decorative', () => {
    host.alt.set('Profile photo');
    fixture.detectChanges();
    expect(el.getAttribute('aria-label')).toBe('Profile photo');

    host.alt.set('');
    fixture.detectChanges();
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(el.hasAttribute('aria-label')).toBe(false);
  });

  it('maps size and shape', () => {
    host.size.set('lg');
    host.shape.set('square');
    fixture.detectChanges();
    expect(el.classList).toContain('avatar-lg');
    expect(el.classList).toContain('avatar-square');
  });

  it('keeps a [uiBadge] dot through image loading', () => {
    expect(el.querySelectorAll('span.badge').length).toBe(1);
    host.src.set('/u/42.jpg');
    fixture.detectChanges();
    fire(img()!, 'load');
    expect(el.querySelectorAll('span.badge').length).toBe(1);
    expect(el.classList).toContain('badge-anchor');
  });
});

describe('UiAvatarComponent (projected fallback)', () => {
  it('renders projected content instead of the default icon', () => {
    TestBed.configureTestingModule({ imports: [ContentHostComponent] });
    const fixture = TestBed.createComponent(ContentHostComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement.querySelector('ui-avatar');
    expect(el.querySelector('.team')).not.toBeNull();
    expect(el.querySelector('.avatar-icon')).toBeNull();
  });
});

describe('UiAvatarGroupComponent', () => {
  let fixture: ComponentFixture<GroupHostComponent>;
  let host: GroupHostComponent;
  let group: HTMLElement;

  const avatars = () => Array.from(group.querySelectorAll<HTMLElement>('ui-avatar'));
  const more = () => group.querySelector<HTMLElement>('.avatar-more');

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [GroupHostComponent] });
    fixture = TestBed.createComponent(GroupHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    group = fixture.nativeElement.querySelector('ui-avatar-group');
  });

  it('hides avatars beyond max and shows +N', () => {
    expect(group.getAttribute('role')).toBe('group');
    expect(group.classList).toContain('avatar-group');
    expect(avatars().map((a) => a.hasAttribute('hidden'))).toEqual([
      false,
      false,
      false,
      true,
      true,
    ]);
    expect(more()!.textContent!.trim()).toBe('+2');
    expect(more()!.getAttribute('aria-label')).toBe('2 more');
  });

  it('shows everyone without max', () => {
    host.max.set(null);
    fixture.detectChanges();
    expect(avatars().every((a) => !a.hasAttribute('hidden'))).toBe(true);
    expect(more()).toBeNull();
  });

  it('applies the group size unless an avatar sets its own', () => {
    expect(avatars()[0].classList).toContain('avatar-xl');
    expect(avatars()[1].classList).toContain('avatar-sm');
    expect(more()!.classList).toContain('avatar-sm');
  });
});
