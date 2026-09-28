import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { CodeLanguage, highlightCode } from './highlight';

@Component({
  selector: 'doc-code-block',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './code-block.component.html',
})
export class CodeBlockComponent {
  readonly code = input<string>('');
  readonly language = input<CodeLanguage>('html');
  readonly copied = signal(false);

  readonly highlightedCode = computed(() => highlightCode(this.code(), this.language()));

  copyCode(): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(this.code());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    }
  }
}
