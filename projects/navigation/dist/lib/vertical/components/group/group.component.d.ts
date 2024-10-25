import { ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { BooleanInput } from '@angular/cdk/coercion';
import { NavigationService } from '../../../navigation.service';
import { NavigationItem } from '../../../navigation.types';
import * as i0 from "@angular/core";
export declare class VerticalNavigationGroupItemComponent implements OnInit, OnDestroy {
    private _changeDetectorRef;
    private _navigationService;
    static ngAcceptInputType_autoCollapse: BooleanInput;
    autoCollapse: boolean;
    item: NavigationItem;
    name: string;
    private _verticalNavigationComponent;
    private _unsubscribeAll;
    constructor(_changeDetectorRef: ChangeDetectorRef, _navigationService: NavigationService);
    ngOnInit(): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<VerticalNavigationGroupItemComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<VerticalNavigationGroupItemComponent, "vertical-navigation-group-item", never, { "autoCollapse": { "alias": "autoCollapse"; "required": false; }; "item": { "alias": "item"; "required": false; }; "name": { "alias": "name"; "required": false; }; }, {}, never, never, true, never>;
}
