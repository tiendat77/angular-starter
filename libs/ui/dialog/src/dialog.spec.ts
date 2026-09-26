import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { DialogModule, DialogService } from './public-api';

@Component({
  imports: [DialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog-layout alert>
      <ng-template dialog-title>Custom title</ng-template>
      <ng-template dialog-body><p class="custom-body">Custom body</p></ng-template>
      <ng-template dialog-actions>
        <button
          class="dismiss"
          dialog-dismiss
        >
          Close
        </button>
      </ng-template>
    </dialog-layout>
  `,
})
class CustomDialogComponent {}

function buttonByText(text: string): HTMLButtonElement {
  const button = Array.from(
    document.querySelectorAll<HTMLButtonElement>('.cdk-overlay-container button')
  ).find((b) => b.textContent?.trim() === text);
  if (!button) throw new Error(`No "${text}" button in the overlay`);
  return button;
}

describe('DialogService', () => {
  let service: DialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DialogService);
  });

  afterEach(() => service.closeAll());

  it('should open a typed confirm dialog and close it with true on Confirm', () => {
    let result: boolean | undefined;
    service
      .confirm({ type: 'warning', title: 'Delete project?', message: 'This cannot be undone.' })
      .closed.subscribe((value) => (result = value));
    TestBed.tick();

    const confirmEl = document.querySelector('dialog-confirm')!;
    expect(confirmEl.querySelector('h2')?.textContent).toBe('Delete project?');
    expect(confirmEl.querySelector('p')?.textContent).toBe('This cannot be undone.');
    expect(confirmEl.querySelector('.bg-warning')).not.toBeNull();

    buttonByText('Confirm').click();
    TestBed.tick();

    expect(result).toBe(true);
    expect(document.querySelector('dialog-confirm')).toBeNull();
  });

  it('should close without a result on Close', () => {
    let result: boolean | undefined = true;
    service.confirm({ title: 'Info' }).closed.subscribe((value) => (result = value));
    TestBed.tick();

    buttonByText('Close').click();
    TestBed.tick();

    expect(result).toBeUndefined();
  });

  it('should project title, body and actions into dialog-layout and dismiss via dialog-dismiss', () => {
    service.open(CustomDialogComponent);
    TestBed.tick();

    const layout = document.querySelector('dialog-layout')!;
    expect(layout.classList).toContain('alert-dialog');
    expect(layout.textContent).toContain('Custom title');
    expect(layout.querySelector('.custom-body')?.textContent).toBe('Custom body');

    (layout.querySelector('.dismiss') as HTMLButtonElement).click();
    TestBed.tick();

    expect(document.querySelector('dialog-layout')).toBeNull();
  });
});
