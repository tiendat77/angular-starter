import * as i0 from '@angular/core';
import { InjectionToken, OnInit, AfterViewChecked, OnDestroy, ElementRef, ErrorHandler, Optional, Provider, EnvironmentProviders } from '@angular/core';
import { SafeResourceUrl, SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs';

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Injection token used to provide the current location to `SvgIcon`.
 * Used to handle server-side rendering and to stub out during unit tests.
 * @docs-private
 */
declare const SVG_ICON_LOCATION: InjectionToken<SvgIconLocation>;
/**
 * Stubbed out location for `SvgIcon`.
 * @docs-private
 */
interface SvgIconLocation {
    getPathname: () => string;
}
/** @docs-private */
declare function SVG_ICON_LOCATION_FACTORY(): SvgIconLocation;
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
declare class SvgIcon implements OnInit, AfterViewChecked, OnDestroy {
    readonly _elementRef: ElementRef<HTMLElement>;
    private _iconRegistry;
    private readonly _errorHandler;
    private _location;
    /**
     * Whether the icon should be inlined, automatically sizing the icon to match the font size of
     * the element the icon is contained in.
     */
    inline: boolean;
    /** Theme color of the icon. */
    color?: string;
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
    constructor();
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
    static ɵfac: i0.ɵɵFactoryDeclaration<SvgIcon, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SvgIcon, "svg-icon", ["svgIcon"], { "inline": { "alias": "inline"; "required": false; }; "color": { "alias": "color"; "required": false; }; "name": { "alias": "name"; "required": false; }; "fontSet": { "alias": "fontSet"; "required": false; }; "fontIcon": { "alias": "fontIcon"; "required": false; }; }, {}, never, ["*"], true, never>;
    static ngAcceptInputType_inline: unknown;
}

declare class SvgIconModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<SvgIconModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<SvgIconModule, never, [typeof SvgIcon], [typeof SvgIcon]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<SvgIconModule>;
}

/**
 * Returns an exception to be thrown in the case when attempting to
 * load an icon with a name that cannot be found.
 * @docs-private
 */
declare function getSvgIconNameNotFoundError(iconName: string): Error;
/**
 * Returns an exception to be thrown when the consumer attempts to use
 * `<svg-icon>` without including @angular/common/http.
 * @docs-private
 */
declare function getSvgIconNoHttpProviderError(): Error;
/**
 * Returns an exception to be thrown when a URL couldn't be sanitized.
 * @param url URL that was attempted to be sanitized.
 * @docs-private
 */
declare function getSvgIconFailedToSanitizeUrlError(url: SafeResourceUrl): Error;
/**
 * Returns an exception to be thrown when a HTML string couldn't be sanitized.
 * @param literal HTML that was attempted to be sanitized.
 * @docs-private
 */
declare function getSvgIconFailedToSanitizeLiteralError(literal: SafeHtml): Error;
/** Options that can be used to configure how an icon or the icons in an icon set are presented. */
interface IconOptions {
    /** View box to set on the icon. */
    viewBox?: string;
    /** Whether or not to fetch the icon or icon set using HTTP credentials. */
    withCredentials?: boolean;
}
/**
 * Function that will be invoked by the icon registry when trying to resolve the
 * URL from which to fetch an icon. The returned URL will be used to make a request for the icon.
 */
type IconResolver = (name: string, namespace: string) => SafeResourceUrl | SafeResourceUrlWithIconOptions | null;
/** Object that specifies a URL from which to fetch an icon and the options to use for it. */
interface SafeResourceUrlWithIconOptions {
    url: SafeResourceUrl;
    options: IconOptions;
}
/**
 * Service to register and display icons used by the `<svg-icon>` component.
 * - Registers icon URLs by namespace and name.
 * - Registers icon set URLs by namespace.
 * - Registers aliases for CSS classes, for use with icon fonts.
 * - Loads icons from URLs and extracts individual icons from icon sets.
 */
