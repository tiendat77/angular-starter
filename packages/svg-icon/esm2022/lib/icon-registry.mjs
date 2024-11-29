/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ErrorHandler, Inject, Injectable, Optional, SecurityContext, SkipSelf, } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { forkJoin, of as observableOf, throwError as observableThrow } from 'rxjs';
import { catchError, finalize, map, share, tap } from 'rxjs/operators';
import { trustedHTMLFromString } from './trusted-types';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
import * as i2 from "@angular/platform-browser";
/**
 * Returns an exception to be thrown in the case when attempting to
 * load an icon with a name that cannot be found.
 * @docs-private
 */
export function getSvgIconNameNotFoundError(iconName) {
    return Error(`Unable to find icon with the name "${iconName}"`);
}
/**
 * Returns an exception to be thrown when the consumer attempts to use
 * `<svg-icon>` without including @angular/common/http.
 * @docs-private
 */
export function getSvgIconNoHttpProviderError() {
    return Error('Could not find HttpClient provider for use with Angular Svg icons. ' +
        'Please include the HttpClientModule from @angular/common/http in your ' +
        'app imports.');
}
/**
 * Returns an exception to be thrown when a URL couldn't be sanitized.
 * @param url URL that was attempted to be sanitized.
 * @docs-private
 */
export function getSvgIconFailedToSanitizeUrlError(url) {
    return Error('The URL provided to SvgIconRegistry was not trusted as a resource URL ' +
        `via Angular's DomSanitizer. Attempted URL was "${url}".`);
}
/**
 * Returns an exception to be thrown when a HTML string couldn't be sanitized.
 * @param literal HTML that was attempted to be sanitized.
 * @docs-private
 */
export function getSvgIconFailedToSanitizeLiteralError(literal) {
    return Error('The literal provided to SvgIconRegistry was not trusted as safe HTML by ' +
        `Angular's DomSanitizer. Attempted literal was "${literal}".`);
}
/**
 * Configuration for an icon, including the URL and possibly the cached SVG element.
 * @docs-private
 */
class SvgIconConfig {
    url;
    svgText;
    options;
    svgElement;
    constructor(url, svgText, options) {
        this.url = url;
        this.svgText = svgText;
        this.options = options;
    }
}
/**
 * Service to register and display icons used by the `<svg-icon>` component.
 * - Registers icon URLs by namespace and name.
 * - Registers icon set URLs by namespace.
 * - Registers aliases for CSS classes, for use with icon fonts.
 * - Loads icons from URLs and extracts individual icons from icon sets.
 */
export class SvgIconRegistry {
    _httpClient;
    _sanitizer;
    _errorHandler;
    _document;
    /**
     * URLs and cached SVG elements for individual icons. Keys are of the format "[namespace]:[icon]".
     */
    _svgIconConfigs = new Map();
    /**
     * SvgIconConfig objects and cached SVG elements for icon sets, keyed by namespace.
     * Multiple icon sets can be registered under the same namespace.
     */
    _iconSetConfigs = new Map();
    /** Cache for icons loaded by direct URLs. */
    _cachedIconsByUrl = new Map();
    /** In-progress icon fetches. Used to coalesce multiple requests to the same URL. */
    _inProgressUrlFetches = new Map();
    /** Map from font identifiers to their CSS class names. Used for icon fonts. */
    _fontCssClassesByAlias = new Map();
    /** Registered icon resolver functions. */
    _resolvers = [];
    /**
     * The CSS classes to apply when an `<svg-icon>` component has no icon name, url, or font
     * specified. The default 'svg-icons' value assumes that the svg icon font has been
     * loaded as described
     */
    _defaultFontSetClass = ['svg-icons', 'svg-ligature-font'];
    constructor(_httpClient, _sanitizer, document, _errorHandler) {
        this._httpClient = _httpClient;
        this._sanitizer = _sanitizer;
        this._errorHandler = _errorHandler;
        this._document = document;
    }
    /**
     * Registers an icon by URL in the default namespace.
     * @param iconName Name under which the icon should be registered.
     * @param url
     */
    addSvgIcon(iconName, url, options) {
        return this.addSvgIconInNamespace('', iconName, url, options);
    }
    /**
     * Registers an icon using an HTML string in the default namespace.
     * @param iconName Name under which the icon should be registered.
     * @param literal SVG source of the icon.
     */
    addSvgIconLiteral(iconName, literal, options) {
        return this.addSvgIconLiteralInNamespace('', iconName, literal, options);
    }
    /**
     * Registers an icon by URL in the specified namespace.
     * @param namespace Namespace in which the icon should be registered.
     * @param iconName Name under which the icon should be registered.
     * @param url
     */
    addSvgIconInNamespace(namespace, iconName, url, options) {
        return this._addSvgIconConfig(namespace, iconName, new SvgIconConfig(url, null, options));
    }
    /**
     * Registers an icon resolver function with the registry. The function will be invoked with the
     * name and namespace of an icon when the registry tries to resolve the URL from which to fetch
     * the icon. The resolver is expected to return a `SafeResourceUrl` that points to the icon,
     * an object with the icon URL and icon options, or `null` if the icon is not supported. Resolvers
     * will be invoked in the order in which they have been registered.
     * @param resolver Resolver function to be registered.
     */
    addSvgIconResolver(resolver) {
        this._resolvers.push(resolver);
        return this;
    }
    /**
     * Registers an icon using an HTML string in the specified namespace.
     * @param namespace Namespace in which the icon should be registered.
     * @param iconName Name under which the icon should be registered.
     * @param literal SVG source of the icon.
     */
    addSvgIconLiteralInNamespace(namespace, iconName, literal, options) {
        const cleanLiteral = this._sanitizer.sanitize(SecurityContext.HTML, literal);
        // TODO: add an ngDevMode check
        if (!cleanLiteral) {
            throw getSvgIconFailedToSanitizeLiteralError(literal);
        }
        // Security: The literal is passed in as SafeHtml, and is thus trusted.
        const trustedLiteral = trustedHTMLFromString(cleanLiteral);
        return this._addSvgIconConfig(namespace, iconName, new SvgIconConfig('', trustedLiteral, options));
    }
    /**
     * Registers an icon set by URL in the default namespace.
     * @param url
     */
    addSvgIconSet(url, options) {
        return this.addSvgIconSetInNamespace('', url, options);
    }
    /**
     * Registers an icon set using an HTML string in the default namespace.
     * @param literal SVG source of the icon set.
     */
    addSvgIconSetLiteral(literal, options) {
        return this.addSvgIconSetLiteralInNamespace('', literal, options);
    }
    /**
     * Registers an icon set by URL in the specified namespace.
     * @param namespace Namespace in which to register the icon set.
     * @param url
     */
    addSvgIconSetInNamespace(namespace, url, options) {
        return this._addSvgIconSetConfig(namespace, new SvgIconConfig(url, null, options));
    }
    /**
     * Registers an icon set using an HTML string in the specified namespace.
     * @param namespace Namespace in which to register the icon set.
     * @param literal SVG source of the icon set.
     */
    addSvgIconSetLiteralInNamespace(namespace, literal, options) {
        const cleanLiteral = this._sanitizer.sanitize(SecurityContext.HTML, literal);
        if (!cleanLiteral) {
            throw getSvgIconFailedToSanitizeLiteralError(literal);
        }
        // Security: The literal is passed in as SafeHtml, and is thus trusted.
        const trustedLiteral = trustedHTMLFromString(cleanLiteral);
        return this._addSvgIconSetConfig(namespace, new SvgIconConfig('', trustedLiteral, options));
    }
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
    registerFontClassAlias(alias, classNames = alias) {
        this._fontCssClassesByAlias.set(alias, classNames);
        return this;
    }
    /**
     * Returns the CSS class name associated with the alias by a previous call to
     * registerFontClassAlias. If no CSS class has been associated, returns the alias unmodified.
     */
    classNameForFontAlias(alias) {
        return this._fontCssClassesByAlias.get(alias) || alias;
    }
    /**
     * Sets the CSS classes to be used for icon fonts when an `<svg-icon>` component does not
     * have a fontSet input value, and is not loading an icon by name or URL.
     */
    setDefaultFontSetClass(...classNames) {
        this._defaultFontSetClass = classNames;
        return this;
    }
    /**
     * Returns the CSS classes to be used for icon fonts when an `<svg-icon>` component does not
     * have a fontSet input value, and is not loading an icon by name or URL.
     */
    getDefaultFontSetClass() {
        return this._defaultFontSetClass;
    }
    /**
     * Returns an Observable that produces the icon (as an `<svg>` DOM element) from the given URL.
     * The response from the URL may be cached so this will not always cause an HTTP request, but
     * the produced element will always be a new copy of the originally fetched icon. (That is,
     * it will not contain any modifications made to elements previously returned).
     *
     * @param safeUrl URL from which to fetch the SVG icon.
     */
    getSvgIconFromUrl(safeUrl) {
        const url = this._sanitizer.sanitize(SecurityContext.RESOURCE_URL, safeUrl);
        if (!url) {
            throw getSvgIconFailedToSanitizeUrlError(safeUrl);
        }
        const cachedIcon = this._cachedIconsByUrl.get(url);
        if (cachedIcon) {
            return observableOf(cloneSvg(cachedIcon));
        }
        return this._loadSvgIconFromConfig(new SvgIconConfig(safeUrl, null)).pipe(tap((svg) => this._cachedIconsByUrl.set(url, svg)), map((svg) => cloneSvg(svg)));
    }
    /**
     * Returns an Observable that produces the icon (as an `<svg>` DOM element) with the given name
     * and namespace. The icon must have been previously registered with addIcon or addIconSet;
     * if not, the Observable will throw an error.
     *
     * @param name Name of the icon to be retrieved.
     * @param namespace Namespace in which to look for the icon.
     */
    getNamedSvgIcon(name, namespace = '') {
        const key = iconKey(namespace, name);
        let config = this._svgIconConfigs.get(key);
        // Return (copy of) cached icon if possible.
        if (config) {
            return this._getSvgFromConfig(config);
        }
        // Otherwise try to resolve the config from one of the resolver functions.
        config = this._getIconConfigFromResolvers(namespace, name);
        if (config) {
            this._svgIconConfigs.set(key, config);
            return this._getSvgFromConfig(config);
        }
        // See if we have any icon sets registered for the namespace.
        const iconSetConfigs = this._iconSetConfigs.get(namespace);
        if (iconSetConfigs) {
            return this._getSvgFromIconSetConfigs(name, iconSetConfigs);
        }
        return observableThrow(getSvgIconNameNotFoundError(key));
    }
    ngOnDestroy() {
        this._resolvers = [];
        this._svgIconConfigs.clear();
        this._iconSetConfigs.clear();
        this._cachedIconsByUrl.clear();
    }
    /**
     * Returns the cached icon for a SvgIconConfig if available, or fetches it from its URL if not.
     */
    _getSvgFromConfig(config) {
        if (config.svgText) {
            // We already have the SVG element for this icon, return a copy.
            return observableOf(cloneSvg(this._svgElementFromConfig(config)));
        }
        else {
            // Fetch the icon from the config's URL, cache it, and return a copy.
            return this._loadSvgIconFromConfig(config).pipe(map((svg) => cloneSvg(svg)));
        }
    }
    /**
     * Attempts to find an icon with the specified name in any of the SVG icon sets.
     * First searches the available cached icons for a nested element with a matching name, and
     * if found copies the element to a new `<svg>` element. If not found, fetches all icon sets
     * that have not been cached, and searches again after all fetches are completed.
     * The returned Observable produces the SVG element if possible, and throws
     * an error if no icon with the specified name can be found.
     */
    _getSvgFromIconSetConfigs(name, iconSetConfigs) {
        // For all the icon set SVG elements we've fetched, see if any contain an icon with the
        // requested name.
        const namedIcon = this._extractIconWithNameFromAnySet(name, iconSetConfigs);
        if (namedIcon) {
            // We could cache namedIcon in _svgIconConfigs, but since we have to make a copy every
            // time anyway, there's probably not much advantage compared to just always extracting
            // it from the icon set.
            return observableOf(namedIcon);
        }
        // Not found in any cached icon sets. If there are icon sets with URLs that we haven't
        // fetched, fetch them now and look for iconName in the results.
        const iconSetFetchRequests = iconSetConfigs
            .filter((iconSetConfig) => !iconSetConfig.svgText)
            .map((iconSetConfig) => {
            return this._loadSvgIconSetFromConfig(iconSetConfig).pipe(catchError((err) => {
                const url = this._sanitizer.sanitize(SecurityContext.RESOURCE_URL, iconSetConfig.url);
                // Swallow errors fetching individual URLs so the
                // combined Observable won't necessarily fail.
                const errorMessage = `Loading icon set URL: ${url} failed: ${err.message}`;
                this._errorHandler.handleError(new Error(errorMessage));
                return observableOf(null);
            }));
        });
        // Fetch all the icon set URLs. When the requests complete, every IconSet should have a
        // cached SVG element (unless the request failed), and we can check again for the icon.
        return forkJoin(iconSetFetchRequests).pipe(map(() => {
            const foundIcon = this._extractIconWithNameFromAnySet(name, iconSetConfigs);
            // TODO: add an ngDevMode check
            if (!foundIcon) {
                throw getSvgIconNameNotFoundError(name);
            }
            return foundIcon;
        }));
    }
    /**
     * Searches the cached SVG elements for the given icon sets for a nested icon element whose "id"
     * tag matches the specified name. If found, copies the nested element to a new SVG element and
     * returns it. Returns null if no matching element is found.
     */
    _extractIconWithNameFromAnySet(iconName, iconSetConfigs) {
        // Iterate backwards, so icon sets added later have precedence.
        for (let i = iconSetConfigs.length - 1; i >= 0; i--) {
            const config = iconSetConfigs[i];
            // Parsing the icon set's text into an SVG element can be expensive. We can avoid some of
            // the parsing by doing a quick check using `indexOf` to see if there's any chance for the
            // icon to be in the set. This won't be 100% accurate, but it should help us avoid at least
            // some of the parsing.
            if (config.svgText && config.svgText.toString().indexOf(iconName) > -1) {
                const svg = this._svgElementFromConfig(config);
                const foundIcon = this._extractSvgIconFromSet(svg, iconName, config.options);
                if (foundIcon) {
                    return foundIcon;
                }
            }
        }
        return null;
    }
    /**
     * Loads the content of the icon URL specified in the SvgIconConfig and creates an SVG element
     * from it.
     */
    _loadSvgIconFromConfig(config) {
        return this._fetchIcon(config).pipe(tap((svgText) => (config.svgText = svgText)), map(() => this._svgElementFromConfig(config)));
    }
    /**
     * Loads the content of the icon set URL specified in the
     * SvgIconConfig and attaches it to the config.
     */
    _loadSvgIconSetFromConfig(config) {
        if (config.svgText) {
            return observableOf(null);
        }
        return this._fetchIcon(config).pipe(tap((svgText) => (config.svgText = svgText)));
    }
    /**
     * Searches the cached element of the given SvgIconConfig for a nested icon element whose "id"
     * tag matches the specified name. If found, copies the nested element to a new SVG element and
     * returns it. Returns null if no matching element is found.
     */
    _extractSvgIconFromSet(iconSet, iconName, options) {
        // Use the `id="iconName"` syntax in order to escape special
        // characters in the ID (versus using the #iconName syntax).
        const iconSource = iconSet.querySelector(`[id="${iconName}"]`);
        if (!iconSource) {
            return null;
        }
        // Clone the element and remove the ID to prevent multiple elements from being added
        // to the page with the same ID.
        const iconElement = iconSource.cloneNode(true);
        iconElement.removeAttribute('id');
        // If the icon node is itself an <svg> node, clone and return it directly. If not, set it as
        // the content of a new <svg> node.
        if (iconElement.nodeName.toLowerCase() === 'svg') {
            return this._setSvgAttributes(iconElement, options);
        }
        // If the node is a <symbol>, it won't be rendered so we have to convert it into <svg>. Note
        // that the same could be achieved by referring to it via <use href="#id">, however the <use>
        // tag is problematic on Firefox, because it needs to include the current page path.
        if (iconElement.nodeName.toLowerCase() === 'symbol') {
            return this._setSvgAttributes(this._toSvgElement(iconElement), options);
        }
        // createElement('SVG') doesn't work as expected; the DOM ends up with
        // the correct nodes, but the SVG content doesn't render. Instead we
        // have to create an empty SVG node using innerHTML and append its content.
        // Elements created using DOMParser.parseFromString have the same problem.
        // http://stackoverflow.com/questions/23003278/svg-innerhtml-in-firefox-can-not-display
        const svg = this._svgElementFromString(trustedHTMLFromString('<svg></svg>'));
        // Clone the node so we don't remove it from the parent icon set element.
        svg.appendChild(iconElement);
        return this._setSvgAttributes(svg, options);
    }
    /**
     * Creates a DOM element from the given SVG string.
     */
    _svgElementFromString(str) {
        const div = this._document.createElement('DIV');
        div.innerHTML = str;
        const svg = div.querySelector('svg');
        // TODO: add an ngDevMode check
        if (!svg) {
            throw Error('<svg> tag not found');
        }
        return svg;
    }
    /**
     * Converts an element into an SVG node by cloning all of its children.
     */
    _toSvgElement(element) {
        const svg = this._svgElementFromString(trustedHTMLFromString('<svg></svg>'));
        const attributes = element.attributes;
        // Copy over all the attributes from the `symbol` to the new SVG, except the id.
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < attributes.length; i++) {
            const { name, value } = attributes[i];
            if (name !== 'id') {
                svg.setAttribute(name, value);
            }
        }
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < element.childNodes.length; i++) {
            if (element.childNodes[i].nodeType === this._document.ELEMENT_NODE) {
                svg.appendChild(element.childNodes[i].cloneNode(true));
            }
        }
        return svg;
    }
    /**
     * Sets the default attributes for an SVG element to be used as an icon.
     */
    _setSvgAttributes(svg, options) {
        svg.setAttribute('fit', '');
        svg.setAttribute('height', '100%');
        svg.setAttribute('width', '100%');
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svg.setAttribute('focusable', 'false'); // Disable IE11 default behavior to make SVGs focusable.
        if (options && options.viewBox) {
            svg.setAttribute('viewBox', options.viewBox);
        }
        return svg;
    }
    /**
     * Returns an Observable which produces the string contents of the given icon. Results may be
     * cached, so future calls with the same URL may not cause another HTTP request.
     */
    _fetchIcon(iconConfig) {
        const { url: safeUrl, options } = iconConfig;
        const withCredentials = options?.withCredentials ?? false;
        if (!this._httpClient) {
            throw getSvgIconNoHttpProviderError();
        }
        // TODO: add an ngDevMode check
        if (safeUrl == null) {
            throw Error(`Cannot fetch icon from URL "${safeUrl}".`);
        }
        const url = this._sanitizer.sanitize(SecurityContext.RESOURCE_URL, safeUrl);
        // TODO: add an ngDevMode check
        if (!url) {
            throw getSvgIconFailedToSanitizeUrlError(safeUrl);
        }
        // Store in-progress fetches to avoid sending a duplicate request for a URL when there is
        // already a request in progress for that URL. It's necessary to call share() on the
        // Observable returned by http.get() so that multiple subscribers don't cause multiple XHRs.
        const inProgressFetch = this._inProgressUrlFetches.get(url);
        if (inProgressFetch) {
            return inProgressFetch;
        }
        const req = this._httpClient.get(url, { responseType: 'text', withCredentials }).pipe(map((svg) => {
            // Security: This SVG is fetched from a SafeResourceUrl, and is thus
            // trusted HTML.
            return trustedHTMLFromString(svg);
        }), finalize(() => this._inProgressUrlFetches.delete(url)), share());
        this._inProgressUrlFetches.set(url, req);
        return req;
    }
    /**
     * Registers an icon config by name in the specified namespace.
     * @param namespace Namespace in which to register the icon config.
     * @param iconName Name under which to register the config.
     * @param config Config to be registered.
     */
    _addSvgIconConfig(namespace, iconName, config) {
        this._svgIconConfigs.set(iconKey(namespace, iconName), config);
        return this;
    }
    /**
     * Registers an icon set config in the specified namespace.
     * @param namespace Namespace in which to register the icon config.
     * @param config Config to be registered.
     */
    _addSvgIconSetConfig(namespace, config) {
        const configNamespace = this._iconSetConfigs.get(namespace);
        if (configNamespace) {
            configNamespace.push(config);
        }
        else {
            this._iconSetConfigs.set(namespace, [config]);
        }
        return this;
    }
    /** Parses a config's text into an SVG element. */
    _svgElementFromConfig(config) {
        if (!config.svgElement) {
            const svg = this._svgElementFromString(config.svgText);
            this._setSvgAttributes(svg, config.options);
            config.svgElement = svg;
        }
        return config.svgElement;
    }
    /** Tries to create an icon config through the registered resolver functions. */
    _getIconConfigFromResolvers(namespace, name) {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < this._resolvers.length; i++) {
            const result = this._resolvers[i](name, namespace);
            if (result) {
                return isSafeUrlWithOptions(result)
                    ? new SvgIconConfig(result.url, null, result.options)
                    : new SvgIconConfig(result, null);
            }
        }
        return undefined;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: SvgIconRegistry, deps: [{ token: i1.HttpClient, optional: true }, { token: i2.DomSanitizer }, { token: DOCUMENT, optional: true }, { token: i0.ErrorHandler }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: SvgIconRegistry, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: SvgIconRegistry, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i1.HttpClient, decorators: [{
                    type: Optional
                }] }, { type: i2.DomSanitizer }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: i0.ErrorHandler }] });
