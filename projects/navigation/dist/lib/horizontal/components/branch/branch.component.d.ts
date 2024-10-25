import { ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { BooleanInput } from '@angular/cdk/coercion';
import { NavigationService } from '../../../navigation.service';
import { NavigationItem } from '../../../navigation.types';
import * as i0 from "@angular/core";
export declare class HorizontalNavigationBranchItemComponent implements OnInit, OnDestroy {
    private _changeDetectorRef;
    private _navigationService;
    static ngAcceptInputType_child: BooleanInput;
    child: boolean;
    item: NavigationItem;
    name: string;
    private _horizontalNavigationComponent;
    private _unsubscribeAll;
    constructor(_changeDetectorRef: ChangeDetectorRef, _navigationService: NavigationService);
    ngOnInit(): void;
    ngOnDestroy(): void;
    triggerChangeDetection(): void;
    trackByFn(index: number, item: any): any;
    static ɵfac: i0.ɵɵFactoryDeclaration<HorizontalNavigationBranchItemComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<HorizontalNavigationBranchItemComponent, "horizontal-navigation-branch-item", never, { "child": { "alias": "child"; "required": false; }; "item": { "alias": "item"; "required": false; }; "name": { "alias": "name"; "required": false; }; }, {}, never, never, true, never>;
}
