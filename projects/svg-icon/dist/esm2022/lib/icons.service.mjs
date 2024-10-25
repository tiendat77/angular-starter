import { DomSanitizer } from '@angular/platform-browser';
import { inject, Injectable } from '@angular/core';
import { SvgIconRegistry } from './icon-registry';
import { ICON_NAMESPACES } from './icon.token';
import * as i0 from "@angular/core";
export class IconsService {
    _domSanitizer = inject(DomSanitizer);
    _svgIconRegistry = inject(SvgIconRegistry);
    _namespaces = inject(ICON_NAMESPACES);
    constructor() {
        if (this._namespaces?.length) {
            this.register(this._namespaces);
        }
    }
    register(namespaces) {
        for (const namespace of namespaces) {
            this._svgIconRegistry.addSvgIconSetInNamespace(namespace.name, this._domSanitizer.bypassSecurityTrustResourceUrl(namespace.url));
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: IconsService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: IconsService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: IconsService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvbnMuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvaWNvbnMuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDekQsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFbkQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxjQUFjLENBQUM7O0FBSS9DLE1BQU0sT0FBTyxZQUFZO0lBQ2IsYUFBYSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNyQyxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDM0MsV0FBVyxHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUVoRDtRQUNFLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxNQUFNLEVBQUUsQ0FBQztZQUM3QixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNsQyxDQUFDO0lBQ0gsQ0FBQztJQUVELFFBQVEsQ0FBQyxVQUEyQjtRQUNsQyxLQUFLLE1BQU0sU0FBUyxJQUFJLFVBQVUsRUFBRSxDQUFDO1lBQ25DLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyx3QkFBd0IsQ0FDNUMsU0FBUyxDQUFDLElBQUksRUFDZCxJQUFJLENBQUMsYUFBYSxDQUFDLDhCQUE4QixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FDakUsQ0FBQztRQUNKLENBQUM7SUFDSCxDQUFDO3VHQWxCVSxZQUFZOzJHQUFaLFlBQVksY0FEQyxNQUFNOzsyRkFDbkIsWUFBWTtrQkFEeEIsVUFBVTttQkFBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEb21TYW5pdGl6ZXIgfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyJztcbmltcG9ydCB7IGluamVjdCwgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBTdmdJY29uUmVnaXN0cnkgfSBmcm9tICcuL2ljb24tcmVnaXN0cnknO1xuaW1wb3J0IHsgSUNPTl9OQU1FU1BBQ0VTIH0gZnJvbSAnLi9pY29uLnRva2VuJztcbmltcG9ydCB7IEljb25OYW1lc3BhY2UgfSBmcm9tICcuL2ljb24uaW50ZXJmYWNlJztcblxuQEluamVjdGFibGUoeyBwcm92aWRlZEluOiAncm9vdCcgfSlcbmV4cG9ydCBjbGFzcyBJY29uc1NlcnZpY2Uge1xuICBwcm90ZWN0ZWQgX2RvbVNhbml0aXplciA9IGluamVjdChEb21TYW5pdGl6ZXIpO1xuICBwcm90ZWN0ZWQgX3N2Z0ljb25SZWdpc3RyeSA9IGluamVjdChTdmdJY29uUmVnaXN0cnkpO1xuICBwcm90ZWN0ZWQgX25hbWVzcGFjZXMgPSBpbmplY3QoSUNPTl9OQU1FU1BBQ0VTKTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBpZiAodGhpcy5fbmFtZXNwYWNlcz8ubGVuZ3RoKSB7XG4gICAgICB0aGlzLnJlZ2lzdGVyKHRoaXMuX25hbWVzcGFjZXMpO1xuICAgIH1cbiAgfVxuXG4gIHJlZ2lzdGVyKG5hbWVzcGFjZXM6IEljb25OYW1lc3BhY2VbXSkge1xuICAgIGZvciAoY29uc3QgbmFtZXNwYWNlIG9mIG5hbWVzcGFjZXMpIHtcbiAgICAgIHRoaXMuX3N2Z0ljb25SZWdpc3RyeS5hZGRTdmdJY29uU2V0SW5OYW1lc3BhY2UoXG4gICAgICAgIG5hbWVzcGFjZS5uYW1lLFxuICAgICAgICB0aGlzLl9kb21TYW5pdGl6ZXIuYnlwYXNzU2VjdXJpdHlUcnVzdFJlc291cmNlVXJsKG5hbWVzcGFjZS51cmwpXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuIl19