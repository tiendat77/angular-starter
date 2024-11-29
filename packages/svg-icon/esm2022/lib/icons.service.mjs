import { inject, Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: IconsService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: IconsService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: IconsService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvbnMuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYnMvc3ZnLWljb24vc3JjL2xpYi9pY29ucy5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ25ELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUV6RCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFbEQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGNBQWMsQ0FBQzs7QUFHL0MsTUFBTSxPQUFPLFlBQVk7SUFDYixhQUFhLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3JDLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUMzQyxXQUFXLEdBQUcsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBRWhEO1FBQ0UsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLE1BQU0sRUFBRSxDQUFDO1lBQzdCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2xDLENBQUM7SUFDSCxDQUFDO0lBRUQsUUFBUSxDQUFDLFVBQTJCO1FBQ2xDLEtBQUssTUFBTSxTQUFTLElBQUksVUFBVSxFQUFFLENBQUM7WUFDbkMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLHdCQUF3QixDQUM1QyxTQUFTLENBQUMsSUFBSSxFQUNkLElBQUksQ0FBQyxhQUFhLENBQUMsOEJBQThCLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUNqRSxDQUFDO1FBQ0osQ0FBQztJQUNILENBQUM7d0dBbEJVLFlBQVk7NEdBQVosWUFBWSxjQURDLE1BQU07OzRGQUNuQixZQUFZO2tCQUR4QixVQUFVO21CQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGluamVjdCwgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRG9tU2FuaXRpemVyIH0gZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlcic7XG5cbmltcG9ydCB7IFN2Z0ljb25SZWdpc3RyeSB9IGZyb20gJy4vaWNvbi1yZWdpc3RyeSc7XG5pbXBvcnQgeyBJY29uTmFtZXNwYWNlIH0gZnJvbSAnLi9pY29uLmludGVyZmFjZSc7XG5pbXBvcnQgeyBJQ09OX05BTUVTUEFDRVMgfSBmcm9tICcuL2ljb24udG9rZW4nO1xuXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46ICdyb290JyB9KVxuZXhwb3J0IGNsYXNzIEljb25zU2VydmljZSB7XG4gIHByb3RlY3RlZCBfZG9tU2FuaXRpemVyID0gaW5qZWN0KERvbVNhbml0aXplcik7XG4gIHByb3RlY3RlZCBfc3ZnSWNvblJlZ2lzdHJ5ID0gaW5qZWN0KFN2Z0ljb25SZWdpc3RyeSk7XG4gIHByb3RlY3RlZCBfbmFtZXNwYWNlcyA9IGluamVjdChJQ09OX05BTUVTUEFDRVMpO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGlmICh0aGlzLl9uYW1lc3BhY2VzPy5sZW5ndGgpIHtcbiAgICAgIHRoaXMucmVnaXN0ZXIodGhpcy5fbmFtZXNwYWNlcyk7XG4gICAgfVxuICB9XG5cbiAgcmVnaXN0ZXIobmFtZXNwYWNlczogSWNvbk5hbWVzcGFjZVtdKSB7XG4gICAgZm9yIChjb25zdCBuYW1lc3BhY2Ugb2YgbmFtZXNwYWNlcykge1xuICAgICAgdGhpcy5fc3ZnSWNvblJlZ2lzdHJ5LmFkZFN2Z0ljb25TZXRJbk5hbWVzcGFjZShcbiAgICAgICAgbmFtZXNwYWNlLm5hbWUsXG4gICAgICAgIHRoaXMuX2RvbVNhbml0aXplci5ieXBhc3NTZWN1cml0eVRydXN0UmVzb3VyY2VVcmwobmFtZXNwYWNlLnVybClcbiAgICAgICk7XG4gICAgfVxuICB9XG59XG4iXX0=