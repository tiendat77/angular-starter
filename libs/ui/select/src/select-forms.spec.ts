import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { UiErrorDirective, UiFormFieldComponent, UiLabelDirective } from '@libs/ui/input';
import { describe, expect, it } from 'vitest';
import { UiOptionComponent, UiSelectComponent } from './public-api';
import { listbox, optionByText, settle, trigger, triggerBox } from './select.testing';

interface User {
  id: number;
  name: string;
}

const USERS: User[] = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];

@Component({
  imports: [
    ReactiveFormsModule,
    UiSelectComponent,
    UiOptionComponent,
    UiFormFieldComponent,
    UiLabelDirective,
    UiErrorDirective,
  ],
  template: `
    <ui-form-field>
      <label uiLabel>Owner</label>
      <ui-select
        [formControl]="owner"
        [compareWith]="byId"
      >
        @for (u of users; track u.id) {
          <ui-option
            [value]="u"
            [label]="u.name"
          />
        }
      </ui-select>
      @if (owner.invalid && owner.touched) {
        <span uiError>Required</span>
      }
    </ui-form-field>
    <button class="outside">outside</button>
  `,
})
class FormsHostComponent {
  readonly users = USERS;
  readonly owner = new FormControl<User | null>(null, Validators.required);
  readonly byId = (a: User, b: User) => a.id === b.id;
}

describe('UiSelectComponent (forms + ui-form-field)', () => {
  let fixture: ComponentFixture<FormsHostComponent>;
  let host: FormsHostComponent;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [FormsHostComponent] });
    fixture = TestBed.createComponent(FormsHostComponent);
    host = fixture.componentInstance;
    await settle(fixture);
  });

  it('renders inside ui-form-field and wires the label to the trigger input', () => {
    const label = document.querySelector('label[uiLabel]')!;
    expect(trigger()).not.toBeNull();
    expect(label.getAttribute('for')).toBe(trigger().id);
  });

  it('writes form values without emitting, including new-but-equal objects', async () => {
    host.owner.setValue({ id: 2, name: 'Bob (from API)' });
    await settle(fixture);

    expect(host.owner.dirty).toBe(false);
    expect(document.querySelector('ui-select .select-value')?.textContent?.trim()).toBe('Bob');

    triggerBox().click();
    await settle(fixture);
    expect(optionByText('Bob').getAttribute('aria-selected')).toBe('true');
  });

  it('propagates user selections to the form control', async () => {
    triggerBox().click();
    await settle(fixture);
    optionByText('Alice').click();
    await settle(fixture);

    expect(host.owner.value).toEqual(USERS[0]);
    expect(host.owner.dirty).toBe(true);
  });

  it('marks touched when focus leaves the select and flags aria-invalid', async () => {
    trigger().focus();
    await settle(fixture);
    (document.querySelector('.outside') as HTMLButtonElement).focus();
    trigger().dispatchEvent(
      new FocusEvent('focusout', {
        bubbles: true,
        relatedTarget: document.querySelector('.outside'),
      })
    );
    await settle(fixture);

    expect(host.owner.touched).toBe(true);
    expect(trigger().getAttribute('aria-invalid')).toBe('true');
    expect(trigger().getAttribute('aria-describedby')).toContain('ui-error');
  });

  it('disables through the form control', async () => {
    host.owner.disable();
    await settle(fixture);
    triggerBox().click();
    await settle(fixture);

    expect(trigger().disabled).toBe(true);
    expect(listbox()).toBeNull();
  });
});
