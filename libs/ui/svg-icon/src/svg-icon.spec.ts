import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { describe, expect, it, vi } from 'vitest';
import { ICON_NAMESPACES, IconsService, SvgIcon, SvgIconRegistry } from './public-api';

const CHECK_SVG = '<svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7" /></svg>';
const X_SVG = '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6" /></svg>';

@Component({
  imports: [SvgIcon],
  template: `<svg-icon [name]="name()" />`,
})
class IconHostComponent {
  readonly name = signal('test:check');
}

describe('SvgIcon', () => {
  let fixture: ComponentFixture<IconHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [IconHostComponent] });
    const registry = TestBed.inject(SvgIconRegistry);
    const sanitizer = TestBed.inject(DomSanitizer);
    registry.addSvgIconLiteralInNamespace(
      'test',
      'check',
      sanitizer.bypassSecurityTrustHtml(CHECK_SVG)
    );
    registry.addSvgIconLiteralInNamespace('test', 'x', sanitizer.bypassSecurityTrustHtml(X_SVG));

    fixture = TestBed.createComponent(IconHostComponent);
    fixture.detectChanges();
  });

  it('should render the registered SVG inline with icon metadata', () => {
    const iconEl: HTMLElement = fixture.nativeElement.querySelector('svg-icon');
    expect(iconEl.getAttribute('role')).toBe('img');
    expect(iconEl.classList).toContain('svg-icon');
    expect(iconEl.getAttribute('data-svg-icon-namespace')).toBe('test');
    expect(iconEl.getAttribute('data-svg-icon-name')).toBe('check');
    expect(iconEl.querySelector('svg path')?.getAttribute('d')).toBe('M5 12l5 5L20 7');
  });

  it('should swap the SVG when the name changes', () => {
    fixture.componentInstance.name.set('test:x');
    fixture.detectChanges();

    const iconEl: HTMLElement = fixture.nativeElement.querySelector('svg-icon');
    expect(iconEl.querySelectorAll('svg').length).toBe(1);
    expect(iconEl.querySelector('svg path')?.getAttribute('d')).toBe('M6 6l12 12M6 18L18 6');
  });
});

describe('IconsService', () => {
  it('should register every configured namespace as an icon set', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ICON_NAMESPACES,
          useValue: [
            { name: 'outline', url: 'icons/outline.svg' },
            { name: 'solid', url: 'icons/solid.svg' },
          ],
        },
      ],
    });
    const registry = TestBed.inject(SvgIconRegistry);
    const addSet = vi.spyOn(registry, 'addSvgIconSetInNamespace');

    TestBed.inject(IconsService);

    expect(addSet).toHaveBeenCalledTimes(2);
    expect(addSet.mock.calls.map(([namespace]) => namespace)).toEqual(['outline', 'solid']);
  });
});
