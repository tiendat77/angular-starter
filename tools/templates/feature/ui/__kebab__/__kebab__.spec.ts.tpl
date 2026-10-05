import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { __Pascal__Component } from './__kebab__';

describe('__Pascal__Component', () => {
  it('renders its label input', () => {
    const fixture = TestBed.createComponent(__Pascal__Component);
    fixture.componentRef.setInput('label', 'Hello');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Hello');
  });
});
