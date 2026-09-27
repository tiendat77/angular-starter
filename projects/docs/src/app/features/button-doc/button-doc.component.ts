import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiButtonComponent, UiButtonSize, UiButtonVariant } from '@libs/ui/button';
import { PlaygroundComponent } from '../../shared/playground/playground.component';

@Component({
  selector: 'doc-button',
  imports: [FormsModule, UiButtonComponent, PlaygroundComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './button-doc.component.html',
})
export class ButtonDocComponent {
  readonly variant = signal<UiButtonVariant>('primary');
  readonly size = signal<UiButtonSize>('md');
  readonly disabled = signal(false);
  readonly loading = signal(false);
  readonly fullWidth = signal(false);
  readonly label = signal('Click me');

  readonly generatedCode = computed(() => {
    const parts = ['<button uiButton'];
    if (this.variant() !== 'primary') parts.push(`variant="${this.variant()}"`);
    if (this.size() !== 'md') parts.push(`size="${this.size()}"`);
    if (this.loading()) parts.push('loading');
    if (this.disabled()) parts.push('disabled');
    if (this.fullWidth()) parts.push('fullWidth');
    return `${parts.join(' ')}>\n  ${this.label()}\n</button>`;
  });
}
