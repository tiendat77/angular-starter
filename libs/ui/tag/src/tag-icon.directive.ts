import { Directive } from '@angular/core';

/** Leading icon or avatar of a `ui-tag`, sized to the tag's text. */
@Directive({ selector: '[uiTagIcon]', host: { class: 'tag-icon' } })
export class UiTagIconDirective {}
