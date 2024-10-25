import { ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { IsActiveMatchOptions } from '@angular/router';
import { NavigationService } from '../../../navigation.service';
import { NavigationItem } from '../../../navigation.types';
import * as i0 from "@angular/core";
export declare class VerticalNavigationBasicItemComponent implements OnInit, OnDestroy {
    private _changeDetectorRef;
    private _navigationService;
    item: NavigationItem;
    name: string;
    isActiveMatchOptions: IsActiveMatchOptions;
    private _verticalNavigationComponent;
    private _unsubscribeAll;
    constructor(_changeDetectorRef: ChangeDetectorRef, _navigationService: NavigationService);
    ngOnInit(): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<VerticalNavigationBasicItemComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<VerticalNavigationBasicItemComponent, "vertical-navigation-basic-item", never, { "item": { "alias": "item"; "required": false; }; "name": { "alias": "name"; "required": false; }; }, {}, never, never, true, never>;
}
