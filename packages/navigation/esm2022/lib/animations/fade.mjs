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
export { fadeIn, fadeInBottom, fadeInLeft, fadeInRight, fadeInTop, fadeOut, fadeOutBottom, fadeOutLeft, fadeOutRight, fadeOutTop, };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFkZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2xpYnMvbmF2aWdhdGlvbi9zcmMvbGliL2FuaW1hdGlvbnMvZmFkZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ2pGLE9BQU8sRUFBRSxlQUFlLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFakUsd0dBQXdHO0FBQ3hHLFlBQVk7QUFDWix3R0FBd0c7QUFDeEcsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsRUFBRTtJQUMvQixLQUFLLENBQ0gsTUFBTSxFQUNOLEtBQUssQ0FBQztRQUNKLE9BQU8sRUFBRSxDQUFDO0tBQ1gsQ0FBQyxDQUNIO0lBRUQsS0FBSyxDQUNILEdBQUcsRUFDSCxLQUFLLENBQUM7UUFDSixPQUFPLEVBQUUsQ0FBQztLQUNYLENBQUMsQ0FDSDtJQUVELCtDQUErQztJQUMvQyxVQUFVLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQztJQUUvQixhQUFhO0lBQ2IsVUFBVSxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsYUFBYSxDQUFDLEVBQUU7UUFDOUMsTUFBTSxFQUFFO1lBQ04sT0FBTyxFQUFFLEdBQUcsa0JBQWtCLENBQUMsUUFBUSxJQUFJLGVBQWUsQ0FBQyxZQUFZLEVBQUU7U0FDMUU7S0FDRixDQUFDO0NBQ0gsQ0FBQyxDQUFDO0FBRUgsd0dBQXdHO0FBQ3hHLGdCQUFnQjtBQUNoQix3R0FBd0c7QUFDeEcsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFdBQVcsRUFBRTtJQUNyQyxLQUFLLENBQ0gsTUFBTSxFQUNOLEtBQUssQ0FBQztRQUNKLE9BQU8sRUFBRSxDQUFDO1FBQ1YsU0FBUyxFQUFFLDBCQUEwQjtLQUN0QyxDQUFDLENBQ0g7SUFFRCxLQUFLLENBQ0gs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QUFFO1NBQ3pFO0tBQ0YsQ0FBQztDQUNILENBQUMsQ0FBQztBQUVILHdHQUF3RztBQUN4RyxtQkFBbUI7QUFDbkIsd0dBQXdHO0FBQ3hHLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxjQUFjLEVBQUU7SUFDM0MsS0FBSyxDQUNILEdBQUcsRUFDSCxLQUFLLENBQUM7UUFDSixPQUFPLEVBQUUsQ0FBQztRQUNWLFNBQVMsRUFBRSxzQkFBc0I7S0FDbEMsQ0FBQyxDQUNIO0lBRUQsS0FBSyxDQUNILE1BQU0sRUFDTixLQUFLLENBQUM7UUFDSixPQUFPLEVBQUUsQ0FBQztRQUNWLFNBQVMsRUFBRSx5QkFBeUI7S0FDckMsQ0FBQyxDQUNIO0lBRUQsK0NBQStDO0lBQy9DLFVBQVUsQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDO0lBRS9CLGFBQWE7SUFDYixVQUFVLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxhQUFhLENBQUMsRUFBRTtRQUM5QyxNQUFNLEVBQUU7WUFDTixPQUFPLEVBQUUsR0FBRyxrQkFBa0IsQ0FBQyxPQUFPLElBQUksZUFBZSxDQUFDLFlBQVksRUFBRTtTQUN6RTtLQUNGLENBQUM7Q0FDSCxDQUFDLENBQUM7QUFFSCxPQUFPLEVBQ0wsTUFBTSxFQUNOLFlBQVksRUFDWixVQUFVLEVBQ1YsV0FBVyxFQUNYLFNBQVMsRUFDVCxPQUFPLEVBQ1AsYUFBYSxFQUNiLFdBQVcsRUFDWCxZQUFZLEVBQ1osVUFBVSxHQUNYLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBhbmltYXRlLCBzdGF0ZSwgc3R5bGUsIHRyYW5zaXRpb24sIHRyaWdnZXIgfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcbmltcG9ydCB7IEFuaW1hdGlvbkN1cnZlcywgQW5pbWF0aW9uRHVyYXRpb25zIH0gZnJvbSAnLi9kZWZhdWx0cyc7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBAIEZhZGUgaW5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jb25zdCBmYWRlSW4gPSB0cmlnZ2VyKCdmYWRlSW4nLCBbXG4gIHN0YXRlKFxuICAgICd2b2lkJyxcbiAgICBzdHlsZSh7XG4gICAgICBvcGFjaXR5OiAwLFxuICAgIH0pXG4gICksXG5cbiAgc3RhdGUoXG4gICAgJyonLFxuICAgIHN0eWxlKHtcbiAgICAgIG9wYWNpdHk6IDEsXG4gICAgfSlcbiAgKSxcblxuICAvLyBQcmV2ZW50IHRoZSB0cmFuc2l0aW9uIGlmIHRoZSBzdGF0ZSBpcyBmYWxzZVxuICB0cmFuc2l0aW9uKCd2b2lkID0+IGZhbHNlJywgW10pLFxuXG4gIC8vIFRyYW5zaXRpb25cbiAgdHJhbnNpdGlvbigndm9pZCA9PiAqJywgYW5pbWF0ZSgne3t0aW1pbmdzfX0nKSwge1xuICAgIHBhcmFtczoge1xuICAgICAgdGltaW5nczogYCR7QW5pbWF0aW9uRHVyYXRpb25zLmVudGVyaW5nfSAke0FuaW1hdGlvbkN1cnZlcy5kZWNlbGVyYXRpb259YCxcbiAgICB9LFxuICB9KSxcbl0pO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQCBGYWRlIGluIHRvcFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNvbnN0IGZhZGVJblRvcCA9IHRyaWdnZXIoJ2ZhZGVJblRvcCcsIFtcbiAgc3RhdGUoXG4gICAgJ3ZvaWQnLFxuICAgIHN0eWxlKHtcbiAgICAgIG9wYWNpdHk6IDAsXG4gICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUzZCgwLCAtMTAwJSwgMCknLFxuICAgIH0pXG4gICksXG5cbiAgc3RhdGUoXG4gICAgJyonLFxuICAgIHN0eWxlKHtcbiAgICAgIG9wYWNpdHk6IDEsXG4gICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUzZCgwLCAwLCAwKScsXG4gICAgfSlcbiAgKSxcblxuICAvLyBQcmV2ZW50IHRoZSB0cmFuc2l0aW9uIGlmIHRoZSBzdGF0ZSBpcyBmYWxzZVxuICB0cmFuc2l0aW9uKCd2b2lkID0+IGZhbHNlJywgW10pLFxuXG4gIC8vIFRyYW5zaXRpb25cbiAgdHJhbnNpdGlvbigndm9pZCA9PiAqJywgYW5pbWF0ZSgne3t0aW1pbmdzfX0nKSwge1xuICAgIHBhcmFtczoge1xuICAgICAgdGltaW5nczogYCR7QW5pbWF0aW9uRHVyYXRpb25zLmVudGVyaW5nfSAke0FuaW1hdGlvbkN1cnZlcy5kZWNlbGVyYXRpb259YCxcbiAgICB9LFxuICB9KSxcbl0pO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQCBGYWRlIGluIGJvdHRvbVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNvbnN0IGZhZGVJbkJvdHRvbSA9IHRyaWdnZXIoJ2ZhZGVJbkJvdHRvbScsIFtcbiAgc3RhdGUoXG4gICAgJ3ZvaWQnLFxuICAgIHN0eWxlKHtcbiAgICAgIG9wYWNpdHk6IDAsXG4gICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUzZCgwLCAxMDAlLCAwKScsXG4gICAgfSlcbiAgKSxcblxuICBzdGF0ZShcbiAgICAnKicsXG4gICAgc3R5bGUoe1xuICAgICAgb3BhY2l0eTogMSxcbiAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZTNkKDAsIDAsIDApJyxcbiAgICB9KVxuICApLFxuXG4gIC8vIFByZXZlbnQgdGhlIHRyYW5zaXRpb24gaWYgdGhlIHN0YXRlIGlzIGZhbHNlXG4gIHRyYW5zaXRpb24oJ3ZvaWQgPT4gZmFsc2UnLCBbXSksXG5cbiAgLy8gVHJhbnNpdGlvblxuICB0cmFuc2l0aW9uKCd2b2lkID0+IConLCBhbmltYXRlKCd7e3RpbWluZ3N9fScpLCB7XG4gICAgcGFyYW1zOiB7XG4gICAgICB0aW1pbmdzOiBgJHtBbmltYXRpb25EdXJhdGlvbnMuZW50ZXJpbmd9ICR7QW5pbWF0aW9uQ3VydmVzLmRlY2VsZXJhdGlvbn1gLFxuICAgIH0sXG4gIH0pLFxuXSk7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBAIEZhZGUgaW4gbGVmdFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNvbnN0IGZhZGVJbkxlZnQgPSB0cmlnZ2VyKCdmYWRlSW5MZWZ0JywgW1xuICBzdGF0ZShcbiAgICAndm9pZCcsXG4gICAgc3R5bGUoe1xuICAgICAgb3BhY2l0eTogMCxcbiAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZTNkKC0xMDAlLCAwLCAwKScsXG4gICAgfSlcbiAgKSxcblxuICBzdGF0ZShcbiAgICAnKicsXG4gICAgc3R5bGUoe1xuICAgICAgb3BhY2l0eTogMSxcbiAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZTNkKDAsIDAsIDApJyxcbiAgICB9KVxuICApLFxuXG4gIC8vIFByZXZlbnQgdGhlIHRyYW5zaXRpb24gaWYgdGhlIHN0YXRlIGlzIGZhbHNlXG4gIHRyYW5zaXRpb24oJ3ZvaWQgPT4gZmFsc2UnLCBbXSksXG5cbiAgLy8gVHJhbnNpdGlvblxuICB0cmFuc2l0aW9uKCd2b2lkID0+IConLCBhbmltYXRlKCd7e3RpbWluZ3N9fScpLCB7XG4gICAgcGFyYW1zOiB7XG4gICAgICB0aW1pbmdzOiBgJHtBbmltYXRpb25EdXJhdGlvbnMuZW50ZXJpbmd9ICR7QW5pbWF0aW9uQ3VydmVzLmRlY2VsZXJhdGlvbn1gLFxuICAgIH0sXG4gIH0pLFxuXSk7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBAIEZhZGUgaW4gcmlnaHRcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jb25zdCBmYWRlSW5SaWdodCA9IHRyaWdnZXIoJ2ZhZGVJblJpZ2h0JywgW1xuICBzdGF0ZShcbiAgICAndm9pZCcsXG4gICAgc3R5bGUoe1xuICAgICAgb3BhY2l0eTogMCxcbiAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZTNkKDEwMCUsIDAsIDApJyxcbiAgICB9KVxuICApLFxuXG4gIHN0YXRlKFxuICAgICcqJyxcbiAgICBzdHlsZSh7XG4gICAgICBvcGFjaXR5OiAxLFxuICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlM2QoMCwgMCwgMCknLFxuICAgIH0pXG4gICksXG5cbiAgLy8gUHJldmVudCB0aGUgdHJhbnNpdGlvbiBpZiB0aGUgc3RhdGUgaXMgZmFsc2VcbiAgdHJhbnNpdGlvbigndm9pZCA9PiBmYWxzZScsIFtdKSxcblxuICAvLyBUcmFuc2l0aW9uXG4gIHRyYW5zaXRpb24oJ3ZvaWQgPT4gKicsIGFuaW1hdGUoJ3t7dGltaW5nc319JyksIHtcbiAgICBwYXJhbXM6IHtcbiAgICAgIHRpbWluZ3M6IGAke0FuaW1hdGlvbkR1cmF0aW9ucy5lbnRlcmluZ30gJHtBbmltYXRpb25DdXJ2ZXMuZGVjZWxlcmF0aW9ufWAsXG4gICAgfSxcbiAgfSksXG5dKTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEAgRmFkZSBvdXRcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jb25zdCBmYWRlT3V0ID0gdHJpZ2dlcignZmFkZU91dCcsIFtcbiAgc3RhdGUoXG4gICAgJyonLFxuICAgIHN0eWxlKHtcbiAgICAgIG9wYWNpdHk6IDEsXG4gICAgfSlcbiAgKSxcblxuICBzdGF0ZShcbiAgICAndm9pZCcsXG4gICAgc3R5bGUoe1xuICAgICAgb3BhY2l0eTogMCxcbiAgICB9KVxuICApLFxuXG4gIC8vIFByZXZlbnQgdGhlIHRyYW5zaXRpb24gaWYgdGhlIHN0YXRlIGlzIGZhbHNlXG4gIHRyYW5zaXRpb24oJ2ZhbHNlID0+IHZvaWQnLCBbXSksXG5cbiAgLy8gVHJhbnNpdGlvblxuICB0cmFuc2l0aW9uKCcqID0+IHZvaWQnLCBhbmltYXRlKCd7e3RpbWluZ3N9fScpLCB7XG4gICAgcGFyYW1zOiB7XG4gICAgICB0aW1pbmdzOiBgJHtBbmltYXRpb25EdXJhdGlvbnMuZXhpdGluZ30gJHtBbmltYXRpb25DdXJ2ZXMuYWNjZWxlcmF0aW9ufWAsXG4gICAgfSxcbiAgfSksXG5dKTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEAgRmFkZSBvdXQgdG9wXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY29uc3QgZmFkZU91dFRvcCA9IHRyaWdnZXIoJ2ZhZGVPdXRUb3AnLCBbXG4gIHN0YXRlKFxuICAgICcqJyxcbiAgICBzdHlsZSh7XG4gICAgICBvcGFjaXR5OiAxLFxuICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlM2QoMCwgMCwgMCknLFxuICAgIH0pXG4gICksXG5cbiAgc3RhdGUoXG4gICAgJ3ZvaWQnLFxuICAgIHN0eWxlKHtcbiAgICAgIG9wYWNpdHk6IDAsXG4gICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUzZCgwLCAtMTAwJSwgMCknLFxuICAgIH0pXG4gICksXG5cbiAgLy8gUHJldmVudCB0aGUgdHJhbnNpdGlvbiBpZiB0aGUgc3RhdGUgaXMgZmFsc2VcbiAgdHJhbnNpdGlvbignZmFsc2UgPT4gdm9pZCcsIFtdKSxcblxuICAvLyBUcmFuc2l0aW9uXG4gIHRyYW5zaXRpb24oJyogPT4gdm9pZCcsIGFuaW1hdGUoJ3t7dGltaW5nc319JyksIHtcbiAgICBwYXJhbXM6IHtcbiAgICAgIHRpbWluZ3M6IGAke0FuaW1hdGlvbkR1cmF0aW9ucy5leGl0aW5nfSAke0FuaW1hdGlvbkN1cnZlcy5hY2NlbGVyYXRpb259YCxcbiAgICB9LFxuICB9KSxcbl0pO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQCBGYWRlIG91dCBib3R0b21cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jb25zdCBmYWRlT3V0Qm90dG9tID0gdHJpZ2dlcignZmFkZU91dEJvdHRvbScsIFtcbiAgc3RhdGUoXG4gICAgJyonLFxuICAgIHN0eWxlKHtcbiAgICAgIG9wYWNpdHk6IDEsXG4gICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUzZCgwLCAwLCAwKScsXG4gICAgfSlcbiAgKSxcblxuICBzdGF0ZShcbiAgICAndm9pZCcsXG4gICAgc3R5bGUoe1xuICAgICAgb3BhY2l0eTogMCxcbiAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZTNkKDAsIDEwMCUsIDApJyxcbiAgICB9KVxuICApLFxuXG4gIC8vIFByZXZlbnQgdGhlIHRyYW5zaXRpb24gaWYgdGhlIHN0YXRlIGlzIGZhbHNlXG4gIHRyYW5zaXRpb24oJ2ZhbHNlID0+IHZvaWQnLCBbXSksXG5cbiAgLy8gVHJhbnNpdGlvblxuICB0cmFuc2l0aW9uKCcqID0+IHZvaWQnLCBhbmltYXRlKCd7e3RpbWluZ3N9fScpLCB7XG4gICAgcGFyYW1zOiB7XG4gICAgICB0aW1pbmdzOiBgJHtBbmltYXRpb25EdXJhdGlvbnMuZXhpdGluZ30gJHtBbmltYXRpb25DdXJ2ZXMuYWNjZWxlcmF0aW9ufWAsXG4gICAgfSxcbiAgfSksXG5dKTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEAgRmFkZSBvdXQgbGVmdFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNvbnN0IGZhZGVPdXRMZWZ0ID0gdHJpZ2dlcignZmFkZU91dExlZnQnLCBbXG4gIHN0YXRlKFxuICAgICcqJyxcbiAgICBzdHlsZSh7XG4gICAgICBvcGFjaXR5OiAxLFxuICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlM2QoMCwgMCwgMCknLFxuICAgIH0pXG4gICksXG5cbiAgc3RhdGUoXG4gICAgJ3ZvaWQnLFxuICAgIHN0eWxlKHtcbiAgICAgIG9wYWNpdHk6IDAsXG4gICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUzZCgtMTAwJSwgMCwgMCknLFxuICAgIH0pXG4gICksXG5cbiAgLy8gUHJldmVudCB0aGUgdHJhbnNpdGlvbiBpZiB0aGUgc3RhdGUgaXMgZmFsc2VcbiAgdHJhbnNpdGlvbignZmFsc2UgPT4gdm9pZCcsIFtdKSxcblxuICAvLyBUcmFuc2l0aW9uXG4gIHRyYW5zaXRpb24oJyogPT4gdm9pZCcsIGFuaW1hdGUoJ3t7dGltaW5nc319JyksIHtcbiAgICBwYXJhbXM6IHtcbiAgICAgIHRpbWluZ3M6IGAke0FuaW1hdGlvbkR1cmF0aW9ucy5leGl0aW5nfSAke0FuaW1hdGlvbkN1cnZlcy5hY2NlbGVyYXRpb259YCxcbiAgICB9LFxuICB9KSxcbl0pO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQCBGYWRlIG91dCByaWdodFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNvbnN0IGZhZGVPdXRSaWdodCA9IHRyaWdnZXIoJ2ZhZGVPdXRSaWdodCcsIFtcbiAgc3RhdGUoXG4gICAgJyonLFxuICAgIHN0eWxlKHtcbiAgICAgIG9wYWNpdHk6IDEsXG4gICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUzZCgwLCAwLCAwKScsXG4gICAgfSlcbiAgKSxcblxuICBzdGF0ZShcbiAgICAndm9pZCcsXG4gICAgc3R5bGUoe1xuICAgICAgb3BhY2l0eTogMCxcbiAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZTNkKDEwMCUsIDAsIDApJyxcbiAgICB9KVxuICApLFxuXG4gIC8vIFByZXZlbnQgdGhlIHRyYW5zaXRpb24gaWYgdGhlIHN0YXRlIGlzIGZhbHNlXG4gIHRyYW5zaXRpb24oJ2ZhbHNlID0+IHZvaWQnLCBbXSksXG5cbiAgLy8gVHJhbnNpdGlvblxuICB0cmFuc2l0aW9uKCcqID0+IHZvaWQnLCBhbmltYXRlKCd7e3RpbWluZ3N9fScpLCB7XG4gICAgcGFyYW1zOiB7XG4gICAgICB0aW1pbmdzOiBgJHtBbmltYXRpb25EdXJhdGlvbnMuZXhpdGluZ30gJHtBbmltYXRpb25DdXJ2ZXMuYWNjZWxlcmF0aW9ufWAsXG4gICAgfSxcbiAgfSksXG5dKTtcblxuZXhwb3J0IHtcbiAgZmFkZUluLFxuICBmYWRlSW5Cb3R0b20sXG4gIGZhZGVJbkxlZnQsXG4gIGZhZGVJblJpZ2h0LFxuICBmYWRlSW5Ub3AsXG4gIGZhZGVPdXQsXG4gIGZhZGVPdXRCb3R0b20sXG4gIGZhZGVPdXRMZWZ0LFxuICBmYWRlT3V0UmlnaHQsXG4gIGZhZGVPdXRUb3AsXG59O1xuIl19