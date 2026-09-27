import * as _angular_core from '@angular/core';
import { UiColor } from '@libs/ui/core';

type UiBadgeSize = 'sm' | 'md';
type UiBadgePosition = 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start';
/** `circular` insets the badge for round hosts (avatars, icon buttons). */
type UiBadgeOverlap = 'rectangular' | 'circular';

/**
 * Overlays a count or dot on its host (Material `matBadge` style). The badge span is decorative;
 * `uiBadgeDescription` is what assistive technology announces, via `aria-describedby`.
 */
declare class UiBadgeAnchorDirective {
    private readonly _host;
    private readonly _renderer;
    private readonly _describer;
    readonly content: _angular_core.InputSignal<string | number | null>;
    readonly max: _angular_core.InputSignalWithTransform<number, unknown>;
    readonly showZero: _angular_core.InputSignalWithTransform<boolean, unknown>;
    readonly dot: _angular_core.InputSignalWithTransform<boolean, unknown>;
    readonly color: _angular_core.InputSignal<UiColor>;
    readonly size: _angular_core.InputSignal<UiBadgeSize>;
    readonly position: _angular_core.InputSignal<UiBadgePosition>;
    readonly overlap: _angular_core.InputSignal<UiBadgeOverlap>;
    readonly hidden: _angular_core.InputSignalWithTransform<boolean, unknown>;
    readonly description: _angular_core.InputSignal<string>;
    private readonly _text;
    private readonly _visible;
    private readonly _class;
    private readonly _badge;
    private _describedAs;
    constructor();
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiBadgeAnchorDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<UiBadgeAnchorDirective, "[uiBadge]", never, { "content": { "alias": "uiBadge"; "required": false; "isSignal": true; }; "max": { "alias": "uiBadgeMax"; "required": false; "isSignal": true; }; "showZero": { "alias": "uiBadgeShowZero"; "required": false; "isSignal": true; }; "dot": { "alias": "uiBadgeDot"; "required": false; "isSignal": true; }; "color": { "alias": "uiBadgeColor"; "required": false; "isSignal": true; }; "size": { "alias": "uiBadgeSize"; "required": false; "isSignal": true; }; "position": { "alias": "uiBadgePosition"; "required": false; "isSignal": true; }; "overlap": { "alias": "uiBadgeOverlap"; "required": false; "isSignal": true; }; "hidden": { "alias": "uiBadgeHidden"; "required": false; "isSignal": true; }; "description": { "alias": "uiBadgeDescription"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

/** Inline count or dot, e.g. next to a menu label. Hidden when there is nothing to show. */
declare class UiBadgeComponent {
    readonly count: _angular_core.InputSignal<string | number | null>;
    readonly max: _angular_core.InputSignalWithTransform<number, unknown>;
    readonly showZero: _angular_core.InputSignalWithTransform<boolean, unknown>;
    readonly dot: _angular_core.InputSignalWithTransform<boolean, unknown>;
    readonly color: _angular_core.InputSignal<UiColor>;
    readonly size: _angular_core.InputSignal<UiBadgeSize>;
    protected readonly text: _angular_core.Signal<string>;
    protected readonly visible: _angular_core.Signal<boolean>;
    protected readonly hostClass: _angular_core.Signal<string>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiBadgeComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<UiBadgeComponent, "ui-badge", never, { "count": { "alias": "count"; "required": false; "isSignal": true; }; "max": { "alias": "max"; "required": false; "isSignal": true; }; "showZero": { "alias": "showZero"; "required": false; "isSignal": true; }; "dot": { "alias": "dot"; "required": false; "isSignal": true; }; "color": { "alias": "color"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

/**
 * Text shown in a badge. Numbers above `max` become "{max}+"; 0 is hidden unless `showZero`;
 * strings pass through; null, '', negative and non-finite numbers give ''.
 */
declare function formatBadgeCount(count: number | string | null | undefined, max?: number, showZero?: boolean): string;

declare const badgeVariants: (props?: {
    color?: "neutral" | "primary" | "info" | "success" | "warning" | "error" | undefined;
    size?: "sm" | "md" | "dot" | undefined;
} | undefined, extraClass?: string) => string;
declare const badgeOverlayVariants: (props?: {
    position?: "top-end" | "top-start" | "bottom-end" | "bottom-start" | undefined;
    overlap?: "rectangular" | "circular" | undefined;
} | undefined, extraClass?: string) => string;

export { UiBadgeAnchorDirective, UiBadgeComponent, badgeOverlayVariants, badgeVariants, formatBadgeCount };
export type { UiBadgeOverlap, UiBadgePosition, UiBadgeSize };
