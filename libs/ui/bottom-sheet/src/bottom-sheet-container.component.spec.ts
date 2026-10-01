import { ComponentPortal } from '@angular/cdk/portal';
import { ChangeDetectionStrategy, Component, NgZone } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UiBottomSheetConfig } from './bottom-sheet-config';
import { BottomSheetContainerComponent } from './bottom-sheet-container.component';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<button id="content-btn">Focus me</button>`,
})
class FocusableContentComponent {}

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p>No focusable elements here.</p>`,
})
class NonFocusableContentComponent {}

function createContainer(
  config: Partial<UiBottomSheetConfig> = {}
): ComponentFixture<BottomSheetContainerComponent> {
  const merged = Object.assign(new UiBottomSheetConfig(), config);
  // Support tests that create more than one fixture in a single `it()` (e.g. the
  // initialSnapIndex-clamping test): TestBed refuses to reconfigure once a component
  // has been instantiated, so reset before each configure.
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [{ provide: UiBottomSheetConfig, useValue: merged }],
  });
  const fixture = TestBed.createComponent(BottomSheetContainerComponent);
  fixture.detectChanges();
  return fixture;
}

/**
 * `enter()` defers the actual visible-flip (and focus-trap work) via `afterNextRender` + a
 * `requestAnimationFrame`-or-`setTimeout` hop, specifically so a real browser has something to
 * paint and transition from (see the Critical fix). `fixture.whenStable()` reliably waits out
 * the `afterNextRender` half; the render-hook callback itself runs outside the Angular zone (by
 * Angular's own design, to avoid triggering unnecessary ticks from render hooks), so the nested
 * rAF/setTimeout hop it schedules may not be tracked by NgZone's stability bookkeeping. A short
 * real-wall-clock wait on top makes the tests deterministic regardless of that.
 */
async function settle(fixture: ComponentFixture<BottomSheetContainerComponent>): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();
  await new Promise((resolve) => setTimeout(resolve, 50));
  fixture.detectChanges();
}

function dispatchPanelTransitionEnd(panel: Element | null): void {
  // Plain Event + a manually-defined propertyName/target, rather than `new TransitionEvent(...)`,
  // since TransitionEvent's constructor support varies across jsdom versions; the component's
  // (transitionend) handler only reads event.propertyName and event.target, so a real dispatch
  // on the actual panel element is a faithful simulation (and, critically, gives event.target the
  // real element - see the "ignore bubbled transitionend" fix).
  const event = new Event('transitionend', { bubbles: true });
  Object.defineProperty(event, 'propertyName', { value: 'transform' });
  panel?.dispatchEvent(event);
}

