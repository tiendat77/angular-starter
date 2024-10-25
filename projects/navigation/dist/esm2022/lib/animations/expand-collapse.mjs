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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwYW5kLWNvbGxhcHNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpYi9hbmltYXRpb25zL2V4cGFuZC1jb2xsYXBzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ2pGLE9BQU8sRUFBRSxlQUFlLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFakUsd0dBQXdHO0FBQ3hHLHNCQUFzQjtBQUN0Qix3R0FBd0c7QUFDeEcsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixFQUFFO0lBQy9DLEtBQUssQ0FDSCxpQkFBaUIsRUFDakIsS0FBSyxDQUFDO1FBQ0osTUFBTSxFQUFFLEdBQUc7S0FDWixDQUFDLENBQ0g7SUFFRCxLQUFLLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUVoQywrQ0FBK0M7SUFDL0MsVUFBVSxDQUFDLHlEQUF5RCxFQUFFLEVBQUUsQ0FBQztJQUV6RSxhQUFhO0lBQ2IsVUFBVSxDQUFDLG9DQUFvQyxFQUFFLE9BQU8sQ0FBQyxhQUFhLENBQUMsRUFBRTtRQUN2RSxNQUFNLEVBQUU7WUFDTixPQUFPLEVBQUUsR0FBRyxrQkFBa0IsQ0FBQyxRQUFRLElBQUksZUFBZSxDQUFDLFlBQVksRUFBRTtTQUMxRTtLQUNGLENBQUM7Q0FDSCxDQUFDLENBQUM7QUFFSCxPQUFPLEVBQUUsY0FBYyxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBhbmltYXRlLCBzdGF0ZSwgc3R5bGUsIHRyYW5zaXRpb24sIHRyaWdnZXIgfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcbmltcG9ydCB7IEFuaW1hdGlvbkN1cnZlcywgQW5pbWF0aW9uRHVyYXRpb25zIH0gZnJvbSAnLi9kZWZhdWx0cyc7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBAIEV4cGFuZCAvIGNvbGxhcHNlXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY29uc3QgZXhwYW5kQ29sbGFwc2UgPSB0cmlnZ2VyKCdleHBhbmRDb2xsYXBzZScsIFtcbiAgc3RhdGUoXG4gICAgJ3ZvaWQsIGNvbGxhcHNlZCcsXG4gICAgc3R5bGUoe1xuICAgICAgaGVpZ2h0OiAnMCcsXG4gICAgfSlcbiAgKSxcblxuICBzdGF0ZSgnKiwgZXhwYW5kZWQnLCBzdHlsZSgnKicpKSxcblxuICAvLyBQcmV2ZW50IHRoZSB0cmFuc2l0aW9uIGlmIHRoZSBzdGF0ZSBpcyBmYWxzZVxuICB0cmFuc2l0aW9uKCd2b2lkIDw9PiBmYWxzZSwgY29sbGFwc2VkIDw9PiBmYWxzZSwgZXhwYW5kZWQgPD0+IGZhbHNlJywgW10pLFxuXG4gIC8vIFRyYW5zaXRpb25cbiAgdHJhbnNpdGlvbigndm9pZCA8PT4gKiwgY29sbGFwc2VkIDw9PiBleHBhbmRlZCcsIGFuaW1hdGUoJ3t7dGltaW5nc319JyksIHtcbiAgICBwYXJhbXM6IHtcbiAgICAgIHRpbWluZ3M6IGAke0FuaW1hdGlvbkR1cmF0aW9ucy5lbnRlcmluZ30gJHtBbmltYXRpb25DdXJ2ZXMuZGVjZWxlcmF0aW9ufWAsXG4gICAgfSxcbiAgfSksXG5dKTtcblxuZXhwb3J0IHsgZXhwYW5kQ29sbGFwc2UgfTtcbiJdfQ==