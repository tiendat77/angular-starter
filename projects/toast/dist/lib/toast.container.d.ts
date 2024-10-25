import { ChangeDetectorRef, ComponentRef, EmbeddedViewRef, NgZone, OnDestroy } from '@angular/core';
import { BasePortalOutlet, CdkPortalOutlet, ComponentPortal, DomPortal, TemplatePortal } from '@angular/cdk/portal';
import { AnimationEvent } from '@angular/animations';
import { Observable, Subject } from 'rxjs';
import * as i0 from "@angular/core";
export declare class ToastContainerComponent extends BasePortalOutlet implements OnDestroy {
    private _ngZone;
    private _changeDetectorRef;
    /** Whether the component has been destroyed. */
    private _destroyed;
    /** The portal outlet inside of this container into which the toast content will be loaded. */
    _portalOutlet: CdkPortalOutlet;
    /** Subject for notifying that the toast has exited from view. */
    readonly _onExit: Subject<void>;
    /** Subject for notifying that the toast has finished entering the view. */
    readonly _onEnter: Subject<void>;
    /** The state of the toast animations. */
    _animationState: string;
    constructor(_ngZone: NgZone, _changeDetectorRef: ChangeDetectorRef);
    attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T>;
    attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C>;
    attachDomPortal: (portal: DomPortal) => void;
    onAnimationEnd(event: AnimationEvent): void;
    enter(): void;
    exit(): Observable<void>;
    ngOnDestroy(): void;
    private _completeExit;
    static ɵfac: i0.ɵɵFactoryDeclaration<ToastContainerComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ToastContainerComponent, "toast-container", never, {}, {}, never, never, true, never>;
}