describe('BottomSheetContainerComponent', () => {
  let fixture: ComponentFixture<BottomSheetContainerComponent>;
  let originalOffsetWidth: PropertyDescriptor | undefined;
  let originalOffsetHeight: PropertyDescriptor | undefined;

  beforeEach(() => {
    Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true });
    // jsdom performs no layout, so every element reports zero geometry. CDK's
    // InteractivityChecker treats zero-geometry elements as invisible/unfocusable,
    // which would make FocusTrap never find anything tabbable. Stub non-zero
    // offsetWidth/offsetHeight so the real focus-trap logic under test actually runs.
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
    // Restore the stubs so they don't leak into other spec files sharing this test process.
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

  it('renders role=dialog, aria-modal, and the configured aria-label', () => {
    fixture = createContainer({ ariaLabel: 'Filter products' });
    const panel: HTMLElement = fixture.nativeElement.querySelector('.bottom-sheet-panel');

    expect(panel.getAttribute('role')).toBe('dialog');
    expect(panel.getAttribute('aria-modal')).toBe('true');
    expect(panel.getAttribute('aria-label')).toBe('Filter products');
  });

  it('hides the drag handle when hasDragHandle is false', () => {
    fixture = createContainer({ hasDragHandle: false });
    expect(fixture.nativeElement.querySelector('.bottom-sheet-handle')).toBeNull();
  });

  it('renders the handle as a keyboard-operable slider reflecting snapIndex', () => {
    fixture = createContainer({ snapPoints: [0.25, 0.5, 0.9], initialSnapIndex: 1 });
    const handle: HTMLElement = fixture.nativeElement.querySelector('.bottom-sheet-handle');

    expect(handle.getAttribute('role')).toBe('slider');
    expect(handle.getAttribute('aria-valuemin')).toBe('0');
    expect(handle.getAttribute('aria-valuemax')).toBe('2');
    expect(handle.getAttribute('aria-valuenow')).toBe('1');
    expect(handle.getAttribute('tabindex')).toBe('0');
  });

  it('renders the handle as non-interactive when disableDrag is true', () => {
    fixture = createContainer({ disableDrag: true });
    const handle: HTMLElement = fixture.nativeElement.querySelector('.bottom-sheet-handle');

    expect(handle.getAttribute('role')).toBeNull();
    expect(handle.getAttribute('tabindex')).toBeNull();
  });

  it('ArrowUp/ArrowDown/Home/End on the handle call snapTo with clamped indices', () => {
    fixture = createContainer({ snapPoints: [0.25, 0.5, 0.9], initialSnapIndex: 1 });
    const handle: HTMLElement = fixture.nativeElement.querySelector('.bottom-sheet-handle');

    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.snapIndex()).toBe(2);

    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true })); // already at max
    fixture.detectChanges();
    expect(fixture.componentInstance.snapIndex()).toBe(2);

    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.snapIndex()).toBe(0);

    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.snapIndex()).toBe(2);
  });

  it('clamps an out-of-range initialSnapIndex instead of producing an invalid snap', () => {
    fixture = createContainer({ snapPoints: [0.25, 0.5, 0.9], initialSnapIndex: 99 });
    expect(fixture.componentInstance.snapIndex()).toBe(2);

    fixture = createContainer({ snapPoints: [0.25, 0.5, 0.9], initialSnapIndex: -5 });
    expect(fixture.componentInstance.snapIndex()).toBe(0);
  });

  it('focuses the first focusable element in the attached content on enter()', async () => {
    fixture = createContainer();
    const portal = new ComponentPortal(FocusableContentComponent);
    fixture.componentInstance.attachComponentPortal(portal);
    fixture.detectChanges();

    fixture.componentInstance.enter();
    await settle(fixture);

    const contentBtn = fixture.nativeElement.querySelector('#content-btn');
    expect(document.activeElement).toBe(contentBtn);
  });

  it('falls back to focusing the panel when the attached content has nothing focusable', async () => {
    fixture = createContainer();
    const portal = new ComponentPortal(NonFocusableContentComponent);
    fixture.componentInstance.attachComponentPortal(portal);
    fixture.detectChanges();

    fixture.componentInstance.enter();
    await settle(fixture);

    const panel: HTMLElement = fixture.nativeElement.querySelector('.bottom-sheet-panel');
    expect(document.activeElement).toBe(panel);
  });

  it('does not start a second enter() sequence, or re-run focus, if called again while already entering/entered', async () => {
    fixture = createContainer();
    const portal = new ComponentPortal(FocusableContentComponent);
    fixture.componentInstance.attachComponentPortal(portal);
    fixture.detectChanges();

    fixture.componentInstance.enter();
    fixture.componentInstance.enter(); // duplicate call, e.g. a stale subscription firing twice
    await settle(fixture);

    expect(fixture.componentInstance.visible()).toBe(true);
    const contentBtn = fixture.nativeElement.querySelector('#content-btn');
    expect(document.activeElement).toBe(contentBtn);
  });

  it('is a no-op if called after exit() has already been requested (I3)', async () => {
    fixture = createContainer();

    fixture.componentInstance.exit(); // dismissed before it was ever opened
    fixture.componentInstance.enter(); // a stale "replacement" enter() arriving afterwards
    await settle(fixture);

    expect(fixture.componentInstance.visible()).toBe(false);
  });

  describe('enter/exit lifecycle', () => {
    it('changes the rendered transform between the hidden and entered states, and emits _onEnter once the real transitionend fires (Critical fix)', async () => {
      fixture = createContainer({ snapPoints: [0.5] });
      const panel: HTMLElement = fixture.nativeElement.querySelector('.bottom-sheet-panel');

      // Before enter() ever runs, the panel renders fully off-screen (panelHeightPx), not at
      // its resting snap position - this is what makes the eventual flip to "visible" a real,
      // transitionable transform change in a real browser.
      expect(panel.style.transform).toBe('translateY(500px)'); // panelHeightPx for [0.5] @ 1000vh

      let entered = false;
      fixture.componentInstance._onEnter.subscribe(() => (entered = true));

      fixture.componentInstance.enter();
      await settle(fixture);

      expect(fixture.componentInstance.visible()).toBe(true);
      // Resting position for snapIndex 0 of [0.5] @ 1000vh: panelHeightPx(500) - 500 = 0.
      expect(panel.style.transform).toBe('translateY(0px)');
      expect(entered).toBe(false); // afterOpened() only resolves once transitionend actually fires

      dispatchPanelTransitionEnd(panel);
      expect(entered).toBe(true);
    });

    it('changes the rendered transform between the entered and exited states, and emits _onExit once (Critical fix)', async () => {
      fixture = createContainer({ snapPoints: [0.5] });
      const panel: HTMLElement = fixture.nativeElement.querySelector('.bottom-sheet-panel');

      fixture.componentInstance.enter();
      await settle(fixture);
      dispatchPanelTransitionEnd(panel); // finish entering
      const enteredTransform = panel.style.transform;

      let exited = false;
      fixture.componentInstance._onExit.subscribe(() => (exited = true));

      fixture.componentInstance.exit();
      fixture.detectChanges();

      const exitingTransform = panel.style.transform;
      expect(exitingTransform).not.toBe(enteredTransform); // a real transform change to transition
      expect(exited).toBe(false); // not resolved until transitionend fires

      dispatchPanelTransitionEnd(panel);
      expect(exited).toBe(true);
      expect(panel.style.transform).toBe('translateY(500px)'); // back to fully hidden
    });

    it('ignores a bubbled transitionend from inside the opened content (I2/Critical)', async () => {
      fixture = createContainer({ snapPoints: [0.5] });
      const panel: HTMLElement = fixture.nativeElement.querySelector('.bottom-sheet-panel');
      const body: HTMLElement = fixture.nativeElement.querySelector('.bottom-sheet-body');

      let entered = false;
      fixture.componentInstance._onEnter.subscribe(() => (entered = true));

      fixture.componentInstance.enter();
      await settle(fixture);

      // A transitionend that bubbles up from something inside the content, not the panel itself.
      const bubbled = new Event('transitionend', { bubbles: true });
      Object.defineProperty(bubbled, 'propertyName', { value: 'transform' });
      Object.defineProperty(bubbled, 'target', { value: body, configurable: true });
      panel.dispatchEvent(bubbled);
      expect(entered).toBe(false);

      dispatchPanelTransitionEnd(panel); // the panel's own transition actually ending
      expect(entered).toBe(true);
    });

    it('emits _onEnter (afterOpened) only once, not on every subsequent transitionend while visible (I2)', async () => {
      fixture = createContainer({ snapPoints: [0.25, 0.5, 0.9], initialSnapIndex: 1 });
      const panel: HTMLElement = fixture.nativeElement.querySelector('.bottom-sheet-panel');

      let enterCount = 0;
      let completed = false;
      fixture.componentInstance._onEnter.subscribe({
        next: () => enterCount++,
        complete: () => (completed = true),
      });

      fixture.componentInstance.enter();
      await settle(fixture);
      dispatchPanelTransitionEnd(panel); // initial entry
      expect(enterCount).toBe(1);
      expect(completed).toBe(true);

      // Simulate further snap settles while still visible (e.g. from a drag or keyboard resize).
      fixture.componentInstance.snapTo(2);
      fixture.detectChanges();
      dispatchPanelTransitionEnd(panel);
      dispatchPanelTransitionEnd(panel);

      expect(enterCount).toBe(1); // still only once
    });

    it('resolves exit() immediately, without waiting on a transition, if the sheet never became visible (I3)', () => {
      fixture = createContainer();

      let exited = false;
      fixture.componentInstance._onExit.subscribe(() => (exited = true));

      // exit() called without ever calling enter() first - e.g. a sheet dismissed while still
      // queued behind a prior sheet's exit transition in a rapid-open sequence.
      fixture.componentInstance.exit();

      expect(exited).toBe(true);
    });

    it('resolves exit() immediately if enter() was called but its deferred visible-flip never ran yet (I3)', () => {
      fixture = createContainer();

      let exited = false;
      fixture.componentInstance._onExit.subscribe(() => (exited = true));

      fixture.componentInstance.enter(); // starts the deferred afterNextRender/rAF sequence...
      fixture.componentInstance.exit(); // ...but is dismissed before that sequence ever runs

      expect(fixture.componentInstance.visible()).toBe(false);
      expect(exited).toBe(true);
    });
  });

  describe('drag gesture', () => {
    beforeEach(() => {
      fixture = createContainer({ snapPoints: [0.25, 0.5, 0.9], initialSnapIndex: 1 });
      // panelHeightPx = 0.9 * 1000 = 900; translateY per index: [650, 400, 0]
      // A drag can only realistically begin once the sheet is on screen, so make the container
      // visible directly (bypassing the async enter() lifecycle, which is covered separately
      // above) so translateYPx() reflects the resting snap position these tests assert against.
      fixture.componentInstance.visible.set(true);
      fixture.detectChanges();
    });

    it('drags the panel transform directly (imperative write) while the handle drag is active', () => {
      fixture.componentInstance._processDragStart(400, 'handle');
      fixture.componentInstance._processDragMove(500, 16); // dragged down 100px

      const panel: HTMLElement = fixture.nativeElement.querySelector('.bottom-sheet-panel');
      expect(panel.style.transform).toBe('translateY(500px)'); // startTranslateY(400) + 100
    });

    it('resolves to a snap index on release for a slow, un-flung drag', () => {
      fixture.componentInstance._processDragStart(400, 'handle');
      fixture.componentInstance._processDragMove(420, 500); // small, slow move
      fixture.componentInstance._processDragEnd(420);

      // nearest translateY to (400 + 20 = 420) among [650, 400, 0] is 400 -> index 1
      expect(fixture.componentInstance.snapIndex()).toBe(1);
    });

    it('restores the panel to its resting transform when a drag resolves back to its starting snap index', () => {
      // _processDragMove writes style.transform imperatively, bypassing the
      // [style.transform]="panelTransform()" binding's change-detection bookkeeping. If the
      // drag ends back at the same snap index it started from, panelTransform() recomputes to
      // the same string Angular already believes is applied, so the binding alone would skip
      // the DOM write and leave the stale mid-drag transform stuck. _processDragEnd must force
      // the DOM back in sync explicitly.
      fixture.componentInstance._processDragStart(400, 'handle');
      fixture.componentInstance._processDragMove(405, 500); // small, slow move - resolves back to same index
      fixture.componentInstance._processDragEnd(405);

      expect(fixture.componentInstance.snapIndex()).toBe(1); // same index it started at

      const panel: HTMLElement = fixture.nativeElement.querySelector('.bottom-sheet-panel');
      expect(panel.style.transform).toBe('translateY(400px)'); // resting position, not the stale mid-drag value
    });

    it('requests dismissal on a fast downward fling past the smallest-snap threshold', () => {
      let dismissRequested = false;
      fixture.componentInstance._dismissRequested.subscribe(() => (dismissRequested = true));

      fixture.componentInstance.snapTo(0); // start at the smallest snap (translateY 650)
      fixture.componentInstance._processDragStart(650, 'handle');
      // dismiss threshold = translateY(index 0) + snapPixels[0] * 0.5 = 650 + 125 = 775;
      // drag 200px down (well past 775) fast enough to fling (40px/ms, well past the 0.5 threshold).
      fixture.componentInstance._processDragMove(850, 5);
      fixture.componentInstance._processDragEnd(850);

      expect(dismissRequested).toBe(true);
    });

    it('does not dismiss and clamps to the smallest snap when disableClose is true, even past the threshold', () => {
      fixture = createContainer({
        snapPoints: [0.25, 0.5, 0.9],
        initialSnapIndex: 0,
        disableClose: true,
      });
      fixture.componentInstance.visible.set(true);
      // panelHeightPx = 900; translateY(index 0) = 650; dismiss threshold = 650 + 125 = 775.
      let dismissRequested = false;
      fixture.componentInstance._dismissRequested.subscribe(() => (dismissRequested = true));

      fixture.componentInstance._processDragStart(650, 'handle');
      // Two slow, evenly-paced moves (0.4 px/ms each) so this stays below the 0.5 px/ms fling
      // threshold - this exercises the "slow drag released past the threshold" branch, not fling.
      fixture.componentInstance._processDragMove(850, 500); // 200px in 500ms = 0.4 px/ms
      fixture.componentInstance._processDragMove(1050, 1000); // another 200px in 500ms = 0.4 px/ms
      fixture.componentInstance._processDragEnd(1050);

      expect(dismissRequested).toBe(false);
      expect(fixture.componentInstance.snapIndex()).toBe(0);
    });

    it('onHandlePointerDown is a no-op when disableDrag is true (drag never starts, so nothing can resolve to a dismiss)', () => {
      fixture = createContainer({ snapPoints: [0.5], initialSnapIndex: 0, disableDrag: true });
      fixture.componentInstance.visible.set(true);
      const handle = fixture.nativeElement.querySelector('.bottom-sheet-handle');
      expect(handle).not.toBeNull(); // still rendered (hasDragHandle default true), just non-interactive

      let dismissRequested = false;
      fixture.componentInstance._dismissRequested.subscribe(() => (dismissRequested = true));
      fixture.componentInstance.onHandlePointerDown({ pointerId: 1, clientY: 0 } as PointerEvent);

      expect(dismissRequested).toBe(false); // onHandlePointerDown returned early; no drag state was created
    });

    it('does not claim an upward drag on the body when already at the largest snap (lets content scroll)', () => {
      fixture.componentInstance.snapTo(2); // largest snap index
      fixture.componentInstance.bodyRef.nativeElement.scrollTop = 50; // mid-scroll, not at top

      fixture.componentInstance._processDragStart(500, 'body');
      const claimed = fixture.componentInstance._processDragMove(450, 16); // upward drag

      expect(claimed).toBe(false);
    });

    it('claims a downward drag on the body when its content is scrolled to the top', () => {
      fixture.componentInstance.snapTo(2);
      fixture.componentInstance.bodyRef.nativeElement.scrollTop = 0;

      fixture.componentInstance._processDragStart(0, 'body');
      const claimed = fixture.componentInstance._processDragMove(50, 16); // downward drag

      expect(claimed).toBe(true);
    });

    it('claims an upward drag on the body when not at the largest snap, regardless of scroll position', () => {
      fixture.componentInstance.snapTo(0); // smallest snap, not the largest
      fixture.componentInstance.bodyRef.nativeElement.scrollTop = 50;

      fixture.componentInstance._processDragStart(500, 'body');
      const claimed = fixture.componentInstance._processDragMove(450, 16); // upward drag

      expect(claimed).toBe(true);
    });

    it('wraps the claim-transition dragging signal write in NgZone.run() (regression test)', () => {
      const ngZone = TestBed.inject(NgZone);
      const runSpy = vi.spyOn(ngZone, 'run');

      // Smallest snap (not the largest) + an upward body drag: per
      // "claims an upward drag on the body when not at the largest snap" above, this claims
      // partway through _processDragMove - the exact branch the NgZone.run() wrapping guards.
      fixture.componentInstance.snapTo(0);
      fixture.componentInstance.bodyRef.nativeElement.scrollTop = 50;
      fixture.componentInstance._processDragStart(500, 'body');
      expect(fixture.componentInstance.dragging()).toBe(false); // not claimed yet
      runSpy.mockClear(); // ignore any NgZone.run() calls from setup above

      fixture.componentInstance._processDragMove(450, 16); // upward drag on the body - claims here

      expect(fixture.componentInstance.dragging()).toBe(true);
      expect(runSpy).toHaveBeenCalled();
    });

    describe('pointercancel (I5)', () => {
      it('reverts to the starting snap point instead of resolving via resolveDragEnd', () => {
        let dismissRequested = false;
        fixture.componentInstance._dismissRequested.subscribe(() => (dismissRequested = true));

        fixture.componentInstance._processDragStart(400, 'handle'); // starts at index 1 (translateY 400)
        // Drag far enough down and fast enough that, if this were a real release, it would
        // dismiss - but a cancel must revert instead of resolving through resolveDragEnd().
        fixture.componentInstance._processDragMove(900, 5);
        fixture.componentInstance._processDragCancel();

        expect(dismissRequested).toBe(false);
        expect(fixture.componentInstance.snapIndex()).toBe(1); // unchanged - reverted, not resolved

        const panel: HTMLElement = fixture.nativeElement.querySelector('.bottom-sheet-panel');
        expect(panel.style.transform).toBe('translateY(400px)'); // back to the resting position it started at
      });

      it('restores touch-action on the body after a cancel', () => {
        const body: HTMLElement = fixture.componentInstance.bodyRef.nativeElement;

        fixture.componentInstance._processDragStart(0, 'body');
        fixture.componentInstance._processDragMove(50, 16); // downward from top - claims
        expect(body.style.touchAction).toBe('none');

        fixture.componentInstance._processDragCancel();
        expect(body.style.touchAction).toBe('');
      });

      it('is a no-op if there was no active drag', () => {
        expect(() => fixture.componentInstance._processDragCancel()).not.toThrow();
      });
    });
  });
});
