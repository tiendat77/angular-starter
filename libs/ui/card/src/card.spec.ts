import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  UiCardActionDirective,
  UiCardContentDirective,
  UiCardDescriptionDirective,
  UiCardFooterDirective,
  UiCardHeaderDirective,
  UiCardMediaDirective,
  UiCardTitleDirective,
} from './card-parts.directive';
import { UiCardComponent } from './card.component';
import { UiCardAppearance, UiCardPadding } from './card.types';

@Component({
  imports: [
    UiCardComponent,
    UiCardHeaderDirective,
    UiCardTitleDirective,
    UiCardDescriptionDirective,
    UiCardActionDirective,
    UiCardContentDirective,
    UiCardFooterDirective,
    UiCardMediaDirective,
  ],
  template: `
    <ui-card
      id="card"
      [appearance]="appearance()"
      [padding]="padding()"
      [interactive]="interactive()"
    >
      <img
        uiCardMedia
        alt=""
        src="data:,"
      />
      <div uiCardHeader>
        <h3 uiCardTitle>Title</h3>
        <p uiCardDescription>Description</p>
        <button
          uiCardAction
          type="button"
        >
          More
        </button>
      </div>
      <div uiCardContent>Content</div>
      <div uiCardFooter>Footer</div>
    </ui-card>
    <a
      uiCard
      id="link"
      href="/x"
      >Link</a
    >
    <button
      uiCard
      id="btn"
      type="button"
    >
      Button
    </button>
    <article
      uiCard
      id="article"
    >
      Plain
    </article>
  `,
})
class CardHostComponent {
  readonly appearance = signal<UiCardAppearance>('outline');
  readonly padding = signal<UiCardPadding>('md');
  readonly interactive = signal(false);
}

describe('UiCardComponent', () => {
  let fixture: ComponentFixture<CardHostComponent>;
  let host: CardHostComponent;
  let root: HTMLElement;

  const byId = (id: string) => root.querySelector<HTMLElement>(`#${id}`)!;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CardHostComponent] });
    fixture = TestBed.createComponent(CardHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    root = fixture.nativeElement;
  });

  it('applies default classes', () => {
    const card = byId('card');
    for (const c of ['card', 'card-outline', 'card-p-md']) expect(card.classList).toContain(c);
    expect(card.classList).not.toContain('card-interactive');
  });

  it('maps appearance, padding and interactive', () => {
    host.appearance.set('elevated');
    host.padding.set('lg');
    host.interactive.set(true);
    fixture.detectChanges();
    const card = byId('card');
    for (const c of ['card-elevated', 'card-p-lg', 'card-interactive']) {
      expect(card.classList).toContain(c);
    }
  });

  it('is interactive automatically on links and buttons only', () => {
    expect(byId('link').classList).toContain('card-interactive');
    expect(byId('btn').classList).toContain('card-interactive');
    expect(byId('article').classList).toContain('card');
    expect(byId('article').classList).not.toContain('card-interactive');
  });

  it('gives each part its class', () => {
    const card = byId('card');
    const expectations: [string, string][] = [
      ['[uiCardMedia]', 'card-media'],
      ['[uiCardHeader]', 'card-header'],
      ['[uiCardTitle]', 'card-title'],
      ['[uiCardDescription]', 'card-description'],
      ['[uiCardAction]', 'card-action'],
      ['[uiCardContent]', 'card-content'],
      ['[uiCardFooter]', 'card-footer'],
    ];
    for (const [selector, cls] of expectations) {
      expect(card.querySelector(selector)!.classList).toContain(cls);
    }
  });
});