declare class SvgIconRegistry implements OnDestroy {
    private _httpClient;
    private _sanitizer;
    private readonly _errorHandler;
    private _document;
    /**
     * URLs and cached SVG elements for individual icons. Keys are of the format "[namespace]:[icon]".
     */
    private _svgIconConfigs;
    /**
     * SvgIconConfig objects and cached SVG elements for icon sets, keyed by namespace.
     * Multiple icon sets can be registered under the same namespace.
     */
    private _iconSetConfigs;
    /** Cache for icons loaded by direct URLs. */
    private _cachedIconsByUrl;
    /** In-progress icon fetches. Used to coalesce multiple requests to the same URL. */
    private _inProgressUrlFetches;
    /** Map from font identifiers to their CSS class names. Used for icon fonts. */
    private _fontCssClassesByAlias;
    /** Registered icon resolver functions. */
    private _resolvers;
    /**
     * The CSS classes to apply when an `<svg-icon>` component has no icon name, url, or font
     * specified. The default 'svg-icons' value assumes that the svg icon font has been
     * loaded as described
     */
    private _defaultFontSetClass;
    constructor();
    /**
     * Registers an icon by URL in the default namespace.
     * @param iconName Name under which the icon should be registered.
     * @param url
     */
    addSvgIcon(iconName: string, url: SafeResourceUrl, options?: IconOptions): this;
    /**
     * Registers an icon using an HTML string in the default namespace.
     * @param iconName Name under which the icon should be registered.
     * @param literal SVG source of the icon.
     */
    addSvgIconLiteral(iconName: string, literal: SafeHtml, options?: IconOptions): this;
    /**
     * Registers an icon by URL in the specified namespace.
     * @param namespace Namespace in which the icon should be registered.
     * @param iconName Name under which the icon should be registered.
     * @param url
     */
    addSvgIconInNamespace(namespace: string, iconName: string, url: SafeResourceUrl, options?: IconOptions): this;
    /**
     * Registers an icon resolver function with the registry. The function will be invoked with the
     * name and namespace of an icon when the registry tries to resolve the URL from which to fetch
     * the icon. The resolver is expected to return a `SafeResourceUrl` that points to the icon,
     * an object with the icon URL and icon options, or `null` if the icon is not supported. Resolvers
     * will be invoked in the order in which they have been registered.
     * @param resolver Resolver function to be registered.
     */
    addSvgIconResolver(resolver: IconResolver): this;
    /**
     * Registers an icon using an HTML string in the specified namespace.
     * @param namespace Namespace in which the icon should be registered.
     * @param iconName Name under which the icon should be registered.
     * @param literal SVG source of the icon.
     */
    addSvgIconLiteralInNamespace(namespace: string, iconName: string, literal: SafeHtml, options?: IconOptions): this;
    /**
     * Registers an icon set by URL in the default namespace.
     * @param url
     */
    addSvgIconSet(url: SafeResourceUrl, options?: IconOptions): this;
    /**
     * Registers an icon set using an HTML string in the default namespace.
     * @param literal SVG source of the icon set.
     */
    addSvgIconSetLiteral(literal: SafeHtml, options?: IconOptions): this;
    /**
     * Registers an icon set by URL in the specified namespace.
     * @param namespace Namespace in which to register the icon set.
     * @param url
     */
    addSvgIconSetInNamespace(namespace: string, url: SafeResourceUrl, options?: IconOptions): this;
    /**
     * Registers an icon set using an HTML string in the specified namespace.
     * @param namespace Namespace in which to register the icon set.
     * @param literal SVG source of the icon set.
     */
    addSvgIconSetLiteralInNamespace(namespace: string, literal: SafeHtml, options?: IconOptions): this;
    /**
     * Defines an alias for CSS class names to be used for icon fonts. Creating an svgIcon
     * component with the alias as the fontSet input will cause the class name to be applied
     * to the `<svg-icon>` element.
     *
     * If the registered font is a ligature font, then don't forget to also include the special
     * class `svg-ligature-font` to allow the usage via attribute. So register like this:
     *
     * ```ts
     * iconRegistry.registerFontClassAlias('f1', 'font1 svg-ligature-font');
     * ```
     *
     * And use like this:
     *
     * ```html
     * <svg-icon fontSet="f1" fontIcon="home"></svg-icon>
     * ```
     *
     * @param alias Alias for the font.
     * @param classNames Class names override to be used instead of the alias.
     */
    registerFontClassAlias(alias: string, classNames?: string): this;
    /**
     * Returns the CSS class name associated with the alias by a previous call to
     * registerFontClassAlias. If no CSS class has been associated, returns the alias unmodified.
     */
    classNameForFontAlias(alias: string): string;
    /**
     * Sets the CSS classes to be used for icon fonts when an `<svg-icon>` component does not
     * have a fontSet input value, and is not loading an icon by name or URL.
     */
    setDefaultFontSetClass(...classNames: string[]): this;
    /**
     * Returns the CSS classes to be used for icon fonts when an `<svg-icon>` component does not
     * have a fontSet input value, and is not loading an icon by name or URL.
     */
    getDefaultFontSetClass(): string[];
    /**
     * Returns an Observable that produces the icon (as an `<svg>` DOM element) from the given URL.
     * The response from the URL may be cached so this will not always cause an HTTP request, but
     * the produced element will always be a new copy of the originally fetched icon. (That is,
     * it will not contain any modifications made to elements previously returned).
     *
     * @param safeUrl URL from which to fetch the SVG icon.
     */
    getSvgIconFromUrl(safeUrl: SafeResourceUrl): Observable<SVGElement>;
    /**
     * Returns an Observable that produces the icon (as an `<svg>` DOM element) with the given name
     * and namespace. The icon must have been previously registered with addIcon or addIconSet;
     * if not, the Observable will throw an error.
     *
     * @param name Name of the icon to be retrieved.
     * @param namespace Namespace in which to look for the icon.
     */
    getNamedSvgIcon(name: string, namespace?: string): Observable<SVGElement>;
    ngOnDestroy(): void;
    /**
     * Returns the cached icon for a SvgIconConfig if available, or fetches it from its URL if not.
     */
    private _getSvgFromConfig;
    /**
     * Attempts to find an icon with the specified name in any of the SVG icon sets.
     * First searches the available cached icons for a nested element with a matching name, and
     * if found copies the element to a new `<svg>` element. If not found, fetches all icon sets
     * that have not been cached, and searches again after all fetches are completed.
     * The returned Observable produces the SVG element if possible, and throws
     * an error if no icon with the specified name can be found.
     */
    private _getSvgFromIconSetConfigs;
    /**
     * Searches the cached SVG elements for the given icon sets for a nested icon element whose "id"
     * tag matches the specified name. If found, copies the nested element to a new SVG element and
     * returns it. Returns null if no matching element is found.
     */
    private _extractIconWithNameFromAnySet;
    /**
     * Loads the content of the icon URL specified in the SvgIconConfig and creates an SVG element
     * from it.
     */
    private _loadSvgIconFromConfig;
    /**
     * Loads the content of the icon set URL specified in the
     * SvgIconConfig and attaches it to the config.
     */
    private _loadSvgIconSetFromConfig;
    /**
     * Searches the cached element of the given SvgIconConfig for a nested icon element whose "id"
     * tag matches the specified name. If found, copies the nested element to a new SVG element and
     * returns it. Returns null if no matching element is found.
     */
    private _extractSvgIconFromSet;
    /**
     * Creates a DOM element from the given SVG string.
     */
    private _svgElementFromString;
    /**
     * Converts an element into an SVG node by cloning all of its children.
     */
    private _toSvgElement;
    /**
     * Sets the default attributes for an SVG element to be used as an icon.
     */
    private _setSvgAttributes;
    /**
     * Returns an Observable which produces the string contents of the given icon. Results may be
     * cached, so future calls with the same URL may not cause another HTTP request.
     */
    private _fetchIcon;
    /**
     * Registers an icon config by name in the specified namespace.
     * @param namespace Namespace in which to register the icon config.
     * @param iconName Name under which to register the config.
     * @param config Config to be registered.
     */
    private _addSvgIconConfig;
    /**
     * Registers an icon set config in the specified namespace.
     * @param namespace Namespace in which to register the icon config.
     * @param config Config to be registered.
     */
    private _addSvgIconSetConfig;
    /** Parses a config's text into an SVG element. */
    private _svgElementFromConfig;
    /** Tries to create an icon config through the registered resolver functions. */
    private _getIconConfigFromResolvers;
    static ɵfac: i0.ɵɵFactoryDeclaration<SvgIconRegistry, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<SvgIconRegistry>;
}
/** @docs-private */
declare function ICON_REGISTRY_PROVIDER_FACTORY(parentRegistry: SvgIconRegistry): SvgIconRegistry;
/** @docs-private */
declare const ICON_REGISTRY_PROVIDER: {
    provide: typeof SvgIconRegistry;
    deps: (typeof DomSanitizer | typeof ErrorHandler | Optional[])[];
    useFactory: typeof ICON_REGISTRY_PROVIDER_FACTORY;
};

