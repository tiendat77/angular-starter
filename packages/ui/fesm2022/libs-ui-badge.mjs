import { AriaDescriber } from '@angular/cdk/a11y';
import * as i0 from '@angular/core';
import { inject, ElementRef, Renderer2, input, numberAttribute, booleanAttribute, computed, isDevMode, effect, DestroyRef, Directive, ChangeDetectionStrategy, Component } from '@angular/core';
import { cva } from '@libs/ui/core';

/**
 * Text shown in a badge. Numbers above `max` become "{max}+"; 0 is hidden unless `showZero`;
 * digit-only strings (e.g. `uiBadge="{{ unread }}"`) count as numbers; other strings pass through;
 * null, '', negative and non-finite numbers give ''.
 */
function formatBadgeCount(count, max = 99, showZero = false) {
    if (count === null || count === undefined || count === '')
        return '';
    if (typeof count === 'string') {
        if (!/^\d+$/.test(count))
            return count;
        count = Number(count);
    }
    if (!Number.isFinite(count) || count < 0)
        return '';
    if (count === 0 && !showZero)
        return '';
    return count > max ? `${max}+` : String(Math.floor(count));
}

const badgeVariants = cva({
    base: 'badge',
    variants: {
        color: {
            neutral: 'badge-neutral',
            primary: 'badge-primary',
            info: 'badge-info',
            success: 'badge-success',
            warning: 'badge-warning',
            error: 'badge-error',
        },
        size: { sm: 'badge-sm', md: 'badge-md', dot: 'badge-dot' },
    },
    defaultVariants: { color: 'error', size: 'md' },
});
const badgeOverlayVariants = cva({
    base: 'badge-overlay',
    variants: {
        position: {
            'top-end': 'badge-top-end',
            'top-start': 'badge-top-start',
            'bottom-end': 'badge-bottom-end',
            'bottom-start': 'badge-bottom-start',
        },
        overlap: { rectangular: '', circular: 'badge-circular' },
    },
    defaultVariants: { position: 'top-end', overlap: 'rectangular' },
});

/** Elements that cannot render a child badge. */
const VOID_HOSTS = new Set(['IMG', 'INPUT', 'TEXTAREA', 'SELECT', 'BR', 'HR']);
/**
 * Overlays a count or dot on its host (Material `matBadge` style). The badge span is decorative;
 * `uiBadgeDescription` is what assistive technology announces, via `aria-describedby`.
 */
