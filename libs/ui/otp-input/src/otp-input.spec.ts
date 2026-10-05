import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UiFormFieldComponent, UiHintDirective, UiLabelDirective } from '@libs/ui/input';
import { describe, expect, it, vi } from 'vitest';
import { UiOtpInput } from './otp-input.component';
import { UiOtpFormatter, UiOtpInputSize } from './otp-input.types';

@Component({
  standalone: true,
  imports: [UiOtpInput, ReactiveFormsModule],
  template: `
    <ui-otp-input
      [formControl]="control"
      [length]="length()"
      [formatter]="formatter()"
      [mask]="mask()"
      [size]="size()"
      [disabled]="disabled()"
      [autoFocus]="autoFocus()"
      (completed)="completedSpy($event)"
    />
  `,
})
class ReactiveHostComponent {
  readonly control = new FormControl('', { nonNullable: true, validators: [Validators.required] });
  readonly length = signal(6);
  readonly formatter = signal<UiOtpFormatter>('numeric');
  readonly mask = signal<boolean | string>(false);
  readonly size = signal<UiOtpInputSize>('md');
  readonly disabled = signal(false);
  readonly autoFocus = signal(false);
  readonly completedSpy = vi.fn();
}

@Component({
  standalone: true,
  imports: [UiOtpInput],
  template: `
    <label for="plain-otp">Code</label>
    <span id="plain-label">Your code</span>
    <ui-otp-input
      inputId="plain-otp"
      [length]="4"
      (completed)="code.set($event)"
    />
    <ui-otp-input
      id="labelled"
      ariaLabelledby="plain-label"
      ariaLabel="ignored"
    />
    <ui-otp-input
      id="custom"
      ariaLabel="Enter PIN"
      [slotLabel]="slotLabel"
    />
  `,
})
class StandaloneHostComponent {
  readonly code = signal('');
  readonly slotLabel = (i: number, n: number) => `Caractère ${i} sur ${n}`;
}

@Component({
  standalone: true,
  imports: [UiOtpInput, FormsModule],
  template: `<ui-otp-input [(ngModel)]="model" />`,
})
class NgModelHostComponent {
  model = '12';
}

@Component({
  standalone: true,
  imports: [
    UiOtpInput,
    ReactiveFormsModule,
    UiFormFieldComponent,
    UiLabelDirective,
    UiHintDirective,
  ],
  template: `
    <ui-form-field>
      <label uiLabel>Code</label>
      <ui-otp-input [formControl]="control" />
      <span uiHint>Six digits</span>
    </ui-form-field>
  `,
})
class FormFieldHostComponent {
  readonly control = new FormControl('', { nonNullable: true, validators: [Validators.required] });
}

@Component({
  standalone: true,
  imports: [UiOtpInput, ReactiveFormsModule],
  template: `
    <form [formGroup]="form">
      <ui-otp-input formControlName="code" />
    </form>
  `,
})
class FormGroupHostComponent {
  readonly form = new FormGroup({
    code: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });
}

function slotsOf(root: HTMLElement): HTMLInputElement[] {
  return Array.from(root.querySelectorAll('input'));
}

function typeInto(
  fixture: ComponentFixture<unknown>,
  slot: HTMLInputElement,
  text: string,
  inputType = text.length === 1 ? 'insertText' : 'insertReplacementText'
): void {
  slot.focus();
  slot.value = text;
  slot.dispatchEvent(new InputEvent('input', { data: text, inputType, bubbles: true }));
  fixture.detectChanges();
}

function press(
  fixture: ComponentFixture<unknown>,
  slot: HTMLInputElement,
  key: string
): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  slot.dispatchEvent(event);
  fixture.detectChanges();
  return event;
}

