import { animate, state, style, transition, trigger } from '@angular/animations';
import { AnimationCurves, AnimationDurations } from './defaults';
// -----------------------------------------------------------------------------------------------------
// @ Fade in
// -----------------------------------------------------------------------------------------------------
const fadeIn = trigger('fadeIn', [
    state('void', style({
        opacity: 0,
    })),
    state('*', style({
        opacity: 1,
    })),
    // Prevent the transition if the state is false
    transition('void => false', []),
    // Transition
    transition('void => *', animate('{{timings}}'), {
        params: {
            timings: `${AnimationDurations.entering} ${AnimationCurves.deceleration}`,
        },
    }),
]);
// -----------------------------------------------------------------------------------------------------
// @ Fade in top
// -----------------------------------------------------------------------------------------------------
const fadeInTop = trigger('fadeInTop', [
    state('void', style({
        opacity: 0,
        transform: 'translate3d(0, -100%, 0)',
    })),
    state('*', style({
        opacity: 1,
        transform: 'translate3d(0, 0, 0)',
    })),
    // Prevent the transition if the state is false
    transition('void => false', []),
    // Transition
    transition('void => *', animate('{{timings}}'), {
        params: {
            timings: `${AnimationDurations.entering} ${AnimationCurves.deceleration}`,
        },
    }),
]);
// -----------------------------------------------------------------------------------------------------
// @ Fade in bottom
// -----------------------------------------------------------------------------------------------------
const fadeInBottom = trigger('fadeInBottom', [
    state('void', style({
        opacity: 0,
        transform: 'translate3d(0, 100%, 0)',
    })),
    state('*', style({
        opacity: 1,
        transform: 'translate3d(0, 0, 0)',
    })),
    // Prevent the transition if the state is false
    transition('void => false', []),
    // Transition
    transition('void => *', animate('{{timings}}'), {
        params: {
            timings: `${AnimationDurations.entering} ${AnimationCurves.deceleration}`,
        },
    }),
]);
// -----------------------------------------------------------------------------------------------------
// @ Fade in left
// -----------------------------------------------------------------------------------------------------
const fadeInLeft = trigger('fadeInLeft', [
    state('void', style({
        opacity: 0,
        transform: 'translate3d(-100%, 0, 0)',
    })),
    state('*', style({
        opacity: 1,
        transform: 'translate3d(0, 0, 0)',
    })),
    // Prevent the transition if the state is false
    transition('void => false', []),
    // Transition
    transition('void => *', animate('{{timings}}'), {
        params: {
            timings: `${AnimationDurations.entering} ${AnimationCurves.deceleration}`,
        },
    }),
]);
// -----------------------------------------------------------------------------------------------------
// @ Fade in right
// -----------------------------------------------------------------------------------------------------
const fadeInRight = trigger('fadeInRight', [
    state('void', style({
        opacity: 0,
        transform: 'translate3d(100%, 0, 0)',
    })),
    state('*', style({
        opacity: 1,
        transform: 'translate3d(0, 0, 0)',
    })),
    // Prevent the transition if the state is false
    transition('void => false', []),
    // Transition
    transition('void => *', animate('{{timings}}'), {
        params: {
            timings: `${AnimationDurations.entering} ${AnimationCurves.deceleration}`,
        },
    }),
]);
// -----------------------------------------------------------------------------------------------------
// @ Fade out
// -----------------------------------------------------------------------------------------------------
const fadeOut = trigger('fadeOut', [
    state('*', style({
        opacity: 1,
    })),
    state('void', style({
        opacity: 0,
    })),
    // Prevent the transition if the state is false
    transition('false => void', []),
    // Transition
    transition('* => void', animate('{{timings}}'), {
        params: {
            timings: `${AnimationDurations.exiting} ${AnimationCurves.acceleration}`,
        },
    }),
]);
// -----------------------------------------------------------------------------------------------------
// @ Fade out top
// -----------------------------------------------------------------------------------------------------
const fadeOutTop = trigger('fadeOutTop', [
    state('*', style({
        opacity: 1,
        transform: 'translate3d(0, 0, 0)',
    })),
    state('void', style({
        opacity: 0,
        transform: 'translate3d(0, -100%, 0)',
    })),
    // Prevent the transition if the state is false
    transition('false => void', []),
    // Transition
    transition('* => void', animate('{{timings}}'), {
        params: {
            timings: `${AnimationDurations.exiting} ${AnimationCurves.acceleration}`,
        },
    }),
]);
// -----------------------------------------------------------------------------------------------------
// @ Fade out bottom
// -----------------------------------------------------------------------------------------------------
const fadeOutBottom = trigger('fadeOutBottom', [
    state('*', style({
        opacity: 1,
        transform: 'translate3d(0, 0, 0)',
    })),
    state('void', style({
        opacity: 0,
        transform: 'translate3d(0, 100%, 0)',
    })),
    // Prevent the transition if the state is false
    transition('false => void', []),
    // Transition
    transition('* => void', animate('{{timings}}'), {
        params: {
            timings: `${AnimationDurations.exiting} ${AnimationCurves.acceleration}`,
        },
    }),
]);
// -----------------------------------------------------------------------------------------------------
// @ Fade out left
// -----------------------------------------------------------------------------------------------------
const fadeOutLeft = trigger('fadeOutLeft', [
    state('*', style({
        opacity: 1,
        transform: 'translate3d(0, 0, 0)',
    })),
    state('void', style({
        opacity: 0,
        transform: 'translate3d(-100%, 0, 0)',
    })),
    // Prevent the transition if the state is false
    transition('false => void', []),
    // Transition
    transition('* => void', animate('{{timings}}'), {
        params: {
            timings: `${AnimationDurations.exiting} ${AnimationCurves.acceleration}`,
        },
    }),
]);
// -----------------------------------------------------------------------------------------------------
// @ Fade out right
// -----------------------------------------------------------------------------------------------------
const fadeOutRight = trigger('fadeOutRight', [
    state('*', style({
        opacity: 1,
        transform: 'translate3d(0, 0, 0)',
    })),
    state('void', style({
        opacity: 0,
        transform: 'translate3d(100%, 0, 0)',
    })),
    // Prevent the transition if the state is false
    transition('false => void', []),
    // Transition
    transition('* => void', animate('{{timings}}'), {
        params: {
            timings: `${AnimationDurations.exiting} ${AnimationCurves.acceleration}`,
        },
    }),
]);
export { fadeIn, fadeInTop, fadeInBottom, fadeInLeft, fadeInRight, fadeOut, fadeOutTop, fadeOutBottom, fadeOutLeft, fadeOutRight, };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFkZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9saWIvYW5pbWF0aW9ucy9mYWRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDakYsT0FBTyxFQUFFLGVBQWUsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUVqRSx3R0FBd0c7QUFDeEcsWUFBWTtBQUNaLHdHQUF3RztBQUN4RyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxFQUFFO0lBQy9CLEtBQUssQ0FDSCxNQUFNLEVBQ04sS0FBSyxDQUFDO1FBQ0osT0FBTyxFQUFFLENBQUM7S0FDWCxDQUFDLENBQ0g7SUFFRCxLQUFLLENBQ0gsR0FBRyxFQUNILEtBQUssQ0FBQztRQUNKLE9BQU8sRUFBRSxDQUFDO0tBQ1gsQ0FBQyxDQUNIO0lBRUQsK0NBQStDO0lBQy9DLFVBQVUsQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDO0lBRS9CLGFBQWE7SUFDYixVQUFVLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxhQUFhLENBQUMsRUFBRTtRQUM5QyxNQUFNLEVBQUU7WUFDTixPQUFPLEVBQUUsR0FBRyxrQkFBa0IsQ0FBQyxRQUFRLElBQUksZUFBZSxDQUFDLFlBQVksRUFBRTtTQUMxRTtLQUNGLENBQUM7Q0FDSCxDQUFDLENBQUM7QUFFSCx3R0FBd0c7QUFDeEcsZ0JBQWdCO0FBQ2hCLHdHQUF3RztBQUN4RyxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsV0FBVyxFQUFFO0lBQ3JDLEtBQUssQ0FDSCxNQUFNLEVBQ04sS0FBSyxDQUFDO1FBQ0osT0FBTyxFQUFFLENBQUM7UUFDVixTQUFTLEVBQUUsMEJBQTBCO0tBQ3RDLENBQUMsQ0FDSDtJQUVELEtBQUssQ0FDSCxHQUFHLEVBQ0gsS0FBSyxDQUFD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O0NBQ0gsQ0FBQyxDQUFDO0FBRUgsd0dBQXdHO0FBQ3hHLG1CQUFtQjtBQUNuQix3R0FBd0c7QUFDeEcsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLGNBQWMsRUFBRTtJQUMzQyxLQUFLLENBQ0gsR0FBRyxFQUNILEtBQUssQ0FBQztRQUNKLE9BQU8sRUFBRSxDQUFDO1FBQ1YsU0FBUyxFQUFFLHNCQUFzQjtLQUNsQyxDQUFDLENBQ0g7SUFFRCxLQUFLLENBQ0gsTUFBTSxFQUNOLEtBQUssQ0FBQztRQUNKLE9BQU8sRUFBRSxDQUFDO1FBQ1YsU0FBUyxFQUFFLHlCQUF5QjtLQUNyQyxDQUFDLENBQ0g7SUFFRCwrQ0FBK0M7SUFDL0MsVUFBVSxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUM7SUFFL0IsYUFBYTtJQUNiLFVBQVUsQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLGFBQWEsQ0FBQyxFQUFFO1FBQzlDLE1BQU0sRUFBRTtZQUNOLE9BQU8sRUFBRSxHQUFHLGtCQUFrQixDQUFDLE9BQU8sSUFBSSxlQUFlLENBQUMsWUFBWSxFQUFFO1NBQ3pFO0tBQ0YsQ0FBQztDQUNILENBQUMsQ0FBQztBQUVILE9BQU8sRUFDTCxNQUFNLEVBQ04sU0FBUyxFQUNULFlBQVksRUFDWixVQUFVLEVBQ1YsV0FBVyxFQUNYLE9BQU8sRUFDUCxVQUFVLEVBQ1YsYUFBYSxFQUNiLFdBQVcsRUFDWCxZQUFZLEdBQ2IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGFuaW1hdGUsIHN0YXRlLCBzdHlsZSwgdHJhbnNpdGlvbiwgdHJpZ2dlciB9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuaW1wb3J0IHsgQW5pbWF0aW9uQ3VydmVzLCBBbmltYXRpb25EdXJhdGlvbnMgfSBmcm9tICcuL2RlZmF1bHRzJztcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEAgRmFkZSBpblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNvbnN0IGZhZGVJbiA9IHRyaWdnZXIoJ2ZhZGVJbicsIFtcbiAgc3RhdGUoXG4gICAgJ3ZvaWQnLFxuICAgIHN0eWxlKHtcbiAgICAgIG9wYWNpdHk6IDAsXG4gICAgfSlcbiAgKSxcblxuICBzdGF0ZShcbiAgICAnKicsXG4gICAgc3R5bGUoe1xuICAgICAgb3BhY2l0eTogMSxcbiAgICB9KVxuICApLFxuXG4gIC8vIFByZXZlbnQgdGhlIHRyYW5zaXRpb24gaWYgdGhlIHN0YXRlIGlzIGZhbHNlXG4gIHRyYW5zaXRpb24oJ3ZvaWQgPT4gZmFsc2UnLCBbXSksXG5cbiAgLy8gVHJhbnNpdGlvblxuICB0cmFuc2l0aW9uKCd2b2lkID0+IConLCBhbmltYXRlKCd7e3RpbWluZ3N9fScpLCB7XG4gICAgcGFyYW1zOiB7XG4gICAgICB0aW1pbmdzOiBgJHtBbmltYXRpb25EdXJhdGlvbnMuZW50ZXJpbmd9ICR7QW5pbWF0aW9uQ3VydmVzLmRlY2VsZXJhdGlvbn1gLFxuICAgIH0sXG4gIH0pLFxuXSk7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBAIEZhZGUgaW4gdG9wXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY29uc3QgZmFkZUluVG9wID0gdHJpZ2dlcignZmFkZUluVG9wJywgW1xuICBzdGF0ZShcbiAgICAndm9pZCcsXG4gICAgc3R5bGUoe1xuICAgICAgb3BhY2l0eTogMCxcbiAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZTNkKDAsIC0xMDAlLCAwKScsXG4gICAgfSlcbiAgKSxcblxuICBzdGF0ZShcbiAgICAnKicsXG4gICAgc3R5bGUoe1xuICAgICAgb3BhY2l0eTogMSxcbiAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZTNkKDAsIDAsIDApJyxcbiAgICB9KVxuICApLFxuXG4gIC8vIFByZXZlbnQgdGhlIHRyYW5zaXRpb24gaWYgdGhlIHN0YXRlIGlzIGZhbHNlXG4gIHRyYW5zaXRpb24oJ3ZvaWQgPT4gZmFsc2UnLCBbXSksXG5cbiAgLy8gVHJhbnNpdGlvblxuICB0cmFuc2l0aW9uKCd2b2lkID0+IConLCBhbmltYXRlKCd7e3RpbWluZ3N9fScpLCB7XG4gICAgcGFyYW1zOiB7XG4gICAgICB0aW1pbmdzOiBgJHtBbmltYXRpb25EdXJhdGlvbnMuZW50ZXJpbmd9ICR7QW5pbWF0aW9uQ3VydmVzLmRlY2VsZXJhdGlvbn1gLFxuICAgIH0sXG4gIH0pLFxuXSk7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBAIEZhZGUgaW4gYm90dG9tXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY29uc3QgZmFkZUluQm90dG9tID0gdHJpZ2dlcignZmFkZUluQm90dG9tJywgW1xuICBzdGF0ZShcbiAgICAndm9pZCcsXG4gICAgc3R5bGUoe1xuICAgICAgb3BhY2l0eTogMCxcbiAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZTNkKDAsIDEwMCUsIDApJyxcbiAgICB9KVxuICApLFxuXG4gIHN0YXRlKFxuICAgICcqJyxcbiAgICBzdHlsZSh7XG4gICAgICBvcGFjaXR5OiAxLFxuICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlM2QoMCwgMCwgMCknLFxuICAgIH0pXG4gICksXG5cbiAgLy8gUHJldmVudCB0aGUgdHJhbnNpdGlvbiBpZiB0aGUgc3RhdGUgaXMgZmFsc2VcbiAgdHJhbnNpdGlvbigndm9pZCA9PiBmYWxzZScsIFtdKSxcblxuICAvLyBUcmFuc2l0aW9uXG4gIHRyYW5zaXRpb24oJ3ZvaWQgPT4gKicsIGFuaW1hdGUoJ3t7dGltaW5nc319JyksIHtcbiAgICBwYXJhbXM6IHtcbiAgICAgIHRpbWluZ3M6IGAke0FuaW1hdGlvbkR1cmF0aW9ucy5lbnRlcmluZ30gJHtBbmltYXRpb25DdXJ2ZXMuZGVjZWxlcmF0aW9ufWAsXG4gICAgfSxcbiAgfSksXG5dKTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEAgRmFkZSBpbiBsZWZ0XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY29uc3QgZmFkZUluTGVmdCA9IHRyaWdnZXIoJ2ZhZGVJbkxlZnQnLCBbXG4gIHN0YXRlKFxuICAgICd2b2lkJyxcbiAgICBzdHlsZSh7XG4gICAgICBvcGFjaXR5OiAwLFxuICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlM2QoLTEwMCUsIDAsIDApJyxcbiAgICB9KVxuICApLFxuXG4gIHN0YXRlKFxuICAgICcqJyxcbiAgICBzdHlsZSh7XG4gICAgICBvcGFjaXR5OiAxLFxuICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlM2QoMCwgMCwgMCknLFxuICAgIH0pXG4gICksXG5cbiAgLy8gUHJldmVudCB0aGUgdHJhbnNpdGlvbiBpZiB0aGUgc3RhdGUgaXMgZmFsc2VcbiAgdHJhbnNpdGlvbigndm9pZCA9PiBmYWxzZScsIFtdKSxcblxuICAvLyBUcmFuc2l0aW9uXG4gIHRyYW5zaXRpb24oJ3ZvaWQgPT4gKicsIGFuaW1hdGUoJ3t7dGltaW5nc319JyksIHtcbiAgICBwYXJhbXM6IHtcbiAgICAgIHRpbWluZ3M6IGAke0FuaW1hdGlvbkR1cmF0aW9ucy5lbnRlcmluZ30gJHtBbmltYXRpb25DdXJ2ZXMuZGVjZWxlcmF0aW9ufWAsXG4gICAgfSxcbiAgfSksXG5dKTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEAgRmFkZSBpbiByaWdodFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNvbnN0IGZhZGVJblJpZ2h0ID0gdHJpZ2dlcignZmFkZUluUmlnaHQnLCBbXG4gIHN0YXRlKFxuICAgICd2b2lkJyxcbiAgICBzdHlsZSh7XG4gICAgICBvcGFjaXR5OiAwLFxuICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlM2QoMTAwJSwgMCwgMCknLFxuICAgIH0pXG4gICksXG5cbiAgc3RhdGUoXG4gICAgJyonLFxuICAgIHN0eWxlKHtcbiAgICAgIG9wYWNpdHk6IDEsXG4gICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUzZCgwLCAwLCAwKScsXG4gICAgfSlcbiAgKSxcblxuICAvLyBQcmV2ZW50IHRoZSB0cmFuc2l0aW9uIGlmIHRoZSBzdGF0ZSBpcyBmYWxzZVxuICB0cmFuc2l0aW9uKCd2b2lkID0+IGZhbHNlJywgW10pLFxuXG4gIC8vIFRyYW5zaXRpb25cbiAgdHJhbnNpdGlvbigndm9pZCA9PiAqJywgYW5pbWF0ZSgne3t0aW1pbmdzfX0nKSwge1xuICAgIHBhcmFtczoge1xuICAgICAgdGltaW5nczogYCR7QW5pbWF0aW9uRHVyYXRpb25zLmVudGVyaW5nfSAke0FuaW1hdGlvbkN1cnZlcy5kZWNlbGVyYXRpb259YCxcbiAgICB9LFxuICB9KSxcbl0pO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQCBGYWRlIG91dFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNvbnN0IGZhZGVPdXQgPSB0cmlnZ2VyKCdmYWRlT3V0JywgW1xuICBzdGF0ZShcbiAgICAnKicsXG4gICAgc3R5bGUoe1xuICAgICAgb3BhY2l0eTogMSxcbiAgICB9KVxuICApLFxuXG4gIHN0YXRlKFxuICAgICd2b2lkJyxcbiAgICBzdHlsZSh7XG4gICAgICBvcGFjaXR5OiAwLFxuICAgIH0pXG4gICksXG5cbiAgLy8gUHJldmVudCB0aGUgdHJhbnNpdGlvbiBpZiB0aGUgc3RhdGUgaXMgZmFsc2VcbiAgdHJhbnNpdGlvbignZmFsc2UgPT4gdm9pZCcsIFtdKSxcblxuICAvLyBUcmFuc2l0aW9uXG4gIHRyYW5zaXRpb24oJyogPT4gdm9pZCcsIGFuaW1hdGUoJ3t7dGltaW5nc319JyksIHtcbiAgICBwYXJhbXM6IHtcbiAgICAgIHRpbWluZ3M6IGAke0FuaW1hdGlvbkR1cmF0aW9ucy5leGl0aW5nfSAke0FuaW1hdGlvbkN1cnZlcy5hY2NlbGVyYXRpb259YCxcbiAgICB9LFxuICB9KSxcbl0pO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQCBGYWRlIG91dCB0b3Bcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jb25zdCBmYWRlT3V0VG9wID0gdHJpZ2dlcignZmFkZU91dFRvcCcsIFtcbiAgc3RhdGUoXG4gICAgJyonLFxuICAgIHN0eWxlKHtcbiAgICAgIG9wYWNpdHk6IDEsXG4gICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUzZCgwLCAwLCAwKScsXG4gICAgfSlcbiAgKSxcblxuICBzdGF0ZShcbiAgICAndm9pZCcsXG4gICAgc3R5bGUoe1xuICAgICAgb3BhY2l0eTogMCxcbiAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZTNkKDAsIC0xMDAlLCAwKScsXG4gICAgfSlcbiAgKSxcblxuICAvLyBQcmV2ZW50IHRoZSB0cmFuc2l0aW9uIGlmIHRoZSBzdGF0ZSBpcyBmYWxzZVxuICB0cmFuc2l0aW9uKCdmYWxzZSA9PiB2b2lkJywgW10pLFxuXG4gIC8vIFRyYW5zaXRpb25cbiAgdHJhbnNpdGlvbignKiA9PiB2b2lkJywgYW5pbWF0ZSgne3t0aW1pbmdzfX0nKSwge1xuICAgIHBhcmFtczoge1xuICAgICAgdGltaW5nczogYCR7QW5pbWF0aW9uRHVyYXRpb25zLmV4aXRpbmd9ICR7QW5pbWF0aW9uQ3VydmVzLmFjY2VsZXJhdGlvbn1gLFxuICAgIH0sXG4gIH0pLFxuXSk7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBAIEZhZGUgb3V0IGJvdHRvbVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNvbnN0IGZhZGVPdXRCb3R0b20gPSB0cmlnZ2VyKCdmYWRlT3V0Qm90dG9tJywgW1xuICBzdGF0ZShcbiAgICAnKicsXG4gICAgc3R5bGUoe1xuICAgICAgb3BhY2l0eTogMSxcbiAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZTNkKDAsIDAsIDApJyxcbiAgICB9KVxuICApLFxuXG4gIHN0YXRlKFxuICAgICd2b2lkJyxcbiAgICBzdHlsZSh7XG4gICAgICBvcGFjaXR5OiAwLFxuICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlM2QoMCwgMTAwJSwgMCknLFxuICAgIH0pXG4gICksXG5cbiAgLy8gUHJldmVudCB0aGUgdHJhbnNpdGlvbiBpZiB0aGUgc3RhdGUgaXMgZmFsc2VcbiAgdHJhbnNpdGlvbignZmFsc2UgPT4gdm9pZCcsIFtdKSxcblxuICAvLyBUcmFuc2l0aW9uXG4gIHRyYW5zaXRpb24oJyogPT4gdm9pZCcsIGFuaW1hdGUoJ3t7dGltaW5nc319JyksIHtcbiAgICBwYXJhbXM6IHtcbiAgICAgIHRpbWluZ3M6IGAke0FuaW1hdGlvbkR1cmF0aW9ucy5leGl0aW5nfSAke0FuaW1hdGlvbkN1cnZlcy5hY2NlbGVyYXRpb259YCxcbiAgICB9LFxuICB9KSxcbl0pO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQCBGYWRlIG91dCBsZWZ0XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY29uc3QgZmFkZU91dExlZnQgPSB0cmlnZ2VyKCdmYWRlT3V0TGVmdCcsIFtcbiAgc3RhdGUoXG4gICAgJyonLFxuICAgIHN0eWxlKHtcbiAgICAgIG9wYWNpdHk6IDEsXG4gICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUzZCgwLCAwLCAwKScsXG4gICAgfSlcbiAgKSxcblxuICBzdGF0ZShcbiAgICAndm9pZCcsXG4gICAgc3R5bGUoe1xuICAgICAgb3BhY2l0eTogMCxcbiAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZTNkKC0xMDAlLCAwLCAwKScsXG4gICAgfSlcbiAgKSxcblxuICAvLyBQcmV2ZW50IHRoZSB0cmFuc2l0aW9uIGlmIHRoZSBzdGF0ZSBpcyBmYWxzZVxuICB0cmFuc2l0aW9uKCdmYWxzZSA9PiB2b2lkJywgW10pLFxuXG4gIC8vIFRyYW5zaXRpb25cbiAgdHJhbnNpdGlvbignKiA9PiB2b2lkJywgYW5pbWF0ZSgne3t0aW1pbmdzfX0nKSwge1xuICAgIHBhcmFtczoge1xuICAgICAgdGltaW5nczogYCR7QW5pbWF0aW9uRHVyYXRpb25zLmV4aXRpbmd9ICR7QW5pbWF0aW9uQ3VydmVzLmFjY2VsZXJhdGlvbn1gLFxuICAgIH0sXG4gIH0pLFxuXSk7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBAIEZhZGUgb3V0IHJpZ2h0XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY29uc3QgZmFkZU91dFJpZ2h0ID0gdHJpZ2dlcignZmFkZU91dFJpZ2h0JywgW1xuICBzdGF0ZShcbiAgICAnKicsXG4gICAgc3R5bGUoe1xuICAgICAgb3BhY2l0eTogMSxcbiAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZTNkKDAsIDAsIDApJyxcbiAgICB9KVxuICApLFxuXG4gIHN0YXRlKFxuICAgICd2b2lkJyxcbiAgICBzdHlsZSh7XG4gICAgICBvcGFjaXR5OiAwLFxuICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlM2QoMTAwJSwgMCwgMCknLFxuICAgIH0pXG4gICksXG5cbiAgLy8gUHJldmVudCB0aGUgdHJhbnNpdGlvbiBpZiB0aGUgc3RhdGUgaXMgZmFsc2VcbiAgdHJhbnNpdGlvbignZmFsc2UgPT4gdm9pZCcsIFtdKSxcblxuICAvLyBUcmFuc2l0aW9uXG4gIHRyYW5zaXRpb24oJyogPT4gdm9pZCcsIGFuaW1hdGUoJ3t7dGltaW5nc319JyksIHtcbiAgICBwYXJhbXM6IHtcbiAgICAgIHRpbWluZ3M6IGAke0FuaW1hdGlvbkR1cmF0aW9ucy5leGl0aW5nfSAke0FuaW1hdGlvbkN1cnZlcy5hY2NlbGVyYXRpb259YCxcbiAgICB9LFxuICB9KSxcbl0pO1xuXG5leHBvcnQge1xuICBmYWRlSW4sXG4gIGZhZGVJblRvcCxcbiAgZmFkZUluQm90dG9tLFxuICBmYWRlSW5MZWZ0LFxuICBmYWRlSW5SaWdodCxcbiAgZmFkZU91dCxcbiAgZmFkZU91dFRvcCxcbiAgZmFkZU91dEJvdHRvbSxcbiAgZmFkZU91dExlZnQsXG4gIGZhZGVPdXRSaWdodCxcbn07XG4iXX0=