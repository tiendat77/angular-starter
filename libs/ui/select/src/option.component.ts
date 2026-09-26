import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';

function isMeaningfulNode(node: Node): boolean {
  return (
    node.nodeType === Node.ELEMENT_NODE ||
    (node.nodeType === Node.TEXT_NODE && !!node.textContent?.trim())
  );
}

/**
 * Declares one option of a `ui-select`. It renders nothing itself: the select reads the
 * declaration and renders the row inside its listbox (aria's `ngOption` must live there).
 * Projected content becomes the row's content; without content the label is shown.
 */
@Component({
  selector: 'ui-option',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-template #content><ng-content /></ng-template>',
})
export class UiOptionComponent<T = unknown> {
  readonly value = input.required<T>();
  readonly label = input.required<string>();
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly content = viewChild.required<TemplateRef<unknown>>('content');

  /** Whether the consumer projected any content (otherwise the select renders the label). */
  readonly hasContent = signal(false);

  constructor() {
    afterNextRender(() => {
      // Render the captured content once, off-DOM, just to see whether anything was projected
      const view = this.content().createEmbeddedView(null);
      this.hasContent.set(view.rootNodes.some(isMeaningfulNode));
      view.destroy();
    });
  }
}