/** @docs-private */
export function ICON_REGISTRY_PROVIDER_FACTORY(parentRegistry, httpClient, sanitizer, errorHandler, document) {
    return parentRegistry || new SvgIconRegistry(httpClient, sanitizer, document, errorHandler);
}
/** @docs-private */
export const ICON_REGISTRY_PROVIDER = {
    // If there is already an SvgIconRegistry available, use that. Otherwise, provide a new one.
    provide: SvgIconRegistry,
    deps: [
        [new Optional(), new SkipSelf(), SvgIconRegistry],
        [new Optional(), HttpClient],
        DomSanitizer,
        ErrorHandler,
        [new Optional(), DOCUMENT],
    ],
    useFactory: ICON_REGISTRY_PROVIDER_FACTORY,
};
/** Clones an SVGElement while preserving type information. */
function cloneSvg(svg) {
    return svg.cloneNode(true);
}
/** Returns the cache key to use for an icon namespace and name. */
function iconKey(namespace, name) {
    return namespace + ':' + name;
}
function isSafeUrlWithOptions(value) {
    return !!(value.url && value.options);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvbi1yZWdpc3RyeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYnMvc3ZnLWljb24vc3JjL2xpYi9pY29uLXJlZ2lzdHJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMzQyxPQUFPLEVBQUUsVUFBVSxFQUFxQixNQUFNLHNCQUFzQixDQUFDO0FBQ3JFLE9BQU8sRUFDTCxZQUFZLEVBQ1osTUFBTSxFQUNOLFVBQVUsRUFHVixRQUFRLEVBQ1IsZUFBZSxFQUNmLFFBQVEsR0FDVCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUUsWUFBWSxFQUE2QixNQUFNLDJCQUEyQixDQUFDO0FBQ3BGLE9BQU8sRUFBRSxRQUFRLEVBQWMsRUFBRSxJQUFJLFlBQVksRUFBRSxVQUFVLElBQUksZUFBZSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQy9GLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDdkUsT0FBTyxFQUFlLHFCQUFxQixFQUFFLE1BQU0saUJBQWlCLENBQUM7Ozs7QUFFckU7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSwyQkFBMkIsQ0FBQyxRQUFnQjtJQUMxRCxPQUFPLEtBQUssQ0FBQyxzQ0FBc0MsUUFBUSxHQUFHLENBQUMsQ0FBQztBQUNsRSxDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSw2QkFBNkI7SUFDM0MsT0FBTyxLQUFLLENBQ1YscUVBQXFFO1FBQ25FLHdFQUF3RTtRQUN4RSxjQUFjLENBQ2pCLENBQUM7QUFDSixDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxrQ0FBa0MsQ0FBQyxHQUFvQjtJQUNyRSxPQUFPLEtBQUssQ0FDVix3RUFBd0U7UUFDdEUsa0RBQWtELEdBQUcsSUFB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UUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQzlGLENBQUM7QUFFRCxvQkFBb0I7QUFDcEIsTUFBTSxDQUFDLE1BQU0sc0JBQXNCLEdBQUc7SUFDcEMsNEZBQTRGO0lBQzVGLE9BQU8sRUFBRSxlQUFlO0lBQ3hCLElBQUksRUFBRTtRQUNKLENBQUMsSUFBSSxRQUFRLEVBQUUsRUFBRSxJQUFJLFFBQVEsRUFBRSxFQUFFLGVBQWUsQ0FBQztRQUNqRCxDQUFDLElBQUksUUFBUSxFQUFFLEVBQUUsVUFBVSxDQUFDO1FBQzVCLFlBQVk7UUFDWixZQUFZO1FBQ1osQ0FBQyxJQUFJLFFBQVEsRUFBRSxFQUFFLFFBQStCLENBQUM7S0FDbEQ7SUFDRCxVQUFVLEVBQUUsOEJBQThCO0NBQzNDLENBQUM7QUFFRiw4REFBOEQ7QUFDOUQsU0FBUyxRQUFRLENBQUMsR0FBZTtJQUMvQixPQUFPLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFlLENBQUM7QUFDM0MsQ0FBQztBQUVELG1FQUFtRTtBQUNuRSxTQUFTLE9BQU8sQ0FBQyxTQUFpQixFQUFFLElBQVk7SUFDOUMsT0FBTyxTQUFTLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQztBQUNoQyxDQUFDO0FBRUQsU0FBUyxvQkFBb0IsQ0FBQyxLQUFVO0lBQ3RDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDeEMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgeyBET0NVTUVOVCB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBIdHRwQ2xpZW50LCBIdHRwRXJyb3JSZXNwb25zZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7XG4gIEVycm9ySGFuZGxlcixcbiAgSW5qZWN0LFxuICBJbmplY3RhYmxlLFxuICBJbmplY3Rpb25Ub2tlbixcbiAgT25EZXN0cm95LFxuICBPcHRpb25hbCxcbiAgU2VjdXJpdHlDb250ZXh0LFxuICBTa2lwU2VsZixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBEb21TYW5pdGl6ZXIsIFNhZmVIdG1sLCBTYWZlUmVzb3VyY2VVcmwgfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyJztcbmltcG9ydCB7IGZvcmtKb2luLCBPYnNlcnZhYmxlLCBvZiBhcyBvYnNlcnZhYmxlT2YsIHRocm93RXJyb3IgYXMgb2JzZXJ2YWJsZVRocm93IH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBjYXRjaEVycm9yLCBmaW5hbGl6ZSwgbWFwLCBzaGFyZSwgdGFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHsgVHJ1c3RlZEhUTUwsIHRydXN0ZWRIVE1MRnJvbVN0cmluZyB9IGZyb20gJy4vdHJ1c3RlZC10eXBlcyc7XG5cbi8qKlxuICogUmV0dXJucyBhbiBleGNlcHRpb24gdG8gYmUgdGhyb3duIGluIHRoZSBjYXNlIHdoZW4gYXR0ZW1wdGluZyB0b1xuICogbG9hZCBhbiBpY29uIHdpdGggYSBuYW1lIHRoYXQgY2Fubm90IGJlIGZvdW5kLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U3ZnSWNvbk5hbWVOb3RGb3VuZEVycm9yKGljb25OYW1lOiBzdHJpbmcpOiBFcnJvciB7XG4gIHJldHVybiBFcnJvcihgVW5hYmxlIHRvIGZpbmQgaWNvbiB3aXRoIHRoZSBuYW1lIFwiJHtpY29uTmFtZX1cImApO1xufVxuXG4vKipcbiAqIFJldHVybnMgYW4gZXhjZXB0aW9uIHRvIGJlIHRocm93biB3aGVuIHRoZSBjb25zdW1lciBhdHRlbXB0cyB0byB1c2VcbiAqIGA8c3ZnLWljb24+YCB3aXRob3V0IGluY2x1ZGluZyBAYW5ndWxhci9jb21tb24vaHR0cC5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFN2Z0ljb25Ob0h0dHBQcm92aWRlckVycm9yKCk6IEVycm9yIHtcbiAgcmV0dXJuIEVycm9yKFxuICAgICdDb3VsZCBub3QgZmluZCBIdHRwQ2xpZW50IHByb3ZpZGVyIGZvciB1c2Ugd2l0aCBBbmd1bGFyIFN2ZyBpY29ucy4gJyArXG4gICAgICAnUGxlYXNlIGluY2x1ZGUgdGhlIEh0dHBDbGllbnRNb2R1bGUgZnJvbSBAYW5ndWxhci9jb21tb24vaHR0cCBpbiB5b3VyICcgK1xuICAgICAgJ2FwcCBpbXBvcnRzLidcbiAgKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGFuIGV4Y2VwdGlvbiB0byBiZSB0aHJvd24gd2hlbiBhIFVSTCBjb3VsZG4ndCBiZSBzYW5pdGl6ZWQuXG4gKiBAcGFyYW0gdXJsIFVSTCB0aGF0IHdhcyBhdHRlbXB0ZWQgdG8gYmUgc2FuaXRpemVkLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U3ZnSWNvbkZhaWxlZFRvU2FuaXRpemVVcmxFcnJvcih1cmw6IFNhZmVSZXNvdXJjZVVybCk6IEVycm9yIHtcbiAgcmV0dXJuIEVycm9yKFxuICAgICdUaGUgVVJMIHByb3ZpZGVkIHRvIFN2Z0ljb25SZWdpc3RyeSB3YXMgbm90IHRydXN0ZWQgYXMgYSByZXNvdXJjZSBVUkwgJyArXG4gICAgICBgdmlhIEFuZ3VsYXIncyBEb21TYW5pdGl6ZXIuIEF0dGVtcHRlZCBVUkwgd2FzIFwiJHt1cmx9XCIuYFxuICApO1xufVxuXG4vKipcbiAqIFJldHVybnMgYW4gZXhjZXB0aW9uIHRvIGJlIHRocm93biB3aGVuIGEgSFRNTCBzdHJpbmcgY291bGRuJ3QgYmUgc2FuaXRpemVkLlxuICogQHBhcmFtIGxpdGVyYWwgSFRNTCB0aGF0IHdhcyBhdHRlbXB0ZWQgdG8gYmUgc2FuaXRpemVkLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U3ZnSWNvbkZhaWxlZFRvU2FuaXRpemVMaXRlcmFsRXJyb3IobGl0ZXJhbDogU2FmZUh0bWwpOiBFcnJvciB7XG4gIHJldHVybiBFcnJvcihcbiAgICAnVGhlIGxpdGVyYWwgcHJvdmlkZWQgdG8gU3ZnSWNvblJlZ2lzdHJ5IHdhcyBub3QgdHJ1c3RlZCBhcyBzYWZlIEhUTUwgYnkgJyArXG4gICAgICBgQW5ndWxhcidzIERvbVNhbml0aXplci4gQXR0ZW1wdGVkIGxpdGVyYWwgd2FzIFwiJHtsaXRlcmFsfVwiLmBcbiAgKTtcbn1cblxuLyoqIE9wdGlvbnMgdGhhdCBjYW4gYmUgdXNlZCB0byBjb25maWd1cmUgaG93IGFuIGljb24gb3IgdGhlIGljb25zIGluIGFuIGljb24gc2V0IGFyZSBwcmVzZW50ZWQuICovXG5leHBvcnQgaW50ZXJmYWNlIEljb25PcHRpb25zIHtcbiAgLyoqIFZpZXcgYm94IHRvIHNldCBvbiB0aGUgaWNvbi4gKi9cbiAgdmlld0JveD86IHN0cmluZztcblxuICAvKiogV2hldGhlciBvciBub3QgdG8gZmV0Y2ggdGhlIGljb24gb3IgaWNvbiBzZXQgdXNpbmcgSFRUUCBjcmVkZW50aWFscy4gKi9cbiAgd2l0aENyZWRlbnRpYWxzPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0aGF0IHdpbGwgYmUgaW52b2tlZCBieSB0aGUgaWNvbiByZWdpc3RyeSB3aGVuIHRyeWluZyB0byByZXNvbHZlIHRoZVxuICogVVJMIGZyb20gd2hpY2ggdG8gZmV0Y2ggYW4gaWNvbi4gVGhlIHJldHVybmVkIFVSTCB3aWxsIGJlIHVzZWQgdG8gbWFrZSBhIHJlcXVlc3QgZm9yIHRoZSBpY29uLlxuICovXG5leHBvcnQgdHlwZSBJY29uUmVzb2x2ZXIgPSAoXG4gIG5hbWU6IHN0cmluZyxcbiAgbmFtZXNwYWNlOiBzdHJpbmdcbikgPT4gU2FmZVJlc291cmNlVXJsIHwgU2FmZVJlc291cmNlVXJsV2l0aEljb25PcHRpb25zIHwgbnVsbDtcblxuLyoqIE9iamVjdCB0aGF0IHNwZWNpZmllcyBhIFVSTCBmcm9tIHdoaWNoIHRvIGZldGNoIGFuIGljb24gYW5kIHRoZSBvcHRpb25zIHRvIHVzZSBmb3IgaXQuICovXG5leHBvcnQgaW50ZXJmYWNlIFNhZmVSZXNvdXJjZVVybFdpdGhJY29uT3B0aW9ucyB7XG4gIHVybDogU2FmZVJlc291cmNlVXJsO1xuICBvcHRpb25zOiBJY29uT3B0aW9ucztcbn1cblxuLyoqXG4gKiBDb25maWd1cmF0aW9uIGZvciBhbiBpY29uLCBpbmNsdWRpbmcgdGhlIFVSTCBhbmQgcG9zc2libHkgdGhlIGNhY2hlZCBTVkcgZWxlbWVudC5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuY2xhc3MgU3ZnSWNvbkNvbmZpZyB7XG4gIHN2Z0VsZW1lbnQ6IFNWR0VsZW1lbnQgfCBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyB1cmw6IFNhZmVSZXNvdXJjZVVybCxcbiAgICBwdWJsaWMgc3ZnVGV4dDogVHJ1c3RlZEhUTUwgfCBudWxsLFxuICAgIHB1YmxpYyBvcHRpb25zPzogSWNvbk9wdGlvbnNcbiAgKSB7fVxufVxuXG4vKiogSWNvbiBjb25maWd1cmF0aW9uIHdob3NlIGNvbnRlbnQgaGFzIGFscmVhZHkgYmVlbiBsb2FkZWQuICovXG50eXBlIExvYWRlZFN2Z0ljb25Db25maWcgPSBTdmdJY29uQ29uZmlnICYgeyBzdmdUZXh0OiBUcnVzdGVkSFRNTCB9O1xuXG4vKipcbiAqIFNlcnZpY2UgdG8gcmVnaXN0ZXIgYW5kIGRpc3BsYXkgaWNvbnMgdXNlZCBieSB0aGUgYDxzdmctaWNvbj5gIGNvbXBvbmVudC5cbiAqIC0gUmVnaXN0ZXJzIGljb24gVVJMcyBieSBuYW1lc3BhY2UgYW5kIG5hbWUuXG4gKiAtIFJlZ2lzdGVycyBpY29uIHNldCBVUkxzIGJ5IG5hbWVzcGFjZS5cbiAqIC0gUmVnaXN0ZXJzIGFsaWFzZXMgZm9yIENTUyBjbGFzc2VzLCBmb3IgdXNlIHdpdGggaWNvbiBmb250cy5cbiAqIC0gTG9hZHMgaWNvbnMgZnJvbSBVUkxzIGFuZCBleHRyYWN0cyBpbmRpdmlkdWFsIGljb25zIGZyb20gaWNvbiBzZXRzLlxuICovXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46ICdyb290JyB9KVxuZXhwb3J0IGNsYXNzIFN2Z0ljb25SZWdpc3RyeSBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgX2RvY3VtZW50OiBEb2N1bWVudDtcblxuICAvKipcbiAgICogVVJMcyBhbmQgY2FjaGVkIFNWRyBlbGVtZW50cyBmb3IgaW5kaXZpZHVhbCBpY29ucy4gS2V5cyBhcmUgb2YgdGhlIGZvcm1hdCBcIltuYW1lc3BhY2VdOltpY29uXVwiLlxuICAgKi9cbiAgcHJpdmF0ZSBfc3ZnSWNvbkNvbmZpZ3MgPSBuZXcgTWFwPHN0cmluZywgU3ZnSWNvbkNvbmZpZz4oKTtcblxuICAvKipcbiAgICogU3ZnSWNvbkNvbmZpZyBvYmplY3RzIGFuZCBjYWNoZWQgU1ZHIGVsZW1lbnRzIGZvciBpY29uIHNldHMsIGtleWVkIGJ5IG5hbWVzcGFjZS5cbiAgICogTXVsdGlwbGUgaWNvbiBzZXRzIGNhbiBiZSByZWdpc3RlcmVkIHVuZGVyIHRoZSBzYW1lIG5hbWVzcGFjZS5cbiAgICovXG4gIHByaXZhdGUgX2ljb25TZXRDb25maWdzID0gbmV3IE1hcDxzdHJpbmcsIFN2Z0ljb25Db25maWdbXT4oKTtcblxuICAvKiogQ2FjaGUgZm9yIGljb25zIGxvYWRlZCBieSBkaXJlY3QgVVJMcy4gKi9cbiAgcHJpdmF0ZSBfY2FjaGVkSWNvbnNCeVVybCA9IG5ldyBNYXA8c3RyaW5nLCBTVkdFbGVtZW50PigpO1xuXG4gIC8qKiBJbi1wcm9ncmVzcyBpY29uIGZldGNoZXMuIFVzZWQgdG8gY29hbGVzY2UgbXVsdGlwbGUgcmVxdWVzdHMgdG8gdGhlIHNhbWUgVVJMLiAqL1xuICBwcml2YXRlIF9pblByb2dyZXNzVXJsRmV0Y2hlcyA9IG5ldyBNYXA8c3RyaW5nLCBPYnNlcnZhYmxlPFRydXN0ZWRIVE1MPj4oKTtcblxuICAvKiogTWFwIGZyb20gZm9udCBpZGVudGlmaWVycyB0byB0aGVpciBDU1MgY2xhc3MgbmFtZXMuIFVzZWQgZm9yIGljb24gZm9udHMuICovXG4gIHByaXZhdGUgX2ZvbnRDc3NDbGFzc2VzQnlBbGlhcyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG5cbiAgLyoqIFJlZ2lzdGVyZWQgaWNvbiByZXNvbHZlciBmdW5jdGlvbnMuICovXG4gIHByaXZhdGUgX3Jlc29sdmVyczogSWNvblJlc29sdmVyW10gPSBbXTtcblxuICAvKipcbiAgICogVGhlIENTUyBjbGFzc2VzIHRvIGFwcGx5IHdoZW4gYW4gYDxzdmctaWNvbj5gIGNvbXBvbmVudCBoYXMgbm8gaWNvbiBuYW1lLCB1cmwsIG9yIGZvbnRcbiAgICogc3BlY2lmaWVkLiBUaGUgZGVmYXVsdCAnc3ZnLWljb25zJyB2YWx1ZSBhc3N1bWVzIHRoYXQgdGhlIHN2ZyBpY29uIGZvbnQgaGFzIGJlZW5cbiAgICogbG9hZGVkIGFzIGRlc2NyaWJlZFxuICAgKi9cbiAgcHJpdmF0ZSBfZGVmYXVsdEZvbnRTZXRDbGFzcyA9IFsnc3ZnLWljb25zJywgJ3N2Zy1saWdhdHVyZS1mb250J107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSBfaHR0cENsaWVudDogSHR0cENsaWVudCxcbiAgICBwcml2YXRlIF9zYW5pdGl6ZXI6IERvbVNhbml0aXplcixcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KERPQ1VNRU5UKSBkb2N1bWVudDogYW55LFxuICAgIHByaXZhdGUgcmVhZG9ubHkgX2Vycm9ySGFuZGxlcjogRXJyb3JIYW5kbGVyXG4gICkge1xuICAgIHRoaXMuX2RvY3VtZW50ID0gZG9jdW1lbnQ7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGFuIGljb24gYnkgVVJMIGluIHRoZSBkZWZhdWx0IG5hbWVzcGFjZS5cbiAgICogQHBhcmFtIGljb25OYW1lIE5hbWUgdW5kZXIgd2hpY2ggdGhlIGljb24gc2hvdWxkIGJlIHJlZ2lzdGVyZWQuXG4gICAqIEBwYXJhbSB1cmxcbiAgICovXG4gIGFkZFN2Z0ljb24oaWNvbk5hbWU6IHN0cmluZywgdXJsOiBTYWZlUmVzb3VyY2VVcmwsIG9wdGlvbnM/OiBJY29uT3B0aW9ucyk6IHRoaXMge1xuICAgIHJldHVybiB0aGlzLmFkZFN2Z0ljb25Jbk5hbWVzcGFjZSgnJywgaWNvbk5hbWUsIHVybCwgb3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGFuIGljb24gdXNpbmcgYW4gSFRNTCBzdHJpbmcgaW4gdGhlIGRlZmF1bHQgbmFtZXNwYWNlLlxuICAgKiBAcGFyYW0gaWNvbk5hbWUgTmFtZSB1bmRlciB3aGljaCB0aGUgaWNvbiBzaG91bGQgYmUgcmVnaXN0ZXJlZC5cbiAgICogQHBhcmFtIGxpdGVyYWwgU1ZHIHNvdXJjZSBvZiB0aGUgaWNvbi5cbiAgICovXG4gIGFkZFN2Z0ljb25MaXRlcmFsKGljb25OYW1lOiBzdHJpbmcsIGxpdGVyYWw6IFNhZmVIdG1sLCBvcHRpb25zPzogSWNvbk9wdGlvbnMpOiB0aGlzIHtcbiAgICByZXR1cm4gdGhpcy5hZGRTdmdJY29uTGl0ZXJhbEluTmFtZXNwYWNlKCcnLCBpY29uTmFtZSwgbGl0ZXJhbCwgb3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGFuIGljb24gYnkgVVJMIGluIHRoZSBzcGVjaWZpZWQgbmFtZXNwYWNlLlxuICAgKiBAcGFyYW0gbmFtZXNwYWNlIE5hbWVzcGFjZSBpbiB3aGljaCB0aGUgaWNvbiBzaG91bGQgYmUgcmVnaXN0ZXJlZC5cbiAgICogQHBhcmFtIGljb25OYW1lIE5hbWUgdW5kZXIgd2hpY2ggdGhlIGljb24gc2hvdWxkIGJlIHJlZ2lzdGVyZWQuXG4gICAqIEBwYXJhbSB1cmxcbiAgICovXG4gIGFkZFN2Z0ljb25Jbk5hbWVzcGFjZShcbiAgICBuYW1lc3BhY2U6IHN0cmluZyxcbiAgICBpY29uTmFtZTogc3RyaW5nLFxuICAgIHVybDogU2FmZVJlc291cmNlVXJsLFxuICAgIG9wdGlvbnM/OiBJY29uT3B0aW9uc1xuICApOiB0aGlzIHtcbiAgICByZXR1cm4gdGhpcy5fYWRkU3ZnSWNvbkNvbmZpZyhuYW1lc3BhY2UsIGljb25OYW1lLCBuZXcgU3ZnSWNvbkNvbmZpZyh1cmwsIG51bGwsIG9wdGlvbnMpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYW4gaWNvbiByZXNvbHZlciBmdW5jdGlvbiB3aXRoIHRoZSByZWdpc3RyeS4gVGhlIGZ1bmN0aW9uIHdpbGwgYmUgaW52b2tlZCB3aXRoIHRoZVxuICAgKiBuYW1lIGFuZCBuYW1lc3BhY2Ugb2YgYW4gaWNvbiB3aGVuIHRoZSByZWdpc3RyeSB0cmllcyB0byByZXNvbHZlIHRoZSBVUkwgZnJvbSB3aGljaCB0byBmZXRjaFxuICAgKiB0aGUgaWNvbi4gVGhlIHJlc29sdmVyIGlzIGV4cGVjdGVkIHRvIHJldHVybiBhIGBTYWZlUmVzb3VyY2VVcmxgIHRoYXQgcG9pbnRzIHRvIHRoZSBpY29uLFxuICAgKiBhbiBvYmplY3Qgd2l0aCB0aGUgaWNvbiBVUkwgYW5kIGljb24gb3B0aW9ucywgb3IgYG51bGxgIGlmIHRoZSBpY29uIGlzIG5vdCBzdXBwb3J0ZWQuIFJlc29sdmVyc1xuICAgKiB3aWxsIGJlIGludm9rZWQgaW4gdGhlIG9yZGVyIGluIHdoaWNoIHRoZXkgaGF2ZSBiZWVuIHJlZ2lzdGVyZWQuXG4gICAqIEBwYXJhbSByZXNvbHZlciBSZXNvbHZlciBmdW5jdGlvbiB0byBiZSByZWdpc3RlcmVkLlxuICAgKi9cbiAgYWRkU3ZnSWNvblJlc29sdmVyKHJlc29sdmVyOiBJY29uUmVzb2x2ZXIpOiB0aGlzIHtcbiAgICB0aGlzLl9yZXNvbHZlcnMucHVzaChyZXNvbHZlcik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGFuIGljb24gdXNpbmcgYW4gSFRNTCBzdHJpbmcgaW4gdGhlIHNwZWNpZmllZCBuYW1lc3BhY2UuXG4gICAqIEBwYXJhbSBuYW1lc3BhY2UgTmFtZXNwYWNlIGluIHdoaWNoIHRoZSBpY29uIHNob3VsZCBiZSByZWdpc3RlcmVkLlxuICAgKiBAcGFyYW0gaWNvbk5hbWUgTmFtZSB1bmRlciB3aGljaCB0aGUgaWNvbiBzaG91bGQgYmUgcmVnaXN0ZXJlZC5cbiAgICogQHBhcmFtIGxpdGVyYWwgU1ZHIHNvdXJjZSBvZiB0aGUgaWNvbi5cbiAgICovXG4gIGFkZFN2Z0ljb25MaXRlcmFsSW5OYW1lc3BhY2UoXG4gICAgbmFtZXNwYWNlOiBzdHJpbmcsXG4gICAgaWNvbk5hbWU6IHN0cmluZyxcbiAgICBsaXRlcmFsOiBTYWZlSHRtbCxcbiAgICBvcHRpb25zPzogSWNvbk9wdGlvbnNcbiAgKTogdGhpcyB7XG4gICAgY29uc3QgY2xlYW5MaXRlcmFsID0gdGhpcy5fc2FuaXRpemVyLnNhbml0aXplKFNlY3VyaXR5Q29udGV4dC5IVE1MLCBsaXRlcmFsKTtcblxuICAgIC8vIFRPRE86IGFkZCBhbiBuZ0Rldk1vZGUgY2hlY2tcbiAgICBpZiAoIWNsZWFuTGl0ZXJhbCkge1xuICAgICAgdGhyb3cgZ2V0U3ZnSWNvbkZhaWxlZFRvU2FuaXRpemVMaXRlcmFsRXJyb3IobGl0ZXJhbCk7XG4gICAgfVxuXG4gICAgLy8gU2VjdXJpdHk6IFRoZSBsaXRlcmFsIGlzIHBhc3NlZCBpbiBhcyBTYWZlSHRtbCwgYW5kIGlzIHRodXMgdHJ1c3RlZC5cbiAgICBjb25zdCB0cnVzdGVkTGl0ZXJhbCA9IHRydXN0ZWRIVE1MRnJvbVN0cmluZyhjbGVhbkxpdGVyYWwpO1xuICAgIHJldHVybiB0aGlzLl9hZGRTdmdJY29uQ29uZmlnKFxuICAgICAgbmFtZXNwYWNlLFxuICAgICAgaWNvbk5hbWUsXG4gICAgICBuZXcgU3ZnSWNvbkNvbmZpZygnJywgdHJ1c3RlZExpdGVyYWwsIG9wdGlvbnMpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYW4gaWNvbiBzZXQgYnkgVVJMIGluIHRoZSBkZWZhdWx0IG5hbWVzcGFjZS5cbiAgICogQHBhcmFtIHVybFxuICAgKi9cbiAgYWRkU3ZnSWNvblNldCh1cmw6IFNhZmVSZXNvdXJjZVVybCwgb3B0aW9ucz86IEljb25PcHRpb25zKTogdGhpcyB7XG4gICAgcmV0dXJuIHRoaXMuYWRkU3ZnSWNvblNldEluTmFtZXNwYWNlKCcnLCB1cmwsIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhbiBpY29uIHNldCB1c2luZyBhbiBIVE1MIHN0cmluZyBpbiB0aGUgZGVmYXVsdCBuYW1lc3BhY2UuXG4gICAqIEBwYXJhbSBsaXRlcmFsIFNWRyBzb3VyY2Ugb2YgdGhlIGljb24gc2V0LlxuICAgKi9cbiAgYWRkU3ZnSWNvblNldExpdGVyYWwobGl0ZXJhbDogU2FmZUh0bWwsIG9wdGlvbnM/OiBJY29uT3B0aW9ucyk6IHRoaXMge1xuICAgIHJldHVybiB0aGlzLmFkZFN2Z0ljb25TZXRMaXRlcmFsSW5OYW1lc3BhY2UoJycsIGxpdGVyYWwsIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhbiBpY29uIHNldCBieSBVUkwgaW4gdGhlIHNwZWNpZmllZCBuYW1lc3BhY2UuXG4gICAqIEBwYXJhbSBuYW1lc3BhY2UgTmFtZXNwYWNlIGluIHdoaWNoIHRvIHJlZ2lzdGVyIHRoZSBpY29uIHNldC5cbiAgICogQHBhcmFtIHVybFxuICAgKi9cbiAgYWRkU3ZnSWNvblNldEluTmFtZXNwYWNlKG5hbWVzcGFjZTogc3RyaW5nLCB1cmw6IFNhZmVSZXNvdXJjZVVybCwgb3B0aW9ucz86IEljb25PcHRpb25zKTogdGhpcyB7XG4gICAgcmV0dXJuIHRoaXMuX2FkZFN2Z0ljb25TZXRDb25maWcobmFtZXNwYWNlLCBuZXcgU3ZnSWNvbkNvbmZpZyh1cmwsIG51bGwsIG9wdGlvbnMpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYW4gaWNvbiBzZXQgdXNpbmcgYW4gSFRNTCBzdHJpbmcgaW4gdGhlIHNwZWNpZmllZCBuYW1lc3BhY2UuXG4gICAqIEBwYXJhbSBuYW1lc3BhY2UgTmFtZXNwYWNlIGluIHdoaWNoIHRvIHJlZ2lzdGVyIHRoZSBpY29uIHNldC5cbiAgICogQHBhcmFtIGxpdGVyYWwgU1ZHIHNvdXJjZSBvZiB0aGUgaWNvbiBzZXQuXG4gICAqL1xuICBhZGRTdmdJY29uU2V0TGl0ZXJhbEluTmFtZXNwYWNlKFxuICAgIG5hbWVzcGFjZTogc3RyaW5nLFxuICAgIGxpdGVyYWw6IFNhZmVIdG1sLFxuICAgIG9wdGlvbnM/OiBJY29uT3B0aW9uc1xuICApOiB0aGlzIHtcbiAgICBjb25zdCBjbGVhbkxpdGVyYWwgPSB0aGlzLl9zYW5pdGl6ZXIuc2FuaXRpemUoU2VjdXJpdHlDb250ZXh0LkhUTUwsIGxpdGVyYWwpO1xuXG4gICAgaWYgKCFjbGVhbkxpdGVyYWwpIHtcbiAgICAgIHRocm93IGdldFN2Z0ljb25GYWlsZWRUb1Nhbml0aXplTGl0ZXJhbEVycm9yKGxpdGVyYWwpO1xuICAgIH1cblxuICAgIC8vIFNlY3VyaXR5OiBUaGUgbGl0ZXJhbCBpcyBwYXNzZWQgaW4gYXMgU2FmZUh0bWwsIGFuZCBpcyB0aHVzIHRydXN0ZWQuXG4gICAgY29uc3QgdHJ1c3RlZExpdGVyYWwgPSB0cnVzdGVkSFRNTEZyb21TdHJpbmcoY2xlYW5MaXRlcmFsKTtcbiAgICByZXR1cm4gdGhpcy5fYWRkU3ZnSWNvblNldENvbmZpZyhuYW1lc3BhY2UsIG5ldyBTdmdJY29uQ29uZmlnKCcnLCB0cnVzdGVkTGl0ZXJhbCwgb3B0aW9ucykpO1xuICB9XG5cbiAgLyoqXG4gICAqIERlZmluZXMgYW4gYWxpYXMgZm9yIENTUyBjbGFzcyBuYW1lcyB0byBiZSB1c2VkIGZvciBpY29uIGZvbnRzLiBDcmVhdGluZyBhbiBzdmdJY29uXG4gICAqIGNvbXBvbmVudCB3aXRoIHRoZSBhbGlhcyBhcyB0aGUgZm9udFNldCBpbnB1dCB3aWxsIGNhdXNlIHRoZSBjbGFzcyBuYW1lIHRvIGJlIGFwcGxpZWRcbiAgICogdG8gdGhlIGA8c3ZnLWljb24+YCBlbGVtZW50LlxuICAgKlxuICAgKiBJZiB0aGUgcmVnaXN0ZXJlZCBmb250IGlzIGEgbGlnYXR1cmUgZm9udCwgdGhlbiBkb24ndCBmb3JnZXQgdG8gYWxzbyBpbmNsdWRlIHRoZSBzcGVjaWFsXG4gICAqIGNsYXNzIGBzdmctbGlnYXR1cmUtZm9udGAgdG8gYWxsb3cgdGhlIHVzYWdlIHZpYSBhdHRyaWJ1dGUuIFNvIHJlZ2lzdGVyIGxpa2UgdGhpczpcbiAgICpcbiAgICogYGBgdHNcbiAgICogaWNvblJlZ2lzdHJ5LnJlZ2lzdGVyRm9udENsYXNzQWxpYXMoJ2YxJywgJ2ZvbnQxIHN2Zy1saWdhdHVyZS1mb250Jyk7XG4gICAqIGBgYFxuICAgKlxuICAgKiBBbmQgdXNlIGxpa2UgdGhpczpcbiAgICpcbiAgICogYGBgaHRtbFxuICAgKiA8c3ZnLWljb24gZm9udFNldD1cImYxXCIgZm9udEljb249XCJob21lXCI+PC9zdmctaWNvbj5cbiAgICogYGBgXG4gICAqXG4gICAqIEBwYXJhbSBhbGlhcyBBbGlhcyBmb3IgdGhlIGZvbnQuXG4gICAqIEBwYXJhbSBjbGFzc05hbWVzIENsYXNzIG5hbWVzIG92ZXJyaWRlIHRvIGJlIHVzZWQgaW5zdGVhZCBvZiB0aGUgYWxpYXMuXG4gICAqL1xuICByZWdpc3RlckZvbnRDbGFzc0FsaWFzKGFsaWFzOiBzdHJpbmcsIGNsYXNzTmFtZXM6IHN0cmluZyA9IGFsaWFzKTogdGhpcyB7XG4gICAgdGhpcy5fZm9udENzc0NsYXNzZXNCeUFsaWFzLnNldChhbGlhcywgY2xhc3NOYW1lcyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgQ1NTIGNsYXNzIG5hbWUgYXNzb2NpYXRlZCB3aXRoIHRoZSBhbGlhcyBieSBhIHByZXZpb3VzIGNhbGwgdG9cbiAgICogcmVnaXN0ZXJGb250Q2xhc3NBbGlhcy4gSWYgbm8gQ1NTIGNsYXNzIGhhcyBiZWVuIGFzc29jaWF0ZWQsIHJldHVybnMgdGhlIGFsaWFzIHVubW9kaWZpZWQuXG4gICAqL1xuICBjbGFzc05hbWVGb3JGb250QWxpYXMoYWxpYXM6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2ZvbnRDc3NDbGFzc2VzQnlBbGlhcy5nZXQoYWxpYXMpIHx8IGFsaWFzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIENTUyBjbGFzc2VzIHRvIGJlIHVzZWQgZm9yIGljb24gZm9udHMgd2hlbiBhbiBgPHN2Zy1pY29uPmAgY29tcG9uZW50IGRvZXMgbm90XG4gICAqIGhhdmUgYSBmb250U2V0IGlucHV0IHZhbHVlLCBhbmQgaXMgbm90IGxvYWRpbmcgYW4gaWNvbiBieSBuYW1lIG9yIFVSTC5cbiAgICovXG4gIHNldERlZmF1bHRGb250U2V0Q2xhc3MoLi4uY2xhc3NOYW1lczogc3RyaW5nW10pOiB0aGlzIHtcbiAgICB0aGlzLl9kZWZhdWx0Rm9udFNldENsYXNzID0gY2xhc3NOYW1lcztcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBDU1MgY2xhc3NlcyB0byBiZSB1c2VkIGZvciBpY29uIGZvbnRzIHdoZW4gYW4gYDxzdmctaWNvbj5gIGNvbXBvbmVudCBkb2VzIG5vdFxuICAgKiBoYXZlIGEgZm9udFNldCBpbnB1dCB2YWx1ZSwgYW5kIGlzIG5vdCBsb2FkaW5nIGFuIGljb24gYnkgbmFtZSBvciBVUkwuXG4gICAqL1xuICBnZXREZWZhdWx0Rm9udFNldENsYXNzKCk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gdGhpcy5fZGVmYXVsdEZvbnRTZXRDbGFzcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIE9ic2VydmFibGUgdGhhdCBwcm9kdWNlcyB0aGUgaWNvbiAoYXMgYW4gYDxzdmc+YCBET00gZWxlbWVudCkgZnJvbSB0aGUgZ2l2ZW4gVVJMLlxuICAgKiBUaGUgcmVzcG9uc2UgZnJvbSB0aGUgVVJMIG1heSBiZSBjYWNoZWQgc28gdGhpcyB3aWxsIG5vdCBhbHdheXMgY2F1c2UgYW4gSFRUUCByZXF1ZXN0LCBidXRcbiAgICogdGhlIHByb2R1Y2VkIGVsZW1lbnQgd2lsbCBhbHdheXMgYmUgYSBuZXcgY29weSBvZiB0aGUgb3JpZ2luYWxseSBmZXRjaGVkIGljb24uIChUaGF0IGlzLFxuICAgKiBpdCB3aWxsIG5vdCBjb250YWluIGFueSBtb2RpZmljYXRpb25zIG1hZGUgdG8gZWxlbWVudHMgcHJldmlvdXNseSByZXR1cm5lZCkuXG4gICAqXG4gICAqIEBwYXJhbSBzYWZlVXJsIFVSTCBmcm9tIHdoaWNoIHRvIGZldGNoIHRoZSBTVkcgaWNvbi5cbiAgICovXG4gIGdldFN2Z0ljb25Gcm9tVXJsKHNhZmVVcmw6IFNhZmVSZXNvdXJjZVVybCk6IE9ic2VydmFibGU8U1ZHRWxlbWVudD4ge1xuICAgIGNvbnN0IHVybCA9IHRoaXMuX3Nhbml0aXplci5zYW5pdGl6ZShTZWN1cml0eUNvbnRleHQuUkVTT1VSQ0VfVVJMLCBzYWZlVXJsKTtcblxuICAgIGlmICghdXJsKSB7XG4gICAgICB0aHJvdyBnZXRTdmdJY29uRmFpbGVkVG9TYW5pdGl6ZVVybEVycm9yKHNhZmVVcmwpO1xuICAgIH1cblxuICAgIGNvbnN0IGNhY2hlZEljb24gPSB0aGlzLl9jYWNoZWRJY29uc0J5VXJsLmdldCh1cmwpO1xuXG4gICAgaWYgKGNhY2hlZEljb24pIHtcbiAgICAgIHJldHVybiBvYnNlcnZhYmxlT2YoY2xvbmVTdmcoY2FjaGVkSWNvbikpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9sb2FkU3ZnSWNvbkZyb21Db25maWcobmV3IFN2Z0ljb25Db25maWcoc2FmZVVybCwgbnVsbCkpLnBpcGUoXG4gICAgICB0YXAoKHN2ZykgPT4gdGhpcy5fY2FjaGVkSWNvbnNCeVVybC5zZXQodXJsISwgc3ZnKSksXG4gICAgICBtYXAoKHN2ZykgPT4gY2xvbmVTdmcoc3ZnKSlcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gT2JzZXJ2YWJsZSB0aGF0IHByb2R1Y2VzIHRoZSBpY29uIChhcyBhbiBgPHN2Zz5gIERPTSBlbGVtZW50KSB3aXRoIHRoZSBnaXZlbiBuYW1lXG4gICAqIGFuZCBuYW1lc3BhY2UuIFRoZSBpY29uIG11c3QgaGF2ZSBiZWVuIHByZXZpb3VzbHkgcmVnaXN0ZXJlZCB3aXRoIGFkZEljb24gb3IgYWRkSWNvblNldDtcbiAgICogaWYgbm90LCB0aGUgT2JzZXJ2YWJsZSB3aWxsIHRocm93IGFuIGVycm9yLlxuICAgKlxuICAgKiBAcGFyYW0gbmFtZSBOYW1lIG9mIHRoZSBpY29uIHRvIGJlIHJldHJpZXZlZC5cbiAgICogQHBhcmFtIG5hbWVzcGFjZSBOYW1lc3BhY2UgaW4gd2hpY2ggdG8gbG9vayBmb3IgdGhlIGljb24uXG4gICAqL1xuICBnZXROYW1lZFN2Z0ljb24obmFtZTogc3RyaW5nLCBuYW1lc3BhY2UgPSAnJyk6IE9ic2VydmFibGU8U1ZHRWxlbWVudD4ge1xuICAgIGNvbnN0IGtleSA9IGljb25LZXkobmFtZXNwYWNlLCBuYW1lKTtcbiAgICBsZXQgY29uZmlnID0gdGhpcy5fc3ZnSWNvbkNvbmZpZ3MuZ2V0KGtleSk7XG5cbiAgICAvLyBSZXR1cm4gKGNvcHkgb2YpIGNhY2hlZCBpY29uIGlmIHBvc3NpYmxlLlxuICAgIGlmIChjb25maWcpIHtcbiAgICAgIHJldHVybiB0aGlzLl9nZXRTdmdGcm9tQ29uZmlnKGNvbmZpZyk7XG4gICAgfVxuXG4gICAgLy8gT3RoZXJ3aXNlIHRyeSB0byByZXNvbHZlIHRoZSBjb25maWcgZnJvbSBvbmUgb2YgdGhlIHJlc29sdmVyIGZ1bmN0aW9ucy5cbiAgICBjb25maWcgPSB0aGlzLl9nZXRJY29uQ29uZmlnRnJvbVJlc29sdmVycyhuYW1lc3BhY2UsIG5hbWUpO1xuXG4gICAgaWYgKGNvbmZpZykge1xuICAgICAgdGhpcy5fc3ZnSWNvbkNvbmZpZ3Muc2V0KGtleSwgY29uZmlnKTtcbiAgICAgIHJldHVybiB0aGlzLl9nZXRTdmdGcm9tQ29uZmlnKGNvbmZpZyk7XG4gICAgfVxuXG4gICAgLy8gU2VlIGlmIHdlIGhhdmUgYW55IGljb24gc2V0cyByZWdpc3RlcmVkIGZvciB0aGUgbmFtZXNwYWNlLlxuICAgIGNvbnN0IGljb25TZXRDb25maWdzID0gdGhpcy5faWNvblNldENvbmZpZ3MuZ2V0KG5hbWVzcGFjZSk7XG5cbiAgICBpZiAoaWNvblNldENvbmZpZ3MpIHtcbiAgICAgIHJldHVybiB0aGlzLl9nZXRTdmdGcm9tSWNvblNldENvbmZpZ3MobmFtZSwgaWNvblNldENvbmZpZ3MpO1xuICAgIH1cblxuICAgIHJldHVybiBvYnNlcnZhYmxlVGhyb3coZ2V0U3ZnSWNvbk5hbWVOb3RGb3VuZEVycm9yKGtleSkpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fcmVzb2x2ZXJzID0gW107XG4gICAgdGhpcy5fc3ZnSWNvbkNvbmZpZ3MuY2xlYXIoKTtcbiAgICB0aGlzLl9pY29uU2V0Q29uZmlncy5jbGVhcigpO1xuICAgIHRoaXMuX2NhY2hlZEljb25zQnlVcmwuY2xlYXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjYWNoZWQgaWNvbiBmb3IgYSBTdmdJY29uQ29uZmlnIGlmIGF2YWlsYWJsZSwgb3IgZmV0Y2hlcyBpdCBmcm9tIGl0cyBVUkwgaWYgbm90LlxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0U3ZnRnJvbUNvbmZpZyhjb25maWc6IFN2Z0ljb25Db25maWcpOiBPYnNlcnZhYmxlPFNWR0VsZW1lbnQ+IHtcbiAgICBpZiAoY29uZmlnLnN2Z1RleHQpIHtcbiAgICAgIC8vIFdlIGFscmVhZHkgaGF2ZSB0aGUgU1ZHIGVsZW1lbnQgZm9yIHRoaXMgaWNvbiwgcmV0dXJuIGEgY29weS5cbiAgICAgIHJldHVybiBvYnNlcnZhYmxlT2YoY2xvbmVTdmcodGhpcy5fc3ZnRWxlbWVudEZyb21Db25maWcoY29uZmlnIGFzIExvYWRlZFN2Z0ljb25Db25maWcpKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEZldGNoIHRoZSBpY29uIGZyb20gdGhlIGNvbmZpZydzIFVSTCwgY2FjaGUgaXQsIGFuZCByZXR1cm4gYSBjb3B5LlxuICAgICAgcmV0dXJuIHRoaXMuX2xvYWRTdmdJY29uRnJvbUNvbmZpZyhjb25maWcpLnBpcGUobWFwKChzdmcpID0+IGNsb25lU3ZnKHN2ZykpKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQXR0ZW1wdHMgdG8gZmluZCBhbiBpY29uIHdpdGggdGhlIHNwZWNpZmllZCBuYW1lIGluIGFueSBvZiB0aGUgU1ZHIGljb24gc2V0cy5cbiAgICogRmlyc3Qgc2VhcmNoZXMgdGhlIGF2YWlsYWJsZSBjYWNoZWQgaWNvbnMgZm9yIGEgbmVzdGVkIGVsZW1lbnQgd2l0aCBhIG1hdGNoaW5nIG5hbWUsIGFuZFxuICAgKiBpZiBmb3VuZCBjb3BpZXMgdGhlIGVsZW1lbnQgdG8gYSBuZXcgYDxzdmc+YCBlbGVtZW50LiBJZiBub3QgZm91bmQsIGZldGNoZXMgYWxsIGljb24gc2V0c1xuICAgKiB0aGF0IGhhdmUgbm90IGJlZW4gY2FjaGVkLCBhbmQgc2VhcmNoZXMgYWdhaW4gYWZ0ZXIgYWxsIGZldGNoZXMgYXJlIGNvbXBsZXRlZC5cbiAgICogVGhlIHJldHVybmVkIE9ic2VydmFibGUgcHJvZHVjZXMgdGhlIFNWRyBlbGVtZW50IGlmIHBvc3NpYmxlLCBhbmQgdGhyb3dzXG4gICAqIGFuIGVycm9yIGlmIG5vIGljb24gd2l0aCB0aGUgc3BlY2lmaWVkIG5hbWUgY2FuIGJlIGZvdW5kLlxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0U3ZnRnJvbUljb25TZXRDb25maWdzKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBpY29uU2V0Q29uZmlnczogU3ZnSWNvbkNvbmZpZ1tdXG4gICk6IE9ic2VydmFibGU8U1ZHRWxlbWVudD4ge1xuICAgIC8vIEZvciBhbGwgdGhlIGljb24gc2V0IFNWRyBlbGVtZW50cyB3ZSd2ZSBmZXRjaGVkLCBzZWUgaWYgYW55IGNvbnRhaW4gYW4gaWNvbiB3aXRoIHRoZVxuICAgIC8vIHJlcXVlc3RlZCBuYW1lLlxuICAgIGNvbnN0IG5hbWVkSWNvbiA9IHRoaXMuX2V4dHJhY3RJY29uV2l0aE5hbWVGcm9tQW55U2V0KG5hbWUsIGljb25TZXRDb25maWdzKTtcblxuICAgIGlmIChuYW1lZEljb24pIHtcbiAgICAgIC8vIFdlIGNvdWxkIGNhY2hlIG5hbWVkSWNvbiBpbiBfc3ZnSWNvbkNvbmZpZ3MsIGJ1dCBzaW5jZSB3ZSBoYXZlIHRvIG1ha2UgYSBjb3B5IGV2ZXJ5XG4gICAgICAvLyB0aW1lIGFueXdheSwgdGhlcmUncyBwcm9iYWJseSBub3QgbXVjaCBhZHZhbnRhZ2UgY29tcGFyZWQgdG8ganVzdCBhbHdheXMgZXh0cmFjdGluZ1xuICAgICAgLy8gaXQgZnJvbSB0aGUgaWNvbiBzZXQuXG4gICAgICByZXR1cm4gb2JzZXJ2YWJsZU9mKG5hbWVkSWNvbik7XG4gICAgfVxuXG4gICAgLy8gTm90IGZvdW5kIGluIGFueSBjYWNoZWQgaWNvbiBzZXRzLiBJZiB0aGVyZSBhcmUgaWNvbiBzZXRzIHdpdGggVVJMcyB0aGF0IHdlIGhhdmVuJ3RcbiAgICAvLyBmZXRjaGVkLCBmZXRjaCB0aGVtIG5vdyBhbmQgbG9vayBmb3IgaWNvbk5hbWUgaW4gdGhlIHJlc3VsdHMuXG4gICAgY29uc3QgaWNvblNldEZldGNoUmVxdWVzdHM6IE9ic2VydmFibGU8VHJ1c3RlZEhUTUwgfCBudWxsPltdID0gaWNvblNldENvbmZpZ3NcbiAgICAgIC5maWx0ZXIoKGljb25TZXRDb25maWcpID0+ICFpY29uU2V0Q29uZmlnLnN2Z1RleHQpXG4gICAgICAubWFwKChpY29uU2V0Q29uZmlnKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9sb2FkU3ZnSWNvblNldEZyb21Db25maWcoaWNvblNldENvbmZpZykucGlwZShcbiAgICAgICAgICBjYXRjaEVycm9yKChlcnI6IEh0dHBFcnJvclJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB1cmwgPSB0aGlzLl9zYW5pdGl6ZXIuc2FuaXRpemUoU2VjdXJpdHlDb250ZXh0LlJFU09VUkNFX1VSTCwgaWNvblNldENvbmZpZy51cmwpO1xuXG4gICAgICAgICAgICAvLyBTd2FsbG93IGVycm9ycyBmZXRjaGluZyBpbmRpdmlkdWFsIFVSTHMgc28gdGhlXG4gICAgICAgICAgICAvLyBjb21iaW5lZCBPYnNlcnZhYmxlIHdvbid0IG5lY2Vzc2FyaWx5IGZhaWwuXG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgTG9hZGluZyBpY29uIHNldCBVUkw6ICR7dXJsfSBmYWlsZWQ6ICR7ZXJyLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgIHRoaXMuX2Vycm9ySGFuZGxlci5oYW5kbGVFcnJvcihuZXcgRXJyb3IoZXJyb3JNZXNzYWdlKSk7XG4gICAgICAgICAgICByZXR1cm4gb2JzZXJ2YWJsZU9mKG51bGwpO1xuICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgICB9KTtcblxuICAgIC8vIEZldGNoIGFsbCB0aGUgaWNvbiBzZXQgVVJMcy4gV2hlbiB0aGUgcmVxdWVzdHMgY29tcGxldGUsIGV2ZXJ5IEljb25TZXQgc2hvdWxkIGhhdmUgYVxuICAgIC8vIGNhY2hlZCBTVkcgZWxlbWVudCAodW5sZXNzIHRoZSByZXF1ZXN0IGZhaWxlZCksIGFuZCB3ZSBjYW4gY2hlY2sgYWdhaW4gZm9yIHRoZSBpY29uLlxuICAgIHJldHVybiBmb3JrSm9pbihpY29uU2V0RmV0Y2hSZXF1ZXN0cykucGlwZShcbiAgICAgIG1hcCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IGZvdW5kSWNvbiA9IHRoaXMuX2V4dHJhY3RJY29uV2l0aE5hbWVGcm9tQW55U2V0KG5hbWUsIGljb25TZXRDb25maWdzKTtcblxuICAgICAgICAvLyBUT0RPOiBhZGQgYW4gbmdEZXZNb2RlIGNoZWNrXG4gICAgICAgIGlmICghZm91bmRJY29uKSB7XG4gICAgICAgICAgdGhyb3cgZ2V0U3ZnSWNvbk5hbWVOb3RGb3VuZEVycm9yKG5hbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZvdW5kSWNvbjtcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWFyY2hlcyB0aGUgY2FjaGVkIFNWRyBlbGVtZW50cyBmb3IgdGhlIGdpdmVuIGljb24gc2V0cyBmb3IgYSBuZXN0ZWQgaWNvbiBlbGVtZW50IHdob3NlIFwiaWRcIlxuICAgKiB0YWcgbWF0Y2hlcyB0aGUgc3BlY2lmaWVkIG5hbWUuIElmIGZvdW5kLCBjb3BpZXMgdGhlIG5lc3RlZCBlbGVtZW50IHRvIGEgbmV3IFNWRyBlbGVtZW50IGFuZFxuICAgKiByZXR1cm5zIGl0LiBSZXR1cm5zIG51bGwgaWYgbm8gbWF0Y2hpbmcgZWxlbWVudCBpcyBmb3VuZC5cbiAgICovXG4gIHByaXZhdGUgX2V4dHJhY3RJY29uV2l0aE5hbWVGcm9tQW55U2V0KFxuICAgIGljb25OYW1lOiBzdHJpbmcsXG4gICAgaWNvblNldENvbmZpZ3M6IFN2Z0ljb25Db25maWdbXVxuICApOiBTVkdFbGVtZW50IHwgbnVsbCB7XG4gICAgLy8gSXRlcmF0ZSBiYWNrd2FyZHMsIHNvIGljb24gc2V0cyBhZGRlZCBsYXRlciBoYXZlIHByZWNlZGVuY2UuXG4gICAgZm9yIChsZXQgaSA9IGljb25TZXRDb25maWdzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBjb25zdCBjb25maWcgPSBpY29uU2V0Q29uZmlnc1tpXTtcblxuICAgICAgLy8gUGFyc2luZyB0aGUgaWNvbiBzZXQncyB0ZXh0IGludG8gYW4gU1ZHIGVsZW1lbnQgY2FuIGJlIGV4cGVuc2l2ZS4gV2UgY2FuIGF2b2lkIHNvbWUgb2ZcbiAgICAgIC8vIHRoZSBwYXJzaW5nIGJ5IGRvaW5nIGEgcXVpY2sgY2hlY2sgdXNpbmcgYGluZGV4T2ZgIHRvIHNlZSBpZiB0aGVyZSdzIGFueSBjaGFuY2UgZm9yIHRoZVxuICAgICAgLy8gaWNvbiB0byBiZSBpbiB0aGUgc2V0LiBUaGlzIHdvbid0IGJlIDEwMCUgYWNjdXJhdGUsIGJ1dCBpdCBzaG91bGQgaGVscCB1cyBhdm9pZCBhdCBsZWFzdFxuICAgICAgLy8gc29tZSBvZiB0aGUgcGFyc2luZy5cbiAgICAgIGlmIChjb25maWcuc3ZnVGV4dCAmJiBjb25maWcuc3ZnVGV4dC50b1N0cmluZygpLmluZGV4T2YoaWNvbk5hbWUpID4gLTEpIHtcbiAgICAgICAgY29uc3Qgc3ZnID0gdGhpcy5fc3ZnRWxlbWVudEZyb21Db25maWcoY29uZmlnIGFzIExvYWRlZFN2Z0ljb25Db25maWcpO1xuICAgICAgICBjb25zdCBmb3VuZEljb24gPSB0aGlzLl9leHRyYWN0U3ZnSWNvbkZyb21TZXQoc3ZnLCBpY29uTmFtZSwgY29uZmlnLm9wdGlvbnMpO1xuICAgICAgICBpZiAoZm91bmRJY29uKSB7XG4gICAgICAgICAgcmV0dXJuIGZvdW5kSWNvbjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2FkcyB0aGUgY29udGVudCBvZiB0aGUgaWNvbiBVUkwgc3BlY2lmaWVkIGluIHRoZSBTdmdJY29uQ29uZmlnIGFuZCBjcmVhdGVzIGFuIFNWRyBlbGVtZW50XG4gICAqIGZyb20gaXQuXG4gICAqL1xuICBwcml2YXRlIF9sb2FkU3ZnSWNvbkZyb21Db25maWcoY29uZmlnOiBTdmdJY29uQ29uZmlnKTogT2JzZXJ2YWJsZTxTVkdFbGVtZW50PiB7XG4gICAgcmV0dXJuIHRoaXMuX2ZldGNoSWNvbihjb25maWcpLnBpcGUoXG4gICAgICB0YXAoKHN2Z1RleHQpID0+IChjb25maWcuc3ZnVGV4dCA9IHN2Z1RleHQpKSxcbiAgICAgIG1hcCgoKSA9PiB0aGlzLl9zdmdFbGVtZW50RnJvbUNvbmZpZyhjb25maWcgYXMgTG9hZGVkU3ZnSWNvbkNvbmZpZykpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2FkcyB0aGUgY29udGVudCBvZiB0aGUgaWNvbiBzZXQgVVJMIHNwZWNpZmllZCBpbiB0aGVcbiAgICogU3ZnSWNvbkNvbmZpZyBhbmQgYXR0YWNoZXMgaXQgdG8gdGhlIGNvbmZpZy5cbiAgICovXG4gIHByaXZhdGUgX2xvYWRTdmdJY29uU2V0RnJvbUNvbmZpZyhjb25maWc6IFN2Z0ljb25Db25maWcpOiBPYnNlcnZhYmxlPFRydXN0ZWRIVE1MIHwgbnVsbD4ge1xuICAgIGlmIChjb25maWcuc3ZnVGV4dCkge1xuICAgICAgcmV0dXJuIG9ic2VydmFibGVPZihudWxsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fZmV0Y2hJY29uKGNvbmZpZykucGlwZSh0YXAoKHN2Z1RleHQpID0+IChjb25maWcuc3ZnVGV4dCA9IHN2Z1RleHQpKSk7XG4gIH1cblxuICAvKipcbiAgICogU2VhcmNoZXMgdGhlIGNhY2hlZCBlbGVtZW50IG9mIHRoZSBnaXZlbiBTdmdJY29uQ29uZmlnIGZvciBhIG5lc3RlZCBpY29uIGVsZW1lbnQgd2hvc2UgXCJpZFwiXG4gICAqIHRhZyBtYXRjaGVzIHRoZSBzcGVjaWZpZWQgbmFtZS4gSWYgZm91bmQsIGNvcGllcyB0aGUgbmVzdGVkIGVsZW1lbnQgdG8gYSBuZXcgU1ZHIGVsZW1lbnQgYW5kXG4gICAqIHJldHVybnMgaXQuIFJldHVybnMgbnVsbCBpZiBubyBtYXRjaGluZyBlbGVtZW50IGlzIGZvdW5kLlxuICAgKi9cbiAgcHJpdmF0ZSBfZXh0cmFjdFN2Z0ljb25Gcm9tU2V0KFxuICAgIGljb25TZXQ6IFNWR0VsZW1lbnQsXG4gICAgaWNvbk5hbWU6IHN0cmluZyxcbiAgICBvcHRpb25zPzogSWNvbk9wdGlvbnNcbiAgKTogU1ZHRWxlbWVudCB8IG51bGwge1xuICAgIC8vIFVzZSB0aGUgYGlkPVwiaWNvbk5hbWVcImAgc3ludGF4IGluIG9yZGVyIHRvIGVzY2FwZSBzcGVjaWFsXG4gICAgLy8gY2hhcmFjdGVycyBpbiB0aGUgSUQgKHZlcnN1cyB1c2luZyB0aGUgI2ljb25OYW1lIHN5bnRheCkuXG4gICAgY29uc3QgaWNvblNvdXJjZSA9IGljb25TZXQucXVlcnlTZWxlY3RvcihgW2lkPVwiJHtpY29uTmFtZX1cIl1gKTtcblxuICAgIGlmICghaWNvblNvdXJjZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gQ2xvbmUgdGhlIGVsZW1lbnQgYW5kIHJlbW92ZSB0aGUgSUQgdG8gcHJldmVudCBtdWx0aXBsZSBlbGVtZW50cyBmcm9tIGJlaW5nIGFkZGVkXG4gICAgLy8gdG8gdGhlIHBhZ2Ugd2l0aCB0aGUgc2FtZSBJRC5cbiAgICBjb25zdCBpY29uRWxlbWVudCA9IGljb25Tb3VyY2UuY2xvbmVOb2RlKHRydWUpIGFzIEVsZW1lbnQ7XG4gICAgaWNvbkVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdpZCcpO1xuXG4gICAgLy8gSWYgdGhlIGljb24gbm9kZSBpcyBpdHNlbGYgYW4gPHN2Zz4gbm9kZSwgY2xvbmUgYW5kIHJldHVybiBpdCBkaXJlY3RseS4gSWYgbm90LCBzZXQgaXQgYXNcbiAgICAvLyB0aGUgY29udGVudCBvZiBhIG5ldyA8c3ZnPiBub2RlLlxuICAgIGlmIChpY29uRWxlbWVudC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnc3ZnJykge1xuICAgICAgcmV0dXJuIHRoaXMuX3NldFN2Z0F0dHJpYnV0ZXMoaWNvbkVsZW1lbnQgYXMgU1ZHRWxlbWVudCwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIG5vZGUgaXMgYSA8c3ltYm9sPiwgaXQgd29uJ3QgYmUgcmVuZGVyZWQgc28gd2UgaGF2ZSB0byBjb252ZXJ0IGl0IGludG8gPHN2Zz4uIE5vdGVcbiAgICAvLyB0aGF0IHRoZSBzYW1lIGNvdWxkIGJlIGFjaGlldmVkIGJ5IHJlZmVycmluZyB0byBpdCB2aWEgPHVzZSBocmVmPVwiI2lkXCI+LCBob3dldmVyIHRoZSA8dXNlPlxuICAgIC8vIHRhZyBpcyBwcm9ibGVtYXRpYyBvbiBGaXJlZm94LCBiZWNhdXNlIGl0IG5lZWRzIHRvIGluY2x1ZGUgdGhlIGN1cnJlbnQgcGFnZSBwYXRoLlxuICAgIGlmIChpY29uRWxlbWVudC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnc3ltYm9sJykge1xuICAgICAgcmV0dXJuIHRoaXMuX3NldFN2Z0F0dHJpYnV0ZXModGhpcy5fdG9TdmdFbGVtZW50KGljb25FbGVtZW50KSwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgLy8gY3JlYXRlRWxlbWVudCgnU1ZHJykgZG9lc24ndCB3b3JrIGFzIGV4cGVjdGVkOyB0aGUgRE9NIGVuZHMgdXAgd2l0aFxuICAgIC8vIHRoZSBjb3JyZWN0IG5vZGVzLCBidXQgdGhlIFNWRyBjb250ZW50IGRvZXNuJ3QgcmVuZGVyLiBJbnN0ZWFkIHdlXG4gICAgLy8gaGF2ZSB0byBjcmVhdGUgYW4gZW1wdHkgU1ZHIG5vZGUgdXNpbmcgaW5uZXJIVE1MIGFuZCBhcHBlbmQgaXRzIGNvbnRlbnQuXG4gICAgLy8gRWxlbWVudHMgY3JlYXRlZCB1c2luZyBET01QYXJzZXIucGFyc2VGcm9tU3RyaW5nIGhhdmUgdGhlIHNhbWUgcHJvYmxlbS5cbiAgICAvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzIzMDAzMjc4L3N2Zy1pbm5lcmh0bWwtaW4tZmlyZWZveC1jYW4tbm90LWRpc3BsYXlcbiAgICBjb25zdCBzdmcgPSB0aGlzLl9zdmdFbGVtZW50RnJvbVN0cmluZyh0cnVzdGVkSFRNTEZyb21TdHJpbmcoJzxzdmc+PC9zdmc+JykpO1xuICAgIC8vIENsb25lIHRoZSBub2RlIHNvIHdlIGRvbid0IHJlbW92ZSBpdCBmcm9tIHRoZSBwYXJlbnQgaWNvbiBzZXQgZWxlbWVudC5cbiAgICBzdmcuYXBwZW5kQ2hpbGQoaWNvbkVsZW1lbnQpO1xuXG4gICAgcmV0dXJuIHRoaXMuX3NldFN2Z0F0dHJpYnV0ZXMoc3ZnLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgRE9NIGVsZW1lbnQgZnJvbSB0aGUgZ2l2ZW4gU1ZHIHN0cmluZy5cbiAgICovXG4gIHByaXZhdGUgX3N2Z0VsZW1lbnRGcm9tU3RyaW5nKHN0cjogVHJ1c3RlZEhUTUwpOiBTVkdFbGVtZW50IHtcbiAgICBjb25zdCBkaXYgPSB0aGlzLl9kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdESVYnKTtcbiAgICBkaXYuaW5uZXJIVE1MID0gc3RyIGFzIHVua25vd24gYXMgc3RyaW5nO1xuICAgIGNvbnN0IHN2ZyA9IGRpdi5xdWVyeVNlbGVjdG9yKCdzdmcnKSBhcyBTVkdFbGVtZW50O1xuXG4gICAgLy8gVE9ETzogYWRkIGFuIG5nRGV2TW9kZSBjaGVja1xuICAgIGlmICghc3ZnKSB7XG4gICAgICB0aHJvdyBFcnJvcignPHN2Zz4gdGFnIG5vdCBmb3VuZCcpO1xuICAgIH1cblxuICAgIHJldHVybiBzdmc7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgYW4gZWxlbWVudCBpbnRvIGFuIFNWRyBub2RlIGJ5IGNsb25pbmcgYWxsIG9mIGl0cyBjaGlsZHJlbi5cbiAgICovXG4gIHByaXZhdGUgX3RvU3ZnRWxlbWVudChlbGVtZW50OiBFbGVtZW50KTogU1ZHRWxlbWVudCB7XG4gICAgY29uc3Qgc3ZnID0gdGhpcy5fc3ZnRWxlbWVudEZyb21TdHJpbmcodHJ1c3RlZEhUTUxGcm9tU3RyaW5nKCc8c3ZnPjwvc3ZnPicpKTtcbiAgICBjb25zdCBhdHRyaWJ1dGVzID0gZWxlbWVudC5hdHRyaWJ1dGVzO1xuXG4gICAgLy8gQ29weSBvdmVyIGFsbCB0aGUgYXR0cmlidXRlcyBmcm9tIHRoZSBgc3ltYm9sYCB0byB0aGUgbmV3IFNWRywgZXhjZXB0IHRoZSBpZC5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L3ByZWZlci1mb3Itb2ZcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGF0dHJpYnV0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHsgbmFtZSwgdmFsdWUgfSA9IGF0dHJpYnV0ZXNbaV07XG5cbiAgICAgIGlmIChuYW1lICE9PSAnaWQnKSB7XG4gICAgICAgIHN2Zy5zZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvcHJlZmVyLWZvci1vZlxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZWxlbWVudC5jaGlsZE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoZWxlbWVudC5jaGlsZE5vZGVzW2ldLm5vZGVUeXBlID09PSB0aGlzLl9kb2N1bWVudC5FTEVNRU5UX05PREUpIHtcbiAgICAgICAgc3ZnLmFwcGVuZENoaWxkKGVsZW1lbnQuY2hpbGROb2Rlc1tpXS5jbG9uZU5vZGUodHJ1ZSkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzdmc7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgZGVmYXVsdCBhdHRyaWJ1dGVzIGZvciBhbiBTVkcgZWxlbWVudCB0byBiZSB1c2VkIGFzIGFuIGljb24uXG4gICAqL1xuICBwcml2YXRlIF9zZXRTdmdBdHRyaWJ1dGVzKHN2ZzogU1ZHRWxlbWVudCwgb3B0aW9ucz86IEljb25PcHRpb25zKTogU1ZHRWxlbWVudCB7XG4gICAgc3ZnLnNldEF0dHJpYnV0ZSgnZml0JywgJycpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsICcxMDAlJyk7XG4gICAgc3ZnLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCAnMTAwJScpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoJ3ByZXNlcnZlQXNwZWN0UmF0aW8nLCAneE1pZFlNaWQgbWVldCcpO1xuICAgIHN2Zy5zZXRBdHRyaWJ1dGUoJ2ZvY3VzYWJsZScsICdmYWxzZScpOyAvLyBEaXNhYmxlIElFMTEgZGVmYXVsdCBiZWhhdmlvciB0byBtYWtlIFNWR3MgZm9jdXNhYmxlLlxuXG4gICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy52aWV3Qm94KSB7XG4gICAgICBzdmcuc2V0QXR0cmlidXRlKCd2aWV3Qm94Jywgb3B0aW9ucy52aWV3Qm94KTtcbiAgICB9XG5cbiAgICByZXR1cm4gc3ZnO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gT2JzZXJ2YWJsZSB3aGljaCBwcm9kdWNlcyB0aGUgc3RyaW5nIGNvbnRlbnRzIG9mIHRoZSBnaXZlbiBpY29uLiBSZXN1bHRzIG1heSBiZVxuICAgKiBjYWNoZWQsIHNvIGZ1dHVyZSBjYWxscyB3aXRoIHRoZSBzYW1lIFVSTCBtYXkgbm90IGNhdXNlIGFub3RoZXIgSFRUUCByZXF1ZXN0LlxuICAgKi9cbiAgcHJpdmF0ZSBfZmV0Y2hJY29uKGljb25Db25maWc6IFN2Z0ljb25Db25maWcpOiBPYnNlcnZhYmxlPFRydXN0ZWRIVE1MPiB7XG4gICAgY29uc3QgeyB1cmw6IHNhZmVVcmwsIG9wdGlvbnMgfSA9IGljb25Db25maWc7XG4gICAgY29uc3Qgd2l0aENyZWRlbnRpYWxzID0gb3B0aW9ucz8ud2l0aENyZWRlbnRpYWxzID8/IGZhbHNlO1xuXG4gICAgaWYgKCF0aGlzLl9odHRwQ2xpZW50KSB7XG4gICAgICB0aHJvdyBnZXRTdmdJY29uTm9IdHRwUHJvdmlkZXJFcnJvcigpO1xuICAgIH1cblxuICAgIC8vIFRPRE86IGFkZCBhbiBuZ0Rldk1vZGUgY2hlY2tcbiAgICBpZiAoc2FmZVVybCA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBFcnJvcihgQ2Fubm90IGZldGNoIGljb24gZnJvbSBVUkwgXCIke3NhZmVVcmx9XCIuYCk7XG4gICAgfVxuXG4gICAgY29uc3QgdXJsID0gdGhpcy5fc2FuaXRpemVyLnNhbml0aXplKFNlY3VyaXR5Q29udGV4dC5SRVNPVVJDRV9VUkwsIHNhZmVVcmwpO1xuXG4gICAgLy8gVE9ETzogYWRkIGFuIG5nRGV2TW9kZSBjaGVja1xuICAgIGlmICghdXJsKSB7XG4gICAgICB0aHJvdyBnZXRTdmdJY29uRmFpbGVkVG9TYW5pdGl6ZVVybEVycm9yKHNhZmVVcmwpO1xuICAgIH1cblxuICAgIC8vIFN0b3JlIGluLXByb2dyZXNzIGZldGNoZXMgdG8gYXZvaWQgc2VuZGluZyBhIGR1cGxpY2F0ZSByZXF1ZXN0IGZvciBhIFVSTCB3aGVuIHRoZXJlIGlzXG4gICAgLy8gYWxyZWFkeSBhIHJlcXVlc3QgaW4gcHJvZ3Jlc3MgZm9yIHRoYXQgVVJMLiBJdCdzIG5lY2Vzc2FyeSB0byBjYWxsIHNoYXJlKCkgb24gdGhlXG4gICAgLy8gT2JzZXJ2YWJsZSByZXR1cm5lZCBieSBodHRwLmdldCgpIHNvIHRoYXQgbXVsdGlwbGUgc3Vic2NyaWJlcnMgZG9uJ3QgY2F1c2UgbXVsdGlwbGUgWEhScy5cbiAgICBjb25zdCBpblByb2dyZXNzRmV0Y2ggPSB0aGlzLl9pblByb2dyZXNzVXJsRmV0Y2hlcy5nZXQodXJsKTtcblxuICAgIGlmIChpblByb2dyZXNzRmV0Y2gpIHtcbiAgICAgIHJldHVybiBpblByb2dyZXNzRmV0Y2g7XG4gICAgfVxuXG4gICAgY29uc3QgcmVxID0gdGhpcy5faHR0cENsaWVudC5nZXQodXJsLCB7IHJlc3BvbnNlVHlwZTogJ3RleHQnLCB3aXRoQ3JlZGVudGlhbHMgfSkucGlwZShcbiAgICAgIG1hcCgoc3ZnKSA9PiB7XG4gICAgICAgIC8vIFNlY3VyaXR5OiBUaGlzIFNWRyBpcyBmZXRjaGVkIGZyb20gYSBTYWZlUmVzb3VyY2VVcmwsIGFuZCBpcyB0aHVzXG4gICAgICAgIC8vIHRydXN0ZWQgSFRNTC5cbiAgICAgICAgcmV0dXJuIHRydXN0ZWRIVE1MRnJvbVN0cmluZyhzdmcpO1xuICAgICAgfSksXG4gICAgICBmaW5hbGl6ZSgoKSA9PiB0aGlzLl9pblByb2dyZXNzVXJsRmV0Y2hlcy5kZWxldGUodXJsKSksXG4gICAgICBzaGFyZSgpXG4gICAgKTtcblxuICAgIHRoaXMuX2luUHJvZ3Jlc3NVcmxGZXRjaGVzLnNldCh1cmwsIHJlcSk7XG4gICAgcmV0dXJuIHJlcTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYW4gaWNvbiBjb25maWcgYnkgbmFtZSBpbiB0aGUgc3BlY2lmaWVkIG5hbWVzcGFjZS5cbiAgICogQHBhcmFtIG5hbWVzcGFjZSBOYW1lc3BhY2UgaW4gd2hpY2ggdG8gcmVnaXN0ZXIgdGhlIGljb24gY29uZmlnLlxuICAgKiBAcGFyYW0gaWNvbk5hbWUgTmFtZSB1bmRlciB3aGljaCB0byByZWdpc3RlciB0aGUgY29uZmlnLlxuICAgKiBAcGFyYW0gY29uZmlnIENvbmZpZyB0byBiZSByZWdpc3RlcmVkLlxuICAgKi9cbiAgcHJpdmF0ZSBfYWRkU3ZnSWNvbkNvbmZpZyhuYW1lc3BhY2U6IHN0cmluZywgaWNvbk5hbWU6IHN0cmluZywgY29uZmlnOiBTdmdJY29uQ29uZmlnKTogdGhpcyB7XG4gICAgdGhpcy5fc3ZnSWNvbkNvbmZpZ3Muc2V0KGljb25LZXkobmFtZXNwYWNlLCBpY29uTmFtZSksIGNvbmZpZyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGFuIGljb24gc2V0IGNvbmZpZyBpbiB0aGUgc3BlY2lmaWVkIG5hbWVzcGFjZS5cbiAgICogQHBhcmFtIG5hbWVzcGFjZSBOYW1lc3BhY2UgaW4gd2hpY2ggdG8gcmVnaXN0ZXIgdGhlIGljb24gY29uZmlnLlxuICAgKiBAcGFyYW0gY29uZmlnIENvbmZpZyB0byBiZSByZWdpc3RlcmVkLlxuICAgKi9cbiAgcHJpdmF0ZSBfYWRkU3ZnSWNvblNldENvbmZpZyhuYW1lc3BhY2U6IHN0cmluZywgY29uZmlnOiBTdmdJY29uQ29uZmlnKTogdGhpcyB7XG4gICAgY29uc3QgY29uZmlnTmFtZXNwYWNlID0gdGhpcy5faWNvblNldENvbmZpZ3MuZ2V0KG5hbWVzcGFjZSk7XG5cbiAgICBpZiAoY29uZmlnTmFtZXNwYWNlKSB7XG4gICAgICBjb25maWdOYW1lc3BhY2UucHVzaChjb25maWcpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9pY29uU2V0Q29uZmlncy5zZXQobmFtZXNwYWNlLCBbY29uZmlnXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKiogUGFyc2VzIGEgY29uZmlnJ3MgdGV4dCBpbnRvIGFuIFNWRyBlbGVtZW50LiAqL1xuICBwcml2YXRlIF9zdmdFbGVtZW50RnJvbUNvbmZpZyhjb25maWc6IExvYWRlZFN2Z0ljb25Db25maWcpOiBTVkdFbGVtZW50IHtcbiAgICBpZiAoIWNvbmZpZy5zdmdFbGVtZW50KSB7XG4gICAgICBjb25zdCBzdmcgPSB0aGlzLl9zdmdFbGVtZW50RnJvbVN0cmluZyhjb25maWcuc3ZnVGV4dCk7XG4gICAgICB0aGlzLl9zZXRTdmdBdHRyaWJ1dGVzKHN2ZywgY29uZmlnLm9wdGlvbnMpO1xuICAgICAgY29uZmlnLnN2Z0VsZW1lbnQgPSBzdmc7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbmZpZy5zdmdFbGVtZW50O1xuICB9XG5cbiAgLyoqIFRyaWVzIHRvIGNyZWF0ZSBhbiBpY29uIGNvbmZpZyB0aHJvdWdoIHRoZSByZWdpc3RlcmVkIHJlc29sdmVyIGZ1bmN0aW9ucy4gKi9cbiAgcHJpdmF0ZSBfZ2V0SWNvbkNvbmZpZ0Zyb21SZXNvbHZlcnMobmFtZXNwYWNlOiBzdHJpbmcsIG5hbWU6IHN0cmluZyk6IFN2Z0ljb25Db25maWcgfCB1bmRlZmluZWQge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvcHJlZmVyLWZvci1vZlxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fcmVzb2x2ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCByZXN1bHQgPSB0aGlzLl9yZXNvbHZlcnNbaV0obmFtZSwgbmFtZXNwYWNlKTtcblxuICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICByZXR1cm4gaXNTYWZlVXJsV2l0aE9wdGlvbnMocmVzdWx0KVxuICAgICAgICAgID8gbmV3IFN2Z0ljb25Db25maWcocmVzdWx0LnVybCwgbnVsbCwgcmVzdWx0Lm9wdGlvbnMpXG4gICAgICAgICAgOiBuZXcgU3ZnSWNvbkNvbmZpZyhyZXN1bHQsIG51bGwpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn1cblxuLyoqIEBkb2NzLXByaXZhdGUgKi9cbmV4cG9ydCBmdW5jdGlvbiBJQ09OX1JFR0lTVFJZX1BST1ZJREVSX0ZBQ1RPUlkoXG4gIHBhcmVudFJlZ2lzdHJ5OiBTdmdJY29uUmVnaXN0cnksXG4gIGh0dHBDbGllbnQ6IEh0dHBDbGllbnQsXG4gIHNhbml0aXplcjogRG9tU2FuaXRpemVyLFxuICBlcnJvckhhbmRsZXI6IEVycm9ySGFuZGxlcixcbiAgZG9jdW1lbnQ/OiBhbnlcbikge1xuICByZXR1cm4gcGFyZW50UmVnaXN0cnkgfHwgbmV3IFN2Z0ljb25SZWdpc3RyeShodHRwQ2xpZW50LCBzYW5pdGl6ZXIsIGRvY3VtZW50LCBlcnJvckhhbmRsZXIpO1xufVxuXG4vKiogQGRvY3MtcHJpdmF0ZSAqL1xuZXhwb3J0IGNvbnN0IElDT05fUkVHSVNUUllfUFJPVklERVIgPSB7XG4gIC8vIElmIHRoZXJlIGlzIGFscmVhZHkgYW4gU3ZnSWNvblJlZ2lzdHJ5IGF2YWlsYWJsZSwgdXNlIHRoYXQuIE90aGVyd2lzZSwgcHJvdmlkZSBhIG5ldyBvbmUuXG4gIHByb3ZpZGU6IFN2Z0ljb25SZWdpc3RyeSxcbiAgZGVwczogW1xuICAgIFtuZXcgT3B0aW9uYWwoKSwgbmV3IFNraXBTZWxmKCksIFN2Z0ljb25SZWdpc3RyeV0sXG4gICAgW25ldyBPcHRpb25hbCgpLCBIdHRwQ2xpZW50XSxcbiAgICBEb21TYW5pdGl6ZXIsXG4gICAgRXJyb3JIYW5kbGVyLFxuICAgIFtuZXcgT3B0aW9uYWwoKSwgRE9DVU1FTlQgYXMgSW5qZWN0aW9uVG9rZW48YW55Pl0sXG4gIF0sXG4gIHVzZUZhY3Rvcnk6IElDT05fUkVHSVNUUllfUFJPVklERVJfRkFDVE9SWSxcbn07XG5cbi8qKiBDbG9uZXMgYW4gU1ZHRWxlbWVudCB3aGlsZSBwcmVzZXJ2aW5nIHR5cGUgaW5mb3JtYXRpb24uICovXG5mdW5jdGlvbiBjbG9uZVN2Zyhzdmc6IFNWR0VsZW1lbnQpOiBTVkdFbGVtZW50IHtcbiAgcmV0dXJuIHN2Zy5jbG9uZU5vZGUodHJ1ZSkgYXMgU1ZHRWxlbWVudDtcbn1cblxuLyoqIFJldHVybnMgdGhlIGNhY2hlIGtleSB0byB1c2UgZm9yIGFuIGljb24gbmFtZXNwYWNlIGFuZCBuYW1lLiAqL1xuZnVuY3Rpb24gaWNvbktleShuYW1lc3BhY2U6IHN0cmluZywgbmFtZTogc3RyaW5nKSB7XG4gIHJldHVybiBuYW1lc3BhY2UgKyAnOicgKyBuYW1lO1xufVxuXG5mdW5jdGlvbiBpc1NhZmVVcmxXaXRoT3B0aW9ucyh2YWx1ZTogYW55KTogdmFsdWUgaXMgU2FmZVJlc291cmNlVXJsV2l0aEljb25PcHRpb25zIHtcbiAgcmV0dXJuICEhKHZhbHVlLnVybCAmJiB2YWx1ZS5vcHRpb25zKTtcbn1cbiJdfQ==