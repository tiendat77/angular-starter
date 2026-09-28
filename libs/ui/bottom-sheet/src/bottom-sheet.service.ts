import { ComponentType, Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { Injectable, Injector, OnDestroy, TemplateRef, inject } from '@angular/core';
import { filter } from 'rxjs';
import {
  BOTTOM_SHEET_DATA,
  BOTTOM_SHEET_DEFAULT_OPTIONS,
  UiBottomSheetConfig,
} from './bottom-sheet-config';
import { BottomSheetContainerComponent } from './bottom-sheet-container.component';
import { UiBottomSheetRef } from './bottom-sheet-ref';

@Injectable({ providedIn: 'root' })
export class UiBottomSheet implements OnDestroy {
  private readonly _overlay = inject(Overlay);
  private readonly _injector = inject(Injector);
  private readonly _defaultConfig = inject(BOTTOM_SHEET_DEFAULT_OPTIONS);

  private _openedRef: UiBottomSheetRef<unknown> | null = null;
  private _hiddenSiblings: HTMLElement[] = [];

  open<T, D = unknown, R = unknown>(
    componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
    config?: Partial<UiBottomSheetConfig<D>>
  ): UiBottomSheetRef<T, R> {
    const merged = {
      ...new UiBottomSheetConfig<D>(),
      ...this._defaultConfig,
      ...config,
    } as UiBottomSheetConfig<D>;

    return this._attach<T, D, R>(componentOrTemplateRef, merged);
  }

  /** Dismisses the currently open sheet, if any. */
  dismiss(result?: unknown): void {
    this._openedRef?.dismiss(result);
  }

  ngOnDestroy(): void {
    this._openedRef?.dismiss();
  }

  private _attach<T, D, R>(
    content: ComponentType<T> | TemplateRef<T>,
    config: UiBottomSheetConfig<D>
  ): UiBottomSheetRef<T, R> {
    const overlayRef = this._createOverlay(config);
    const container = this._attachContainer(overlayRef, config);
    const sheetRef = new UiBottomSheetRef<T, R>(container, overlayRef);

    if (content instanceof TemplateRef) {
      const portal = new TemplatePortal(content, null!, {
        $implicit: config.data,
        bottomSheetRef: sheetRef,
      } as never);
      sheetRef.instance = container.attachTemplatePortal(portal) as unknown as T;
    } else {
      const injector = this._createInjector(config, sheetRef);
      const portal = new ComponentPortal(content, undefined, injector);
      sheetRef.instance = container.attachComponentPortal<T>(portal).instance;
    }

    if (config.hasBackdrop) {
      overlayRef
        .backdropClick()
        .pipe(filter(() => !config.disableClose))
        .subscribe(() => sheetRef.dismiss());
    }
    overlayRef
      .keydownEvents()
      .pipe(filter((event) => event.key === 'Escape' && !config.disableClose))
      .subscribe(() => sheetRef.dismiss());
    container._dismissRequested.subscribe(() => sheetRef.dismiss());

    this._hideBackgroundFromAssistiveTechnology(overlayRef);

    sheetRef.afterDismissed().subscribe(() => {
      if (this._openedRef === (sheetRef as unknown as UiBottomSheetRef<unknown>)) {
        this._openedRef = null;
      }
      this._restoreBackgroundFromAssistiveTechnology();
    });

    const previous = this._openedRef;
    if (previous) {
      previous.afterDismissed().subscribe(() => container.enter());
      previous.dismiss();
    } else {
      container.enter();
    }

    this._openedRef = sheetRef as unknown as UiBottomSheetRef<unknown>;
    return sheetRef;
  }

  private _createOverlay(config: UiBottomSheetConfig): OverlayRef {
    const overlayConfig = new OverlayConfig({
      hasBackdrop: config.hasBackdrop,
      backdropClass: config.backdropClass,
      panelClass: config.panelClass,
      direction: config.direction,
      scrollStrategy: this._overlay.scrollStrategies.block(),
      // GlobalPositionStrategy only tracks a single horizontal anchor internally, so
      // `.left('0').right('0')` alone does NOT span both edges - the last call wins and the
      // pane shrinks to its content width, pinned to that single side (see the I4 finding).
      // `width: '100%'` on the OverlayConfig is what actually makes the pane flush-width: CDK's
      // `GlobalPositionStrategy.apply()` checks `config.width === '100%'` to decide whether to
      // go "flush horizontally" (justify-content: flex-start, margins zeroed), and separately
      // `OverlayRef._updateElementSize()` applies `config.width` straight to the pane's own
      // `style.width`.
      width: '100%',
      positionStrategy: this._overlay.position().global().left('0').right('0').bottom('0'),
    });
    return this._overlay.create(overlayConfig);
  }

  private _attachContainer(
    overlayRef: OverlayRef,
    config: UiBottomSheetConfig
  ): BottomSheetContainerComponent {
    const userInjector = config.viewContainerRef?.injector;
    const injector = Injector.create({
      parent: userInjector ?? this._injector,
      providers: [{ provide: UiBottomSheetConfig, useValue: config }],
    });
    const containerPortal = new ComponentPortal(
      BottomSheetContainerComponent,
      config.viewContainerRef,
      injector
    );
    return overlayRef.attach(containerPortal).instance;
  }

  private _createInjector<T, R>(
    config: UiBottomSheetConfig,
    sheetRef: UiBottomSheetRef<T, R>
  ): Injector {
    const userInjector = config.viewContainerRef?.injector;
    return Injector.create({
      parent: userInjector ?? this._injector,
      providers: [
        { provide: UiBottomSheetRef, useValue: sheetRef },
        { provide: BOTTOM_SHEET_DATA, useValue: config.data },
      ],
    });
  }

  /** Hides body content behind the overlay from assistive technology (raw Overlay has no built-in equivalent of @angular/cdk/dialog's Dialog service doing this). */
  private _hideBackgroundFromAssistiveTechnology(overlayRef: OverlayRef): void {
    const overlayContainerEl = overlayRef.hostElement.parentElement;
    const root = overlayContainerEl?.parentElement;
    if (!overlayContainerEl || !root) return;

    for (const sibling of Array.from(root.children) as HTMLElement[]) {
      if (sibling === overlayContainerEl || sibling.hasAttribute('aria-hidden')) continue;
      sibling.setAttribute('aria-hidden', 'true');
      this._hiddenSiblings.push(sibling);
    }
  }

  private _restoreBackgroundFromAssistiveTechnology(): void {
    if (this._openedRef) return; // another (replacement) sheet is still open
    for (const sibling of this._hiddenSiblings) {
      sibling.removeAttribute('aria-hidden');
    }
    this._hiddenSiblings = [];
  }
}
