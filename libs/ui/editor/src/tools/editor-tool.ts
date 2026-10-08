import { computed, Directive, inject } from '@angular/core';
import { Editor } from '@tiptap/core';
import { UiEditorContext } from '../editor.context';
import { UiEditorLabels } from '../editor.types';

/** What every toolbar tool shares: its id, its accessible name and its enabled state. */
export abstract class UiEditorTool {
  protected readonly context = inject(UiEditorContext);

  /** Id used in the `toolbar` / `bubbleMenu` config; also `data-tool` on the button. */
  abstract readonly tool: string;
  protected abstract readonly labelKey: keyof UiEditorLabels;

  protected readonly label = computed(() => this.context.$labels()[this.labelKey]);

  /** The editor exists whenever a tool is rendered. */
  protected get editor(): Editor {
    return this.context.editor()!;
  }

  /** Whether the tool can act on the current selection (override); read inside `isDisabled`. */
  protected can(): boolean {
    return true;
  }

  protected readonly isDisabled = computed(() => {
    this.context.version();
    return this.context.$disabled() || !this.can();
  });
}

/**
 * A tool that is a plain button: the component's host *is* the `<button>` (its selector is
 * `button[uiEditor…]`, and Angular creates the element a selector names), so each tool's template
 * is only its icon.
 *
 * Buttons never take the mouse focus (`mousedown` is cancelled) so the editor keeps its selection.
 * `tabindex` is managed by the toolbar (roving tabindex), not here.
 */
@Directive({
  host: {
    type: 'button',
    class: 'editor-button',
    tabindex: '-1',
    '[attr.data-tool]': 'tool',
    '[attr.aria-label]': 'label()',
    '[attr.title]': 'label()',
    '[attr.aria-pressed]': 'pressed()',
    '[attr.disabled]': 'isDisabled() ? "" : null',
    '(mousedown)': '$event.preventDefault()',
    '(click)': 'run()',
  },
})
export abstract class UiEditorToolButton extends UiEditorTool {
  /** Runs the tool's command. */
  protected abstract run(): void;

  /** Toggle tools return their state, shown as `aria-pressed`; plain buttons return `null`. */
  protected isActive(): boolean | null {
    return null;
  }

  protected readonly pressed = computed(() => {
    this.context.version();
    const active = this.isActive();
    return active === null ? null : active ? 'true' : 'false';
  });
}
