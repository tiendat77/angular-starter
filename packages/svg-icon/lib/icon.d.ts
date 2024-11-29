import { AfterViewChecked, ElementRef, ErrorHandler, InjectionToken, OnDestroy, OnInit } from '@angular/core';
import { SvgIconRegistry } from './icon-registry';
import * as i0 from "@angular/core";
/**
 * Injection token used to provide the current location to `SvgIcon`.
 * Used to handle server-side rendering and to stub out during unit tests.
 * @docs-private
 */
export declare const SVG_ICON_LOCATION: InjectionToken<SvgIconLocation>;
/**
 * Stubbed out location for `SvgIcon`.
 * @docs-private
 */
export interface SvgIconLocation {
    getPathname: () => string;
}
/** @docs-private */
export declare function SVG_ICON_LOCATION_FACTORY(): SvgIconLocation;
/**
 * Component to display an icon. It can be used in the following ways:
 *
 * - Specify the svgIcon input to load an SVG icon from a URL previously registered with the
 *   addSvgIcon, addSvgIconInNamespace, addSvgIconSet, or addSvgIconSetInNamespace methods of
 *   SvgIconRegistry. If the svgIcon value contains a colon it is assumed to be in the format
 *   "[namespace]:[name]", if not the value will be the name of an icon in the default namespace.
 *   Examples:
 *     `<svg-icon svgIcon="left-arrow"></svg-icon>
 *     <svg-icon svgIcon="animals:cat"></svg-icon>`
 *
 * - Use a font ligature as an icon by putting the ligature text in the `fontIcon` attribute or the
 *   content of the `<svg-icon>` component. If you register a custom font class, don't forget to also
 *   include the special class `svg-ligature-font`. It is recommended to use the attribute alternative
 *   to prevent the ligature text to be selectable and to appear in search engine results.
 *   By default, the svg icons font is used as described at
 *   http://google.github.io/material-design-icons/#icon-font-for-the-web. You can specify an
 *   alternate font by setting the fontSet input to either the CSS class to apply to use the
 *   desired font, or to an alias previously registered with SvgIconRegistry.registerFontClassAlias.
 *   Examples:
 *     `<svg-icon fontIcon="home"></svg-icon>
 *     <svg-icon>home</svg-icon>
 *     <svg-icon fontSet="my_font" fontIcon="sun"></svg-icon>
 *     <svg-icon fontSet="my_font">sun</svg-icon>`
 *
 * - Specify a font glyph to be included via CSS rules by setting the fontSet input to specify the
 *   font, and the fontIcon input to specify the icon. Typically the fontIcon will specify a
 *   CSS class which causes the glyph to be displayed via a :before selector, as in
 *   https://fortawesome.github.io/Font-Awesome/examples/
 *   Example:
 *     `<svg-icon fontSet="fa" fontIcon="alarm"></svg-icon>`
 */
export declare class SvgIcon implements OnInit, AfterViewChecked, OnDestroy {
    readonly _elementRef: ElementRef<HTMLElement>;
    private _iconRegistry;
    private readonly _errorHandler;
    private _location;
    /**
     * Whether the icon should be inlined, automatically sizing the icon to match the font size of
     * the element the icon is contained in.
     */
    inline: boolean;
    /** Name of the icon in the SVG icon set. */
    get name(): string;
    set name(value: string);
    private _name;
    /** Font set that the icon is a part of. */
    get fontSet(): string;
    set fontSet(value: string);
    private _fontSet;
    /** Name of an icon within a font set. */
    get fontIcon(): string;
    set fontIcon(value: string);
    private _fontIcon;
    private _previousFontSetClass;
    private _previousFontIconClass;
    _svgName: string | null;
    _svgNamespace: string | null;
    /** Keeps track of the current page path. */
    private _previousPath?;
    /** Keeps track of the elements and attributes that we've prefixed with the current path. */
    private _elementsWithExternalReferences?;
    /** Subscription to the current in-progress SVG icon request. */
    private _currentIconFetch;
    constructor(_elementRef: ElementRef<HTMLElement>, _iconRegistry: SvgIconRegistry, _errorHandler: ErrorHandler, ariaHidden: string, _location: SvgIconLocation);
    /**
     * Splits an svgIcon binding value into its icon set and icon name components.
     * Returns a 2-element array of [(icon set), (icon name)].
     * The separator for the two fields is ':'. If there is no separator, an empty
     * string is returned for the icon set and the entire value is returned for
     * the icon name. If the argument is falsy, returns an array of two empty strings.
     * Throws an error if the name contains two or more ':' separators.
     * Examples:
     *   `'social:cake' -> ['social', 'cake']
     *   'penguin' -> ['', 'penguin']
     *   null -> ['', '']
     *   'a:b:c' -> (throws Error)`
     */
    private _splitIconName;
    ngOnInit(): void;
    ngAfterViewChecked(): void;
    ngOnDestroy(): void;
    _usingFontIcon(): boolean;
    private _setSvgElement;
    private _clearSvgElement;
    private _updateFontIconClasses;
    /**
     * Cleans up a value to be used as a fontIcon or fontSet.
     * Since the value ends up being assigned as a CSS class, we
     * have to trim the value and omit space-separated values.
     */
    private _cleanupFontValue;
    /**
     * Prepends the current path to all elements that have an attribute pointing to a `FuncIRI`
     * reference. This is required because WebKit browsers require references to be prefixed with
     * the current path, if the page has a `base` tag.
     */
    private _prependPathToReferences;
    /**
     * Caches the children of an SVG element that have `url()`
     * references that we need to prefix with the current path.
     */
    private _cacheChildrenWithExternalReferences;
    /** Sets a new SVG icon with a particular name. */
    private _updateSvgIcon;
    static ɵfac: i0.ɵɵFactoryDeclaration<SvgIcon, [null, null, null, { attribute: "aria-hidden"; }, null]>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SvgIcon, "svg-icon", ["svgIcon"], { "inline": { "alias": "inline"; "required": false; }; "name": { "alias": "name"; "required": false; }; "fontSet": { "alias": "fontSet"; "required": false; }; "fontIcon": { "alias": "fontIcon"; "required": false; }; }, {}, never, ["*"], true, never>;
    static ngAcceptInputType_inline: unknown;
}