class UiBadgeAnchorDirective {
    _host = inject(ElementRef).nativeElement;
    _renderer = inject(Renderer2);
    _describer = inject(AriaDescriber);
    content = input(null, { ...(ngDevMode ? { debugName: "content" } : /* istanbul ignore next */ {}), alias: 'uiBadge' });
    max = input(99, { ...(ngDevMode ? { debugName: "max" } : /* istanbul ignore next */ {}), alias: 'uiBadgeMax', transform: numberAttribute });
    showZero = input(false, { ...(ngDevMode ? { debugName: "showZero" } : /* istanbul ignore next */ {}), alias: 'uiBadgeShowZero', transform: booleanAttribute });
    dot = input(false, { ...(ngDevMode ? { debugName: "dot" } : /* istanbul ignore next */ {}), alias: 'uiBadgeDot', transform: booleanAttribute });
    color = input('error', { ...(ngDevMode ? { debugName: "color" } : /* istanbul ignore next */ {}), alias: 'uiBadgeColor' });
    size = input('md', { ...(ngDevMode ? { debugName: "size" } : /* istanbul ignore next */ {}), alias: 'uiBadgeSize' });
    position = input('top-end', { ...(ngDevMode ? { debugName: "position" } : /* istanbul ignore next */ {}), alias: 'uiBadgePosition' });
    overlap = input('rectangular', { ...(ngDevMode ? { debugName: "overlap" } : /* istanbul ignore next */ {}), alias: 'uiBadgeOverlap' });
    hidden = input(false, { ...(ngDevMode ? { debugName: "hidden" } : /* istanbul ignore next */ {}), alias: 'uiBadgeHidden', transform: booleanAttribute });
    description = input('', { ...(ngDevMode ? { debugName: "description" } : /* istanbul ignore next */ {}), alias: 'uiBadgeDescription' });
    _text = computed(() => this.dot() ? '' : formatBadgeCount(this.content(), this.max(), this.showZero()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_text" }] : /* istanbul ignore next */ []));
    _visible = computed(() => !this.hidden() && (this.dot() || this._text() !== ''), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_visible" }] : /* istanbul ignore next */ []));
    _class = computed(() => badgeVariants({ color: this.color(), size: this.dot() ? 'dot' : this.size() }, badgeOverlayVariants({ position: this.position(), overlap: this.overlap() })), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_class" }] : /* istanbul ignore next */ []));
    _badge;
    _describedAs = '';
    constructor() {
        if (isDevMode() && VOID_HOSTS.has(this._host.tagName)) {
            throw new Error(`uiBadge cannot be placed on <${this._host.tagName}>: it can't contain the badge. Wrap it in an element.`);
        }
        this._badge = this._renderer.createElement('span');
        this._renderer.setAttribute(this._badge, 'aria-hidden', 'true');
        this._renderer.appendChild(this._host, this._badge);
        effect(() => {
            this._badge.textContent = this._text();
            this._badge.className = this._class();
            this._badge.hidden = !this._visible();
        });
        effect(() => {
            const next = this._visible() ? this.description().trim() : '';
            if (next === this._describedAs)
                return;
            if (this._describedAs)
                this._describer.removeDescription(this._host, this._describedAs);
            if (next)
                this._describer.describe(this._host, next);
            this._describedAs = next;
        });
        inject(DestroyRef).onDestroy(() => {
            if (this._describedAs)
                this._describer.removeDescription(this._host, this._describedAs);
            this._renderer.removeChild(this._host, this._badge);
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiBadgeAnchorDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "22.0.5", type: UiBadgeAnchorDirective, isStandalone: true, selector: "[uiBadge]", inputs: { content: { classPropertyName: "content", publicName: "uiBadge", isSignal: true, isRequired: false, transformFunction: null }, max: { classPropertyName: "max", publicName: "uiBadgeMax", isSignal: true, isRequired: false, transformFunction: null }, showZero: { classPropertyName: "showZero", publicName: "uiBadgeShowZero", isSignal: true, isRequired: false, transformFunction: null }, dot: { classPropertyName: "dot", publicName: "uiBadgeDot", isSignal: true, isRequired: false, transformFunction: null }, color: { classPropertyName: "color", publicName: "uiBadgeColor", isSignal: true, isRequired: false, transformFunction: null }, size: { classPropertyName: "size", publicName: "uiBadgeSize", isSignal: true, isRequired: false, transformFunction: null }, position: { classPropertyName: "position", publicName: "uiBadgePosition", isSignal: true, isRequired: false, transformFunction: null }, overlap: { classPropertyName: "overlap", publicName: "uiBadgeOverlap", isSignal: true, isRequired: false, transformFunction: null }, hidden: { classPropertyName: "hidden", publicName: "uiBadgeHidden", isSignal: true, isRequired: false, transformFunction: null }, description: { classPropertyName: "description", publicName: "uiBadgeDescription", isSignal: true, isRequired: false, transformFunction: null } }, host: { classAttribute: "badge-anchor" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiBadgeAnchorDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[uiBadge]',
                    host: { class: 'badge-anchor' },
                }]
        }], ctorParameters: () => [], propDecorators: { content: [{ type: i0.Input, args: [{ isSignal: true, alias: "uiBadge", required: false }] }], max: [{ type: i0.Input, args: [{ isSignal: true, alias: "uiBadgeMax", required: false }] }], showZero: [{ type: i0.Input, args: [{ isSignal: true, alias: "uiBadgeShowZero", required: false }] }], dot: [{ type: i0.Input, args: [{ isSignal: true, alias: "uiBadgeDot", required: false }] }], color: [{ type: i0.Input, args: [{ isSignal: true, alias: "uiBadgeColor", required: false }] }], size: [{ type: i0.Input, args: [{ isSignal: true, alias: "uiBadgeSize", required: false }] }], position: [{ type: i0.Input, args: [{ isSignal: true, alias: "uiBadgePosition", required: false }] }], overlap: [{ type: i0.Input, args: [{ isSignal: true, alias: "uiBadgeOverlap", required: false }] }], hidden: [{ type: i0.Input, args: [{ isSignal: true, alias: "uiBadgeHidden", required: false }] }], description: [{ type: i0.Input, args: [{ isSignal: true, alias: "uiBadgeDescription", required: false }] }] } });

/** Inline count or dot, e.g. next to a menu label. Hidden when there is nothing to show. */
class UiBadgeComponent {
    count = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "count" }] : /* istanbul ignore next */ []));
    max = input(99, { ...(ngDevMode ? { debugName: "max" } : /* istanbul ignore next */ {}), transform: numberAttribute });
    showZero = input(false, { ...(ngDevMode ? { debugName: "showZero" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    dot = input(false, { ...(ngDevMode ? { debugName: "dot" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    color = input('error', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "color" }] : /* istanbul ignore next */ []));
    size = input('md', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "size" }] : /* istanbul ignore next */ []));
    text = computed(() => this.dot() ? '' : formatBadgeCount(this.count(), this.max(), this.showZero()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "text" }] : /* istanbul ignore next */ []));
    visible = computed(() => this.dot() || this.text() !== '', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "visible" }] : /* istanbul ignore next */ []));
    hostClass = computed(() => badgeVariants({ color: this.color(), size: this.dot() ? 'dot' : this.size() }), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hostClass" }] : /* istanbul ignore next */ []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiBadgeComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "22.0.5", type: UiBadgeComponent, isStandalone: true, selector: "ui-badge", inputs: { count: { classPropertyName: "count", publicName: "count", isSignal: true, isRequired: false, transformFunction: null }, max: { classPropertyName: "max", publicName: "max", isSignal: true, isRequired: false, transformFunction: null }, showZero: { classPropertyName: "showZero", publicName: "showZero", isSignal: true, isRequired: false, transformFunction: null }, dot: { classPropertyName: "dot", publicName: "dot", isSignal: true, isRequired: false, transformFunction: null }, color: { classPropertyName: "color", publicName: "color", isSignal: true, isRequired: false, transformFunction: null }, size: { classPropertyName: "size", publicName: "size", isSignal: true, isRequired: false, transformFunction: null } }, host: { properties: { "class": "hostClass()", "attr.hidden": "visible() ? null : \"\"" } }, ngImport: i0, template: '{{ text() }}', isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiBadgeComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'ui-badge',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    host: {
                        '[class]': 'hostClass()',
                        '[attr.hidden]': 'visible() ? null : ""',
                    },
                    template: '{{ text() }}',
                }]
        }], propDecorators: { count: [{ type: i0.Input, args: [{ isSignal: true, alias: "count", required: false }] }], max: [{ type: i0.Input, args: [{ isSignal: true, alias: "max", required: false }] }], showZero: [{ type: i0.Input, args: [{ isSignal: true, alias: "showZero", required: false }] }], dot: [{ type: i0.Input, args: [{ isSignal: true, alias: "dot", required: false }] }], color: [{ type: i0.Input, args: [{ isSignal: true, alias: "color", required: false }] }], size: [{ type: i0.Input, args: [{ isSignal: true, alias: "size", required: false }] }] } });

/**
 * Generated bundle index. Do not edit.
 */

export { UiBadgeAnchorDirective, UiBadgeComponent, badgeOverlayVariants, badgeVariants, formatBadgeCount };
//# sourceMappingURL=libs-ui-badge.mjs.map
