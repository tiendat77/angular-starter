import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
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

describe('SvgIconRegistry icon listing', () => {
  const SET = `<svg xmlns="http://www.w3.org/2000/svg"><defs>
    <svg id="home"><path d="M0 0" /></svg>
    <svg id="arrow"><defs><linearGradient id="grad" /></defs><path d="M1 1" /></svg>
  </defs></svg>`;
  const SET_2 = `<svg xmlns="http://www.w3.org/2000/svg"><symbol id="bell"><path d="M2 2" /></symbol>
    <svg id="home"><path d="M9 9" /></svg></svg>`;

  const setup = () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    return {
      registry: TestBed.inject(SvgIconRegistry),
      sanitizer: TestBed.inject(DomSanitizer),
      http: TestBed.inject(HttpTestingController),
    };
  };

  it('should list icons of a literal set, ignoring ids nested inside icons', () => {
    const { registry, sanitizer } = setup();
    registry.addSvgIconSetLiteralInNamespace('ns', sanitizer.bypassSecurityTrustHtml(SET));

    let names: string[] = [];
    registry.getIconNames('ns').subscribe((n) => (names = n));

    expect(names).toEqual(['arrow', 'home']);
  });

  it('should fetch URL sets once and merge sets, individual icons and duplicates', () => {
    const { registry, sanitizer, http } = setup();
    registry.addSvgIconSetInNamespace('ns', sanitizer.bypassSecurityTrustResourceUrl('a.svg'));
    registry.addSvgIconSetInNamespace('ns', sanitizer.bypassSecurityTrustResourceUrl('b.svg'));
    registry.addSvgIconLiteralInNamespace(
      'ns',
      'zap',
      sanitizer.bypassSecurityTrustHtml('<svg><path d="M3 3" /></svg>')
    );

    let names: string[] = [];
    registry.getIconNames('ns').subscribe((n) => (names = n));
    http.expectOne('a.svg').flush(SET);
    http.expectOne('b.svg').flush(SET_2);

    expect(names).toEqual(['arrow', 'bell', 'home', 'zap']);

    registry.getIconNames('ns').subscribe((n) => (names = n));
    http.expectNone('a.svg');
    expect(names).toEqual(['arrow', 'bell', 'home', 'zap']);
  });

  it('should skip a set that fails to load and report the error', () => {
    const { registry, sanitizer, http } = setup();
    registry.addSvgIconSetInNamespace('ns', sanitizer.bypassSecurityTrustResourceUrl('bad.svg'));
    registry.addSvgIconSetLiteralInNamespace('ns', sanitizer.bypassSecurityTrustHtml(SET));

    let names: string[] | undefined;
    registry.getIconNames('ns').subscribe((n) => (names = n));
    http.expectOne('bad.svg').flush('nope', { status: 404, statusText: 'Not Found' });

    expect(names).toEqual(['arrow', 'home']);
  });

  it('should return an empty list for an unknown namespace and list namespaces', () => {
    const { registry, sanitizer } = setup();
    registry.addSvgIconSetLiteralInNamespace('b', sanitizer.bypassSecurityTrustHtml(SET));
    registry.addSvgIconLiteralInNamespace(
      'a',
      'x',
      sanitizer.bypassSecurityTrustHtml('<svg><path d="M3 3" /></svg>')
    );

    let names: string[] | undefined;
    registry.getIconNames('missing').subscribe((n) => (names = n));

    expect(names).toEqual([]);
    expect(registry.getNamespaces()).toEqual(['a', 'b']);
  });
});
