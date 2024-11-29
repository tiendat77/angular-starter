import { NavigationItem } from './navigation.types';
import * as i0 from "@angular/core";
export declare class NavigationService {
    private _componentRegistry;
    private _navigationStore;
    registerComponent(name: string, component: any): void;
    deregisterComponent(name: string): void;
    getComponent<T>(name: string): T;
    storeNavigation(key: string, navigation: NavigationItem[]): void;
    getNavigation(key: string): NavigationItem[];
    deleteNavigation(key: string): void;
    getFlatNavigation(navigation: NavigationItem[], flatNavigation?: NavigationItem[]): NavigationItem[];
    getItem(id: string, navigation: NavigationItem[]): NavigationItem | null;
    getItemParent(id: string, navigation: NavigationItem[], parent: NavigationItem[] | NavigationItem): NavigationItem[] | NavigationItem | null;
    static ɵfac: i0.ɵɵFactoryDeclaration<NavigationService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<NavigationService>;
}
