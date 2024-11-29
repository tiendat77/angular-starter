import { animate, state, style, transition, trigger } from '@angular/animations';
import { AnimationCurves, AnimationDurations } from './defaults';
// -----------------------------------------------------------------------------------------------------
// @ Expand / collapse
// -----------------------------------------------------------------------------------------------------
const expandCollapse = trigger('expandCollapse', [
    state('void, collapsed', style({
        height: '0',
    })),
    state('*, expanded', style('*')),
    // Prevent the transition if the state is false
    transition('void <=> false, collapsed <=> false, expanded <=> false', []),
    // Transition
    transition('void <=> *, collapsed <=> expanded', animate('{{timings}}'), {
        params: {
            timings: `${AnimationDurations.entering} ${AnimationCurves.deceleration}`,
        },
    }),
]);
export { expandCollapse };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwYW5kLWNvbGxhcHNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbGlicy9uYXZpZ2F0aW9uL3NyYy9saWIvYW5pbWF0aW9ucy9leHBhbmQtY29sbGFwc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNqRixPQUFPLEVBQUUsZUFBZSxFQUFFLGtCQUFrQixFQUFFLE1BQU0sWUFBWSxDQUFDO0FBRWpFLHdHQUF3RztBQUN4RyxzQkFBc0I7QUFDdEIsd0dBQXdHO0FBQ3hHLE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRTtJQUMvQyxLQUFLLENBQ0gsaUJBQWlCLEVBQ2pCLEtBQUssQ0FBQztRQUNKLE1BQU0sRUFBRSxHQUFHO0tBQ1osQ0FBQyxDQUNIO0lBRUQsS0FBSyxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFFaEMsK0NBQStDO0lBQy9DLFVBQVUsQ0FBQyx5REFBeUQsRUFBRSxFQUFFLENBQUM7SUFFekUsYUFBYTtJQUNiLFVBQVUsQ0FBQyxvQ0FBb0MsRUFBRSxPQUFPLENBQUMsYUFBYSxDQUFDLEVBQUU7UUFDdkUsTUFBTSxFQUFFO1lBQ04sT0FBTyxFQUFFLEdBQUcsa0JBQWtCLENBQUMsUUFBUSxJQUFJLGVBQWUsQ0FBQyxZQUFZLEVBQUU7U0FDMUU7S0FDRixDQUFDO0NBQ0gsQ0FBQyxDQUFDO0FBRUgsT0FBTyxFQUFFLGNBQWMsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYW5pbWF0ZSwgc3RhdGUsIHN0eWxlLCB0cmFuc2l0aW9uLCB0cmlnZ2VyIH0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5pbXBvcnQgeyBBbmltYXRpb25DdXJ2ZXMsIEFuaW1hdGlvbkR1cmF0aW9ucyB9IGZyb20gJy4vZGVmYXVsdHMnO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQCBFeHBhbmQgLyBjb2xsYXBzZVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNvbnN0IGV4cGFuZENvbGxhcHNlID0gdHJpZ2dlcignZXhwYW5kQ29sbGFwc2UnLCBbXG4gIHN0YXRlKFxuICAgICd2b2lkLCBjb2xsYXBzZWQnLFxuICAgIHN0eWxlKHtcbiAgICAgIGhlaWdodDogJzAnLFxuICAgIH0pXG4gICksXG5cbiAgc3RhdGUoJyosIGV4cGFuZGVkJywgc3R5bGUoJyonKSksXG5cbiAgLy8gUHJldmVudCB0aGUgdHJhbnNpdGlvbiBpZiB0aGUgc3RhdGUgaXMgZmFsc2VcbiAgdHJhbnNpdGlvbigndm9pZCA8PT4gZmFsc2UsIGNvbGxhcHNlZCA8PT4gZmFsc2UsIGV4cGFuZGVkIDw9PiBmYWxzZScsIFtdKSxcblxuICAvLyBUcmFuc2l0aW9uXG4gIHRyYW5zaXRpb24oJ3ZvaWQgPD0+ICosIGNvbGxhcHNlZCA8PT4gZXhwYW5kZWQnLCBhbmltYXRlKCd7e3RpbWluZ3N9fScpLCB7XG4gICAgcGFyYW1zOiB7XG4gICAgICB0aW1pbmdzOiBgJHtBbmltYXRpb25EdXJhdGlvbnMuZW50ZXJpbmd9ICR7QW5pbWF0aW9uQ3VydmVzLmRlY2VsZXJhdGlvbn1gLFxuICAgIH0sXG4gIH0pLFxuXSk7XG5cbmV4cG9ydCB7IGV4cGFuZENvbGxhcHNlIH07XG4iXX0=