import { Injectable } from '@angular/core';
import { NavigationItem } from './navigation.types';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private _componentRegistry: Map<string, any> = new Map<string, any>();
  private _navigationStore: Map<string, NavigationItem[]> = new Map<string, any>();

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  registerComponent(name: string, component: any): void {
    this._componentRegistry.set(name, component);
  }

  deregisterComponent(name: string): void {
    this._componentRegistry.delete(name);
  }

  getComponent<T>(name: string): T {
    return this._componentRegistry.get(name);
  }

  storeNavigation(key: string, navigation: NavigationItem[]): void {
    this._navigationStore.set(key, navigation);
  }

  getNavigation(key: string): NavigationItem[] {
    return this._navigationStore.get(key) ?? [];
  }

  deleteNavigation(key: string): void {
    // Check if the navigation exists
    if (!this._navigationStore.has(key)) {
      console.warn(`Navigation with the key '${key}' does not exist in the store.`);
    }

    // Delete from the storage
    this._navigationStore.delete(key);
  }

  getFlatNavigation(
    navigation: NavigationItem[],
    flatNavigation: NavigationItem[] = []
  ): NavigationItem[] {
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

  getItem(id: string, navigation: NavigationItem[]): NavigationItem | null {
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

  getItemParent(
    id: string,
    navigation: NavigationItem[],
    parent: NavigationItem[] | NavigationItem
  ): NavigationItem[] | NavigationItem | null {
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
}
