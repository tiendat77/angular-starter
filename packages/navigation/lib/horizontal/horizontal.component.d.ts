import { ChangeDetectorRef, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { NavigationService } from '../navigation.service';
import { NavigationItem } from '../navigation.types';
import * as i0 from "@angular/core";
export declare class HorizontalNavigationComponent implements OnChanges, OnInit, OnDestroy {
    private _changeDetectorRef;
    private _navigationService;
    name: string;
    navigation: NavigationItem[];
    onRefreshed: ReplaySubject<boolean>;
    private _unsubscribeAll;
    /**
     * Constructor
     */
    constructor(_changeDetectorRef: ChangeDetectorRef, _navigationService: NavigationService);
    ngOnChanges(changes: SimpleChanges): void;
    ngOnInit(): void;
    ngOnDestroy(): void;
    refresh(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<HorizontalNavigationComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<HorizontalNavigationComponent, "horizontal-navigation", ["horizontalNavigation"], { "name": { "alias": "name"; "required": false; }; "navigation": { "alias": "navigation"; "required": false; }; }, {}, never, never, true, never>;
}
