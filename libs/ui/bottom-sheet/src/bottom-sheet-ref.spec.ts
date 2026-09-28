import { OverlayRef } from '@angular/cdk/overlay';
import { signal } from '@angular/core';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { BottomSheetContainerRef, UiBottomSheetRef } from './bottom-sheet-ref';

function createFakeContainer(): BottomSheetContainerRef & {
  triggerEnter: () => void;
  triggerExit: () => void;
  exit: ReturnType<typeof vi.fn>;
  snapTo: ReturnType<typeof vi.fn>;
} {
  const onEnter = new Subject<void>();
  const onExit = new Subject<void>();
  return {
    snapIndex: signal(0),
    _onEnter: onEnter,
    _onExit: onExit,
    exit: vi.fn(),
    snapTo: vi.fn(),
    triggerEnter: () => onEnter.next(),
    triggerExit: () => onExit.next(),
  } as unknown as BottomSheetContainerRef & {
    triggerEnter: () => void;
    triggerExit: () => void;
    exit: ReturnType<typeof vi.fn>;
    snapTo: ReturnType<typeof vi.fn>;
  };
}

function createFakeOverlayRef(): OverlayRef {
  return {
    dispose: vi.fn(),
    backdropClick: vi.fn(() => new Subject()),
    keydownEvents: vi.fn(() => new Subject()),
  } as unknown as OverlayRef;
}

describe('UiBottomSheetRef', () => {
  it('resolves afterDismissed() with the dismiss() result once the container finishes exiting', () => {
    const container = createFakeContainer();
    const overlayRef = createFakeOverlayRef();
    const ref = new UiBottomSheetRef<unknown, { ok: boolean }>(container, overlayRef);

    let resolved: { ok: boolean } | undefined;
    let completed = false;
    ref.afterDismissed().subscribe({
      next: (value) => (resolved = value),
      complete: () => (completed = true),
    });

    ref.dismiss({ ok: true });
    expect(container.exit).toHaveBeenCalledTimes(1);
    expect(resolved).toBeUndefined(); // not resolved until the container's _onExit fires

    container.triggerExit();
    expect(resolved).toEqual({ ok: true });
    expect(completed).toBe(true);
    expect(overlayRef.dispose).toHaveBeenCalledTimes(1);
  });

  it('resolves afterDismissed() with undefined when dismiss() is called with no result', () => {
    const container = createFakeContainer();
    const ref = new UiBottomSheetRef(container, createFakeOverlayRef());

    let resolved: unknown = 'not-yet';
    ref.afterDismissed().subscribe((value) => (resolved = value));

    ref.dismiss();
    container.triggerExit();

    expect(resolved).toBeUndefined();
  });

  it('does not call exit() a second time if dismiss() is called after it already resolved', () => {
    const container = createFakeContainer();
    const ref = new UiBottomSheetRef(container, createFakeOverlayRef());

    ref.dismiss();
    container.triggerExit();
    ref.dismiss();

    expect(container.exit).toHaveBeenCalledTimes(1);
  });

  it("afterOpened() proxies the container's _onEnter", () => {
    const container = createFakeContainer();
    const ref = new UiBottomSheetRef(container, createFakeOverlayRef());

    let opened = false;
    ref.afterOpened().subscribe(() => (opened = true));

    container.triggerEnter();
    expect(opened).toBe(true);
  });

  it('snapTo() delegates to the container and snapIndex reads through it', () => {
    const container = createFakeContainer();
    const ref = new UiBottomSheetRef(container, createFakeOverlayRef());

    ref.snapTo(2);
    expect(container.snapTo).toHaveBeenCalledWith(2);
    expect(ref.snapIndex).toBe(container.snapIndex);
  });
});
