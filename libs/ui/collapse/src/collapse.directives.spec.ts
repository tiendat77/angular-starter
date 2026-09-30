import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import {
  UiCollapseContentDirective,
  UiCollapseExtraDirective,
  UiCollapseHeaderDirective,
  UiCollapseIconDirective,
} from './collapse.directives';

@Component({
  standalone: true,
  imports: [
    UiCollapseHeaderDirective,
    UiCollapseExtraDirective,
    UiCollapseContentDirective,
    UiCollapseIconDirective,
  ],
  template: `
    <ng-template uiCollapseHeader>Header</ng-template>
    <ng-template uiCollapseExtra>Extra</ng-template>
    <ng-template uiCollapseContent>Content</ng-template>
    <ng-template uiCollapseIcon>Icon</ng-template>
  `,
})
class DirectiveHostComponent {
  readonly header = viewChild(UiCollapseHeaderDirective);
  readonly extra = viewChild(UiCollapseExtraDirective);
  readonly content = viewChild(UiCollapseContentDirective);
  readonly icon = viewChild(UiCollapseIconDirective);
}

describe('UiCollapse Directives', () => {
  it('should query all slot directives via viewChild', () => {
    TestBed.configureTestingModule({ imports: [DirectiveHostComponent] });
    const fixture = TestBed.createComponent(DirectiveHostComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.header()).toBeDefined();
    expect(fixture.componentInstance.extra()).toBeDefined();
    expect(fixture.componentInstance.content()).toBeDefined();
    expect(fixture.componentInstance.icon()).toBeDefined();
  });
});
