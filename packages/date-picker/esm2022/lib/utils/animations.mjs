/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
/**
 * Animations used by the Material datepicker.
 * @docs-private
 */
export const animations = {
  /** Transforms the height of the datepicker's calendar. */
  transformPanel: trigger('transformPanel', [
    transition(
      'void => enter-dropdown',
      animate(
        '120ms cubic-bezier(0, 0, 0.2, 1)',
        keyframes([
          style({ opacity: 0, transform: 'scale(1, 0.8)' }),
          style({ opacity: 1, transform: 'scale(1, 1)' }),
        ])
      )
    ),
    transition(
      'void => enter-dialog',
      animate(
        '150ms cubic-bezier(0, 0, 0.2, 1)',
        keyframes([
          style({ opacity: 0, transform: 'scale(0.7)' }),
          style({ transform: 'none', opacity: 1 }),
        ])
      )
    ),
    transition('* => void', animate('100ms linear', style({ opacity: 0 }))),
  ]),
  /** Fades in the content of the calendar. */
  fadeInCalendar: trigger('fadeInCalendar', [
    state('void', style({ opacity: 0 })),
    state('enter', style({ opacity: 1 })),
    transition('void => *', animate('120ms 100ms cubic-bezier(0.55, 0, 0.55, 0.2)')),
  ]),
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2xpYnMvZGF0ZS1waWNrZXIvc3JjL2xpYi91dGlscy9hbmltYXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCxPQUFPLEVBQ1AsS0FBSyxFQUNMLEtBQUssRUFDTCxVQUFVLEVBQ1YsT0FBTyxFQUNQLFNBQVMsR0FFVixNQUFNLHFCQUFxQixDQUFDO0FBRTdCOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLFVBQVUsR0FHbkI7SUFDRiwwREFBMEQ7SUFDMUQsY0FBYyxFQUFFLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRTtRQUN4QyxVQUFVLENBQ1Isd0JBQXdCLEVBQ3hCLE9BQU8sQ0FDTCxrQ0FBa0MsRUFDbEMsU0FBUyxDQUFDO1lBQ1IsS0FBSyxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsZUFBZSxFQUFFLENBQUM7WUFDakQsS0FBSyxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsYUFBYSxFQUFFLENBQUM7U0FDaEQsQ0FBQyxDQUNILENBQ0Y7UUFDRCxVQUFVLENBQ1Isc0JBQXNCLEVBQ3RCLE9BQU8sQ0FDTCxrQ0FBa0MsRUFDbEMsU0FBUyxDQUFDO1lBQ1IsS0FBSyxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLENBQUM7WUFDOUMsS0FBSyxDQUFDLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUM7U0FDekMsQ0FBQyxDQUNILENBQ0Y7UUFDRCxVQUFVLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxjQUFjLEVBQUUsS0FBSyxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUN4RSxDQUFDO0lBRUYsNENBQTRDO0lBQzVDLGNBQWMsRUFBRSxPQUFPLENBQUMsZ0JBQWdCLEVBQUU7UUFDeEMsS0FBSyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNwQyxLQUFLLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3JDLFVBQVUsQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLDhDQUE4QyxDQUFDLENBQUM7S0FDakYsQ0FBQztDQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgYW5pbWF0ZSxcbiAgc3RhdGUsXG4gIHN0eWxlLFxuICB0cmFuc2l0aW9uLFxuICB0cmlnZ2VyLFxuICBrZXlmcmFtZXMsXG4gIEFuaW1hdGlvblRyaWdnZXJNZXRhZGF0YSxcbn0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5cbi8qKlxuICogQW5pbWF0aW9ucyB1c2VkIGJ5IHRoZSBNYXRlcmlhbCBkYXRlcGlja2VyLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgY29uc3QgYW5pbWF0aW9uczoge1xuICByZWFkb25seSB0cmFuc2Zvcm1QYW5lbDogQW5pbWF0aW9uVHJpZ2dlck1ldGFkYXRhO1xuICByZWFkb25seSBmYWRlSW5DYWxlbmRhcjogQW5pbWF0aW9uVHJpZ2dlck1ldGFkYXRhO1xufSA9IHtcbiAgLyoqIFRyYW5zZm9ybXMgdGhlIGhlaWdodCBvZiB0aGUgZGF0ZXBpY2tlcidzIGNhbGVuZGFyLiAqL1xuICB0cmFuc2Zvcm1QYW5lbDogdHJpZ2dlcigndHJhbnNmb3JtUGFuZWwnLCBbXG4gICAgdHJhbnNpdGlvbihcbiAgICAgICd2b2lkID0+IGVudGVyLWRyb3Bkb3duJyxcbiAgICAgIGFuaW1hdGUoXG4gICAgICAgICcxMjBtcyBjdWJpYy1iZXppZXIoMCwgMCwgMC4yLCAxKScsXG4gICAgICAgIGtleWZyYW1lcyhbXG4gICAgICAgICAgc3R5bGUoeyBvcGFjaXR5OiAwLCB0cmFuc2Zvcm06ICdzY2FsZSgxLCAwLjgpJyB9KSxcbiAgICAgICAgICBzdHlsZSh7IG9wYWNpdHk6IDEsIHRyYW5zZm9ybTogJ3NjYWxlKDEsIDEpJyB9KSxcbiAgICAgICAgXSlcbiAgICAgIClcbiAgICApLFxuICAgIHRyYW5zaXRpb24oXG4gICAgICAndm9pZCA9PiBlbnRlci1kaWFsb2cnLFxuICAgICAgYW5pbWF0ZShcbiAgICAgICAgJzE1MG1zIGN1YmljLWJlemllcigwLCAwLCAwLjIsIDEpJyxcbiAgICAgICAga2V5ZnJhbWVzKFtcbiAgICAgICAgICBzdHlsZSh7IG9wYWNpdHk6IDAsIHRyYW5zZm9ybTogJ3NjYWxlKDAuNyknIH0pLFxuICAgICAgICAgIHN0eWxlKHsgdHJhbnNmb3JtOiAnbm9uZScsIG9wYWNpdHk6IDEgfSksXG4gICAgICAgIF0pXG4gICAgICApXG4gICAgKSxcbiAgICB0cmFuc2l0aW9uKCcqID0+IHZvaWQnLCBhbmltYXRlKCcxMDBtcyBsaW5lYXInLCBzdHlsZSh7IG9wYWNpdHk6IDAgfSkpKSxcbiAgXSksXG5cbiAgLyoqIEZhZGVzIGluIHRoZSBjb250ZW50IG9mIHRoZSBjYWxlbmRhci4gKi9cbiAgZmFkZUluQ2FsZW5kYXI6IHRyaWdnZXIoJ2ZhZGVJbkNhbGVuZGFyJywgW1xuICAgIHN0YXRlKCd2b2lkJywgc3R5bGUoeyBvcGFjaXR5OiAwIH0pKSxcbiAgICBzdGF0ZSgnZW50ZXInLCBzdHlsZSh7IG9wYWNpdHk6IDEgfSkpLFxuICAgIHRyYW5zaXRpb24oJ3ZvaWQgPT4gKicsIGFuaW1hdGUoJzEyMG1zIDEwMG1zIGN1YmljLWJlemllcigwLjU1LCAwLCAwLjU1LCAwLjIpJykpLFxuICBdKSxcbn07XG4iXX0=
