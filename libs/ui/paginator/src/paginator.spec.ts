import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { PageEvent, Paginator } from './public-api';

@Component({
  imports: [Paginator],
  template: `
    <paginator
      [length]="length()"
      [pageIndex]="pageIndex()"
      [pageSize]="pageSize()"
      [pageSizeLabel]="pageSizeLabel()"
      [disabled]="disabled()"
      (page)="onPage($event)"
    />
  `,
})
class PaginatorHostComponent {
  readonly length = signal(95);
  readonly pageIndex = signal(1);
  readonly pageSize = signal(10);
  readonly pageSizeLabel = signal('Page size:');
  readonly disabled = signal(false);
  readonly events: PageEvent[] = [];

  onPage(event: PageEvent): void {
    this.events.push(event);
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }
}

describe('Paginator', () => {
  let fixture: ComponentFixture<PaginatorHostComponent>;
  let host: PaginatorHostComponent;

  const pageButtons = (): HTMLButtonElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('paginator .join-item')).filter((b) =>
      /^\d+$/.test((b as HTMLElement).textContent!.trim())
    ) as HTMLButtonElement[];

  const allPageItems = (): HTMLElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('paginator .join-item')) as HTMLElement[];

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [PaginatorHostComponent] });
    fixture = TestBed.createComponent(PaginatorHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should highlight the current page and disable previous on the first page', () => {
    const current = pageButtons().find((b) => b.classList.contains('btn-primary'));
    expect(current?.textContent?.trim()).toBe('1');

    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('paginator .join-item')
    );
    expect(buttons[0].disabled).toBe(true);
  });

  it('should emit a page event when a page is selected', () => {
    pageButtons()
      .find((b) => b.textContent?.trim() === '3')!
      .click();
    fixture.detectChanges();

    expect(host.events.at(-1)).toMatchObject({
      pageIndex: 3,
      previousPageIndex: 1,
      pageSize: 10,
      length: 95,
    });
    expect(
      pageButtons()
        .find((b) => b.classList.contains('btn-primary'))
        ?.textContent?.trim()
    ).toBe('3');
  });

  it('should hide itself when there is nothing to page', () => {
    host.length.set(0);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('paginator').classList).toContain('hidden');
  });

  it('should not use btn-circle and should follow design system shape', () => {
    const circularButtons = fixture.nativeElement.querySelectorAll('paginator .btn-circle');
    expect(circularButtons.length).toBe(0);
  });

  it('should support custom pageSizeLabel for i18n', () => {
    host.pageSizeLabel.set('Kích thước trang:');
    fixture.detectChanges();

    const labelEl = fixture.nativeElement.querySelector('paginator .label');
    expect(labelEl?.textContent?.trim()).toContain('Kích thước trang:');
  });

  it('should render smart ellipsis when total pages > 7', () => {
    // 90 pages
    host.length.set(900);
    host.pageSize.set(10);
    host.pageIndex.set(1);
    fixture.detectChanges();

    // Start pages: [1, 2, 3, 4, 5, '...', 90]
    const itemTextsStart = allPageItems()
      .map((el) => el.textContent?.trim())
      .filter((t) => t && (t === '...' || /^\d+$/.test(t)));
    expect(itemTextsStart).toEqual(['1', '2', '3', '4', '5', '...', '90']);

    // Middle pages: [1, '...', 5, 6, 7, 8, 9, '...', 90]
    host.pageIndex.set(7);
    fixture.detectChanges();

    const itemTextsMiddle = allPageItems()
      .map((el) => el.textContent?.trim())
      .filter((t) => t && (t === '...' || /^\d+$/.test(t)));
    expect(itemTextsMiddle).toEqual(['1', '...', '5', '6', '7', '8', '9', '...', '90']);

    // End pages: [1, '...', 86, 87, 88, 89, 90]
    host.pageIndex.set(90);
    fixture.detectChanges();

    const itemTextsEnd = allPageItems()
      .map((el) => el.textContent?.trim())
      .filter((t) => t && (t === '...' || /^\d+$/.test(t)));
    expect(itemTextsEnd).toEqual(['1', '...', '86', '87', '88', '89', '90']);
  });

  it('should use overlay panel instead of native select for page size', () => {
    const nativeSelect = fixture.nativeElement.querySelector('paginator select');
    expect(nativeSelect).toBeNull();

    const trigger = fixture.nativeElement.querySelector('.paginator-page-size-trigger');
    expect(trigger).not.toBeNull();
    expect(trigger.textContent.trim()).toContain('10');

    // Click trigger to open overlay
    trigger.click();
    fixture.detectChanges();

    const overlayPanel = document.querySelector('.paginator-page-size-panel');
    expect(overlayPanel).not.toBeNull();

    // Select option 25
    const option25 = Array.from(document.querySelectorAll('.paginator-page-size-option')).find(
      (el) => el.textContent?.trim() === '25'
    ) as HTMLElement;
    expect(option25).toBeDefined();

    option25.click();
    fixture.detectChanges();

    expect(host.pageSize()).toBe(25);
    expect(host.pageIndex()).toBe(1);
    expect(document.querySelector('.paginator-page-size-panel')).toBeNull();
  });

  describe('when disabled', () => {
    beforeEach(() => {
      host.disabled.set(true);
      fixture.detectChanges();
    });

    it('disables every button, including the page numbers', () => {
      const buttons = Array.from(
        fixture.nativeElement.querySelectorAll('paginator button')
      ) as HTMLButtonElement[];
      expect(buttons.length).toBeGreaterThan(0);
      expect(buttons.every((b) => b.disabled)).toBe(true);
    });

    it('does not change the page from a page number or the paginator API', () => {
      pageButtons()
        .find((b) => b.textContent?.trim() === '3')!
        .click();
      const paginator = fixture.debugElement.children[0].componentInstance as Paginator;
      paginator.nextPage();
      paginator.lastPage();
      paginator.selectPage(4);
      paginator._changePageSize(25);
      fixture.detectChanges();

      expect(host.events).toHaveLength(0);
      expect(host.pageIndex()).toBe(1);
      expect(host.pageSize()).toBe(10);
    });
  });
});
