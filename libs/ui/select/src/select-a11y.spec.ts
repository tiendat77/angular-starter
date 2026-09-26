import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UiFormFieldComponent, UiHintDirective, UiLabelDirective } from '@libs/ui/input';
import { describe, expect, it } from 'vitest';
import { UiOptionComponent, UiSelectComponent } from './public-api';
import { settle, trigger } from './select.testing';

@Component({
  imports: [UiSelectComponent, UiOptionComponent],
  template: `
    <ui-select
      ariaLabel="Fruit"
      [multiple]="multiple()"
      [(value)]="value"
    >
      <ui-option
        value="apple"
        label="Apple"
      />
      <ui-option
        value="banana"
        label="Banana"
      />
    </ui-select>
  `,
})
class StandaloneHostComponent {
  readonly multiple = signal(false);
  readonly value = signal<string | string[] | null>(null);
}

@Component({
  imports: [
    ReactiveFormsModule,
    UiSelectComponent,
    UiOptionComponent,
    UiFormFieldComponent,
    UiLabelDirective,
    UiHintDirective,
  ],
  template: `
    <ui-form-field>
      <label uiLabel>Fruit</label>
      <ui-select [formControl]="fruit">
        <ui-option
          value="apple"
          label="Apple"
        />
      </ui-select>
      <span uiHint>Pick one</span>
    </ui-form-field>
  `,
})
class FieldHostComponent {
  readonly fruit = new FormControl<string | null>('apple');
}

/** Text of every element referenced by the trigger's aria-describedby. */
function describedByText(): string[] {
  const ids = (trigger().getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean);
  return ids.map((id) => document.getElementById(id)?.textContent?.trim() ?? `<missing #${id}>`);
}

describe('UiSelectComponent (accessibility)', () => {
  it('forwards ariaLabel to the combobox input', async () => {
    TestBed.configureTestingModule({ imports: [StandaloneHostComponent] });
    const fixture = TestBed.createComponent(StandaloneHostComponent);
    await settle(fixture);

    expect(trigger().getAttribute('aria-label')).toBe('Fruit');
  });

  it('exposes the selected label to assistive tech via aria-describedby', async () => {
    TestBed.configureTestingModule({ imports: [StandaloneHostComponent] });
    const fixture: ComponentFixture<StandaloneHostComponent> =
      TestBed.createComponent(StandaloneHostComponent);
    fixture.componentInstance.value.set('banana');
    await settle(fixture);

    expect(describedByText()).toEqual(['Banana']);
  });

  it('describes multiple values as a comma-separated list', async () => {
    TestBed.configureTestingModule({ imports: [StandaloneHostComponent] });
    const fixture = TestBed.createComponent(StandaloneHostComponent);
    fixture.componentInstance.multiple.set(true);
    fixture.componentInstance.value.set(['apple', 'banana']);
    await settle(fixture);

    expect(describedByText()).toEqual(['Apple, Banana']);
  });

  it('keeps the value description next to the form-field hint', async () => {
    TestBed.configureTestingModule({ imports: [FieldHostComponent] });
    const fixture = TestBed.createComponent(FieldHostComponent);
    await settle(fixture);

    expect(describedByText()).toEqual(['Pick one', 'Apple']);
  });
});