interface IconNamespace {
    url: string;
    name: string;
}

declare const ICON_NAMESPACES: InjectionToken<IconNamespace[]>;

declare const provideIcons: (namespaces?: IconNamespace[]) => (Provider | EnvironmentProviders)[];

declare class IconsService {
    protected _domSanitizer: DomSanitizer;
    protected _svgIconRegistry: SvgIconRegistry;
    protected _namespaces: IconNamespace[];
    constructor();
    register(namespaces: IconNamespace[]): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<IconsService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<IconsService>;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @fileoverview
 * A module to facilitate use of a Trusted Types policy internally within
 * Angular Material. It lazily constructs the Trusted Types policy, providing
 * helper utilities for promoting strings to Trusted Types. When Trusted Types
 * are not available, strings are used as a fallback.
 * @security All use of this module is security-sensitive and should go through
 * security review.
 */
declare interface TrustedHTML {
    __brand__: 'TrustedHTML';
}
declare interface TrustedTypePolicyFactory {
    createPolicy(policyName: string, policyOptions: {
        createHTML?: (input: string) => string;
    }): TrustedTypePolicy;
}
declare interface TrustedTypePolicy {
    createHTML(input: string): TrustedHTML;
}
/**
 * Unsafely promote a string to a TrustedHTML, falling back to strings when
 * Trusted Types are not available.
 * @security This is a security-sensitive function; any use of this function
 * must go through security review. In particular, it must be assured that the
 * provided string will never cause an XSS vulnerability if used in a context
 * that will be interpreted as HTML by a browser, e.g. when assigning to
 * element.innerHTML.
 */
declare function trustedHTMLFromString(html: string): TrustedHTML;

export { ICON_NAMESPACES, ICON_REGISTRY_PROVIDER, ICON_REGISTRY_PROVIDER_FACTORY, IconsService, SVG_ICON_LOCATION, SVG_ICON_LOCATION_FACTORY, SvgIcon, SvgIconModule, SvgIconRegistry, getSvgIconFailedToSanitizeLiteralError, getSvgIconFailedToSanitizeUrlError, getSvgIconNameNotFoundError, getSvgIconNoHttpProviderError, provideIcons, trustedHTMLFromString };
export type { IconNamespace, IconOptions, IconResolver, SafeResourceUrlWithIconOptions, SvgIconLocation, TrustedHTML, TrustedTypePolicy, TrustedTypePolicyFactory };
