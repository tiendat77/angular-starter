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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9hc3QucmVmLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi90b2FzdC5yZWYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFjLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQVMzQyx5RUFBeUU7QUFDekUsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBRXhDOztHQUVHO0FBQ0gsTUFBTSxPQUFPLFFBQVE7SUE4QlQ7SUE3QlYsd0VBQXdFO0lBQ3hFLFFBQVEsQ0FBSTtJQUVaOzs7T0FHRztJQUNILGlCQUFpQixDQUEwQjtJQUUzQyx3RUFBd0U7SUFDdkQsZUFBZSxHQUFHLElBQUksT0FBTyxFQUFnQixDQUFDO0lBRS9ELDZFQUE2RTtJQUM1RCxZQUFZLEdBQUcsSUFBSSxPQUFPLEVBQVEsQ0FBQztJQUVwRCx1RUFBdUU7SUFDdEQsU0FBUyxHQUFHLElBQUksT0FBTyxFQUFRLENBQUM7SUFFakQ7OztPQUdHO0lBQ0ssa0JBQWtCLENBQWU7SUFFekMsK0RBQStEO0lBQ3ZELGtCQUFrQixHQUFHLEtBQUssQ0FBQztJQUVuQyxZQUNFLGlCQUEwQyxFQUNsQyxXQUF1QjtRQUF2QixnQkFBVyxHQUFYLFdBQVcsQ0FBWTtRQUUvQixJQUFJLENBQUMsaUJBQWlCLEdBQUcsaUJBQWlCLENBQUM7UUFDM0MsaUJBQWlCLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBRUQsMkJBQTJCO0lBQzNCLE9BQU87UUFDTCxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNqQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDaEMsQ0FBQztRQUNELFlBQVksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBRUQsc0NBQXNDO0lBQ3RDLGlCQUFpQjtRQUNmLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzNCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUM7WUFDL0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN0QixJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzFCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNqQixDQUFDO1FBQ0QsWUFBWSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsZUFBZTtRQUNiLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQzNCLENBQUM7SUFFRCw4Q0FBOEM7SUFDOUMsYUFBYSxDQUFDLFFBQWdCO1FBQzVCLHFGQUFxRjtRQUNyRiwyRkFBMkY7UUFDM0YsSUFBSSxDQUFDLGtCQUFrQixHQUFHLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQztJQUM5RixDQUFDO0lBRUQsZ0NBQWdDO0lBQ2hDLEtBQUs7UUFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM5QixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDL0IsQ0FBQztJQUNILENBQUM7SUFFRCx1Q0FBdUM7SUFDL0IsY0FBYztRQUNwQixJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRTNCLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzNCLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDNUIsQ0FBQztRQUVELElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQztRQUMxRSxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2hDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxLQUFLLENBQUM7SUFDbEMsQ0FBQztJQUVELDhFQUE4RTtJQUM5RSxjQUFjO1FBQ1osT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDO0lBQzlCLENBQUM7SUFFRCxrRkFBa0Y7SUFDbEYsV0FBVztRQUNULE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQztJQUN6QyxDQUFDO0lBRUQsMkVBQTJFO0lBQzNFLFFBQVE7UUFDTixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDeEIsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgT3ZlcmxheVJlZiB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7IE9ic2VydmFibGUsIFN1YmplY3QgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IFRvYXN0Q29udGFpbmVyQ29tcG9uZW50IH0gZnJvbSAnLi90b2FzdC5jb250YWluZXInO1xuXG4vKiogRXZlbnQgdGhhdCBpcyBlbWl0dGVkIHdoZW4gYSB0b2FzdCBpcyBkaXNtaXNzZWQuICovXG5leHBvcnQgaW50ZXJmYWNlIFRvYXN0RGlzbWlzcyB7XG4gIC8qKiBXaGV0aGVyIHRoZSB0b2FzdCB3YXMgZGlzbWlzc2VkIHVzaW5nIHRoZSBhY3Rpb24gYnV0dG9uLiAqL1xuICBkaXNtaXNzZWRCeUFjdGlvbjogYm9vbGVhbjtcbn1cblxuLyoqIE1heGltdW0gYW1vdW50IG9mIG1pbGxpc2Vjb25kcyB0aGF0IGNhbiBiZSBwYXNzZWQgaW50byBzZXRUaW1lb3V0LiAqL1xuY29uc3QgTUFYX1RJTUVPVVQgPSBNYXRoLnBvdygyLCAzMSkgLSAxO1xuXG4vKipcbiAqIFJlZmVyZW5jZSB0byBhIHRvYXN0IGRpc3BhdGNoZWQgZnJvbSB0aGUgdG9hc3Qgc2VydmljZS5cbiAqL1xuZXhwb3J0IGNsYXNzIFRvYXN0UmVmPFQ+IHtcbiAgLyoqIFRoZSBpbnN0YW5jZSBvZiB0aGUgY29tcG9uZW50IG1ha2luZyB1cCB0aGUgY29udGVudCBvZiB0aGUgdG9hc3QuICovXG4gIGluc3RhbmNlOiBUO1xuXG4gIC8qKlxuICAgKiBUaGUgaW5zdGFuY2Ugb2YgdGhlIGNvbXBvbmVudCBtYWtpbmcgdXAgdGhlIGNvbnRlbnQgb2YgdGhlIHRvYXN0LlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICBjb250YWluZXJJbnN0YW5jZTogVG9hc3RDb250YWluZXJDb21wb25lbnQ7XG5cbiAgLyoqIFN1YmplY3QgZm9yIG5vdGlmeWluZyB0aGUgdXNlciB0aGF0IHRoZSB0b2FzdCBoYXMgYmVlbiBkaXNtaXNzZWQuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2FmdGVyRGlzbWlzc2VkID0gbmV3IFN1YmplY3Q8VG9hc3REaXNtaXNzPigpO1xuXG4gIC8qKiBTdWJqZWN0IGZvciBub3RpZnlpbmcgdGhlIHVzZXIgdGhhdCB0aGUgdG9hc3QgaGFzIG9wZW5lZCBhbmQgYXBwZWFyZWQuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2FmdGVyT3BlbmVkID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICAvKiogU3ViamVjdCBmb3Igbm90aWZ5aW5nIHRoZSB1c2VyIHRoYXQgdGhlIHRvYXN0IGFjdGlvbiB3YXMgY2FsbGVkLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9vbkFjdGlvbiA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgLyoqXG4gICAqIFRpbWVvdXQgSUQgZm9yIHRoZSBkdXJhdGlvbiBzZXRUaW1lb3V0IGNhbGwuIFVzZWQgdG8gY2xlYXIgdGhlIHRpbWVvdXQgaWYgdGhlIHRvYXN0IGlzXG4gICAqIGRpc21pc3NlZCBiZWZvcmUgdGhlIGR1cmF0aW9uIHBhc3Nlcy5cbiAgICovXG4gIHByaXZhdGUgX2R1cmF0aW9uVGltZW91dElkOiBudW1iZXIgfCBhbnk7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHRvYXN0IHdhcyBkaXNtaXNzZWQgdXNpbmcgdGhlIGFjdGlvbiBidXR0b24uICovXG4gIHByaXZhdGUgX2Rpc21pc3NlZEJ5QWN0aW9uID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgY29udGFpbmVySW5zdGFuY2U6IFRvYXN0Q29udGFpbmVyQ29tcG9uZW50LFxuICAgIHByaXZhdGUgX292ZXJsYXlSZWY6IE92ZXJsYXlSZWZcbiAgKSB7XG4gICAgdGhpcy5jb250YWluZXJJbnN0YW5jZSA9IGNvbnRhaW5lckluc3RhbmNlO1xuICAgIGNvbnRhaW5lckluc3RhbmNlLl9vbkV4aXQuc3Vic2NyaWJlKCgpID0+IHRoaXMuX2ZpbmlzaERpc21pc3MoKSk7XG4gIH1cblxuICAvKiogRGlzbWlzc2VzIHRoZSB0b2FzdC4gKi9cbiAgZGlzbWlzcygpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2FmdGVyRGlzbWlzc2VkLmNsb3NlZCkge1xuICAgICAgdGhpcy5jb250YWluZXJJbnN0YW5jZS5leGl0KCk7XG4gICAgfVxuICAgIGNsZWFyVGltZW91dCh0aGlzLl9kdXJhdGlvblRpbWVvdXRJZCk7XG4gIH1cblxuICAvKiogTWFya3MgdGhlIHRvYXN0IGFjdGlvbiBjbGlja2VkLiAqL1xuICBkaXNtaXNzV2l0aEFjdGlvbigpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX29uQWN0aW9uLmNsb3NlZCkge1xuICAgICAgdGhpcy5fZGlzbWlzc2VkQnlBY3Rpb24gPSB0cnVlO1xuICAgICAgdGhpcy5fb25BY3Rpb24ubmV4dCgpO1xuICAgICAgdGhpcy5fb25BY3Rpb24uY29tcGxldGUoKTtcbiAgICAgIHRoaXMuZGlzbWlzcygpO1xuICAgIH1cbiAgICBjbGVhclRpbWVvdXQodGhpcy5fZHVyYXRpb25UaW1lb3V0SWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1hcmtzIHRoZSB0b2FzdCBhY3Rpb24gY2xpY2tlZC5cbiAgICogQGRlcHJlY2F0ZWQgVXNlIGBkaXNtaXNzV2l0aEFjdGlvbmAgaW5zdGVhZC5cbiAgICogQGJyZWFraW5nLWNoYW5nZSA4LjAuMFxuICAgKi9cbiAgY2xvc2VXaXRoQWN0aW9uKCk6IHZvaWQge1xuICAgIHRoaXMuZGlzbWlzc1dpdGhBY3Rpb24oKTtcbiAgfVxuXG4gIC8qKiBEaXNtaXNzZXMgdGhlIHRvYXN0IGFmdGVyIHNvbWUgZHVyYXRpb24gKi9cbiAgX2Rpc21pc3NBZnRlcihkdXJhdGlvbjogbnVtYmVyKTogdm9pZCB7XG4gICAgLy8gTm90ZSB0aGF0IHdlIG5lZWQgdG8gY2FwIHRoZSBkdXJhdGlvbiB0byB0aGUgbWF4aW11bSB2YWx1ZSBmb3Igc2V0VGltZW91dCwgYmVjYXVzZVxuICAgIC8vIGl0J2xsIHJldmVydCB0byAxIGlmIHNvbWVib2R5IHBhc3NlcyBpbiBzb21ldGhpbmcgZ3JlYXRlciAoZS5nLiBgSW5maW5pdHlgKS4gU2VlICMxNzIzNC5cbiAgICB0aGlzLl9kdXJhdGlvblRpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT4gdGhpcy5kaXNtaXNzKCksIE1hdGgubWluKGR1cmF0aW9uLCBNQVhfVElNRU9VVCkpO1xuICB9XG5cbiAgLyoqIE1hcmtzIHRoZSB0b2FzdCBhcyBvcGVuZWQgKi9cbiAgX29wZW4oKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9hZnRlck9wZW5lZC5jbG9zZWQpIHtcbiAgICAgIHRoaXMuX2FmdGVyT3BlbmVkLm5leHQoKTtcbiAgICAgIHRoaXMuX2FmdGVyT3BlbmVkLmNvbXBsZXRlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIENsZWFucyB1cCB0aGUgRE9NIGFmdGVyIGNsb3NpbmcuICovXG4gIHByaXZhdGUgX2ZpbmlzaERpc21pc3MoKTogdm9pZCB7XG4gICAgdGhpcy5fb3ZlcmxheVJlZi5kaXNwb3NlKCk7XG5cbiAgICBpZiAoIXRoaXMuX29uQWN0aW9uLmNsb3NlZCkge1xuICAgICAgdGhpcy5fb25BY3Rpb24uY29tcGxldGUoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9hZnRlckRpc21pc3NlZC5uZXh0KHsgZGlzbWlzc2VkQnlBY3Rpb246IHRoaXMuX2Rpc21pc3NlZEJ5QWN0aW9uIH0pO1xuICAgIHRoaXMuX2FmdGVyRGlzbWlzc2VkLmNvbXBsZXRlKCk7XG4gICAgdGhpcy5fZGlzbWlzc2VkQnlBY3Rpb24gPSBmYWxzZTtcbiAgfVxuXG4gIC8qKiBHZXRzIGFuIG9ic2VydmFibGUgdGhhdCBpcyBub3RpZmllZCB3aGVuIHRoZSB0b2FzdCBpcyBmaW5pc2hlZCBjbG9zaW5nLiAqL1xuICBhZnRlckRpc21pc3NlZCgpOiBPYnNlcnZhYmxlPFRvYXN0RGlzbWlzcz4ge1xuICAgIHJldHVybiB0aGlzLl9hZnRlckRpc21pc3NlZDtcbiAgfVxuXG4gIC8qKiBHZXRzIGFuIG9ic2VydmFibGUgdGhhdCBpcyBub3RpZmllZCB3aGVuIHRoZSB0b2FzdCBoYXMgb3BlbmVkIGFuZCBhcHBlYXJlZC4gKi9cbiAgYWZ0ZXJPcGVuZWQoKTogT2JzZXJ2YWJsZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuY29udGFpbmVySW5zdGFuY2UuX29uRW50ZXI7XG4gIH1cblxuICAvKiogR2V0cyBhbiBvYnNlcnZhYmxlIHRoYXQgaXMgbm90aWZpZWQgd2hlbiB0aGUgdG9hc3QgYWN0aW9uIGlzIGNhbGxlZC4gKi9cbiAgb25BY3Rpb24oKTogT2JzZXJ2YWJsZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuX29uQWN0aW9uO1xuICB9XG59XG4iXX0=