import * as i0 from '@angular/core';
import { OnChanges, OnInit, OnDestroy, SimpleChanges, AfterViewInit, EventEmitter } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { Params, QueryParamsHandling, IsActiveMatchOptions } from '@angular/router';
import { BooleanInput } from '@angular/cdk/coercion';

interface NavigationItem {
    id?: string;
    title?: string;
    subtitle?: string;
    type: 'aside' | 'basic' | 'collapsable' | 'divider' | 'group' | 'spacer';
    hidden?: (item: NavigationItem) => boolean;
    active?: boolean;
    disabled?: boolean;
    link?: string;
    fragment?: string;
    preserveFragment?: boolean;
    queryParams?: Params | null;
    queryParamsHandling?: QueryParamsHandling | null;
    externalLink?: boolean;
    target?: '_blank' | '_self' | '_parent' | '_top' | string;
    exactMatch?: boolean;
    isActiveMatchOptions?: IsActiveMatchOptions;
    function?: (item: NavigationItem) => void;
    classes?: {
        title?: string;
        subtitle?: string;
        icon?: string;
        wrapper?: string;
    };
    icon?: string;
    badge?: {
        title?: string;
        classes?: string;
    };
    children?: NavigationItem[];
    meta?: any;
    permissions?: string[];
}
type VerticalNavigationAppearance = 'default' | 'compact' | 'dense' | 'thin';
type VerticalNavigationMode = 'over' | 'side';
type VerticalNavigationPosition = 'left' | 'right';

declare class HorizontalNavigationComponent implements OnChanges, OnInit, OnDestroy {
    name: string;
    navigation: NavigationItem[];
    onRefreshed: ReplaySubject<boolean>;
    private _unsubscribeAll;
    private _changeDetectorRef;
    private _navigationService;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnInit(): void;
    ngOnDestroy(): void;
    refresh(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<HorizontalNavigationComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<HorizontalNavigationComponent, "horizontal-navigation", ["horizontalNavigation"], { "name": { "alias": "name"; "required": false; }; "navigation": { "alias": "navigation"; "required": false; }; }, {}, never, never, true, never>;
}

declare class NavigationService {
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

declare class VerticalNavigationComponent implements OnChanges, OnInit, AfterViewInit, OnDestroy {
    static ngAcceptInputType_inner: BooleanInput;
    static ngAcceptInputType_opened: BooleanInput;
    static ngAcceptInputType_transparentOverlay: BooleanInput;
    appearance: VerticalNavigationAppearance;
    autoCollapse: boolean;
    inner: boolean;
    mode: VerticalNavigationMode;
    name: string;
    navigation: NavigationItem[];
    opened: boolean;
    position: VerticalNavigationPosition;
    transparentOverlay: boolean;
    readonly appearanceChanged: EventEmitter<VerticalNavigationAppearance>;
    readonly modeChanged: EventEmitter<VerticalNavigationMode>;
    readonly openedChanged: EventEmitter<boolean>;
    readonly positionChanged: EventEmitter<VerticalNavigationPosition>;
    private _navigationContentEl;
    activeAsideItemId: string;
    onCollapsableItemCollapsed: ReplaySubject<NavigationItem>;
    onCollapsableItemExpanded: ReplaySubject<NavigationItem>;
    onRefreshed: ReplaySubject<boolean>;
    private _animationsEnabled;
    private _asideOverlay;
    private readonly _handleAsideOverlayClick;
    private readonly _handleOverlayClick;
    private _hovered;
    private _mutationObserver;
    private _overlay;
    private _player;
    private _scrollStrategy;
    private _unsubscribeAll;
    private _document;
    private _animationBuilder;
    private _changeDetectorRef;
    private _elementRef;
    private _renderer2;
    private _router;
    private _scrollStrategyOptions;
    private _navigationService;
    constructor();
    get classList(): any;
    get styleList(): any;
    onMouseenter(): void;
    onMouseleave(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnInit(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    refresh(): void;
    open(): void;
    close(): void;
    toggle(): void;
    openAside(item: NavigationItem): void;
    closeAside(): void;
    toggleAside(item: NavigationItem): void;
    private _enableAnimations;
    private _disableAnimations;
    private _showOverlay;
    private _hideOverlay;
    private _showAsideOverlay;
    private _hideAsideOverlay;
    private _toggleOpened;
    static ɵfac: i0.ɵɵFactoryDeclaration<VerticalNavigationComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<VerticalNavigationComponent, "vertical-navigation", ["verticalNavigation"], { "appearance": { "alias": "appearance"; "required": false; }; "autoCollapse": { "alias": "autoCollapse"; "required": false; }; "inner": { "alias": "inner"; "required": false; }; "mode": { "alias": "mode"; "required": false; }; "name": { "alias": "name"; "required": false; }; "navigation": { "alias": "navigation"; "required": false; }; "opened": { "alias": "opened"; "required": false; }; "position": { "alias": "position"; "required": false; }; "transparentOverlay": { "alias": "transparentOverlay"; "required": false; }; }, { "appearanceChanged": "appearanceChanged"; "modeChanged": "modeChanged"; "openedChanged": "openedChanged"; "positionChanged": "positionChanged"; }, never, ["[verticalNavigationHeader]", "[verticalNavigationContentHeader]", "[verticalNavigationContentFooter]", "[verticalNavigationFooter]"], true, never>;
}

export { HorizontalNavigationComponent, NavigationService, VerticalNavigationComponent };
export type { NavigationItem, VerticalNavigationAppearance, VerticalNavigationMode, VerticalNavigationPosition };
