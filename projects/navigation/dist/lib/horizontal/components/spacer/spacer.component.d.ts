import { ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { NavigationService } from '../../../navigation.service';
import { NavigationItem } from '../../../navigation.types';
import * as i0 from "@angular/core";
export declare class HorizontalNavigationSpacerItemComponent implements OnInit, OnDestroy {
    private _changeDetectorRef;
    private _navigationService;
    item: NavigationItem;
    name: string;
    private _horizontalNavigationComponent;
    private _unsubscribeAll;
    constructor(_changeDetectorRef: ChangeDetectorRef, _navigationService: NavigationService);
    ngOnInit(): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<HorizontalNavigationSpacerItemComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<HorizontalNavigationSpacerItemComponent, "horizontal-navigation-spacer-item", never, { "item": { "alias": "item"; "required": false; }; "name": { "alias": "name"; "required": false; }; }, {}, never, never, true, never>;
}
