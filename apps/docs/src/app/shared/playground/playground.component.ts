import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CodeBlockComponent } from '../code-block/code-block.component';
import { CodeLanguage } from '../code-block/highlight';

@Component({
  selector: 'doc-playground',
  imports: [CodeBlockComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './playground.component.html',
})
export class PlaygroundComponent {
  readonly title = input<string>('');
  readonly description = input<string>('');
  readonly code = input<string>('');
  readonly codeLanguage = input<CodeLanguage>('html');
}
