import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiButtonComponent } from '@libs/ui/button';
import {
  UiCardActionDirective,
  UiCardAppearance,
  UiCardComponent,
  UiCardContentDirective,
  UiCardDescriptionDirective,
  UiCardFooterDirective,
  UiCardHeaderDirective,
  UiCardMediaDirective,
  UiCardPadding,
  UiCardTitleDirective,
} from '@libs/ui/card';
import { ApiRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { PlaygroundComponent } from '../../shared/playground/playground.component';

/** Inline cover image, so the docs don't depend on an external image host. */
const SAMPLE_COVER =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 160">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#0ea5e9"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs>' +
      '<rect width="400" height="160" fill="url(#g)"/></svg>'
  );

@Component({
  selector: 'doc-card',
  imports: [
    FormsModule,
    UiButtonComponent,
    UiCardComponent,
    UiCardHeaderDirective,
    UiCardTitleDirective,
    UiCardDescriptionDirective,
    UiCardActionDirective,
    UiCardContentDirective,
    UiCardFooterDirective,
    UiCardMediaDirective,
    PlaygroundComponent,
    ApiTableComponent,
    CodeBlockComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card-doc.component.html',
})
export class CardDocComponent {
  readonly cover = SAMPLE_COVER;
  readonly appearances: UiCardAppearance[] = ['outline', 'elevated', 'filled'];
  readonly paddings: UiCardPadding[] = ['none', 'sm', 'md', 'lg'];
  readonly projects = [
    { name: 'Alpha', description: 'Design system' },
    { name: 'Beta', description: 'Mobile app' },
    { name: 'Gamma', description: 'Data pipeline' },
  ];

  readonly appearance = signal<UiCardAppearance>('outline');
  readonly padding = signal<UiCardPadding>('md');
  readonly interactive = signal(false);
  readonly media = signal(true);

  readonly generatedCode = computed(() => {
    const attrs: string[] = [];
    if (this.appearance() !== 'outline') attrs.push(`appearance="${this.appearance()}"`);
    if (this.padding() !== 'md') attrs.push(`padding="${this.padding()}"`);
    if (this.interactive()) attrs.push('interactive');
    const lines = [`<ui-card${attrs.length ? ' ' + attrs.join(' ') : ''}>`];
    if (this.media()) lines.push('  <img uiCardMedia src="cover.jpg" alt="" />');
    lines.push(
      '  <div uiCardHeader>',
      '    <h3 uiCardTitle>Project Alpha</h3>',
      '    <p uiCardDescription>Updated 2 hours ago</p>',
      '    <button uiButton variant="ghost" size="icon" uiCardAction aria-label="More">⋯</button>',
      '  </div>',
      '  <div uiCardContent>…</div>',
      '  <div uiCardFooter>',
      '    <button uiButton variant="outline">Cancel</button>',
      '    <button uiButton>Open</button>',
      '  </div>',
      '</ui-card>'
    );
    return lines.join('\n');
  });

  readonly linkCode = `<a uiCard href="/projects/alpha">
  <div uiCardHeader>
    <h3 uiCardTitle>Alpha</h3>
    <p uiCardDescription>Design system</p>
  </div>
</a>`;

  readonly apiRows: ApiRow[] = [
    {
      name: 'appearance',
      type: "'outline' | 'elevated' | 'filled'",
      default: "'outline'",
      description: 'Border / border + shadow / muted surface without border.',
    },
    {
      name: 'padding',
      type: "'none' | 'sm' | 'md' | 'lg'",
      default: "'md'",
      description: 'Spacing used by the card and every part (0 / 12 / 24 / 32px).',
    },
    {
      name: 'interactive',
      type: 'boolean',
      default: 'false',
      description: 'Hover and focus styles. Automatic on a[uiCard] and button[uiCard].',
    },
    {
      name: '[uiCardHeader] [uiCardTitle] [uiCardDescription] [uiCardAction]',
      type: 'directive',
      description: 'Header with title, description and a top-right action.',
    },
    {
      name: '[uiCardContent] [uiCardFooter] [uiCardMedia]',
      type: 'directive',
      description: 'Body, right-aligned action row, and full-bleed media.',
    },
  ];
}
