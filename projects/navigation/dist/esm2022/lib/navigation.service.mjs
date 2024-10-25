import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
export class NavigationService {
    _componentRegistry = new Map();
    _navigationStore = new Map();
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
    registerComponent(name, component) {
        this._componentRegistry.set(name, component);
    }
    deregisterComponent(name) {
        this._componentRegistry.delete(name);
    }
    getComponent(name) {
        return this._componentRegistry.get(name);
    }
    storeNavigation(key, navigation) {
        this._navigationStore.set(key, navigation);
    }
    getNavigation(key) {
        return this._navigationStore.get(key) ?? [];
    }
    deleteNavigation(key) {
        // Check if the navigation exists
        if (!this._navigationStore.has(key)) {
            console.warn(`Navigation with the key '${key}' does not exist in the store.`);
        }
        // Delete from the storage
        this._navigationStore.delete(key);
    }
    getFlatNavigation(navigation, flatNavigation = []) {
        for (const item of navigation) {
            if (item.type === 'basic') {
                flatNavigation.push(item);
                continue;
            }
            if (item.type === 'aside' || item.type === 'collapsable' || item.type === 'group') {
                if (item.children) {
                    this.getFlatNavigation(item.children, flatNavigation);
                }
            }
        }
        return flatNavigation;
    }
    getItem(id, navigation) {
        for (const item of navigation) {
            if (item.id === id) {
                return item;
            }
            if (item.children) {
                const childItem = this.getItem(id, item.children);
                if (childItem) {
                    return childItem;
                }
            }
        }
        return null;
    }
    getItemParent(id, navigation, parent) {
        for (const item of navigation) {
            if (item.id === id) {
                return parent;
            }
            if (item.children) {
                const childItem = this.getItemParent(id, item.children, item);
                if (childItem) {
                    return childItem;
                }
            }
        }
        return null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: NavigationService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: NavigationService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: NavigationService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF2aWdhdGlvbi5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9uYXZpZ2F0aW9uLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQzs7QUFJM0MsTUFBTSxPQUFPLGlCQUFpQjtJQUNwQixrQkFBa0IsR0FBcUIsSUFBSSxHQUFHLEVBQWUsQ0FBQztJQUM5RCxnQkFBZ0IsR0FBa0MsSUFBSSxHQUFHLEVBQWUsQ0FBQztJQUVqRix3R0FBd0c7SUFDeEcsbUJBQW1CO0lBQ25CLHdHQUF3RztJQUV4RyxpQkFBaUIsQ0FBQyxJQUFZLEVBQUUsU0FBYztRQUM1QyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBRUQsbUJBQW1CLENBQUMsSUFBWTtRQUM5QixJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxZQUFZLENBQUksSUFBWTtRQUMxQixPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVELGVBQWUsQ0FBQyxHQUFXLEVBQUUsVUFBNEI7UUFDdkQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVELGFBQWEsQ0FBQyxHQUFXO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDOUMsQ0FBQztJQUVELGdCQUFnQixDQUFDLEdBQVc7UUFDMUIsaUNBQWlDO1FBQ2pDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDcEMsT0FBTyxDQUFDLElBQUksQ0FBQyw0QkFBNEIsR0FBRyxnQ0FBZ0MsQ0FBQyxDQUFDO1FBQ2hGLENBQUM7UUFFRCwwQkFBMEI7UUFDMUIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRUQsaUJBQWlCLENBQ2YsVUFBNEIsRUFDNUIsaUJBQW1DLEVBQUU7UUFFckMsS0FBSyxNQUFNLElBQUksSUFBSSxVQUFVLEVBQUUsQ0FBQztZQUM5QixJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssT0FBTyxFQUFFLENBQUM7Z0JBQzFCLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzFCLFNBQVM7WUFDWCxDQUFDO1lBRUQsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLE9BQU8sSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLGFBQWEsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBRSxDQUFDO2dCQUNsRixJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztvQkFDbEIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsY0FBYyxDQUFDLENBQUM7Z0JBQ3hELENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztRQUVELE9BQU8sY0FBYyxDQUFDO0lBQ3hCLENBQUM7SUFFRCxPQUFPLENBQUMsRUFBVSxFQUFFLFVBQTRCO1FBQzlDLEtBQUssTUFBTSxJQUFJLElBQUksVUFBVSxFQUFFLENBQUM7WUFDOUIsSUFBSSxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDO2dCQUNuQixPQUFPLElBQUksQ0FBQztZQUNkLENBQUM7WUFFRCxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDbEIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUVsRCxJQUFJLFNBQVMsRUFBRSxDQUFDO29CQUNkLE9BQU8sU0FBUyxDQUFDO2dCQUNuQixDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRCxhQUFhLENBQ1gsRUFBVSxFQUNWLFVBQTRCLEVBQzVCLE1BQXlDO1FBRXpDLEtBQUssTUFBTSxJQUFJLElBQUksVUFBVSxFQUFFLENBQUM7WUFDOUIsSUFBSSxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDO2dCQUNuQixPQUFPLE1BQU0sQ0FBQztZQUNoQixDQUFDO1lBRUQsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ2xCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBRTlELElBQUksU0FBUyxFQUFFLENBQUM7b0JBQ2QsT0FBTyxTQUFTLENBQUM7Z0JBQ25CLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQzt1R0FoR1UsaUJBQWlCOzJHQUFqQixpQkFBaUIsY0FESixNQUFNOzsyRkFDbkIsaUJBQWlCO2tCQUQ3QixVQUFVO21CQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE5hdmlnYXRpb25JdGVtIH0gZnJvbSAnLi9uYXZpZ2F0aW9uLnR5cGVzJztcblxuQEluamVjdGFibGUoeyBwcm92aWRlZEluOiAncm9vdCcgfSlcbmV4cG9ydCBjbGFzcyBOYXZpZ2F0aW9uU2VydmljZSB7XG4gIHByaXZhdGUgX2NvbXBvbmVudFJlZ2lzdHJ5OiBNYXA8c3RyaW5nLCBhbnk+ID0gbmV3IE1hcDxzdHJpbmcsIGFueT4oKTtcbiAgcHJpdmF0ZSBfbmF2aWdhdGlvblN0b3JlOiBNYXA8c3RyaW5nLCBOYXZpZ2F0aW9uSXRlbVtdPiA9IG5ldyBNYXA8c3RyaW5nLCBhbnk+KCk7XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gQCBQdWJsaWMgbWV0aG9kc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHJlZ2lzdGVyQ29tcG9uZW50KG5hbWU6IHN0cmluZywgY29tcG9uZW50OiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLl9jb21wb25lbnRSZWdpc3RyeS5zZXQobmFtZSwgY29tcG9uZW50KTtcbiAgfVxuXG4gIGRlcmVnaXN0ZXJDb21wb25lbnQobmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fY29tcG9uZW50UmVnaXN0cnkuZGVsZXRlKG5hbWUpO1xuICB9XG5cbiAgZ2V0Q29tcG9uZW50PFQ+KG5hbWU6IHN0cmluZyk6IFQge1xuICAgIHJldHVybiB0aGlzLl9jb21wb25lbnRSZWdpc3RyeS5nZXQobmFtZSk7XG4gIH1cblxuICBzdG9yZU5hdmlnYXRpb24oa2V5OiBzdHJpbmcsIG5hdmlnYXRpb246IE5hdmlnYXRpb25JdGVtW10pOiB2b2lkIHtcbiAgICB0aGlzLl9uYXZpZ2F0aW9uU3RvcmUuc2V0KGtleSwgbmF2aWdhdGlvbik7XG4gIH1cblxuICBnZXROYXZpZ2F0aW9uKGtleTogc3RyaW5nKTogTmF2aWdhdGlvbkl0ZW1bXSB7XG4gICAgcmV0dXJuIHRoaXMuX25hdmlnYXRpb25TdG9yZS5nZXQoa2V5KSA/PyBbXTtcbiAgfVxuXG4gIGRlbGV0ZU5hdmlnYXRpb24oa2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICAvLyBDaGVjayBpZiB0aGUgbmF2aWdhdGlvbiBleGlzdHNcbiAgICBpZiAoIXRoaXMuX25hdmlnYXRpb25TdG9yZS5oYXMoa2V5KSkge1xuICAgICAgY29uc29sZS53YXJuKGBOYXZpZ2F0aW9uIHdpdGggdGhlIGtleSAnJHtrZXl9JyBkb2VzIG5vdCBleGlzdCBpbiB0aGUgc3RvcmUuYCk7XG4gICAgfVxuXG4gICAgLy8gRGVsZXRlIGZyb20gdGhlIHN0b3JhZ2VcbiAgICB0aGlzLl9uYXZpZ2F0aW9uU3RvcmUuZGVsZXRlKGtleSk7XG4gIH1cblxuICBnZXRGbGF0TmF2aWdhdGlvbihcbiAgICBuYXZpZ2F0aW9uOiBOYXZpZ2F0aW9uSXRlbVtdLFxuICAgIGZsYXROYXZpZ2F0aW9uOiBOYXZpZ2F0aW9uSXRlbVtdID0gW11cbiAgKTogTmF2aWdhdGlvbkl0ZW1bXSB7XG4gICAgZm9yIChjb25zdCBpdGVtIG9mIG5hdmlnYXRpb24pIHtcbiAgICAgIGlmIChpdGVtLnR5cGUgPT09ICdiYXNpYycpIHtcbiAgICAgICAgZmxhdE5hdmlnYXRpb24ucHVzaChpdGVtKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChpdGVtLnR5cGUgPT09ICdhc2lkZScgfHwgaXRlbS50eXBlID09PSAnY29sbGFwc2FibGUnIHx8IGl0ZW0udHlwZSA9PT0gJ2dyb3VwJykge1xuICAgICAgICBpZiAoaXRlbS5jaGlsZHJlbikge1xuICAgICAgICAgIHRoaXMuZ2V0RmxhdE5hdmlnYXRpb24oaXRlbS5jaGlsZHJlbiwgZmxhdE5hdmlnYXRpb24pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZsYXROYXZpZ2F0aW9uO1xuICB9XG5cbiAgZ2V0SXRlbShpZDogc3RyaW5nLCBuYXZpZ2F0aW9uOiBOYXZpZ2F0aW9uSXRlbVtdKTogTmF2aWdhdGlvbkl0ZW0gfCBudWxsIHtcbiAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgbmF2aWdhdGlvbikge1xuICAgICAgaWYgKGl0ZW0uaWQgPT09IGlkKSB7XG4gICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXRlbS5jaGlsZHJlbikge1xuICAgICAgICBjb25zdCBjaGlsZEl0ZW0gPSB0aGlzLmdldEl0ZW0oaWQsIGl0ZW0uY2hpbGRyZW4pO1xuXG4gICAgICAgIGlmIChjaGlsZEl0ZW0pIHtcbiAgICAgICAgICByZXR1cm4gY2hpbGRJdGVtO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBnZXRJdGVtUGFyZW50KFxuICAgIGlkOiBzdHJpbmcsXG4gICAgbmF2aWdhdGlvbjogTmF2aWdhdGlvbkl0ZW1bXSxcbiAgICBwYXJlbnQ6IE5hdmlnYXRpb25JdGVtW10gfCBOYXZpZ2F0aW9uSXRlbVxuICApOiBOYXZpZ2F0aW9uSXRlbVtdIHwgTmF2aWdhdGlvbkl0ZW0gfCBudWxsIHtcbiAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgbmF2aWdhdGlvbikge1xuICAgICAgaWYgKGl0ZW0uaWQgPT09IGlkKSB7XG4gICAgICAgIHJldHVybiBwYXJlbnQ7XG4gICAgICB9XG5cbiAgICAgIGlmIChpdGVtLmNoaWxkcmVuKSB7XG4gICAgICAgIGNvbnN0IGNoaWxkSXRlbSA9IHRoaXMuZ2V0SXRlbVBhcmVudChpZCwgaXRlbS5jaGlsZHJlbiwgaXRlbSk7XG5cbiAgICAgICAgaWYgKGNoaWxkSXRlbSkge1xuICAgICAgICAgIHJldHVybiBjaGlsZEl0ZW07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuIl19