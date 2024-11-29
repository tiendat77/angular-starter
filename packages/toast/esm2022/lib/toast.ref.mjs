import { Subject } from 'rxjs';
/** Maximum amount of milliseconds that can be passed into setTimeout. */
const MAX_TIMEOUT = Math.pow(2, 31) - 1;
/**
 * Reference to a toast dispatched from the toast service.
 */
export class ToastRef {
    _overlayRef;
    /** The instance of the component making up the content of the toast. */
    instance;
    /**
     * The instance of the component making up the content of the toast.
     * @docs-private
     */
    containerInstance;
    /** Subject for notifying the user that the toast has been dismissed. */
    _afterDismissed = new Subject();
    /** Subject for notifying the user that the toast has opened and appeared. */
    _afterOpened = new Subject();
    /** Subject for notifying the user that the toast action was called. */
    _onAction = new Subject();
    /**
     * Timeout ID for the duration setTimeout call. Used to clear the timeout if the toast is
     * dismissed before the duration passes.
     */
    _durationTimeoutId;
    /** Whether the toast was dismissed using the action button. */
    _dismissedByAction = false;
    constructor(containerInstance, _overlayRef) {
        this._overlayRef = _overlayRef;
        this.containerInstance = containerInstance;
        containerInstance._onExit.subscribe(() => this._finishDismiss());
    }
    /** Dismisses the toast. */
    dismiss() {
        if (!this._afterDismissed.closed) {
            this.containerInstance.exit();
        }
        clearTimeout(this._durationTimeoutId);
    }
    /** Marks the toast action clicked. */
    dismissWithAction() {
        if (!this._onAction.closed) {
            this._dismissedByAction = true;
            this._onAction.next();
            this._onAction.complete();
            this.dismiss();
        }
        clearTimeout(this._durationTimeoutId);
    }
    /**
     * Marks the toast action clicked.
     * @deprecated Use `dismissWithAction` instead.
     * @breaking-change 8.0.0
     */
    closeWithAction() {
        this.dismissWithAction();
    }
    /** Dismisses the toast after some duration */
    _dismissAfter(duration) {
        // Note that we need to cap the duration to the maximum value for setTimeout, because
        // it'll revert to 1 if somebody passes in something greater (e.g. `Infinity`). See #17234.
        this._durationTimeoutId = setTimeout(() => this.dismiss(), Math.min(duration, MAX_TIMEOUT));
    }
    /** Marks the toast as opened */
    _open() {
        if (!this._afterOpened.closed) {
            this._afterOpened.next();
            this._afterOpened.complete();
        }
    }
    /** Cleans up the DOM after closing. */
    _finishDismiss() {
        this._overlayRef.dispose();
        if (!this._onAction.closed) {
            this._onAction.complete();
        }
        this._afterDismissed.next({ dismissedByAction: this._dismissedByAction });
        this._afterDismissed.complete();
        this._dismissedByAction = false;
    }
    /** Gets an observable that is notified when the toast is finished closing. */
    afterDismissed() {
        return this._afterDismissed;
    }
    /** Gets an observable that is notified when the toast has opened and appeared. */
    afterOpened() {
        return this.containerInstance._onEnter;
    }
    /** Gets an observable that is notified when the toast action is called. */
    onAction() {
        return this._onAction;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9hc3QucmVmLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vbGlicy90b2FzdC9zcmMvbGliL3RvYXN0LnJlZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQWMsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBUzNDLHlFQUF5RTtBQUN6RSxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7QUFFeEM7O0dBRUc7QUFDSCxNQUFNLE9BQU8sUUFBUTtJQThCVDtJQTdCVix3RUFBd0U7SUFDeEUsUUFBUSxDQUFJO0lBRVo7OztPQUdHO0lBQ0gsaUJBQWlCLENBQTBCO0lBRTNDLHdFQUF3RTtJQUN2RCxlQUFlLEdBQUcsSUFBSSxPQUFPLEVBQWdCLENBQUM7SUFFL0QsNkVBQTZFO0lBQzVELFlBQVksR0FBRyxJQUFJLE9BQU8sRUFBUSxDQUFDO0lBRXBELHVFQUF1RTtJQUN0RCxTQUFTLEdBQUcsSUFBSSxPQUFPLEVBQVEsQ0FBQztJQUVqRDs7O09BR0c7SUFDSyxrQkFBa0IsQ0FBZTtJQUV6QywrREFBK0Q7SUFDdkQsa0JBQWtCLEdBQUcsS0FBSyxDQUFDO0lBRW5DLFlBQ0UsaUJBQTBDLEVBQ2xDLFdBQXVCO1FBQXZCLGdCQUFXLEdBQVgsV0FBVyxDQUFZO1FBRS9CLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQztRQUMzQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO0lBQ25FLENBQUM7SUFFRCwyQkFBMkI7SUFDM0IsT0FBTztRQUNMLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2pDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNoQyxDQUFDO1FBQ0QsWUFBWSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFFRCxzQ0FBc0M7SUFDdEMsaUJBQWlCO1FBQ2YsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDM0IsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQztZQUMvQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDMUIsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLENBQUM7UUFDRCxZQUFZLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxlQUFlO1FBQ2IsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDM0IsQ0FBQztJQUVELDhDQUE4QztJQUM5QyxhQUFhLENBQUMsUUFBZ0I7UUFDNUIscUZBQXFGO1FBQ3JGLDJGQUEyRjtRQUMzRixJQUFJLENBQUMsa0JBQWtCLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO0lBQzlGLENBQUM7SUFFRCxnQ0FBZ0M7SUFDaEMsS0FBSztRQUNILElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzlCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDekIsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUMvQixDQUFDO0lBQ0gsQ0FBQztJQUVELHVDQUF1QztJQUMvQixjQUFjO1FBQ3BCLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDM0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUM1QixDQUFDO1FBRUQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxpQkFBaUIsRUFBRSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO1FBQzFFLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDaEMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLEtBQUssQ0FBQztJQUNsQyxDQUFDO0lBRUQsOEVBQThFO0lBQzlFLGNBQWM7UUFDWixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUM7SUFDOUIsQ0FBQztJQUVELGtGQUFrRjtJQUNsRixXQUFXO1FBQ1QsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDO0lBQ3pDLENBQUM7SUFFRCwyRUFBMkU7SUFDM0UsUUFBUTtRQUNOLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUN4QixDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBPdmVybGF5UmVmIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgVG9hc3RDb250YWluZXJDb21wb25lbnQgfSBmcm9tICcuL3RvYXN0LmNvbnRhaW5lcic7XG5cbi8qKiBFdmVudCB0aGF0IGlzIGVtaXR0ZWQgd2hlbiBhIHRvYXN0IGlzIGRpc21pc3NlZC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVG9hc3REaXNtaXNzIHtcbiAgLyoqIFdoZXRoZXIgdGhlIHRvYXN0IHdhcyBkaXNtaXNzZWQgdXNpbmcgdGhlIGFjdGlvbiBidXR0b24uICovXG4gIGRpc21pc3NlZEJ5QWN0aW9uOiBib29sZWFuO1xufVxuXG4vKiogTWF4aW11bSBhbW91bnQgb2YgbWlsbGlzZWNvbmRzIHRoYXQgY2FuIGJlIHBhc3NlZCBpbnRvIHNldFRpbWVvdXQuICovXG5jb25zdCBNQVhfVElNRU9VVCA9IE1hdGgucG93KDIsIDMxKSAtIDE7XG5cbi8qKlxuICogUmVmZXJlbmNlIHRvIGEgdG9hc3QgZGlzcGF0Y2hlZCBmcm9tIHRoZSB0b2FzdCBzZXJ2aWNlLlxuICovXG5leHBvcnQgY2xhc3MgVG9hc3RSZWY8VD4ge1xuICAvKiogVGhlIGluc3RhbmNlIG9mIHRoZSBjb21wb25lbnQgbWFraW5nIHVwIHRoZSBjb250ZW50IG9mIHRoZSB0b2FzdC4gKi9cbiAgaW5zdGFuY2U6IFQ7XG5cbiAgLyoqXG4gICAqIFRoZSBpbnN0YW5jZSBvZiB0aGUgY29tcG9uZW50IG1ha2luZyB1cCB0aGUgY29udGVudCBvZiB0aGUgdG9hc3QuXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIGNvbnRhaW5lckluc3RhbmNlOiBUb2FzdENvbnRhaW5lckNvbXBvbmVudDtcblxuICAvKiogU3ViamVjdCBmb3Igbm90aWZ5aW5nIHRoZSB1c2VyIHRoYXQgdGhlIHRvYXN0IGhhcyBiZWVuIGRpc21pc3NlZC4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfYWZ0ZXJEaXNtaXNzZWQgPSBuZXcgU3ViamVjdDxUb2FzdERpc21pc3M+KCk7XG5cbiAgLyoqIFN1YmplY3QgZm9yIG5vdGlmeWluZyB0aGUgdXNlciB0aGF0IHRoZSB0b2FzdCBoYXMgb3BlbmVkIGFuZCBhcHBlYXJlZC4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfYWZ0ZXJPcGVuZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIC8qKiBTdWJqZWN0IGZvciBub3RpZnlpbmcgdGhlIHVzZXIgdGhhdCB0aGUgdG9hc3QgYWN0aW9uIHdhcyBjYWxsZWQuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX29uQWN0aW9uID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICAvKipcbiAgICogVGltZW91dCBJRCBmb3IgdGhlIGR1cmF0aW9uIHNldFRpbWVvdXQgY2FsbC4gVXNlZCB0byBjbGVhciB0aGUgdGltZW91dCBpZiB0aGUgdG9hc3QgaXNcbiAgICogZGlzbWlzc2VkIGJlZm9yZSB0aGUgZHVyYXRpb24gcGFzc2VzLlxuICAgKi9cbiAgcHJpdmF0ZSBfZHVyYXRpb25UaW1lb3V0SWQ6IG51bWJlciB8IGFueTtcblxuICAvKiogV2hldGhlciB0aGUgdG9hc3Qgd2FzIGRpc21pc3NlZCB1c2luZyB0aGUgYWN0aW9uIGJ1dHRvbi4gKi9cbiAgcHJpdmF0ZSBfZGlzbWlzc2VkQnlBY3Rpb24gPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBjb250YWluZXJJbnN0YW5jZTogVG9hc3RDb250YWluZXJDb21wb25lbnQsXG4gICAgcHJpdmF0ZSBfb3ZlcmxheVJlZjogT3ZlcmxheVJlZlxuICApIHtcbiAgICB0aGlzLmNvbnRhaW5lckluc3RhbmNlID0gY29udGFpbmVySW5zdGFuY2U7XG4gICAgY29udGFpbmVySW5zdGFuY2UuX29uRXhpdC5zdWJzY3JpYmUoKCkgPT4gdGhpcy5fZmluaXNoRGlzbWlzcygpKTtcbiAgfVxuXG4gIC8qKiBEaXNtaXNzZXMgdGhlIHRvYXN0LiAqL1xuICBkaXNtaXNzKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5fYWZ0ZXJEaXNtaXNzZWQuY2xvc2VkKSB7XG4gICAgICB0aGlzLmNvbnRhaW5lckluc3RhbmNlLmV4aXQoKTtcbiAgICB9XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX2R1cmF0aW9uVGltZW91dElkKTtcbiAgfVxuXG4gIC8qKiBNYXJrcyB0aGUgdG9hc3QgYWN0aW9uIGNsaWNrZWQuICovXG4gIGRpc21pc3NXaXRoQWN0aW9uKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5fb25BY3Rpb24uY2xvc2VkKSB7XG4gICAgICB0aGlzLl9kaXNtaXNzZWRCeUFjdGlvbiA9IHRydWU7XG4gICAgICB0aGlzLl9vbkFjdGlvbi5uZXh0KCk7XG4gICAgICB0aGlzLl9vbkFjdGlvbi5jb21wbGV0ZSgpO1xuICAgICAgdGhpcy5kaXNtaXNzKCk7XG4gICAgfVxuICAgIGNsZWFyVGltZW91dCh0aGlzLl9kdXJhdGlvblRpbWVvdXRJZCk7XG4gIH1cblxuICAvKipcbiAgICogTWFya3MgdGhlIHRvYXN0IGFjdGlvbiBjbGlja2VkLlxuICAgKiBAZGVwcmVjYXRlZCBVc2UgYGRpc21pc3NXaXRoQWN0aW9uYCBpbnN0ZWFkLlxuICAgKiBAYnJlYWtpbmctY2hhbmdlIDguMC4wXG4gICAqL1xuICBjbG9zZVdpdGhBY3Rpb24oKTogdm9pZCB7XG4gICAgdGhpcy5kaXNtaXNzV2l0aEFjdGlvbigpO1xuICB9XG5cbiAgLyoqIERpc21pc3NlcyB0aGUgdG9hc3QgYWZ0ZXIgc29tZSBkdXJhdGlvbiAqL1xuICBfZGlzbWlzc0FmdGVyKGR1cmF0aW9uOiBudW1iZXIpOiB2b2lkIHtcbiAgICAvLyBOb3RlIHRoYXQgd2UgbmVlZCB0byBjYXAgdGhlIGR1cmF0aW9uIHRvIHRoZSBtYXhpbXVtIHZhbHVlIGZvciBzZXRUaW1lb3V0LCBiZWNhdXNlXG4gICAgLy8gaXQnbGwgcmV2ZXJ0IHRvIDEgaWYgc29tZWJvZHkgcGFzc2VzIGluIHNvbWV0aGluZyBncmVhdGVyIChlLmcuIGBJbmZpbml0eWApLiBTZWUgIzE3MjM0LlxuICAgIHRoaXMuX2R1cmF0aW9uVGltZW91dElkID0gc2V0VGltZW91dCgoKSA9PiB0aGlzLmRpc21pc3MoKSwgTWF0aC5taW4oZHVyYXRpb24sIE1BWF9USU1FT1VUKSk7XG4gIH1cblxuICAvKiogTWFya3MgdGhlIHRvYXN0IGFzIG9wZW5lZCAqL1xuICBfb3BlbigpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2FmdGVyT3BlbmVkLmNsb3NlZCkge1xuICAgICAgdGhpcy5fYWZ0ZXJPcGVuZWQubmV4dCgpO1xuICAgICAgdGhpcy5fYWZ0ZXJPcGVuZWQuY29tcGxldGUoKTtcbiAgICB9XG4gIH1cblxuICAvKiogQ2xlYW5zIHVwIHRoZSBET00gYWZ0ZXIgY2xvc2luZy4gKi9cbiAgcHJpdmF0ZSBfZmluaXNoRGlzbWlzcygpOiB2b2lkIHtcbiAgICB0aGlzLl9vdmVybGF5UmVmLmRpc3Bvc2UoKTtcblxuICAgIGlmICghdGhpcy5fb25BY3Rpb24uY2xvc2VkKSB7XG4gICAgICB0aGlzLl9vbkFjdGlvbi5jb21wbGV0ZSgpO1xuICAgIH1cblxuICAgIHRoaXMuX2FmdGVyRGlzbWlzc2VkLm5leHQoeyBkaXNtaXNzZWRCeUFjdGlvbjogdGhpcy5fZGlzbWlzc2VkQnlBY3Rpb24gfSk7XG4gICAgdGhpcy5fYWZ0ZXJEaXNtaXNzZWQuY29tcGxldGUoKTtcbiAgICB0aGlzLl9kaXNtaXNzZWRCeUFjdGlvbiA9IGZhbHNlO1xuICB9XG5cbiAgLyoqIEdldHMgYW4gb2JzZXJ2YWJsZSB0aGF0IGlzIG5vdGlmaWVkIHdoZW4gdGhlIHRvYXN0IGlzIGZpbmlzaGVkIGNsb3NpbmcuICovXG4gIGFmdGVyRGlzbWlzc2VkKCk6IE9ic2VydmFibGU8VG9hc3REaXNtaXNzPiB7XG4gICAgcmV0dXJuIHRoaXMuX2FmdGVyRGlzbWlzc2VkO1xuICB9XG5cbiAgLyoqIEdldHMgYW4gb2JzZXJ2YWJsZSB0aGF0IGlzIG5vdGlmaWVkIHdoZW4gdGhlIHRvYXN0IGhhcyBvcGVuZWQgYW5kIGFwcGVhcmVkLiAqL1xuICBhZnRlck9wZW5lZCgpOiBPYnNlcnZhYmxlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5jb250YWluZXJJbnN0YW5jZS5fb25FbnRlcjtcbiAgfVxuXG4gIC8qKiBHZXRzIGFuIG9ic2VydmFibGUgdGhhdCBpcyBub3RpZmllZCB3aGVuIHRoZSB0b2FzdCBhY3Rpb24gaXMgY2FsbGVkLiAqL1xuICBvbkFjdGlvbigpOiBPYnNlcnZhYmxlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5fb25BY3Rpb247XG4gIH1cbn1cbiJdfQ==