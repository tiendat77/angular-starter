import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PageEvent, Paginator } from './public-api';

@Component({
  imports: [Paginator],
  template: `
    <paginator
      [length]="length()"
      [pageIndex]="pageIndex()"
      [pageSize]="10"
      (page)="onPage($event)"
    />
  `,
})
class PaginatorHostComponent {
  readonly length = signal(95);
  readonly pageIndex = signal(1);
  readonly events: PageEvent[] = [];

  onPage(event: PageEvent): void {
    this.events.push(event);
    this.pageIndex.set(event.pageIndex);
  }
}

describe('Paginator', () => {
  let fixture: ComponentFixture<PaginatorHostComponent>;
  let host: PaginatorHostComponent;

  const pageButtons = (): HTMLButtonElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('paginator .join-item')).filter((b) =>
      /^\d+$/.test((b as HTMLElement).textContent!.trim())
    ) as HTMLButtonElement[];

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
});
