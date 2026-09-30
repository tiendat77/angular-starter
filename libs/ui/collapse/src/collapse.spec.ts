import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  UiCollapse,
  UiCollapseContentDirective,
  UiCollapseExtraDirective,
  UiCollapsePanel,
} from './public-api';

@Component({
  standalone: true,
  imports: [UiCollapse, UiCollapsePanel, UiCollapseExtraDirective, UiCollapseContentDirective],
  template: `
    <ui-collapse
      [accordion]="accordion()"
      [disabled]="disabled()"
      [(activeIds)]="activeIds"
    >
      <ui-collapse-panel
        [id]="'p1'"
        header="Panel 1"
        [(expanded)]="panel1Open"
      >
        <button
          *uiCollapseExtra
          type="button"
          class="btn-extra"
          (click)="onExtraClick()"
        >
          Extra Action
        </button>
        Content 1
      </ui-collapse-panel>
      <ui-collapse-panel
        [id]="'p2'"
        header="Panel 2"
        [(expanded)]="panel2Open"
      >
        <div
          *uiCollapseContent
          class="lazy-element"
        >
          Lazy Content 2
        </div>
      </ui-collapse-panel>
    </ui-collapse>
  `,
})
class TestHostComponent {
  readonly accordion = signal(false);
  readonly disabled = signal(false);
  readonly activeIds = signal<any>(null);
  readonly panel1Open = signal(false);
  readonly panel2Open = signal(false);
  extraClicked = false;

  onExtraClick() {
    this.extraClicked = true;
  }
}

describe('UiCollapse & UiCollapsePanel', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestHostComponent] });
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render panels collapsed by default', () => {
    const triggers = fixture.nativeElement.querySelectorAll('button[ngAccordionTrigger]');
    expect(triggers.length).toBe(2);
    expect(triggers[0].getAttribute('aria-expanded')).toBe('false');
  });

  it('should toggle panel expansion when clicked', () => {
    const trigger = fixture.nativeElement.querySelector(
      'button[ngAccordionTrigger]'
    ) as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();

    expect(host.panel1Open()).toBe(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('should enforce accordion mutual exclusivity when accordion is true', () => {
    host.accordion.set(true);
    fixture.detectChanges();

    const triggers = fixture.nativeElement.querySelectorAll('button[ngAccordionTrigger]');
    triggers[0].click();
    fixture.detectChanges();
    expect(host.panel1Open()).toBe(true);
    expect(host.panel2Open()).toBe(false);

    triggers[1].click();
    fixture.detectChanges();
    expect(host.panel1Open()).toBe(false);
    expect(host.panel2Open()).toBe(true);
  });

  it('should sync container activeIds two-way model on click', () => {
    const triggers = fixture.nativeElement.querySelectorAll('button[ngAccordionTrigger]');
    triggers[0].click();
    fixture.detectChanges();

    expect(host.activeIds()).toEqual(['p1']);

    triggers[1].click();
    fixture.detectChanges();

    expect(host.activeIds()).toEqual(['p1', 'p2']);
  });

  it('should sync panels when activeIds is updated programmatically', () => {
    host.activeIds.set(['p2']);
    fixture.detectChanges();

    expect(host.panel1Open()).toBe(false);
    expect(host.panel2Open()).toBe(true);
  });

  it('should isolate extra action clicks and not toggle panel', () => {
    const extraBtn = fixture.nativeElement.querySelector('.btn-extra') as HTMLButtonElement;
    expect(extraBtn).toBeTruthy();
    extraBtn.click();
    fixture.detectChanges();

    expect(host.extraClicked).toBe(true);
    expect(host.panel1Open()).toBe(false);
  });

  it('should apply role="region" and aria-labelledby on content panel', () => {
    const panel = fixture.nativeElement.querySelector('div[ngAccordionPanel]') as HTMLElement;
    expect(panel.getAttribute('role')).toBe('region');
    expect(panel.getAttribute('aria-labelledby')).toBeTruthy();
  });

  it('should navigate between triggers with arrow keys', () => {
    const triggers = fixture.nativeElement.querySelectorAll(
      'button[ngAccordionTrigger]'
    ) as NodeListOf<HTMLButtonElement>;
    triggers[0].focus();
    expect(document.activeElement).toBe(triggers[0]);

    triggers[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();

    expect(document.activeElement).toBe(triggers[1]);
  });

  it('should defer rendering when *uiCollapseContent is used until expanded', () => {
    // Check that lazy element is not in DOM initially
    expect(fixture.nativeElement.querySelector('.lazy-element')).toBeNull();

    // Expand panel 2
    const triggers = fixture.nativeElement.querySelectorAll(
      'button[ngAccordionTrigger]'
    ) as NodeListOf<HTMLButtonElement>;
    triggers[1].click();
    fixture.detectChanges();

    // Expect lazy element to be present in DOM
    expect(fixture.nativeElement.querySelector('.lazy-element')).not.toBeNull();
  });

  it('should disable all triggers when container disabled is true', () => {
    host.disabled.set(true);
    fixture.detectChanges();

    const triggers = fixture.nativeElement.querySelectorAll(
      'button[ngAccordionTrigger]'
    ) as NodeListOf<HTMLButtonElement>;
    expect(triggers[0].getAttribute('aria-disabled')).toBe('true');
    expect(triggers[1].getAttribute('aria-disabled')).toBe('true');

    triggers[0].click();
    fixture.detectChanges();
    expect(host.panel1Open()).toBe(false);
  });

  describe('collapsing', () => {
    const click = (i: number) => {
      const triggers = fixture.nativeElement.querySelectorAll('button[ngAccordionTrigger]');
      triggers[i].click();
      fixture.detectChanges();
    };

    it('should collapse an expanded panel when clicked again', () => {
      click(0);
      expect(host.panel1Open()).toBe(true);
      click(0);
      expect(host.panel1Open()).toBe(false);
      expect(host.activeIds()).toEqual([]);
      expect(
        fixture.nativeElement
          .querySelector('button[ngAccordionTrigger]')
          .getAttribute('aria-expanded')
      ).toBe('false');
    });

    it('should collapse one panel and keep the other open', () => {
      click(0);
      click(1);
      click(0);
      expect(host.activeIds()).toEqual(['p2']);
      expect(host.panel1Open()).toBe(false);
      expect(host.panel2Open()).toBe(true);
    });

    it('should collapse in accordion mode', () => {
      host.accordion.set(true);
      fixture.detectChanges();
      click(0);
      expect(host.panel1Open()).toBe(true);
      click(0);
      expect(host.panel1Open()).toBe(false);
    });

    it('should collapse when activeIds is cleared programmatically', () => {
      click(0);
      host.activeIds.set([]);
      fixture.detectChanges();
      expect(host.panel1Open()).toBe(false);
    });
  });
});