function pasteInto(
  fixture: ComponentFixture<unknown>,
  slot: HTMLInputElement,
  text: string
): Event {
  const event = new Event('paste', { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'clipboardData', { value: { getData: () => text } });
  slot.dispatchEvent(event);
  fixture.detectChanges();
  return event;
}

describe('UiOtpInput', () => {
  describe('with a reactive form control', () => {
    let fixture: ComponentFixture<ReactiveHostComponent>;
    let host: ReactiveHostComponent;
    let root: HTMLElement;
    const slots = () => slotsOf(root);

    beforeEach(() => {
      TestBed.configureTestingModule({ imports: [ReactiveHostComponent] });
      fixture = TestBed.createComponent(ReactiveHostComponent);
      host = fixture.componentInstance;
      root = fixture.nativeElement;
      fixture.detectChanges();
    });

    describe('rendering and attributes', () => {
      it('renders `length` slots inside a labelled group', () => {
        const group = root.querySelector('ui-otp-input') as HTMLElement;
        expect(slots().length).toBe(6);
        expect(group.getAttribute('role')).toBe('group');
        expect(group.getAttribute('aria-label')).toBe('OTP verification code');
      });

      it('labels every slot "Digit i of n"', () => {
        expect(slots().map((s) => s.getAttribute('aria-label'))).toEqual([
          'Digit 1 of 6',
          'Digit 2 of 6',
          'Digit 3 of 6',
          'Digit 4 of 6',
          'Digit 5 of 6',
          'Digit 6 of 6',
        ]);
      });

      it('supports one-time-code autofill without capping slot length', () => {
        for (const slot of slots()) {
          expect(slot.getAttribute('autocomplete')).toBe('one-time-code');
          expect(slot.getAttribute('inputmode')).toBe('numeric');
          expect(slot.hasAttribute('maxlength')).toBe(false);
        }
      });

      it('re-renders when length changes', () => {
        host.length.set(4);
        fixture.detectChanges();
        expect(slots().length).toBe(4);
      });

      it('applies size classes', () => {
        host.size.set('sm');
        fixture.detectChanges();
        expect(slots()[0].className).toContain('input-sm');
        host.size.set('lg');
        fixture.detectChanges();
        expect(slots()[0].className).toContain('input-lg');
      });

      it('uses a text input mode for non-numeric formatters', () => {
        host.formatter.set('alphanumeric');
        fixture.detectChanges();
        expect(slots()[0].getAttribute('inputmode')).toBe('text');
      });
    });

    describe('typing', () => {
      it('advances focus and updates the form value', () => {
        typeInto(fixture, slots()[0], '1');
        expect(host.control.value).toBe('1');
        expect(document.activeElement).toBe(slots()[1]);
        typeInto(fixture, slots()[1], '2');
        expect(host.control.value).toBe('12');
        expect(document.activeElement).toBe(slots()[2]);
      });

      it('rejects characters the formatter does not accept and restores the slot', () => {
        typeInto(fixture, slots()[0], 'a');
        expect(host.control.value).toBe('');
        expect(slots()[0].value).toBe('');
        expect(document.activeElement).toBe(slots()[0]);
      });

      it('replaces the character of a filled slot', () => {
        host.control.setValue('123456');
        fixture.detectChanges();
        typeInto(fixture, slots()[2], '9');
        expect(host.control.value).toBe('129456');
        expect(document.activeElement).toBe(slots()[3]);
      });

      it('keeps focus on the last slot when the code is full', () => {
        for (const [i, c] of ['1', '2', '3', '4', '5', '6'].entries()) {
          typeInto(fixture, slots()[i], c);
        }
        expect(host.control.value).toBe('123456');
        expect(document.activeElement).toBe(slots()[5]);
      });

      it('emits `completed` once the last slot is filled by the user', () => {
        for (const [i, c] of ['1', '2', '3', '4', '5'].entries()) {
          typeInto(fixture, slots()[i], c);
        }
        expect(host.completedSpy).not.toHaveBeenCalled();
        typeInto(fixture, slots()[5], '6');
        expect(host.completedSpy).toHaveBeenCalledTimes(1);
        expect(host.completedSpy).toHaveBeenCalledWith('123456');
      });
    });

    describe('autofill and paste', () => {
      it('distributes a multi-character input event across slots (SMS autofill)', () => {
        typeInto(fixture, slots()[0], '123456');
        expect(host.control.value).toBe('123456');
        expect(
          slots()
            .map((s) => s.value)
            .join('')
        ).toBe('123456');
        expect(host.completedSpy).toHaveBeenCalledWith('123456');
      });

      it('truncates autofilled text to the length', () => {
        typeInto(fixture, slots()[0], '12345678');
        expect(host.control.value).toBe('123456');
      });

      it('splits pasted text across slots and prevents the default paste', () => {
        const event = pasteInto(fixture, slots()[0], '123456');
        expect(event.defaultPrevented).toBe(true);
        expect(host.control.value).toBe('123456');
      });

      it('overwrites from the slot that received the paste', () => {
        host.control.setValue('123456');
        fixture.detectChanges();
        pasteInto(fixture, slots()[2], '98');
        expect(host.control.value).toBe('129856');
      });

      it('applies the formatter to pasted text', () => {
        pasteInto(fixture, slots()[0], '12-34 56');
        expect(host.control.value).toBe('123456');
      });

      it('ignores a paste with nothing the formatter accepts', () => {
        host.control.setValue('12');
        fixture.detectChanges();
        pasteInto(fixture, slots()[2], 'abc');
        expect(host.control.value).toBe('12');
      });
    });

    describe('keyboard', () => {
      beforeEach(() => {
        host.control.setValue('1234');
        fixture.detectChanges();
      });

      it('Backspace on a filled slot removes it, shifts the rest left and keeps focus', () => {
        slots()[1].focus();
        const event = press(fixture, slots()[1], 'Backspace');
        expect(event.defaultPrevented).toBe(true);
        expect(host.control.value).toBe('134');
        expect(document.activeElement).toBe(slots()[1]);
      });

      it('Backspace on the first empty slot removes the last character and moves back', () => {
        slots()[4].focus();
        expect(document.activeElement).toBe(slots()[4]);
        press(fixture, slots()[4], 'Backspace');
        expect(host.control.value).toBe('123');
        expect(document.activeElement).toBe(slots()[3]);
      });

      it('Backspace with nothing entered does nothing', () => {
        host.control.setValue('');
        fixture.detectChanges();
        slots()[0].focus();
        press(fixture, slots()[0], 'Backspace');
        expect(host.control.value).toBe('');
        expect(document.activeElement).toBe(slots()[0]);
      });

      it('Delete removes the current slot and keeps focus', () => {
        slots()[0].focus();
        press(fixture, slots()[0], 'Delete');
        expect(host.control.value).toBe('234');
        expect(document.activeElement).toBe(slots()[0]);
      });

      it('handles Android Backspace delivered only as an input event', () => {
        slots()[3].focus();
        slots()[3].value = '';
        slots()[3].dispatchEvent(
          new InputEvent('input', { inputType: 'deleteContentBackward', bubbles: true })
        );
        fixture.detectChanges();
        expect(host.control.value).toBe('123');
      });

      it('ArrowLeft and ArrowRight move between slots and clamp at the ends', () => {
        slots()[1].focus();
        press(fixture, slots()[1], 'ArrowRight');
        expect(document.activeElement).toBe(slots()[2]);
        press(fixture, slots()[2], 'ArrowLeft');
        expect(document.activeElement).toBe(slots()[1]);
        slots()[0].focus();
        press(fixture, slots()[0], 'ArrowLeft');
        expect(document.activeElement).toBe(slots()[0]);
      });

      it('ArrowRight cannot jump past the first empty slot', () => {
        slots()[3].focus();
        press(fixture, slots()[3], 'ArrowRight');
        press(fixture, slots()[4], 'ArrowRight');
        expect(document.activeElement).toBe(slots()[4]);
      });
    });

    describe('focus', () => {
      it('redirects focus on an empty slot past the end of the value to the first empty slot', () => {
        host.control.setValue('12');
        fixture.detectChanges();
        slots()[5].focus();
        expect(document.activeElement).toBe(slots()[2]);
      });

      it('selects the content of a filled slot on focus', () => {
        host.control.setValue('12');
        fixture.detectChanges();
        slots()[0].focus();
        expect(slots()[0].selectionStart).toBe(0);
        expect(slots()[0].selectionEnd).toBe(1);
      });

      it('uses a roving tabindex so Tab enters and leaves the group in one stop', () => {
        host.control.setValue('123');
        fixture.detectChanges();
        expect(slots().map((s) => s.getAttribute('tabindex'))).toEqual([
          '-1',
          '-1',
          '-1',
          '0',
          '-1',
          '-1',
        ]);
      });

      it('focuses the first empty slot on mount when autoFocus is set', () => {
        const other = TestBed.createComponent(ReactiveHostComponent);
        other.componentInstance.autoFocus.set(true);
        other.componentInstance.control.setValue('12');
        other.detectChanges();
        const target = slotsOf(other.nativeElement)[2];
        TestBed.tick();
        expect(document.activeElement).toBe(target);
        other.destroy();
      });
    });

    describe('formatter', () => {
      it('accepts letters and digits for the alphanumeric preset', () => {
        host.formatter.set('alphanumeric');
        fixture.detectChanges();
        pasteInto(fixture, slots()[0], 'a1-B2');
        expect(host.control.value).toBe('a1B2');
      });

      it('accepts a RegExp, ignoring its global flag', () => {
        host.formatter.set(/[a-f0-9]/gi);
        fixture.detectChanges();
        pasteInto(fixture, slots()[0], 'abxyz1g2');
        expect(host.control.value).toBe('ab12');
      });

      it('accepts a transforming function', () => {
        host.formatter.set((c) => (/[a-z]/i.test(c) ? c.toUpperCase() : ''));
        fixture.detectChanges();
        pasteInto(fixture, slots()[0], 'a1b2c');
        expect(host.control.value).toBe('ABC');
      });
    });

    describe('mask', () => {
      it('shows • in each filled slot but keeps the real value', () => {
        host.mask.set(true);
        fixture.detectChanges();
        typeInto(fixture, slots()[0], '1');
        typeInto(fixture, slots()[1], '2');
        expect(slots()[0].value).toBe('•');
        expect(slots()[1].value).toBe('•');
        expect(slots()[2].value).toBe('');
        expect(host.control.value).toBe('12');
      });

      it('uses the first character of a string mask', () => {
        host.mask.set('*');
        fixture.detectChanges();
        pasteInto(fixture, slots()[0], '123');
        expect(
          slots()
            .slice(0, 3)
            .map((s) => s.value)
        ).toEqual(['*', '*', '*']);
        expect(host.control.value).toBe('123');
      });

      it('replaces a masked slot without leaking the mask character', () => {
        host.mask.set(true);
        host.control.setValue('123456');
        fixture.detectChanges();
        typeInto(fixture, slots()[1], '9');
        expect(host.control.value).toBe('193456');
      });
    });

    describe('ControlValueAccessor', () => {
      it('writeValue shows the value, formats it and trims it to length', () => {
        host.control.setValue('12ab3456789');
        fixture.detectChanges();
        expect(
          slots()
            .map((s) => s.value)
            .join('')
        ).toBe('123456');
      });

      it('writeValue does not emit `completed`', () => {
        host.control.setValue('123456');
        fixture.detectChanges();
        expect(host.completedSpy).not.toHaveBeenCalled();
      });

      it('clears every slot when the control is reset', () => {
        host.control.setValue('123456');
        fixture.detectChanges();
        host.control.reset();
        fixture.detectChanges();
        expect(slots().every((s) => s.value === '')).toBe(true);
      });

      it('disables every slot through the control', () => {
        host.control.disable();
        fixture.detectChanges();
        expect(slots().every((s) => s.disabled)).toBe(true);
        host.control.enable();
        fixture.detectChanges();
        expect(slots().every((s) => !s.disabled)).toBe(true);
      });

      it('disables every slot through the `disabled` input', () => {
        host.disabled.set(true);
        fixture.detectChanges();
        expect(slots().every((s) => s.disabled)).toBe(true);
      });

      it('marks the control touched only when focus leaves the whole group', () => {
        slots()[0].focus();
        slots()[0].dispatchEvent(
          new FocusEvent('focusout', { bubbles: true, relatedTarget: slots()[1] })
        );
        expect(host.control.touched).toBe(false);
        slots()[1].dispatchEvent(
          new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body })
        );
        expect(host.control.touched).toBe(true);
      });

      it('sets aria-invalid on the slots once the invalid control is touched', () => {
        expect(slots().every((s) => !s.hasAttribute('aria-invalid'))).toBe(true);
        host.control.markAsTouched();
        fixture.detectChanges();
        expect(slots().every((s) => s.getAttribute('aria-invalid') === 'true')).toBe(true);
        typeInto(fixture, slots()[0], '1');
        expect(slots().every((s) => s.getAttribute('aria-invalid') === 'true')).toBe(false);
      });
    });
  });

  describe('standalone, without ui-form-field, labels or forms directives', () => {
    let fixture: ComponentFixture<StandaloneHostComponent>;
    let root: HTMLElement;

    beforeEach(() => {
      TestBed.configureTestingModule({ imports: [StandaloneHostComponent] });
      fixture = TestBed.createComponent(StandaloneHostComponent);
      root = fixture.nativeElement;
      fixture.detectChanges();
    });

    it('works with no NgControl and reports the code through `completed`', () => {
      const slots = slotsOf(root.querySelector('ui-otp-input') as HTMLElement);
      expect(slots.length).toBe(4);
      pasteInto(fixture, slots[0], '9876');
      expect(fixture.componentInstance.code()).toBe('9876');
      expect(slots.every((s) => !s.hasAttribute('aria-invalid'))).toBe(true);
      expect(slots.every((s) => !s.hasAttribute('aria-describedby'))).toBe(true);
    });

    it('puts `inputId` on the first slot so an external label works', () => {
      const first = root.querySelector('#plain-otp') as HTMLInputElement;
      expect(first).toBeTruthy();
      expect(first.tagName).toBe('INPUT');
      expect(first).toBe(slotsOf(root.querySelector('ui-otp-input') as HTMLElement)[0]);
      const label = root.querySelector('label[for="plain-otp"]') as HTMLLabelElement;
      expect(label.control).toBe(first);
    });

    it('uses `ariaLabelledby` instead of `ariaLabel` when given', () => {
      const group = root.querySelector('#labelled') as HTMLElement;
      expect(group.getAttribute('aria-labelledby')).toBe('plain-label');
      expect(group.hasAttribute('aria-label')).toBe(false);
    });

    it('supports a custom group label and slot label function', () => {
      const group = root.querySelector('#custom') as HTMLElement;
      expect(group.getAttribute('aria-label')).toBe('Enter PIN');
      expect(slotsOf(group)[1].getAttribute('aria-label')).toBe('Caractère 2 sur 6');
    });

    it('generates unique slot ids when no inputId is given', () => {
      const ids = Array.from(root.querySelectorAll('input')).map((i) => i.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids.every((id) => !!id)).toBe(true);
    });
  });

  describe('with formControlName inside a FormGroup', () => {
    it('tracks validity, value and touched state', () => {
      TestBed.configureTestingModule({ imports: [FormGroupHostComponent] });
      const fixture = TestBed.createComponent(FormGroupHostComponent);
      fixture.detectChanges();
      const form = fixture.componentInstance.form;
      const slots = slotsOf(fixture.nativeElement);

      expect(slots.every((s) => !s.hasAttribute('aria-invalid'))).toBe(true);

      // A partial code is invalid, but typing it must not flash the error before the user is done.
      pasteInto(fixture, slots[0], '12');
      expect(form.controls.code.invalid).toBe(true);
      expect(form.controls.code.dirty).toBe(true);
      expect(slots.every((s) => !s.hasAttribute('aria-invalid'))).toBe(true);

      form.markAllAsTouched();
      fixture.detectChanges();
      expect(slots.every((s) => s.getAttribute('aria-invalid') === 'true')).toBe(true);

      pasteInto(fixture, slots[0], '123456');
      expect(form.controls.code.value).toBe('123456');
      expect(form.valid).toBe(true);
      expect(slots.every((s) => !s.hasAttribute('aria-invalid'))).toBe(true);
    });
  });

  describe('with ngModel', () => {
    it('reads and writes the model without ui-form-field', async () => {
      TestBed.configureTestingModule({ imports: [NgModelHostComponent] });
      const fixture = TestBed.createComponent(NgModelHostComponent);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      const slots = slotsOf(fixture.nativeElement);
      expect(slots.map((s) => s.value).join('')).toBe('12');
      typeInto(fixture, slots[2], '3');
      expect(fixture.componentInstance.model).toBe('123');
    });
  });

  describe('inside ui-form-field', () => {
    it('wires label, description and focus to the slots', () => {
      TestBed.configureTestingModule({ imports: [FormFieldHostComponent] });
      const fixture = TestBed.createComponent(FormFieldHostComponent);
      fixture.detectChanges();
      TestBed.tick();
      fixture.detectChanges();
      const root: HTMLElement = fixture.nativeElement;
      const slots = slotsOf(root);
      const label = root.querySelector('label') as HTMLLabelElement;
      const hint = root.querySelector('[uiHint]') as HTMLElement;

      expect(label.getAttribute('for')).toBe(slots[0].id);
      expect(slots.every((s) => s.getAttribute('aria-describedby') === hint.id)).toBe(true);

      fixture.componentInstance.control.markAsTouched();
      fixture.detectChanges();
      TestBed.tick();
      expect(slots.every((s) => s.getAttribute('aria-invalid') === 'true')).toBe(true);
    });
  });
});
