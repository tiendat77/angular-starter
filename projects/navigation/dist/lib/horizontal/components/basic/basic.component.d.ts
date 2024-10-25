import { ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { IsActiveMatchOptions } from '@angular/router';
import { NavigationService } from '../../../navigation.service';
import { NavigationItem } from '../../../navigation.types';
import * as i0 from "@angular/core";
export declare class HorizontalNavigationBasicItemComponent implements OnInit, OnDestroy {
    private _changeDetectorRef;
    private _navigationService;
    item: NavigationItem;
    name: string;
    isActiveMatchOptions: IsActiveMatchOptions;
    private _horizontalNavigationComponent;
    private _unsubscribeAll;
    constructor(_changeDetectorRef: ChangeDetectorRef, _navigationService: NavigationService);
    ngOnInit(): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<HorizontalNavigationBasicItemComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<HorizontalNavigationBasicItemComponent, "horizontal-navigation-basic-item", never, { "item": { "alias": "item"; "required": false; }; "name": { "alias": "name"; "required": false; }; }, {}, never, never, true, never>;
}
