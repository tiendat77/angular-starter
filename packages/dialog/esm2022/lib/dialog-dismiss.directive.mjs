import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/dialog";
export class DialogDismissDirective {
    _dialogRef;
    constructor(_dialogRef) {
        this._dialogRef = _dialogRef;
    }
    _onButtonClick() {
        this._dialogRef.close();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: DialogDismissDirective, deps: [{ token: i1.DialogRef }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.13", type: DialogDismissDirective, isStandalone: true, selector: "[dialog-dismiss], [dialogDismiss]", host: { listeners: { "click": "_onButtonClick()" } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: DialogDismissDirective, decorators: [{
            type: Directive,
            args: [{
                    standalone: true,
                    selector: '[dialog-dismiss], [dialogDismiss]',
                    host: {
                        '(click)': '_onButtonClick()',
                    },
                }]
        }], ctorParameters: () => [{ type: i1.DialogRef }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLWRpc21pc3MuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vbGlicy9kaWFsb2cvc3JjL2xpYi9kaWFsb2ctZGlzbWlzcy5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQzs7O0FBUzFDLE1BQU0sT0FBTyxzQkFBc0I7SUFDYjtJQUFwQixZQUFvQixVQUEwQjtRQUExQixlQUFVLEdBQVYsVUFBVSxDQUFnQjtJQUFHLENBQUM7SUFFbEQsY0FBYztRQUNaLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDMUIsQ0FBQzt3R0FMVSxzQkFBc0I7NEZBQXRCLHNCQUFzQjs7NEZBQXRCLHNCQUFzQjtrQkFQbEMsU0FBUzttQkFBQztvQkFDVCxVQUFVLEVBQUUsSUFBSTtvQkFDaEIsUUFBUSxFQUFFLG1DQUFtQztvQkFDN0MsSUFBSSxFQUFFO3dCQUNKLFNBQVMsRUFBRSxrQkFBa0I7cUJBQzlCO2lCQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlhbG9nUmVmIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2RpYWxvZyc7XG5pbXBvcnQgeyBEaXJlY3RpdmUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuQERpcmVjdGl2ZSh7XG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIHNlbGVjdG9yOiAnW2RpYWxvZy1kaXNtaXNzXSwgW2RpYWxvZ0Rpc21pc3NdJyxcbiAgaG9zdDoge1xuICAgICcoY2xpY2spJzogJ19vbkJ1dHRvbkNsaWNrKCknLFxuICB9LFxufSlcbmV4cG9ydCBjbGFzcyBEaWFsb2dEaXNtaXNzRGlyZWN0aXZlIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfZGlhbG9nUmVmOiBEaWFsb2dSZWY8YW55Pikge31cblxuICBfb25CdXR0b25DbGljaygpIHtcbiAgICB0aGlzLl9kaWFsb2dSZWYuY2xvc2UoKTtcbiAgfVxufVxuIl19