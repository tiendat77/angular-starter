import { Directive } from '@angular/core';

/** Title/description column with an optional action pinned to the top-right. */
@Directive({ selector: '[uiCardHeader]', host: { class: 'card-header' } })
export class UiCardHeaderDirective {}

@Directive({ selector: '[uiCardTitle]', host: { class: 'card-title' } })
export class UiCardTitleDirective {}

@Directive({ selector: '[uiCardDescription]', host: { class: 'card-description' } })
export class UiCardDescriptionDirective {}

/** Button or menu placed in the header's top-right corner. */
@Directive({ selector: '[uiCardAction]', host: { class: 'card-action' } })
export class UiCardActionDirective {}

@Directive({ selector: '[uiCardContent]', host: { class: 'card-content' } })
export class UiCardContentDirective {}

@Directive({ selector: '[uiCardFooter]', host: { class: 'card-footer' } })
export class UiCardFooterDirective {}

/** Full-bleed image or video; bleeds into the card's top/bottom padding when first/last. */
@Directive({ selector: '[uiCardMedia]', host: { class: 'card-media' } })
export class UiCardMediaDirective {}
