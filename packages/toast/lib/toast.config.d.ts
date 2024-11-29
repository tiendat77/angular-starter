import { Direction } from '@angular/cdk/bidi';
import { InjectionToken, ViewContainerRef } from '@angular/core';
export declare const TOAST_DATA: InjectionToken<any>;
export type ToastType = 'success' | 'error' | 'info' | 'warning';
export type ToastHorizontalPosition = 'start' | 'center' | 'end' | 'left' | 'right';
export type ToastVerticalPosition = 'top' | 'bottom';
export declare class ToastConfig<D = any> {
    /**
     * The view container that serves as the parent for the toast for the purposes of dependency
     * injection. Note: this does not affect where the toast is inserted in the DOM.
     */
    viewContainerRef?: ViewContainerRef;
    /** The length of time in milliseconds to wait before automatically dismissing the toast. */
    duration?: number;
    /** Text layout direction for the toast. */
    direction?: Direction;
    /** Data being injected into the child component. */
    data?: D | null;
    /** The horizontal position to place the toast. */
    horizontalPosition?: ToastHorizontalPosition;
    /** The vertical position to place the toast. */
    verticalPosition?: ToastVerticalPosition;
}
