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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: NavigationService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: NavigationService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: NavigationService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF2aWdhdGlvbi5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vbGlicy9uYXZpZ2F0aW9uL3NyYy9saWIvbmF2aWdhdGlvbi5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7O0FBSTNDLE1BQU0sT0FBTyxpQkFBaUI7SUFDcEIsa0JBQWtCLEdBQXFCLElBQUksR0FBRyxFQUFlLENBQUM7SUFDOUQsZ0JBQWdCLEdBQWtDLElBQUksR0FBRyxFQUFlLENBQUM7SUFFakYsd0dBQXdHO0lBQ3hHLG1CQUFtQjtJQUNuQix3R0FBd0c7SUFFeEcsaUJBQWlCLENBQUMsSUFBWSxFQUFFLFNBQWM7UUFDNUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVELG1CQUFtQixDQUFDLElBQVk7UUFDOUIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRUQsWUFBWSxDQUFJLElBQVk7UUFDMUIsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFFRCxlQUFlLENBQUMsR0FBVyxFQUFFLFVBQTRCO1FBQ3ZELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFRCxhQUFhLENBQUMsR0FBVztRQUN2QixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzlDLENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxHQUFXO1FBQzFCLGlDQUFpQztRQUNqQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ3BDLE9BQU8sQ0FBQyxJQUFJLENBQUMsNEJBQTRCLEdBQUcsZ0NBQWdDLENBQUMsQ0FBQztRQUNoRixDQUFDO1FBRUQsMEJBQTBCO1FBQzFCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVELGlCQUFpQixDQUNmLFVBQTRCLEVBQzVCLGlCQUFtQyxFQUFFO1FBRXJDLEtBQUssTUFBTSxJQUFJLElBQUksVUFBVSxFQUFFLENBQUM7WUFDOUIsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBRSxDQUFDO2dCQUMxQixjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUMxQixTQUFTO1lBQ1gsQ0FBQztZQUVELElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxPQUFPLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxhQUFhLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxPQUFPLEVBQUUsQ0FBQztnQkFDbEYsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7b0JBQ2xCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLGNBQWMsQ0FBQyxDQUFDO2dCQUN4RCxDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7UUFFRCxPQUFPLGNBQWMsQ0FBQztJQUN4QixDQUFDO0lBRUQsT0FBTyxDQUFDLEVBQVUsRUFBRSxVQUE0QjtRQUM5QyxLQUFLLE1BQU0sSUFBSSxJQUFJLFVBQVUsRUFBRSxDQUFDO1lBQzlCLElBQUksSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQztnQkFDbkIsT0FBTyxJQUFJLENBQUM7WUFDZCxDQUFDO1lBRUQsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ2xCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFFbEQsSUFBSSxTQUFTLEVBQUUsQ0FBQztvQkFDZCxPQUFPLFNBQVMsQ0FBQztnQkFDbkIsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsYUFBYSxDQUNYLEVBQVUsRUFDVixVQUE0QixFQUM1QixNQUF5QztRQUV6QyxLQUFLLE1BQU0sSUFBSSxJQUFJLFVBQVUsRUFBRSxDQUFDO1lBQzlCLElBQUksSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQztnQkFDbkIsT0FBTyxNQUFNLENBQUM7WUFDaEIsQ0FBQztZQUVELElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNsQixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUU5RCxJQUFJLFNBQVMsRUFBRSxDQUFDO29CQUNkLE9BQU8sU0FBUyxDQUFDO2dCQUNuQixDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7d0dBaEdVLGlCQUFpQjs0R0FBakIsaUJBQWlCLGNBREosTUFBTTs7NEZBQ25CLGlCQUFpQjtrQkFEN0IsVUFBVTttQkFBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBOYXZpZ2F0aW9uSXRlbSB9IGZyb20gJy4vbmF2aWdhdGlvbi50eXBlcyc7XG5cbkBJbmplY3RhYmxlKHsgcHJvdmlkZWRJbjogJ3Jvb3QnIH0pXG5leHBvcnQgY2xhc3MgTmF2aWdhdGlvblNlcnZpY2Uge1xuICBwcml2YXRlIF9jb21wb25lbnRSZWdpc3RyeTogTWFwPHN0cmluZywgYW55PiA9IG5ldyBNYXA8c3RyaW5nLCBhbnk+KCk7XG4gIHByaXZhdGUgX25hdmlnYXRpb25TdG9yZTogTWFwPHN0cmluZywgTmF2aWdhdGlvbkl0ZW1bXT4gPSBuZXcgTWFwPHN0cmluZywgYW55PigpO1xuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIEAgUHVibGljIG1ldGhvZHNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICByZWdpc3RlckNvbXBvbmVudChuYW1lOiBzdHJpbmcsIGNvbXBvbmVudDogYW55KTogdm9pZCB7XG4gICAgdGhpcy5fY29tcG9uZW50UmVnaXN0cnkuc2V0KG5hbWUsIGNvbXBvbmVudCk7XG4gIH1cblxuICBkZXJlZ2lzdGVyQ29tcG9uZW50KG5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2NvbXBvbmVudFJlZ2lzdHJ5LmRlbGV0ZShuYW1lKTtcbiAgfVxuXG4gIGdldENvbXBvbmVudDxUPihuYW1lOiBzdHJpbmcpOiBUIHtcbiAgICByZXR1cm4gdGhpcy5fY29tcG9uZW50UmVnaXN0cnkuZ2V0KG5hbWUpO1xuICB9XG5cbiAgc3RvcmVOYXZpZ2F0aW9uKGtleTogc3RyaW5nLCBuYXZpZ2F0aW9uOiBOYXZpZ2F0aW9uSXRlbVtdKTogdm9pZCB7XG4gICAgdGhpcy5fbmF2aWdhdGlvblN0b3JlLnNldChrZXksIG5hdmlnYXRpb24pO1xuICB9XG5cbiAgZ2V0TmF2aWdhdGlvbihrZXk6IHN0cmluZyk6IE5hdmlnYXRpb25JdGVtW10ge1xuICAgIHJldHVybiB0aGlzLl9uYXZpZ2F0aW9uU3RvcmUuZ2V0KGtleSkgPz8gW107XG4gIH1cblxuICBkZWxldGVOYXZpZ2F0aW9uKGtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgLy8gQ2hlY2sgaWYgdGhlIG5hdmlnYXRpb24gZXhpc3RzXG4gICAgaWYgKCF0aGlzLl9uYXZpZ2F0aW9uU3RvcmUuaGFzKGtleSkpIHtcbiAgICAgIGNvbnNvbGUud2FybihgTmF2aWdhdGlvbiB3aXRoIHRoZSBrZXkgJyR7a2V5fScgZG9lcyBub3QgZXhpc3QgaW4gdGhlIHN0b3JlLmApO1xuICAgIH1cblxuICAgIC8vIERlbGV0ZSBmcm9tIHRoZSBzdG9yYWdlXG4gICAgdGhpcy5fbmF2aWdhdGlvblN0b3JlLmRlbGV0ZShrZXkpO1xuICB9XG5cbiAgZ2V0RmxhdE5hdmlnYXRpb24oXG4gICAgbmF2aWdhdGlvbjogTmF2aWdhdGlvbkl0ZW1bXSxcbiAgICBmbGF0TmF2aWdhdGlvbjogTmF2aWdhdGlvbkl0ZW1bXSA9IFtdXG4gICk6IE5hdmlnYXRpb25JdGVtW10ge1xuICAgIGZvciAoY29uc3QgaXRlbSBvZiBuYXZpZ2F0aW9uKSB7XG4gICAgICBpZiAoaXRlbS50eXBlID09PSAnYmFzaWMnKSB7XG4gICAgICAgIGZsYXROYXZpZ2F0aW9uLnB1c2goaXRlbSk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXRlbS50eXBlID09PSAnYXNpZGUnIHx8IGl0ZW0udHlwZSA9PT0gJ2NvbGxhcHNhYmxlJyB8fCBpdGVtLnR5cGUgPT09ICdncm91cCcpIHtcbiAgICAgICAgaWYgKGl0ZW0uY2hpbGRyZW4pIHtcbiAgICAgICAgICB0aGlzLmdldEZsYXROYXZpZ2F0aW9uKGl0ZW0uY2hpbGRyZW4sIGZsYXROYXZpZ2F0aW9uKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmbGF0TmF2aWdhdGlvbjtcbiAgfVxuXG4gIGdldEl0ZW0oaWQ6IHN0cmluZywgbmF2aWdhdGlvbjogTmF2aWdhdGlvbkl0ZW1bXSk6IE5hdmlnYXRpb25JdGVtIHwgbnVsbCB7XG4gICAgZm9yIChjb25zdCBpdGVtIG9mIG5hdmlnYXRpb24pIHtcbiAgICAgIGlmIChpdGVtLmlkID09PSBpZCkge1xuICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgIH1cblxuICAgICAgaWYgKGl0ZW0uY2hpbGRyZW4pIHtcbiAgICAgICAgY29uc3QgY2hpbGRJdGVtID0gdGhpcy5nZXRJdGVtKGlkLCBpdGVtLmNoaWxkcmVuKTtcblxuICAgICAgICBpZiAoY2hpbGRJdGVtKSB7XG4gICAgICAgICAgcmV0dXJuIGNoaWxkSXRlbTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgZ2V0SXRlbVBhcmVudChcbiAgICBpZDogc3RyaW5nLFxuICAgIG5hdmlnYXRpb246IE5hdmlnYXRpb25JdGVtW10sXG4gICAgcGFyZW50OiBOYXZpZ2F0aW9uSXRlbVtdIHwgTmF2aWdhdGlvbkl0ZW1cbiAgKTogTmF2aWdhdGlvbkl0ZW1bXSB8IE5hdmlnYXRpb25JdGVtIHwgbnVsbCB7XG4gICAgZm9yIChjb25zdCBpdGVtIG9mIG5hdmlnYXRpb24pIHtcbiAgICAgIGlmIChpdGVtLmlkID09PSBpZCkge1xuICAgICAgICByZXR1cm4gcGFyZW50O1xuICAgICAgfVxuXG4gICAgICBpZiAoaXRlbS5jaGlsZHJlbikge1xuICAgICAgICBjb25zdCBjaGlsZEl0ZW0gPSB0aGlzLmdldEl0ZW1QYXJlbnQoaWQsIGl0ZW0uY2hpbGRyZW4sIGl0ZW0pO1xuXG4gICAgICAgIGlmIChjaGlsZEl0ZW0pIHtcbiAgICAgICAgICByZXR1cm4gY2hpbGRJdGVtO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cbiJdfQ==