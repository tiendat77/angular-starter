import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiButtonComponent } from '@libs/ui/button';
import {
  UiCarousel,
  UiCarouselChange,
  UiCarouselDot,
  UiCarouselDotPosition,
  UiCarouselEffect,
  UiCarouselSlide,
} from '@libs/ui/carousel';
import { ApiRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { PlaygroundComponent } from '../../shared/playground/playground.component';

interface Scene {
  title: string;
  sky: [string, string];
  hill: string;
}

const SCENES: Scene[] = [
  { title: 'Morning', sky: ['#fde68a', '#fb923c'], hill: '#3f6212' },
  { title: 'Noon', sky: ['#7dd3fc', '#0ea5e9'], hill: '#15803d' },
  { title: 'Evening', sky: ['#c4b5fd', '#f472b6'], hill: '#1e3a8a' },
  { title: 'Night', sky: ['#312e81', '#0f172a'], hill: '#020617' },
  { title: 'Dawn', sky: ['#fecdd3', '#fda4af'], hill: '#14532d' },
];

/** A landscape as an SVG data URI: the examples need no network and no image files. */
function scene(index: number, width = 800, height = 450): string {
  const { title, sky, hill } = SCENES[index % SCENES.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs>
<rect width="${width}" height="${height}" fill="url(#g)"/>
<circle cx="${width * 0.72}" cy="${height * 0.3}" r="${height * 0.09}" fill="#ffffff" fill-opacity="0.85"/>
<path d="M0 ${height} L0 ${height * 0.72} Q${width * 0.25} ${height * 0.5} ${width * 0.5} ${height * 0.7} T${width} ${height * 0.66} L${width} ${height} Z" fill="${hill}"/>
<text x="${width * 0.06}" y="${height * 0.2}" font-family="sans-serif" font-size="${height * 0.09}" font-weight="700" fill="#ffffff" fill-opacity="0.95">${title}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

@Component({
  selector: 'doc-carousel',
  imports: [
    JsonPipe,
    FormsModule,
    UiButtonComponent,
    UiCarousel,
    UiCarouselSlide,
    UiCarouselDot,
    PlaygroundComponent,
    ApiTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './carousel-doc.component.html',
})
export class CarouselDocComponent {
  readonly scenes = SCENES.map((s, i) => ({
    title: s.title,
    src: scene(i),
    thumb: scene(i, 96, 54),
  }));

  // Image carousel playground
  readonly index = signal(0);
  readonly effect = signal<UiCarouselEffect>('scrollx');
  readonly dotPosition = signal<UiCarouselDotPosition>('bottom');
  readonly dots = signal(true);
  readonly arrows = signal(true);
  readonly loop = signal(true);
  readonly enableSwipe = signal(true);
  readonly speed = signal(500);
  readonly lastBefore = signal<UiCarouselChange | null>(null);
  readonly lastAfter = signal<UiCarouselChange | null>(null);
  readonly carousel = viewChild<UiCarousel>('imageCarousel');

  readonly code = computed(() => {
    const attrs = [
      '[(activeIndex)]="index"',
      this.effect() !== 'scrollx' ? `effect="${this.effect()}"` : '',
      this.dotPosition() !== 'bottom' ? `dotPosition="${this.dotPosition()}"` : '',
      !this.dots() ? '[dots]="false"' : '',
      !this.arrows() ? '[arrows]="false"' : '',
      !this.loop() ? '[loop]="false"' : '',
      !this.enableSwipe() ? '[enableSwipe]="false"' : '',
      this.speed() !== 500 ? `[speed]="${this.speed()}"` : '',
      'ariaLabel="Photos"',
      '(beforeChange)="log($event)"',
      '(afterChange)="log($event)"',
    ].filter(Boolean);
    return `<ui-carousel
  ${attrs.join('\n  ')}
>
  @for (photo of photos; track photo.src) {
    <ui-carousel-slide>
      <img [src]="photo.src" [alt]="photo.title" class="h-full w-full object-cover" />
    </ui-carousel-slide>
  }
</ui-carousel>`;
  });

  // Autoplay card slider
  readonly cardsIndex = signal(0);
  readonly autoPlay = signal(true);
  readonly autoPlaySpeed = signal(3000);
  readonly pauseOnHover = signal(true);
  readonly cards = [
    {
      title: 'Design tokens',
      text: 'One set of semantic colours drives every component in light and dark.',
    },
    {
      title: 'Accessible by default',
      text: 'Roles, labels, focus and keyboard follow the WAI-ARIA patterns.',
    },
    {
      title: 'Signals first',
      text: 'OnPush components built on signals, ready for zoneless apps.',
    },
    {
      title: 'Tiny entrypoints',
      text: 'Import only what you use: each component is its own entrypoint.',
    },
  ];

  readonly cardsCode = computed(() => {
    const attrs = [
      '[(activeIndex)]="index"',
      this.autoPlay() ? 'autoPlay' : '',
      this.autoPlay() && this.autoPlaySpeed() !== 3000
        ? `[autoPlaySpeed]="${this.autoPlaySpeed()}"`
        : '',
      !this.pauseOnHover() ? '[pauseOnHover]="false"' : '',
      'effect="fade"',
      '[arrows]="false"',
      'ariaLabel="Highlights"',
    ].filter(Boolean);
    return `<ui-carousel
  ${attrs.join('\n  ')}
>
  @for (card of cards; track card.title) {
    <ui-carousel-slide>
      <div class="card">…{{ card.title }}…</div>
    </ui-carousel-slide>
  }

  <!-- Drawn inside every dot (a button that goes to its slide) -->
  <ng-template uiCarouselDot let-index let-active="active" let-count="count">
    <span>{{ index + 1 }} / {{ count }}</span>
  </ng-template>
</ui-carousel>`;
  });

  readonly thumbsIndex = signal(0);
  readonly thumbsCode = `<ui-carousel [(activeIndex)]="index" [arrows]="false" ariaLabel="Landscapes">
  @for (photo of photos; track photo.src) {
    <ui-carousel-slide><img [src]="photo.src" [alt]="photo.title" /></ui-carousel-slide>
  }

  <!-- Thumbnails as dots: the active one gets a ring -->
  <ng-template uiCarouselDot let-index>
    <img [src]="photos[index].thumb" alt="" class="h-9 w-16 object-cover" />
  </ng-template>
</ui-carousel>`;

  log(change: UiCarouselChange): void {
    // beforeChange fires first, afterChange when the animation has ended
    this.lastBefore.set(change);
  }

  readonly apiRows: ApiRow[] = [
    {
      name: 'activeIndex',
      type: 'model<number>',
      default: '0',
      description:
        'Slide on show (0-based); two-way, [(activeIndex)]. An index out of range is shown kept in range.',
    },
    {
      name: 'effect',
      type: "'scrollx' | 'fade'",
      default: "'scrollx'",
      description: 'Slides move in, or cross-fade.',
    },
    {
      name: 'autoPlay',
      type: 'boolean',
      default: 'false',
      description:
        'Changes the slide by itself. A stop / start button is added (WCAG 2.2.2); a user who prefers reduced motion starts with it stopped.',
    },
    {
      name: 'autoPlaySpeed',
      type: 'number',
      default: '3000',
      description: 'Milliseconds a slide stays on show.',
    },
    {
      name: 'pauseOnHover',
      type: 'boolean',
      default: 'true',
      description: 'Pauses autoPlay while the pointer is over the carousel or focus is inside it.',
    },
    {
      name: 'dots',
      type: 'boolean',
      default: 'true',
      description: 'Dot indicators (only with two slides or more).',
    },
    {
      name: 'dotPosition',
      type: "'bottom' | 'top' | 'left' | 'right'",
      default: "'bottom'",
      description: 'Where the dots sit. Left and right make the slides move vertically.',
    },
    {
      name: 'arrows',
      type: 'boolean',
      default: 'true',
      description: 'Previous / next buttons (disabled at the ends without a loop).',
    },
    {
      name: 'loop',
      type: 'boolean',
      default: 'true',
      description:
        'The first slide follows the last one. Without it autoPlay stops at the last slide.',
    },
    {
      name: 'enableSwipe',
      type: 'boolean',
      default: 'true',
      description:
        'Drag with touch, mouse or pen. A third of the width, or a quick flick, changes the slide.',
    },
    {
      name: 'speed',
      type: 'number',
      default: '500',
      description: 'Milliseconds a change of slide takes (0 with reduced motion).',
    },
    {
      name: 'ariaLabel',
      type: 'string',
      default: "'Carousel'",
      description: 'Name of the carousel region.',
    },
    {
      name: 'labels',
      type: 'Partial<UiCarouselLabels>',
      description: 'Overrides the texts of the controls and slides, to localise.',
    },
    { name: '(beforeChange)', type: '{ from, to }', description: 'A change of slide starts.' },
    {
      name: '(afterChange)',
      type: '{ from, to }',
      description: 'A change of slide is over (its animation has ended).',
    },
    {
      name: 'next() / prev() / goTo(i)',
      type: 'methods',
      description: 'On the component (template reference or viewChild).',
    },
    {
      name: 'ng-template[uiCarouselDot]',
      type: 'let-index, active, count',
      description: 'Draws the inside of every dot: thumbnails, a counter.',
    },
    {
      name: 'ng-template[uiCarouselPrevIcon / uiCarouselNextIcon]',
      type: 'template',
      description: 'Replaces the icon of an arrow button.',
    },
    {
      name: 'ui-carousel-slide [ariaLabel]',
      type: 'string',
      description: "Name of a slide; by default '2 of 5'.",
    },
  ];

  readonly keyboardRows: ApiRow[] = [
    {
      name: 'Arrow Left / Up',
      type: 'key',
      description: 'Previous slide (also in a vertical carousel).',
    },
    { name: 'Arrow Right / Down', type: 'key', description: 'Next slide.' },
    { name: 'Home / End', type: 'key', description: 'First / last slide.' },
  ];
}
