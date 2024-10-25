import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class DialogHeaderDirective {
    _element;
    get element() {
        return this._element.nativeElement;
    }
    constructor(_element) {
        this._element = _element;
    }
    ngOnInit() {
        this.element.classList.add('hidden');
    }
    visibility(enable) {
        if (enable) {
            this.element.classList.remove('hidden');
        }
        else {
            this.element.classList.add('hidden');
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: DialogHeaderDirective, deps: [{ token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.8", type: DialogHeaderDirective, isStandalone: true, selector: "[dialog-header], [dialogHeader]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: DialogHeaderDirective, decorators: [{
            type: Directive,
            args: [{
                    standalone: true,
                    selector: '[dialog-header], [dialogHeader]',
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLWhlYWRlci5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL2RpYWxvZy1oZWFkZXIuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQXNCLE1BQU0sZUFBZSxDQUFDOztBQU05RCxNQUFNLE9BQU8scUJBQXFCO0lBS1o7SUFKcEIsSUFBSSxPQUFPO1FBQ1QsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQTRCLENBQUM7SUFDcEQsQ0FBQztJQUVELFlBQW9CLFFBQW9CO1FBQXBCLGFBQVEsR0FBUixRQUFRLENBQVk7SUFBRyxDQUFDO0lBRTVDLFFBQVE7UUFDTixJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVELFVBQVUsQ0FBQyxNQUFlO1FBQ3hCLElBQUksTUFBTSxFQUFFLENBQUM7WUFDWCxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDMUMsQ0FBQzthQUFNLENBQUM7WUFDTixJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdkMsQ0FBQztJQUNILENBQUM7dUdBakJVLHFCQUFxQjsyRkFBckIscUJBQXFCOzsyRkFBckIscUJBQXFCO2tCQUpqQyxTQUFTO21CQUFDO29CQUNULFVBQVUsRUFBRSxJQUFJO29CQUNoQixRQUFRLEVBQUUsaUNBQWlDO2lCQUM1QyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpcmVjdGl2ZSwgRWxlbWVudFJlZiwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbkBEaXJlY3RpdmUoe1xuICBzdGFuZGFsb25lOiB0cnVlLFxuICBzZWxlY3RvcjogJ1tkaWFsb2ctaGVhZGVyXSwgW2RpYWxvZ0hlYWRlcl0nLFxufSlcbmV4cG9ydCBjbGFzcyBEaWFsb2dIZWFkZXJEaXJlY3RpdmUgaW1wbGVtZW50cyBPbkluaXQge1xuICBnZXQgZWxlbWVudCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZWxlbWVudC5uYXRpdmVFbGVtZW50IGFzIEhUTUxFbGVtZW50O1xuICB9XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfZWxlbWVudDogRWxlbWVudFJlZikge31cblxuICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XG4gIH1cblxuICB2aXNpYmlsaXR5KGVuYWJsZTogYm9vbGVhbikge1xuICAgIGlmIChlbmFibGUpIHtcbiAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xuICAgIH1cbiAgfVxufVxuIl19