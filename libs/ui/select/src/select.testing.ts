import { ComponentFixture } from '@angular/core/testing';

/** Runs change detection, lets aria's afterRender effects flush, then runs it again. */
export async function settle(fixture: ComponentFixture<unknown>): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

export function trigger(): HTMLInputElement {
  return document.querySelector<HTMLInputElement>('ui-select input[role="combobox"]')!;
}

export function triggerBox(): HTMLElement {
  return document.querySelector<HTMLElement>('ui-select .select-trigger')!;
}

export function listbox(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[role="listbox"]');
}

export function options(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'));
}

export function optionByText(text: string): HTMLElement {
  const option = options().find((el) => el.textContent?.trim() === text);
  if (!option) throw new Error(`No option with text "${text}"`);
  return option;
}

/** Key events only reach a focused element in a browser, so the helpers focus first. */
export function key(el: HTMLElement, keyName: string): void {
  el.focus();
  el.dispatchEvent(new KeyboardEvent('keydown', { key: keyName, bubbles: true, cancelable: true }));
}

export function type(el: HTMLInputElement, text: string): void {
  el.focus();
  el.value = text;
  el.dispatchEvent(new InputEvent('input', { bubbles: true, data: text, inputType: 'insertText' }));
}
