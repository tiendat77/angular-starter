import * as i0 from '@angular/core';
import { Directive, inject, ElementRef, input, booleanAttribute, computed, ChangeDetectionStrategy, Component } from '@angular/core';
import { cva } from '@libs/ui/core';

/** Title/description column with an optional action pinned to the top-right. */
class UiCardHeaderDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiCardHeaderDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "22.0.5", type: UiCardHeaderDirective, isStandalone: true, selector: "[uiCardHeader]", host: { classAttribute: "card-header" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiCardHeaderDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[uiCardHeader]', host: { class: 'card-header' } }]
        }] });
class UiCardTitleDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiCardTitleDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "22.0.5", type: UiCardTitleDirective, isStandalone: true, selector: "[uiCardTitle]", host: { classAttribute: "card-title" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiCardTitleDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[uiCardTitle]', host: { class: 'card-title' } }]
        }] });
class UiCardDescriptionDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiCardDescriptionDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "22.0.5", type: UiCardDescriptionDirective, isStandalone: true, selector: "[uiCardDescription]", host: { classAttribute: "card-description" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiCardDescriptionDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[uiCardDescription]', host: { class: 'card-description' } }]
        }] });
/** Button or menu placed in the header's top-right corner. */
class UiCardActionDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiCardActionDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "22.0.5", type: UiCardActionDirective, isStandalone: true, selector: "[uiCardAction]", host: { classAttribute: "card-action" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiCardActionDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[uiCardAction]', host: { class: 'card-action' } }]
        }] });
class UiCardContentDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiCardContentDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "22.0.5", type: UiCardContentDirective, isStandalone: true, selector: "[uiCardContent]", host: { classAttribute: "card-content" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiCardContentDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[uiCardContent]', host: { class: 'card-content' } }]
        }] });
class UiCardFooterDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiCardFooterDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "22.0.5", type: UiCardFooterDirective, isStandalone: true, selector: "[uiCardFooter]", host: { classAttribute: "card-footer" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiCardFooterDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[uiCardFooter]', host: { class: 'card-footer' } }]
        }] });
/** Full-bleed image or video; bleeds into the card's top/bottom padding when first/last. */
class UiCardMediaDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiCardMediaDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "22.0.5", type: UiCardMediaDirective, isStandalone: true, selector: "[uiCardMedia]", host: { classAttribute: "card-media" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiCardMediaDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[uiCardMedia]', host: { class: 'card-media' } }]
        }] });

const cardVariants = cva({
    base: 'card',
    variants: {
        appearance: { outline: 'card-outline', elevated: 'card-elevated', filled: 'card-filled' },
        padding: { none: 'card-p-none', sm: 'card-p-sm', md: 'card-p-md', lg: 'card-p-lg' },
        interactive: { true: 'card-interactive', false: '' },
    },
    defaultVariants: { appearance: 'outline', padding: 'md', interactive: 'false' },
});

/**
 * Surface for grouped content. Works as `<ui-card>` or on a semantic host (`article[uiCard]`,
 * `a[uiCard]`, `button[uiCard]`). Links and buttons get the interactive look automatically.
 */
class UiCardComponent {
    _tagName = inject(ElementRef).nativeElement.tagName;
    appearance = input('outline', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "appearance" }] : /* istanbul ignore next */ []));
    padding = input('md', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "padding" }] : /* istanbul ignore next */ []));
    interactive = input(false, { ...(ngDevMode ? { debugName: "interactive" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    hostClass = computed(() => cardVariants({
        appearance: this.appearance(),
        padding: this.padding(),
        interactive: this.interactive() || this._tagName === 'A' || this._tagName === 'BUTTON'
            ? 'true'
            : 'false',
    }), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hostClass" }] : /* istanbul ignore next */ []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiCardComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "22.0.5", type: UiCardComponent, isStandalone: true, selector: "ui-card, [uiCard]", inputs: { appearance: { classPropertyName: "appearance", publicName: "appearance", isSignal: true, isRequired: false, transformFunction: null }, padding: { classPropertyName: "padding", publicName: "padding", isSignal: true, isRequired: false, transformFunction: null }, interactive: { classPropertyName: "interactive", publicName: "interactive", isSignal: true, isRequired: false, transformFunction: null } }, host: { properties: { "class": "hostClass()" } }, ngImport: i0, template: '<ng-content />', isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiCardComponent, decorators: [{
            type: Component,
            args: [{
                    // Attribute form keeps native <a>/<button>/<article> semantics
                    selector: 'ui-card, [uiCard]',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    host: { '[class]': 'hostClass()' },
                    template: '<ng-content />',
                }]
        }], propDecorators: { appearance: [{ type: i0.Input, args: [{ isSignal: true, alias: "appearance", required: false }] }], padding: [{ type: i0.Input, args: [{ isSignal: true, alias: "padding", required: false }] }], interactive: [{ type: i0.Input, args: [{ isSignal: true, alias: "interactive", required: false }] }] } });

/**
 * Generated bundle index. Do not edit.
 */

export { UiCardActionDirective, UiCardComponent, UiCardContentDirective, UiCardDescriptionDirective, UiCardFooterDirective, UiCardHeaderDirective, UiCardMediaDirective, UiCardTitleDirective, cardVariants };
//# sourceMappingURL=libs-ui-card.mjs.map
