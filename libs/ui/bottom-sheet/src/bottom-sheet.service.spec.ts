import { OverlayContainer } from '@angular/cdk/overlay';
import { ApplicationRef, ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  BOTTOM_SHEET_DATA,
  BOTTOM_SHEET_DEFAULT_OPTIONS,
  UiBottomSheetConfig,
} from './bottom-sheet-config';
import { UiBottomSheetRef } from './bottom-sheet-ref';
import { UiBottomSheet } from './bottom-sheet.service';

interface TestData {
  label: string;
}

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span id="data-label">{{ data.label }}</span>
    <button
      id="confirm-btn"
      (click)="confirm()"
    >
      Confirm
    </button>
  `,
})
class TestSheetContentComponent {
  readonly data = inject<TestData>(BOTTOM_SHEET_DATA);
  readonly sheetRef = inject(UiBottomSheetRef<TestSheetContentComponent, string>);

  confirm(): void {
    this.sheetRef.dismiss(`confirmed:${this.data.label}`);
  }
}

function completeTransition(panel: Element | null): void {
  // Plain Event + a manually-defined propertyName, rather than `new TransitionEvent(...)`,
  // since TransitionEvent's constructor support varies across jsdom versions; the component's
  // (transitionend) handler only reads event.propertyName/event.target, so dispatching a real
  // event straight on the panel element is a faithful simulation.
  const event = new Event('transitionend');
  Object.defineProperty(event, 'propertyName', { value: 'transform' });
  panel?.dispatchEvent(event);
}

describe('UiBottomSheet', () => {
  let service: UiBottomSheet;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;
  let appRef: ApplicationRef;
  let originalOffsetWidth: PropertyDescriptor | undefined;
  let originalOffsetHeight: PropertyDescriptor | undefined;

  function flush(): void {
    appRef.tick();
  }

  /**
   * `BottomSheetContainerComponent.enter()` defers becoming visible (and creating/using the
   * focus trap) via `afterNextRender` + a `requestAnimationFrame`-or-`setTimeout` hop, so a real
   * browser has an actual painted "hidden" frame to transition away from (see the Critical fix).
   * A plain `appRef.tick()` only runs a synchronous CD pass; it does not wait out that deferred
   * chain. This waits a short real interval on top so the sheet has actually finished entering
   * before the test interacts with it, matching how it behaves in a real app.
   */
  async function settle(): Promise<void> {
    appRef.tick();
    await new Promise((resolve) => setTimeout(resolve, 50));
    appRef.tick();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [] });
    service = TestBed.inject(UiBottomSheet);
    overlayContainer = TestBed.inject(OverlayContainer);
    overlayContainerElement = overlayContainer.getContainerElement();
    appRef = TestBed.inject(ApplicationRef);

    // jsdom performs no layout, so every element reports zero geometry, which CDK's
    // InteractivityChecker (used by the focus trap, and by this container's own
    // body-scoped tabbable search - see the I6 finding) treats as invisible/unfocusable.
    // Stub non-zero geometry so the real focus logic under test actually runs.
    originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
    originalOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      value: 100,
    });
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      value: 40,
    });
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
    if (originalOffsetWidth) {
      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth);
    } else {
      delete (HTMLElement.prototype as { offsetWidth?: number }).offsetWidth;
    }
    if (originalOffsetHeight) {
      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', originalOffsetHeight);
    } else {
      delete (HTMLElement.prototype as { offsetHeight?: number }).offsetHeight;
    }
  });

  it('attaches the container and content into the overlay, injecting BOTTOM_SHEET_DATA', () => {
    service.open<TestSheetContentComponent, TestData>(TestSheetContentComponent, {
      data: { label: 'filters' },
    });
    flush();

    const panel = overlayContainerElement.querySelector('.bottom-sheet-panel');
    expect(panel).not.toBeNull();
    expect(overlayContainerElement.querySelector('#data-label')?.textContent).toBe('filters');
  });

  it('focuses the first focusable element in the opened content after a normal (non-replacement) open() (I1)', async () => {
    service.open<TestSheetContentComponent, TestData>(TestSheetContentComponent, {
      data: { label: 'filters' },
    });

    // Regression coverage for the I1 finding: container.enter() used to run synchronously right
    // after overlayRef.attach(), before Angular had run change detection on the newly-attached
    // view even once - so ngAfterViewInit (which creates the focus trap) hadn't run yet, and
    // focusInitialElement() silently fell through to the panel fallback instead of the content's
    // first focusable element. A container-level test that calls fixture.detectChanges() before
    // enter() hides this timing bug entirely; only a full service-level open() reproduces it.
    await settle();

    const confirmBtn = overlayContainerElement.querySelector<HTMLButtonElement>('#confirm-btn');
    expect(confirmBtn).not.toBeNull();
    expect(document.activeElement).toBe(confirmBtn);
  });

  it('resolves afterDismissed() with the result passed to dismiss()', async () => {
    const ref = service.open<TestSheetContentComponent, TestData, string>(
      TestSheetContentComponent,
      {
        data: { label: 'filters' },
      }
    );
    await settle();

    let resolved: string | undefined;
    ref.afterDismissed().subscribe((value) => (resolved = value));

    const confirmBtn = overlayContainerElement.querySelector<HTMLButtonElement>('#confirm-btn');
    confirmBtn?.click();
    flush();
    completeTransition(overlayContainerElement.querySelector('.bottom-sheet-panel'));

    expect(resolved).toBe('confirmed:filters');
  });

  it('dismisses on backdrop click unless disableClose is true', async () => {
    const ref = service.open(TestSheetContentComponent, { data: { label: 'a' } });
    await settle();

    let dismissed = false;
    ref.afterDismissed().subscribe(() => (dismissed = true));

    const backdrop = overlayContainerElement.querySelector<HTMLElement>('.cdk-overlay-backdrop');
    backdrop?.click();
    flush();
    completeTransition(overlayContainerElement.querySelector('.bottom-sheet-panel'));

    expect(dismissed).toBe(true);
  });

  it('does not dismiss on backdrop click when disableClose is true', async () => {
    const ref = service.open(TestSheetContentComponent, {
      data: { label: 'a' },
      disableClose: true,
    });
    await settle();

    let dismissed = false;
    ref.afterDismissed().subscribe(() => (dismissed = true));

    const backdrop = overlayContainerElement.querySelector<HTMLElement>('.cdk-overlay-backdrop');
    backdrop?.click();
    flush();

    expect(dismissed).toBe(false);
  });

  it('dismisses on Escape unless disableClose is true', async () => {
    const ref = service.open(TestSheetContentComponent, { data: { label: 'a' } });
    await settle();

    let dismissed = false;
    ref.afterDismissed().subscribe(() => (dismissed = true));

    const panel = overlayContainerElement.querySelector<HTMLElement>('.bottom-sheet-panel');
    panel?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    flush();
    completeTransition(panel);

    expect(dismissed).toBe(true);
  });

  it('replaces a currently-open sheet: opening a second sheet dismisses the first', async () => {
    const first = service.open(TestSheetContentComponent, { data: { label: 'first' } });
    await settle(); // let the first sheet actually finish entering before it gets replaced

    let firstDismissed = false;
    first.afterDismissed().subscribe(() => (firstDismissed = true));

    service.open(TestSheetContentComponent, { data: { label: 'second' } });
    flush();

    // The first sheet's dismiss() has been called; its exit transition must complete
    // before it's considered gone (mirrors ToastService's replace-then-enter sequencing).
    const panels = overlayContainerElement.querySelectorAll('.bottom-sheet-panel');
    expect(panels.length).toBeGreaterThanOrEqual(1);
    completeTransition(panels[0]);
    flush();

    expect(firstDismissed).toBe(true);
    expect(overlayContainerElement.querySelector('#data-label')?.textContent).toBe('second');
  });

  it(
    'resolves the two replaced sheets immediately (no transition to wait on) and shows only the ' +
      'last one when three sheets are opened in rapid succession, before any of them finishes ' +
      'entering (I3)',
    async () => {
      const a = service.open(TestSheetContentComponent, { data: { label: 'a' } });
      let aDismissed = false;
      a.afterDismissed().subscribe(() => (aDismissed = true));

      // Opened before `a` ever became visible: `a`'s container.exit() (triggered by this
      // replacement) finds it was never entered, so it resolves afterDismissed() immediately
      // instead of hanging on a transition that would never happen.
      const b = service.open(TestSheetContentComponent, { data: { label: 'b' } });
      let bDismissed = false;
      b.afterDismissed().subscribe(() => (bDismissed = true));

      // Opened before `b` ever became visible either - same immediate-resolve path for `b`.
      const c = service.open(TestSheetContentComponent, { data: { label: 'c' } });
      flush(); // let c's content bindings (e.g. {{ data.label }}) actually render

      // Both replaced sheets resolve synchronously, without needing any transition or settle.
      expect(aDismissed).toBe(true);
      expect(bDismissed).toBe(true);

      const panelsAfterOpens = overlayContainerElement.querySelectorAll('.bottom-sheet-panel');
      expect(panelsAfterOpens.length).toBe(1); // a and b's overlays were already disposed
      expect(overlayContainerElement.querySelector('#data-label')?.textContent).toBe('c');

      // The last one opened (c) is the one that actually ends up visible/open.
      await settle();
      const cPanel = overlayContainerElement.querySelector('.bottom-sheet-panel');
      expect(cPanel?.classList.contains('bottom-sheet-panel-visible')).toBe(true);
    }
  );

  it('restores focus to the previously focused element after dismiss when restoreFocus is true', async () => {
    const trigger = document.createElement('button');
    trigger.id = 'trigger-btn';
    document.body.appendChild(trigger);
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    const ref = service.open(TestSheetContentComponent, { data: { label: 'a' } });
    await settle();

    ref.dismiss();
    completeTransition(overlayContainerElement.querySelector('.bottom-sheet-panel'));
    flush();

    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });

  it('hides other document.body children from assistive technology while open, and restores them after dismiss', async () => {
    const sibling = document.createElement('div');
    sibling.id = 'app-sibling';
    document.body.appendChild(sibling);
    expect(sibling.hasAttribute('aria-hidden')).toBe(false);

    const ref = service.open(TestSheetContentComponent, { data: { label: 'a' } });
    await settle();

    expect(sibling.getAttribute('aria-hidden')).toBe('true');
    // The overlay container itself (the sheet's own subtree) must stay visible to AT.
    expect(overlayContainerElement.hasAttribute('aria-hidden')).toBe(false);

    ref.dismiss();
    completeTransition(overlayContainerElement.querySelector('.bottom-sheet-panel'));
    flush();

    expect(sibling.hasAttribute('aria-hidden')).toBe(false);

    sibling.remove();
  });

  it('keeps background siblings aria-hidden throughout a single-instance replacement, restoring only once the last sheet is gone', async () => {
    const sibling = document.createElement('div');
    sibling.id = 'app-sibling-replace';
    document.body.appendChild(sibling);

    service.open(TestSheetContentComponent, { data: { label: 'first' } });
    await settle();
    expect(sibling.getAttribute('aria-hidden')).toBe('true');

    service.open(TestSheetContentComponent, { data: { label: 'second' } });
    await settle();

    // Complete the first sheet's exit transition so its afterDismissed() resolves and the
    // second sheet enters. The background must remain hidden throughout: the first sheet's
    // dismissal must not restore aria-hidden while the second (replacement) is still open.
    const panels = overlayContainerElement.querySelectorAll('.bottom-sheet-panel');
    completeTransition(panels[0]);
    flush();

    expect(sibling.getAttribute('aria-hidden')).toBe('true');
    expect(overlayContainerElement.querySelector('#data-label')?.textContent).toBe('second');

    const secondPanel = overlayContainerElement.querySelector('.bottom-sheet-panel');
    service.dismiss();
    completeTransition(secondPanel);
    flush();

    expect(sibling.hasAttribute('aria-hidden')).toBe(false);

    sibling.remove();
  });

  it('lets per-call config override BOTTOM_SHEET_DEFAULT_OPTIONS, and defaults fill in the rest', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: BOTTOM_SHEET_DEFAULT_OPTIONS,
          useValue: Object.assign(new UiBottomSheetConfig(), {
            snapPoints: [0.3, 0.7],
            hasBackdrop: false,
          }),
        },
      ],
    });
    const scopedService = TestBed.inject(UiBottomSheet);
    const scopedOverlayContainer = TestBed.inject(OverlayContainer);
    const scopedAppRef = TestBed.inject(ApplicationRef);

    scopedService.open(TestSheetContentComponent, { data: { label: 'a' }, hasBackdrop: true });
    scopedAppRef.tick();

    const el = scopedOverlayContainer.getContainerElement();
    expect(el.querySelector('.cdk-overlay-backdrop')).not.toBeNull(); // per-call override won

    scopedOverlayContainer.ngOnDestroy();
  });
});
