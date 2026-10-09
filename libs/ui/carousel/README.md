# Carousel

A slide show: put `ui-carousel-slide` elements inside `ui-carousel`. Change slides with the arrows, the dots, the arrow keys or a swipe; `activeIndex` is two-way bindable. Slides hold anything: images, cards, your own templates. It follows the WAI-ARIA carousel pattern.

```ts
import {
  UiCarousel,
  UiCarouselDot,
  UiCarouselNextIcon,
  UiCarouselPrevIcon,
  UiCarouselSlide,
} from '@libs/ui/carousel';
```

## Usage

```html
<ui-carousel ariaLabel="Photos" [(activeIndex)]="index" (afterChange)="onChange($event)">
  @for (photo of photos; track photo.src) {
    <ui-carousel-slide>
      <img [src]="photo.src" [alt]="photo.title" class="block w-full object-cover" />
    </ui-carousel-slide>
  }
</ui-carousel>

<!-- Automatic slide show, cross-fading, with a counter as the dots -->
<ui-carousel effect="fade" autoPlay [autoPlaySpeed]="4000" [arrows]="false" ariaLabel="Highlights">
  <ui-carousel-slide>…</ui-carousel-slide>
  <ui-carousel-slide>…</ui-carousel-slide>

  <ng-template let-index let-active="active" let-count="count" uiCarouselDot>
    {{ index + 1 }} / {{ count }}
  </ng-template>
</ui-carousel>

<!-- Thumbnails as dots, your own arrow icons -->
<ui-carousel>
  …
  <ng-template let-index uiCarouselDot><img [src]="photos[index].thumb" alt="" /></ng-template>
  <ng-template uiCarouselPrevIcon>‹</ng-template>
  <ng-template uiCarouselNextIcon>›</ng-template>
</ui-carousel>
```

Move it from code: `#c="uiCarousel"` then `c.next()`, `c.prev()`, `c.goTo(2)`.

The slides stack in one grid cell, so the carousel is as tall as its tallest slide and stays responsive. A change animates only the two slides involved (it also loops smoothly with two slides). Dots on the `left` or `right` make the slides move vertically.

**Swipe:** drag with touch, mouse or pen; the slide follows the pointer, and a third of the width or a quick flick changes the slide. The click that ends a drag does not reach links inside the slide.

**Accessibility:** a labelled `region` of slides that name themselves ("2 of 5"); slides not on show are `aria-hidden` and `inert`. With `autoPlay` a stop / start button is added (first in reading order), `aria-live` is `off` while it rotates, and the slide show pauses on hover, on focus inside, and while dragging. For users who prefer reduced motion there is no animation and the slide show starts stopped. Keyboard: Arrow Left / Up previous, Arrow Right / Down next, Home / End first / last.

## API

### `ui-carousel`

| Input           | Type                                     | Default      | Description                                                                                                                      |
| --------------- | ---------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `activeIndex`   | `number` (`model`)                       | `0`          | The slide on show, 0-based. Two-way: `[(activeIndex)]`. An index out of range is shown kept in range.                            |
| `effect`        | `'scrollx' \| 'fade'`                    | `'scrollx'`  | Slides move, or cross-fade.                                                                                                      |
| `autoPlay`      | `boolean`                                | `false`      | Changes the slide by itself. Stops at the last slide when `loop` is off.                                                         |
| `autoPlaySpeed` | `number`                                 | `3000`       | Milliseconds a slide stays on show.                                                                                              |
| `pauseOnHover`  | `boolean`                                | `true`       | Pauses `autoPlay` while the pointer is over the carousel or focus is inside it.                                                  |
| `dots`          | `boolean`                                | `true`       | Dot indicators (with two slides or more).                                                                                        |
| `dotPosition`   | `'bottom' \| 'top' \| 'left' \| 'right'` | `'bottom'`   | Where the dots sit; `left` / `right` make the slides move vertically.                                                            |
| `arrows`        | `boolean`                                | `true`       | Previous / next buttons (disabled at the ends without a loop).                                                                   |
| `loop`          | `boolean`                                | `true`       | The first slide follows the last (and the reverse).                                                                              |
| `enableSwipe`   | `boolean`                                | `true`       | Drag to change the slide.                                                                                                        |
| `speed`         | `number`                                 | `500`        | Milliseconds a change takes.                                                                                                     |
| `ariaLabel`     | `string`                                 | `'Carousel'` | Name of the carousel region.                                                                                                     |
| `labels`        | `Partial<UiCarouselLabels>`              | English      | Names of the controls and slides (`previous`, `next`, `play`, `pause`, `dots`, `slide(i, n)`, `goTo(i, n)`). Use it to localise. |

| Output         | Type           | Description                                          |
| -------------- | -------------- | ---------------------------------------------------- |
| `beforeChange` | `{ from, to }` | A change of slide starts.                            |
| `afterChange`  | `{ from, to }` | A change of slide is over (its animation has ended). |

Methods: `next()`, `prev()`, `goTo(index)`.

### `ui-carousel-slide`

| Input       | Type     | Default    | Description        |
| ----------- | -------- | ---------- | ------------------ |
| `ariaLabel` | `string` | `"2 of 5"` | Name of the slide. |

### Templates

| Directive                         | Context / use                                                                             |
| --------------------------------- | ----------------------------------------------------------------------------------------- |
| `ng-template[uiCarouselDot]`      | Drawn inside every dot (a button that goes to its slide): `let-index`, `active`, `count`. |
| `ng-template[uiCarouselPrevIcon]` | Replaces the icon of the previous arrow.                                                  |
| `ng-template[uiCarouselNextIcon]` | Replaces the icon of the next arrow.                                                      |
