import { Directive, inject, TemplateRef } from '@angular/core';
import { UiCarouselDotContext } from './carousel.types';

/**
 * Replaces the look of the dots: the template is drawn inside every dot (a button that keeps going
 * to its slide). Use it for thumbnails or a counter:
 *
 * ```html
 * <ng-template uiCarouselDot let-index let-active="active" let-count="count">
 *   <img [src]="thumbs[index]" alt="" />
 * </ng-template>
 * ```
 */
@Directive({ selector: 'ng-template[uiCarouselDot]' })
export class UiCarouselDot {
  readonly template = inject<TemplateRef<UiCarouselDotContext>>(TemplateRef);

  static ngTemplateContextGuard(
    _directive: UiCarouselDot,
    _context: unknown
  ): _context is UiCarouselDotContext {
    return true;
  }
}

/** Replaces the icon of the previous arrow (the button stays). */
@Directive({ selector: 'ng-template[uiCarouselPrevIcon]' })
export class UiCarouselPrevIcon {
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}

/** Replaces the icon of the next arrow (the button stays). */
@Directive({ selector: 'ng-template[uiCarouselNextIcon]' })
export class UiCarouselNextIcon {
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}
