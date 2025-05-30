import { InjectionToken } from '@angular/core';
export const TOAST_DATA = new InjectionToken('ToastData');
export class ToastConfig {
    /**
     * The view container that serves as the parent for the toast for the purposes of dependency
     * injection. Note: this does not affect where the toast is inserted in the DOM.
     */
    viewContainerRef;
    /** The length of time in milliseconds to wait before automatically dismissing the toast. */
    duration = 5000;
    /** Text layout direction for the toast. */
    direction;
    /** Data being injected into the child component. */
    data = null;
    /** The horizontal position to place the toast. */
    horizontalPosition = 'center';
    /** The vertical position to place the toast. */
    verticalPosition = 'top';
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9hc3QuY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vbGlicy90b2FzdC9zcmMvbGliL3RvYXN0LmNvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsY0FBYyxFQUFvQixNQUFNLGVBQWUsQ0FBQztBQUVqRSxNQUFNLENBQUMsTUFBTSxVQUFVLEdBQUcsSUFBSSxjQUFjLENBQU0sV0FBVyxDQUFDLENBQUM7QUFRL0QsTUFBTSxPQUFPLFdBQVc7SUFDdEI7OztPQUdHO0lBQ0gsZ0JBQWdCLENBQW9CO0lBRXBDLDRGQUE0RjtJQUM1RixRQUFRLEdBQVksSUFBSSxDQUFDO0lBRXpCLDJDQUEyQztJQUMzQyxTQUFTLENBQWE7SUFFdEIsb0RBQW9EO0lBQ3BELElBQUksR0FBYyxJQUFJLENBQUM7SUFFdkIsa0RBQWtEO0lBQ2xELGtCQUFrQixHQUE2QixRQUFRLENBQUM7SUFFeEQsZ0RBQWdEO0lBQ2hELGdCQUFnQixHQUEyQixLQUFLLENBQUM7Q0FDbEQiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3Rpb24gfSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQgeyBJbmplY3Rpb25Ub2tlbiwgVmlld0NvbnRhaW5lclJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5leHBvcnQgY29uc3QgVE9BU1RfREFUQSA9IG5ldyBJbmplY3Rpb25Ub2tlbjxhbnk+KCdUb2FzdERhdGEnKTtcblxuZXhwb3J0IHR5cGUgVG9hc3RUeXBlID0gJ3N1Y2Nlc3MnIHwgJ2Vycm9yJyB8ICdpbmZvJyB8ICd3YXJuaW5nJztcblxuZXhwb3J0IHR5cGUgVG9hc3RIb3Jpem9udGFsUG9zaXRpb24gPSAnc3RhcnQnIHwgJ2NlbnRlcicgfCAnZW5kJyB8ICdsZWZ0JyB8ICdyaWdodCc7XG5cbmV4cG9ydCB0eXBlIFRvYXN0VmVydGljYWxQb3NpdGlvbiA9ICd0b3AnIHwgJ2JvdHRvbSc7XG5cbmV4cG9ydCBjbGFzcyBUb2FzdENvbmZpZzxEID0gYW55PiB7XG4gIC8qKlxuICAgKiBUaGUgdmlldyBjb250YWluZXIgdGhhdCBzZXJ2ZXMgYXMgdGhlIHBhcmVudCBmb3IgdGhlIHRvYXN0IGZvciB0aGUgcHVycG9zZXMgb2YgZGVwZW5kZW5jeVxuICAgKiBpbmplY3Rpb24uIE5vdGU6IHRoaXMgZG9lcyBub3QgYWZmZWN0IHdoZXJlIHRoZSB0b2FzdCBpcyBpbnNlcnRlZCBpbiB0aGUgRE9NLlxuICAgKi9cbiAgdmlld0NvbnRhaW5lclJlZj86IFZpZXdDb250YWluZXJSZWY7XG5cbiAgLyoqIFRoZSBsZW5ndGggb2YgdGltZSBpbiBtaWxsaXNlY29uZHMgdG8gd2FpdCBiZWZvcmUgYXV0b21hdGljYWxseSBkaXNtaXNzaW5nIHRoZSB0b2FzdC4gKi9cbiAgZHVyYXRpb24/OiBudW1iZXIgPSA1MDAwO1xuXG4gIC8qKiBUZXh0IGxheW91dCBkaXJlY3Rpb24gZm9yIHRoZSB0b2FzdC4gKi9cbiAgZGlyZWN0aW9uPzogRGlyZWN0aW9uO1xuXG4gIC8qKiBEYXRhIGJlaW5nIGluamVjdGVkIGludG8gdGhlIGNoaWxkIGNvbXBvbmVudC4gKi9cbiAgZGF0YT86IEQgfCBudWxsID0gbnVsbDtcblxuICAvKiogVGhlIGhvcml6b250YWwgcG9zaXRpb24gdG8gcGxhY2UgdGhlIHRvYXN0LiAqL1xuICBob3Jpem9udGFsUG9zaXRpb24/OiBUb2FzdEhvcml6b250YWxQb3NpdGlvbiA9ICdjZW50ZXInO1xuXG4gIC8qKiBUaGUgdmVydGljYWwgcG9zaXRpb24gdG8gcGxhY2UgdGhlIHRvYXN0LiAqL1xuICB2ZXJ0aWNhbFBvc2l0aW9uPzogVG9hc3RWZXJ0aWNhbFBvc2l0aW9uID0gJ3RvcCc7XG59XG4iXX0=