import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiSize } from '@libs/ui/core';
import { UiRadioComponent, UiRadioGroupComponent } from '@libs/ui/radio';
import { PlaygroundComponent } from '../../shared/playground/playground.component';

@Component({
  selector: 'doc-radio',
  imports: [FormsModule, UiRadioGroupComponent, UiRadioComponent, PlaygroundComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './radio-doc.component.html',
})
export class RadioDocComponent {
  readonly size = signal<UiSize>('md');
  readonly disabled = signal(false);
  readonly selected = signal('pro');

  readonly generatedCode = computed(() => {
    return `<ui-radio-group [(value)]="plan" size="${this.size()}"${this.disabled() ? ' disabled' : ''}>\n  <ui-radio value="starter" label="Starter Plan (Free)" />\n  <ui-radio value="pro" label="Pro Plan ($19/mo)" />\n  <ui-radio value="enterprise" label="Enterprise Plan (Custom)" />\n</ui-radio-group>`;
  });
}
