import { CdkPortal } from '@angular/cdk/portal';
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class DialogTitleDirective extends CdkPortal {
    constructor(templateRef, viewContainerRef) {
        super(templateRef, viewContainerRef);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: DialogTitleDirective, deps: [{ token: i0.TemplateRef }, { token: i0.ViewContainerRef }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.8", type: DialogTitleDirective, isStandalone: true, selector: "[dialog-title], [dialogTitle]", usesInheritance: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: DialogTitleDirective, decorators: [{
            type: Directive,
            args: [{
                    standalone: true,
                    selector: '[dialog-title], [dialogTitle]',
                }]
        }], ctorParameters: () => [{ type: i0.TemplateRef }, { type: i0.ViewContainerRef }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLXRpdGxlLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvZGlhbG9nLXRpdGxlLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDaEQsT0FBTyxFQUFFLFNBQVMsRUFBaUMsTUFBTSxlQUFlLENBQUM7O0FBTXpFLE1BQU0sT0FBTyxvQkFBcUIsU0FBUSxTQUFTO0lBQ2pELFlBQVksV0FBNkIsRUFBRSxnQkFBa0M7UUFDM0UsS0FBSyxDQUFDLFdBQVcsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7dUdBSFUsb0JBQW9COzJGQUFwQixvQkFBb0I7OzJGQUFwQixvQkFBb0I7a0JBSmhDLFNBQVM7bUJBQUM7b0JBQ1QsVUFBVSxFQUFFLElBQUk7b0JBQ2hCLFFBQVEsRUFBRSwrQkFBK0I7aUJBQzFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2RrUG9ydGFsIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XG5pbXBvcnQgeyBEaXJlY3RpdmUsIFRlbXBsYXRlUmVmLCBWaWV3Q29udGFpbmVyUmVmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbkBEaXJlY3RpdmUoe1xuICBzdGFuZGFsb25lOiB0cnVlLFxuICBzZWxlY3RvcjogJ1tkaWFsb2ctdGl0bGVdLCBbZGlhbG9nVGl0bGVdJyxcbn0pXG5leHBvcnQgY2xhc3MgRGlhbG9nVGl0bGVEaXJlY3RpdmUgZXh0ZW5kcyBDZGtQb3J0YWwge1xuICBjb25zdHJ1Y3Rvcih0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8YW55Piwgdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZikge1xuICAgIHN1cGVyKHRlbXBsYXRlUmVmLCB2aWV3Q29udGFpbmVyUmVmKTtcbiAgfVxufVxuIl19