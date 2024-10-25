/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { animate, state, style, transition, trigger, keyframes, } from '@angular/animations';
/**
 * Animations used by the Material datepicker.
 * @docs-private
 */
export const animations = {
    /** Transforms the height of the datepicker's calendar. */
    transformPanel: trigger('transformPanel', [
        transition('void => enter-dropdown', animate('120ms cubic-bezier(0, 0, 0.2, 1)', keyframes([
            style({ opacity: 0, transform: 'scale(1, 0.8)' }),
            style({ opacity: 1, transform: 'scale(1, 1)' }),
        ]))),
        transition('void => enter-dialog', animate('150ms cubic-bezier(0, 0, 0.2, 1)', keyframes([
            style({ opacity: 0, transform: 'scale(0.7)' }),
            style({ transform: 'none', opacity: 1 }),
        ]))),
        transition('* => void', animate('100ms linear', style({ opacity: 0 }))),
    ]),
    /** Fades in the content of the calendar. */
    fadeInCalendar: trigger('fadeInCalendar', [
        state('void', style({ opacity: 0 })),
        state('enter', style({ opacity: 1 })),
        transition('void => *', animate('120ms 100ms cubic-bezier(0.55, 0, 0.55, 0.2)')),
    ]),
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9saWIvdXRpbHMvYW5pbWF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQ0wsT0FBTyxFQUNQLEtBQUssRUFDTCxLQUFLLEVBQ0wsVUFBVSxFQUNWLE9BQU8sRUFDUCxTQUFTLEdBRVYsTUFBTSxxQkFBcUIsQ0FBQztBQUU3Qjs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSxVQUFVLEdBR25CO0lBQ0YsMERBQTBEO0lBQzFELGNBQWMsRUFBRSxPQUFPLENBQUMsZ0JBQWdCLEVBQUU7UUFDeEMsVUFBVSxDQUNSLHdCQUF3QixFQUN4QixPQUFPLENBQ0wsa0NBQWtDLEVBQ2xDLFNBQVMsQ0FBQztZQUNSLEtBQUssQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLGVBQWUsRUFBRSxDQUFDO1lBQ2pELEtBQUssQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxDQUFDO1NBQ2hELENBQUMsQ0FDSCxDQUNGO1FBQ0QsVUFBVSxDQUNSLHNCQUFzQixFQUN0QixPQUFPLENBQ0wsa0NBQWtDLEVBQ2xDLFNBQVMsQ0FBQztZQUNSLEtBQUssQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxDQUFDO1lBQzlDLEtBQUssQ0FBQyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDO1NBQ3pDLENBQUMsQ0FDSCxDQUNGO1FBQ0QsVUFBVSxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDeEUsQ0FBQztJQUVGLDRDQUE0QztJQUM1QyxjQUFjLEVBQUUsT0FBTyxDQUFDLGdCQUFnQixFQUFFO1FBQ3hDLEtBQUssQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDcEMsS0FBSyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNyQyxVQUFVLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDO0tBQ2pGLENBQUM7Q0FDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIGFuaW1hdGUsXG4gIHN0YXRlLFxuICBzdHlsZSxcbiAgdHJhbnNpdGlvbixcbiAgdHJpZ2dlcixcbiAga2V5ZnJhbWVzLFxuICBBbmltYXRpb25UcmlnZ2VyTWV0YWRhdGEsXG59IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuXG4vKipcbiAqIEFuaW1hdGlvbnMgdXNlZCBieSB0aGUgTWF0ZXJpYWwgZGF0ZXBpY2tlci5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuZXhwb3J0IGNvbnN0IGFuaW1hdGlvbnM6IHtcbiAgcmVhZG9ubHkgdHJhbnNmb3JtUGFuZWw6IEFuaW1hdGlvblRyaWdnZXJNZXRhZGF0YTtcbiAgcmVhZG9ubHkgZmFkZUluQ2FsZW5kYXI6IEFuaW1hdGlvblRyaWdnZXJNZXRhZGF0YTtcbn0gPSB7XG4gIC8qKiBUcmFuc2Zvcm1zIHRoZSBoZWlnaHQgb2YgdGhlIGRhdGVwaWNrZXIncyBjYWxlbmRhci4gKi9cbiAgdHJhbnNmb3JtUGFuZWw6IHRyaWdnZXIoJ3RyYW5zZm9ybVBhbmVsJywgW1xuICAgIHRyYW5zaXRpb24oXG4gICAgICAndm9pZCA9PiBlbnRlci1kcm9wZG93bicsXG4gICAgICBhbmltYXRlKFxuICAgICAgICAnMTIwbXMgY3ViaWMtYmV6aWVyKDAsIDAsIDAuMiwgMSknLFxuICAgICAgICBrZXlmcmFtZXMoW1xuICAgICAgICAgIHN0eWxlKHsgb3BhY2l0eTogMCwgdHJhbnNmb3JtOiAnc2NhbGUoMSwgMC44KScgfSksXG4gICAgICAgICAgc3R5bGUoeyBvcGFjaXR5OiAxLCB0cmFuc2Zvcm06ICdzY2FsZSgxLCAxKScgfSksXG4gICAgICAgIF0pXG4gICAgICApXG4gICAgKSxcbiAgICB0cmFuc2l0aW9uKFxuICAgICAgJ3ZvaWQgPT4gZW50ZXItZGlhbG9nJyxcbiAgICAgIGFuaW1hdGUoXG4gICAgICAgICcxNTBtcyBjdWJpYy1iZXppZXIoMCwgMCwgMC4yLCAxKScsXG4gICAgICAgIGtleWZyYW1lcyhbXG4gICAgICAgICAgc3R5bGUoeyBvcGFjaXR5OiAwLCB0cmFuc2Zvcm06ICdzY2FsZSgwLjcpJyB9KSxcbiAgICAgICAgICBzdHlsZSh7IHRyYW5zZm9ybTogJ25vbmUnLCBvcGFjaXR5OiAxIH0pLFxuICAgICAgICBdKVxuICAgICAgKVxuICAgICksXG4gICAgdHJhbnNpdGlvbignKiA9PiB2b2lkJywgYW5pbWF0ZSgnMTAwbXMgbGluZWFyJywgc3R5bGUoeyBvcGFjaXR5OiAwIH0pKSksXG4gIF0pLFxuXG4gIC8qKiBGYWRlcyBpbiB0aGUgY29udGVudCBvZiB0aGUgY2FsZW5kYXIuICovXG4gIGZhZGVJbkNhbGVuZGFyOiB0cmlnZ2VyKCdmYWRlSW5DYWxlbmRhcicsIFtcbiAgICBzdGF0ZSgndm9pZCcsIHN0eWxlKHsgb3BhY2l0eTogMCB9KSksXG4gICAgc3RhdGUoJ2VudGVyJywgc3R5bGUoeyBvcGFjaXR5OiAxIH0pKSxcbiAgICB0cmFuc2l0aW9uKCd2b2lkID0+IConLCBhbmltYXRlKCcxMjBtcyAxMDBtcyBjdWJpYy1iZXppZXIoMC41NSwgMCwgMC41NSwgMC4yKScpKSxcbiAgXSksXG59O1xuIl19