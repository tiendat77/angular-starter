import * as i0 from '@angular/core';

/** Title/description column with an optional action pinned to the top-right. */
declare class UiCardHeaderDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<UiCardHeaderDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<UiCardHeaderDirective, "[uiCardHeader]", never, {}, {}, never, never, true, never>;
}
declare class UiCardTitleDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<UiCardTitleDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<UiCardTitleDirective, "[uiCardTitle]", never, {}, {}, never, never, true, never>;
}
declare class UiCardDescriptionDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<UiCardDescriptionDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<UiCardDescriptionDirective, "[uiCardDescription]", never, {}, {}, never, never, true, never>;
}
/** Button or menu placed in the header's top-right corner. */
declare class UiCardActionDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<UiCardActionDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<UiCardActionDirective, "[uiCardAction]", never, {}, {}, never, never, true, never>;
}
declare class UiCardContentDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<UiCardContentDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<UiCardContentDirective, "[uiCardContent]", never, {}, {}, never, never, true, never>;
}
declare class UiCardFooterDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<UiCardFooterDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<UiCardFooterDirective, "[uiCardFooter]", never, {}, {}, never, never, true, never>;
}
/** Full-bleed image or video; bleeds into the card's top/bottom padding when first/last. */
declare class UiCardMediaDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<UiCardMediaDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<UiCardMediaDirective, "[uiCardMedia]", never, {}, {}, never, never, true, never>;
}

type UiCardAppearance = 'outline' | 'elevated' | 'filled';
type UiCardPadding = 'none' | 'sm' | 'md' | 'lg';

/**
 * Surface for grouped content. Works as `<ui-card>` or on a semantic host (`article[uiCard]`,
 * `a[uiCard]`, `button[uiCard]`). Links and buttons get the interactive look automatically.
 */
declare class UiCardComponent {
    private readonly _tagName;
    readonly appearance: i0.InputSignal<UiCardAppearance>;
    readonly padding: i0.InputSignal<UiCardPadding>;
    readonly interactive: i0.InputSignalWithTransform<boolean, unknown>;
    protected readonly hostClass: i0.Signal<string>;
    static ɵfac: i0.ɵɵFactoryDeclaration<UiCardComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<UiCardComponent, "ui-card, [uiCard]", never, { "appearance": { "alias": "appearance"; "required": false; "isSignal": true; }; "padding": { "alias": "padding"; "required": false; "isSignal": true; }; "interactive": { "alias": "interactive"; "required": false; "isSignal": true; }; }, {}, never, ["*"], true, never>;
}

declare const cardVariants: (props?: {
    appearance?: "outline" | "elevated" | "filled" | undefined;
    padding?: "none" | "sm" | "md" | "lg" | undefined;
    interactive?: "true" | "false" | undefined;
} | undefined, extraClass?: string) => string;

export { UiCardActionDirective, UiCardComponent, UiCardContentDirective, UiCardDescriptionDirective, UiCardFooterDirective, UiCardHeaderDirective, UiCardMediaDirective, UiCardTitleDirective, cardVariants };
export type { UiCardAppearance, UiCardPadding };
