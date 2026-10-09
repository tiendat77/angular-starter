import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, expect, it } from 'vitest';
import { UiCardModule } from './card.module';
import {
  UiCardActionDirective,
  UiCardComponent,
  UiCardContentDirective,
  UiCardDescriptionDirective,
  UiCardFooterDirective,
  UiCardHeaderDirective,
  UiCardMediaDirective,
  UiCardTitleDirective,
} from './public-api';

@Component({
  imports: [UiCardModule],
  template: `
    <ui-card>
      <img
        uiCardMedia
        alt=""
      />
      <div uiCardHeader>
        <h3 uiCardTitle>Title</h3>
        <p uiCardDescription>Description</p>
        <button uiCardAction>⋯</button>
      </div>
      <div uiCardContent>Content</div>
      <div uiCardFooter>Footer</div>
    </ui-card>
  `,
})
class Host {}

describe('UiCardModule', () => {
  it('brings the card and all its parts', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    for (const directive of [
      UiCardComponent,
      UiCardMediaDirective,
      UiCardHeaderDirective,
      UiCardTitleDirective,
      UiCardDescriptionDirective,
      UiCardActionDirective,
      UiCardContentDirective,
      UiCardFooterDirective,
    ]) {
      expect(fixture.debugElement.query(By.directive(directive))).not.toBeNull();
    }
  });
});
