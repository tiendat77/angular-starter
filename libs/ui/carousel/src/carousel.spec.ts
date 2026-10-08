import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UiCarouselSlide } from './carousel-slide.component';
import {
  UiCarouselDot,
  UiCarouselNextIcon,
  UiCarouselPrevIcon,
} from './carousel-templates.directive';
import { UiCarousel } from './carousel.component';
import {
  UiCarouselChange,
  UiCarouselDotPosition,
  UiCarouselEffect,
  UiCarouselLabels,
} from './carousel.types';

@Component({
  imports: [UiCarousel, UiCarouselSlide, UiCarouselDot, UiCarouselPrevIcon, UiCarouselNextIcon],
  template: `
    <ui-carousel
      [(activeIndex)]="index"
      [effect]="effect()"
      [autoPlay]="autoPlay()"
      [autoPlaySpeed]="autoPlaySpeed()"
      [pauseOnHover]="pauseOnHover()"
      [dots]="dots()"
      [dotPosition]="dotPosition()"
      [arrows]="arrows()"
      [loop]="loop()"
      [enableSwipe]="enableSwipe()"
      [speed]="speed()"
      [ariaLabel]="ariaLabel()"
      [labels]="labels()"
      (beforeChange)="before.push($event)"
      (afterChange)="after.push($event)"
    >
      @for (slide of slides(); track slide) {
        <ui-carousel-slide>
          <button
            type="button"
            class="inner"
            (click)="clicks = clicks + 1"
          >
            Slide {{ slide }}
          </button>
        </ui-carousel-slide>
      }
      @if (customDots()) {
        <ng-template
          uiCarouselDot
          let-index
          let-active="active"
          let-count="count"
        >
          <span class="custom-dot">{{ index + 1 }}/{{ count }}{{ active ? '*' : '' }}</span>
        </ng-template>
      }
      @if (customIcons()) {
        <ng-template uiCarouselPrevIcon><b class="prev-icon">P</b></ng-template>
        <ng-template uiCarouselNextIcon><b class="next-icon">N</b></ng-template>
      }
    </ui-carousel>
  `,
})
class Host {
  readonly index = signal(0);
  readonly slides = signal([1, 2, 3, 4]);
  readonly effect = signal<UiCarouselEffect>('scrollx');
  readonly autoPlay = signal(false);
  readonly autoPlaySpeed = signal(3000);
  readonly pauseOnHover = signal(true);
  readonly dots = signal(true);
  readonly dotPosition = signal<UiCarouselDotPosition>('bottom');
  readonly arrows = signal(true);
  readonly loop = signal(true);
  readonly enableSwipe = signal(true);
  readonly speed = signal(500);
  readonly ariaLabel = signal<string | undefined>(undefined);
  readonly labels = signal<Partial<UiCarouselLabels>>({});
  readonly customDots = signal(false);
  readonly customIcons = signal(false);
  readonly before: UiCarouselChange[] = [];
  readonly after: UiCarouselChange[] = [];
  clicks = 0;
}

async function setup(
  configure?: (host: Host) => void,
  slideCount = 4
): Promise<ComponentFixture<Host>> {
  const fixture = TestBed.createComponent(Host);
  fixture.componentInstance.slides.set(Array.from({ length: slideCount }, (_, i) => i + 1));
  configure?.(fixture.componentInstance);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture;
}

const root = (f: ComponentFixture<unknown>): HTMLElement =>
  (f.nativeElement as HTMLElement).querySelector('ui-carousel')!;
const slides = (f: ComponentFixture<unknown>): HTMLElement[] =>
  Array.from(root(f).querySelectorAll<HTMLElement>('ui-carousel-slide'));
const dots = (f: ComponentFixture<unknown>): HTMLElement[] =>
  Array.from(root(f).querySelectorAll<HTMLElement>('.carousel-dot'));
const arrow = (f: ComponentFixture<unknown>, which: 'prev' | 'next'): HTMLButtonElement =>
  root(f).querySelector<HTMLButtonElement>(`.carousel-arrow-${which}`)!;
const viewport = (f: ComponentFixture<unknown>): HTMLElement =>
  root(f).querySelector<HTMLElement>('.carousel-viewport')!;

async function settle(f: ComponentFixture<unknown>): Promise<void> {
  await f.whenStable();
  f.detectChanges();
}

async function click(f: ComponentFixture<unknown>, el: HTMLElement): Promise<void> {
  el.click();
  f.detectChanges();
  await settle(f);
}

function key(f: ComponentFixture<unknown>, name: string, target: HTMLElement = viewport(f)): void {
  target.dispatchEvent(
    new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true })
  );
  f.detectChanges();
}

/** A pointer event: jsdom has no PointerEvent, the carousel reads `pointerId`, `isPrimary`, `timeStamp`. */
function pointer(el: Element, type: string, x: number, time: number, y = 0): void {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y });
  Object.defineProperties(event, {
    pointerId: { value: 1 },
    isPrimary: { value: true },
    timeStamp: { value: time },
  });
  el.dispatchEvent(event);
}

function sizeViewport(f: ComponentFixture<unknown>, width = 300, height = 200): void {
  Object.defineProperty(viewport(f), 'clientWidth', { value: width, configurable: true });
  Object.defineProperty(viewport(f), 'clientHeight', { value: height, configurable: true });
}

describe('UiCarousel', () => {
  describe('ARIA', () => {
    it('is a labelled carousel region', async () => {
      const fixture = await setup();
      expect(root(fixture).getAttribute('role')).toBe('region');
      expect(root(fixture).getAttribute('aria-roledescription')).toBe('carousel');
      expect(root(fixture).getAttribute('aria-label')).toBe('Carousel');
      fixture.componentInstance.ariaLabel.set('Featured products');
      fixture.detectChanges();
      expect(root(fixture).getAttribute('aria-label')).toBe('Featured products');
    });

    it('makes every slide a named group, and hides the ones not on show', async () => {
      const fixture = await setup();
      const all = slides(fixture);
      all.forEach((slide, i) => {
        expect(slide.getAttribute('role')).toBe('group');
        expect(slide.getAttribute('aria-roledescription')).toBe('slide');
        expect(slide.getAttribute('aria-label')).toBe(`${i + 1} of 4`);
      });
      expect(all[0].getAttribute('aria-hidden')).toBeNull();
      expect(all[0].hasAttribute('inert')).toBe(false);
      expect(all[1].getAttribute('aria-hidden')).toBe('true');
      expect(all[1].hasAttribute('inert')).toBe(true);
    });

    it('moves the hiding along with the slide on show', async () => {
      const fixture = await setup();
      await click(fixture, arrow(fixture, 'next'));
      const all = slides(fixture);
      expect(all[0].getAttribute('aria-hidden')).toBe('true');
      expect(all[1].getAttribute('aria-hidden')).toBeNull();
    });

    it('names the controls', async () => {
      const fixture = await setup();
      expect(arrow(fixture, 'prev').getAttribute('aria-label')).toBe('Previous slide');
      expect(arrow(fixture, 'next').getAttribute('aria-label')).toBe('Next slide');
      expect(root(fixture).querySelector('.carousel-dots')!.getAttribute('aria-label')).toBe(
        'Choose a slide'
      );
      expect(dots(fixture)[2].getAttribute('aria-label')).toBe('Go to slide 3');
    });

    it('marks the dot of the slide on show', async () => {
      const fixture = await setup();
      expect(dots(fixture).map((d) => d.getAttribute('aria-current'))).toEqual([
        'true',
        null,
        null,
        null,
      ]);
    });

    it('lets the labels be localised', async () => {
      const fixture = await setup((h) =>
        h.labels.set({
          next: 'Slide sau',
          goTo: (index) => `Đến slide ${index + 1}`,
          slide: (index, count) => `${index + 1} trên ${count}`,
        })
      );
      expect(arrow(fixture, 'next').getAttribute('aria-label')).toBe('Slide sau');
      expect(arrow(fixture, 'prev').getAttribute('aria-label')).toBe('Previous slide');
      expect(dots(fixture)[1].getAttribute('aria-label')).toBe('Đến slide 2');
      expect(slides(fixture)[0].getAttribute('aria-label')).toBe('1 trên 4');
    });
  });

  describe('navigation', () => {
    it('goes to the next and the previous slide', async () => {
      const fixture = await setup();
      await click(fixture, arrow(fixture, 'next'));
      expect(fixture.componentInstance.index()).toBe(1);
      await click(fixture, arrow(fixture, 'next'));
      expect(fixture.componentInstance.index()).toBe(2);
      await click(fixture, arrow(fixture, 'prev'));
      expect(fixture.componentInstance.index()).toBe(1);
    });

    it('goes to the slide of a dot', async () => {
      const fixture = await setup();
      await click(fixture, dots(fixture)[3]);
      expect(fixture.componentInstance.index()).toBe(3);
      expect(dots(fixture)[3].getAttribute('aria-current')).toBe('true');
    });

    it('wraps around with a loop', async () => {
      const fixture = await setup();
      await click(fixture, arrow(fixture, 'prev'));
      expect(fixture.componentInstance.index()).toBe(3);
      await click(fixture, arrow(fixture, 'next'));
      expect(fixture.componentInstance.index()).toBe(0);
    });

    it('stops at the ends without a loop, and disables the arrow there', async () => {
      const fixture = await setup((h) => h.loop.set(false));
      expect(arrow(fixture, 'prev').disabled).toBe(true);
      expect(arrow(fixture, 'next').disabled).toBe(false);
      await click(fixture, dots(fixture)[3]);
      expect(arrow(fixture, 'next').disabled).toBe(true);
      key(fixture, 'ArrowRight');
      expect(fixture.componentInstance.index()).toBe(3);
    });

    it('is two-way bound: the app can move it', async () => {
      const fixture = await setup();
      fixture.componentInstance.index.set(2);
      fixture.detectChanges();
      await settle(fixture);
      expect(slides(fixture)[2].getAttribute('aria-hidden')).toBeNull();
      expect(dots(fixture)[2].getAttribute('aria-current')).toBe('true');
    });

    it('shows an index out of range kept in range, and leaves the binding alone', async () => {
      const fixture = await setup((h) => h.index.set(99));
      expect(slides(fixture)[3].getAttribute('aria-hidden')).toBeNull();
      expect(fixture.componentInstance.index()).toBe(99);
    });

    it('has methods to move it', async () => {
      const fixture = await setup();
      const carousel = fixture.debugElement.children[0].componentInstance as UiCarousel;
      carousel.next();
      await settle(fixture);
      expect(fixture.componentInstance.index()).toBe(1);
      carousel.goTo(3);
      await settle(fixture);
      expect(fixture.componentInstance.index()).toBe(3);
      carousel.prev();
      await settle(fixture);
      expect(fixture.componentInstance.index()).toBe(2);
    });

    it('has no controls for a single slide', async () => {
      const fixture = await setup(undefined, 1);
      expect(arrow(fixture, 'next')).toBeNull();
      expect(dots(fixture).length).toBe(0);
    });

    it('can hide the dots and the arrows', async () => {
      const fixture = await setup((h) => {
        h.dots.set(false);
        h.arrows.set(false);
      });
      expect(dots(fixture).length).toBe(0);
      expect(arrow(fixture, 'next')).toBeNull();
    });
  });

  describe('events', () => {
    it('reports the start of a change, then its end', async () => {
      const fixture = await setup();
      const host = fixture.componentInstance;
      fixture.componentInstance.index.set(2);
      fixture.detectChanges();
      expect(host.before).toEqual([{ from: 0, to: 2 }]);
      await settle(fixture);
      expect(host.after).toEqual([{ from: 0, to: 2 }]);
    });

    it('reports a wrap-around', async () => {
      const fixture = await setup();
      await click(fixture, arrow(fixture, 'prev'));
      expect(fixture.componentInstance.before).toEqual([{ from: 0, to: 3 }]);
      expect(fixture.componentInstance.after).toEqual([{ from: 0, to: 3 }]);
    });

    it('says nothing for the first render', async () => {
      const fixture = await setup();
      expect(fixture.componentInstance.before).toEqual([]);
      expect(fixture.componentInstance.after).toEqual([]);
    });
  });

  describe('keyboard', () => {
    it('changes the slide with the arrow keys, in either direction', async () => {
      const fixture = await setup();
      key(fixture, 'ArrowRight');
      expect(fixture.componentInstance.index()).toBe(1);
      await settle(fixture);
      key(fixture, 'ArrowDown');
      expect(fixture.componentInstance.index()).toBe(2);
      await settle(fixture);
      key(fixture, 'ArrowLeft');
      expect(fixture.componentInstance.index()).toBe(1);
      await settle(fixture);
      key(fixture, 'ArrowUp');
      expect(fixture.componentInstance.index()).toBe(0);
    });

    it('goes to the ends with Home and End', async () => {
      const fixture = await setup();
      key(fixture, 'End');
      expect(fixture.componentInstance.index()).toBe(3);
      await settle(fixture);
      key(fixture, 'Home');
      expect(fixture.componentInstance.index()).toBe(0);
    });

    it('works from a control inside the carousel, and does not scroll the page', async () => {
      const fixture = await setup();
      const event = new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      });
      dots(fixture)[0].dispatchEvent(event);
      fixture.detectChanges();
      expect(fixture.componentInstance.index()).toBe(1);
      expect(event.defaultPrevented).toBe(true);
    });

    it('leaves other keys, shortcuts and text fields alone', async () => {
      const fixture = await setup();
      key(fixture, 'a');
      viewport(fixture).dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', ctrlKey: true, bubbles: true })
      );
      const input = document.createElement('input');
      slides(fixture)[0].appendChild(input);
      key(fixture, 'ArrowRight', input);
      expect(fixture.componentInstance.index()).toBe(0);
    });

    it('can be reached with the keyboard', async () => {
      const fixture = await setup();
      expect(viewport(fixture).getAttribute('tabindex')).toBe('0');
    });
  });

  describe('effect', () => {
    it('lays the slides out for a slide: the one on show at rest, the others on their side', async () => {
      const fixture = await setup();
      const transforms = slides(fixture).map((s) => s.style.transform);
      expect(transforms[0]).toBe('translate3d(0%, 0, 0)');
      expect(transforms[1]).toBe('translate3d(100%, 0, 0)'); // next, after
      expect(transforms[3]).toBe('translate3d(-100%, 0, 0)'); // last, before (loop)
    });

    it('does not wrap the slides without a loop', async () => {
      const fixture = await setup((h) => h.loop.set(false));
      expect(slides(fixture)[3].style.transform).toBe('translate3d(100%, 0, 0)');
    });

    it('moves the slides up and down when the dots are left or right', async () => {
      const fixture = await setup((h) => h.dotPosition.set('right'));
      expect(root(fixture).hasAttribute('data-vertical')).toBe(true);
      expect(slides(fixture)[1].style.transform).toBe('translate3d(0, 100%, 0)');
    });

    it('fades: the slide on show is opaque, the others transparent, none move', async () => {
      const fixture = await setup((h) => h.effect.set('fade'));
      const all = slides(fixture);
      expect(all.map((s) => s.style.opacity)).toEqual(['1', '0', '0', '0']);
      expect(all[1].style.transform).toBe('');
      await click(fixture, arrow(fixture, 'next'));
      expect(slides(fixture).map((s) => s.style.opacity)).toEqual(['0', '1', '0', '0']);
    });

    it('puts the dots where dotPosition says', async () => {
      const fixture = await setup((h) => h.dotPosition.set('top'));
      expect(root(fixture).getAttribute('data-dots')).toBe('top');
    });
  });

  describe('animation', () => {
    let calls: { element: Element; keyframes: Keyframe[]; options: KeyframeAnimationOptions }[];
    const original = (Element.prototype as { animate?: unknown }).animate;

    beforeEach(() => {
      calls = [];
      (Element.prototype as unknown as { animate: unknown }).animate = function (
        this: Element,
        keyframes: Keyframe[],
        options: KeyframeAnimationOptions
      ) {
        calls.push({ element: this, keyframes, options });
        return { finished: Promise.resolve(), cancel: () => undefined };
      };
    });

    afterEach(() => {
      (Element.prototype as unknown as { animate: unknown }).animate = original;
    });

    it('slides only the two slides of a change', async () => {
      const fixture = await setup();
      await click(fixture, arrow(fixture, 'next'));
      expect(calls.length).toBe(2);
      const all = slides(fixture);
      const out = calls.find((c) => c.element === all[0])!;
      const incoming = calls.find((c) => c.element === all[1])!;
      expect(out.keyframes).toEqual([
        { transform: 'translate3d(0px, 0, 0)' },
        { transform: 'translate3d(-100%, 0, 0)' },
      ]);
      expect(incoming.keyframes).toEqual([
        { transform: 'translate3d(calc(100% + 0px), 0, 0)' },
        { transform: 'translate3d(0px, 0, 0)' },
      ]);
      expect(out.options.duration).toBe(500);
    });

    it('slides the other way for the previous slide, also when it wraps', async () => {
      const fixture = await setup();
      await click(fixture, arrow(fixture, 'prev'));
      const incoming = calls.find((c) => c.element === slides(fixture)[3])!;
      expect(incoming.keyframes[0]).toEqual({ transform: 'translate3d(calc(-100% + 0px), 0, 0)' });
    });

    it('goes in the direction of the dot', async () => {
      const fixture = await setup();
      await click(fixture, dots(fixture)[2]);
      const out = calls.find((c) => c.element === slides(fixture)[0])!;
      expect(out.keyframes[1]).toEqual({ transform: 'translate3d(-100%, 0, 0)' });
    });

    it('uses the speed input, and moves up and down in a vertical carousel', async () => {
      const fixture = await setup((h) => {
        h.speed.set(200);
        h.dotPosition.set('left');
      });
      await click(fixture, arrow(fixture, 'next'));
      expect(calls[0].options.duration).toBe(200);
      expect(String(calls[0].keyframes[1]['transform'])).toBe('translate3d(0, -100%, 0)');
    });

    it('cross-fades with the fade effect', async () => {
      const fixture = await setup((h) => h.effect.set('fade'));
      await click(fixture, arrow(fixture, 'next'));
      const out = calls.find((c) => c.element === slides(fixture)[0])!;
      const incoming = calls.find((c) => c.element === slides(fixture)[1])!;
      expect(out.keyframes).toEqual([{ opacity: 1 }, { opacity: 0 }]);
      expect(incoming.keyframes).toEqual([{ opacity: 0 }, { opacity: 1 }]);
    });

    it('reports the end of a change only when the animation ends', async () => {
      const finishers: (() => void)[] = [];
      (Element.prototype as unknown as { animate: unknown }).animate = function () {
        return {
          finished: new Promise<void>((resolve) => finishers.push(resolve)),
          cancel: () => undefined,
        };
      };
      const fixture = await setup();
      arrow(fixture, 'next').click();
      fixture.detectChanges();
      await Promise.resolve();
      expect(fixture.componentInstance.before.length).toBe(1);
      expect(fixture.componentInstance.after.length).toBe(0);
      finishers.forEach((finish) => finish());
      await settle(fixture);
      await Promise.resolve();
      expect(fixture.componentInstance.after).toEqual([{ from: 0, to: 1 }]);
    });

    it('ignores a click on an arrow while a change is running', async () => {
      (Element.prototype as unknown as { animate: unknown }).animate = function () {
        return { finished: new Promise<void>(() => undefined), cancel: () => undefined };
      };
      const fixture = await setup();
      arrow(fixture, 'next').click();
      fixture.detectChanges();
      arrow(fixture, 'next').click();
      fixture.detectChanges();
      expect(fixture.componentInstance.index()).toBe(1);
    });
  });

  describe('autoplay', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    const tick = async (f: ComponentFixture<unknown>, ms: number): Promise<void> => {
      await vi.advanceTimersByTimeAsync(ms);
      f.detectChanges();
    };

    it('does nothing by default', async () => {
      const fixture = await setup();
      await tick(fixture, 10000);
      expect(fixture.componentInstance.index()).toBe(0);
      expect(root(fixture).querySelector('.carousel-rotate')).toBeNull();
    });

    it('changes the slide every autoPlaySpeed, and wraps', async () => {
      const fixture = await setup((h) => h.autoPlay.set(true));
      await tick(fixture, 2999);
      expect(fixture.componentInstance.index()).toBe(0);
      await tick(fixture, 1);
      expect(fixture.componentInstance.index()).toBe(1);
      await tick(fixture, 3000);
      await tick(fixture, 3000);
      await tick(fixture, 3000);
      expect(fixture.componentInstance.index()).toBe(0);
    });

    it('uses the speed it is given', async () => {
      const fixture = await setup((h) => {
        h.autoPlay.set(true);
        h.autoPlaySpeed.set(1000);
      });
      await tick(fixture, 1000);
      expect(fixture.componentInstance.index()).toBe(1);
    });

    it('restarts its timer after a manual change', async () => {
      const fixture = await setup((h) => h.autoPlay.set(true));
      await tick(fixture, 2500);
      await click(fixture, arrow(fixture, 'next'));
      await tick(fixture, 2500);
      expect(fixture.componentInstance.index()).toBe(1);
      await tick(fixture, 500);
      expect(fixture.componentInstance.index()).toBe(2);
    });

    it('pauses while the pointer is over it', async () => {
      const fixture = await setup((h) => h.autoPlay.set(true));
      root(fixture).dispatchEvent(new MouseEvent('mouseenter'));
      fixture.detectChanges();
      await tick(fixture, 10000);
      expect(fixture.componentInstance.index()).toBe(0);
      root(fixture).dispatchEvent(new MouseEvent('mouseleave'));
      fixture.detectChanges();
      await tick(fixture, 3000);
      expect(fixture.componentInstance.index()).toBe(1);
    });

    it('pauses while focus is inside', async () => {
      const fixture = await setup((h) => h.autoPlay.set(true));
      root(fixture).dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      fixture.detectChanges();
      await tick(fixture, 10000);
      expect(fixture.componentInstance.index()).toBe(0);
      root(fixture).dispatchEvent(
        new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body })
      );
      fixture.detectChanges();
      await tick(fixture, 3000);
      expect(fixture.componentInstance.index()).toBe(1);
    });

    it('keeps going over a hover when pauseOnHover is off', async () => {
      const fixture = await setup((h) => {
        h.autoPlay.set(true);
        h.pauseOnHover.set(false);
      });
      root(fixture).dispatchEvent(new MouseEvent('mouseenter'));
      fixture.detectChanges();
      await tick(fixture, 3000);
      expect(fixture.componentInstance.index()).toBe(1);
    });

    it('has a button to stop and start it, first in the reading order', async () => {
      const fixture = await setup((h) => h.autoPlay.set(true));
      const button = root(fixture).querySelector<HTMLButtonElement>('.carousel-rotate')!;
      expect(root(fixture).firstElementChild).toBe(button);
      expect(button.getAttribute('aria-label')).toBe('Stop automatic slide show');
      expect(viewport(fixture).getAttribute('aria-live')).toBe('off');

      await click(fixture, button);
      expect(button.getAttribute('aria-label')).toBe('Start automatic slide show');
      expect(viewport(fixture).getAttribute('aria-live')).toBe('polite');
      await tick(fixture, 10000);
      expect(fixture.componentInstance.index()).toBe(0);

      await click(fixture, button);
      await tick(fixture, 3000);
      expect(fixture.componentInstance.index()).toBe(1);
    });

    it('stops at the last slide without a loop', async () => {
      const fixture = await setup((h) => {
        h.autoPlay.set(true);
        h.loop.set(false);
      });
      for (let i = 0; i < 6; i++) {
        await tick(fixture, 3000);
      }
      expect(fixture.componentInstance.index()).toBe(3);
    });

    it('starts stopped for a user who prefers reduced motion', async () => {
      const original = window.matchMedia;
      window.matchMedia = ((query: string) => ({
        matches: query.includes('reduce'),
        media: query,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      })) as unknown as typeof window.matchMedia;
      try {
        const fixture = await setup((h) => h.autoPlay.set(true));
        fixture.detectChanges();
        await tick(fixture, 10000);
        expect(fixture.componentInstance.index()).toBe(0);
        expect(root(fixture).querySelector('.carousel-rotate')!.getAttribute('aria-label')).toBe(
          'Start automatic slide show'
        );
      } finally {
        window.matchMedia = original;
      }
    });
  });

  describe('swipe', () => {
    it('follows the pointer, and shows the slide that comes', async () => {
      const fixture = await setup();
      sizeViewport(fixture);
      pointer(viewport(fixture), 'pointerdown', 200, 0);
      pointer(viewport(fixture), 'pointermove', 150, 100);
      fixture.detectChanges();
      expect(root(fixture).hasAttribute('data-dragging')).toBe(true);
      expect(slides(fixture)[0].style.transform).toContain('-50px');
      expect(slides(fixture)[1].style.transform).toContain('calc(100% + -50px)');
    });

    it('changes the slide past a third of the width (to the next one when dragged left)', async () => {
      const fixture = await setup();
      sizeViewport(fixture);
      pointer(viewport(fixture), 'pointerdown', 250, 0);
      pointer(viewport(fixture), 'pointermove', 100, 300);
      pointer(viewport(fixture), 'pointerup', 100, 301);
      fixture.detectChanges();
      await settle(fixture);
      expect(fixture.componentInstance.index()).toBe(1);
      expect(root(fixture).hasAttribute('data-dragging')).toBe(false);
    });

    it('goes to the previous slide when dragged right', async () => {
      const fixture = await setup((h) => h.index.set(2));
      sizeViewport(fixture);
      pointer(viewport(fixture), 'pointerdown', 50, 0);
      pointer(viewport(fixture), 'pointermove', 200, 300);
      pointer(viewport(fixture), 'pointerup', 200, 301);
      fixture.detectChanges();
      await settle(fixture);
      expect(fixture.componentInstance.index()).toBe(1);
    });

    it('stays when the drag was short and slow, and lays the slides back', async () => {
      const fixture = await setup();
      sizeViewport(fixture);
      pointer(viewport(fixture), 'pointerdown', 200, 0);
      pointer(viewport(fixture), 'pointermove', 160, 1000);
      pointer(viewport(fixture), 'pointerup', 160, 2000);
      fixture.detectChanges();
      await settle(fixture);
      expect(fixture.componentInstance.index()).toBe(0);
      expect(slides(fixture)[0].style.transform).toBe('translate3d(0%, 0, 0)');
    });

    it('changes the slide on a quick flick', async () => {
      const fixture = await setup();
      sizeViewport(fixture);
      pointer(viewport(fixture), 'pointerdown', 200, 0);
      pointer(viewport(fixture), 'pointermove', 150, 40);
      pointer(viewport(fixture), 'pointerup', 150, 41);
      fixture.detectChanges();
      await settle(fixture);
      expect(fixture.componentInstance.index()).toBe(1);
    });

    it('does not count a small movement as a drag', async () => {
      const fixture = await setup();
      sizeViewport(fixture);
      pointer(viewport(fixture), 'pointerdown', 200, 0);
      pointer(viewport(fixture), 'pointermove', 197, 10);
      pointer(viewport(fixture), 'pointerup', 197, 20);
      fixture.detectChanges();
      expect(root(fixture).hasAttribute('data-dragging')).toBe(false);
      expect(fixture.componentInstance.index()).toBe(0);
    });

    it('does not follow a drag past the first slide without a loop', async () => {
      const fixture = await setup((h) => h.loop.set(false));
      sizeViewport(fixture);
      pointer(viewport(fixture), 'pointerdown', 50, 0);
      pointer(viewport(fixture), 'pointermove', 250, 500);
      pointer(viewport(fixture), 'pointerup', 250, 600);
      fixture.detectChanges();
      await settle(fixture);
      expect(fixture.componentInstance.index()).toBe(0);
    });

    it('does nothing when swipe is off', async () => {
      const fixture = await setup((h) => h.enableSwipe.set(false));
      sizeViewport(fixture);
      pointer(viewport(fixture), 'pointerdown', 250, 0);
      pointer(viewport(fixture), 'pointermove', 50, 300);
      pointer(viewport(fixture), 'pointerup', 50, 301);
      expect(fixture.componentInstance.index()).toBe(0);
      expect(root(fixture).hasAttribute('data-swipe')).toBe(false);
    });

    it('swipes up and down in a vertical carousel', async () => {
      const fixture = await setup((h) => h.dotPosition.set('left'));
      sizeViewport(fixture);
      pointer(viewport(fixture), 'pointerdown', 100, 0, 180);
      pointer(viewport(fixture), 'pointermove', 100, 300, 20);
      pointer(viewport(fixture), 'pointerup', 100, 301, 20);
      fixture.detectChanges();
      await settle(fixture);
      expect(fixture.componentInstance.index()).toBe(1);
    });

    it('fades by swipe too, without moving the slides', async () => {
      const fixture = await setup((h) => h.effect.set('fade'));
      sizeViewport(fixture);
      pointer(viewport(fixture), 'pointerdown', 250, 0);
      pointer(viewport(fixture), 'pointermove', 100, 300);
      expect(slides(fixture)[0].style.transform).toBe('');
      pointer(viewport(fixture), 'pointerup', 100, 301);
      fixture.detectChanges();
      await settle(fixture);
      expect(fixture.componentInstance.index()).toBe(1);
    });

    it('swallows the click that ends a drag, but not a plain click', async () => {
      const fixture = await setup();
      sizeViewport(fixture);
      const inner = slides(fixture)[0].querySelector<HTMLButtonElement>('.inner')!;
      inner.click();
      expect(fixture.componentInstance.clicks).toBe(1);

      pointer(viewport(fixture), 'pointerdown', 250, 0);
      pointer(viewport(fixture), 'pointermove', 40, 300);
      pointer(viewport(fixture), 'pointerup', 40, 301);
      inner.click();
      expect(fixture.componentInstance.clicks).toBe(1);

      await new Promise((resolve) => setTimeout(resolve));
      inner.click();
      expect(fixture.componentInstance.clicks).toBe(2);
    });
  });

  describe('templates', () => {
    it('draws the dots from a template, with the index, the state and the count', async () => {
      const fixture = await setup((h) => h.customDots.set(true));
      const texts = dots(fixture).map((d) => d.querySelector('.custom-dot')!.textContent);
      expect(texts).toEqual(['1/4*', '2/4', '3/4', '4/4']);
      expect(root(fixture).querySelector('.carousel-dots-custom')).not.toBeNull();
      await click(fixture, dots(fixture)[1]);
      expect(fixture.componentInstance.index()).toBe(1);
    });

    it('draws the arrow icons from templates', async () => {
      const fixture = await setup((h) => h.customIcons.set(true));
      expect(arrow(fixture, 'prev').querySelector('.prev-icon')).not.toBeNull();
      expect(arrow(fixture, 'next').querySelector('.next-icon')).not.toBeNull();
      expect(arrow(fixture, 'next').querySelector('svg')).toBeNull();
    });
  });

  describe('slides', () => {
    it('follows slides that come and go', async () => {
      const fixture = await setup();
      fixture.componentInstance.slides.set([1, 2, 3, 4, 5, 6]);
      fixture.detectChanges();
      await settle(fixture);
      expect(dots(fixture).length).toBe(6);
      fixture.componentInstance.index.set(5);
      fixture.detectChanges();
      fixture.componentInstance.slides.set([1, 2]);
      fixture.detectChanges();
      await settle(fixture);
      expect(slides(fixture)[1].getAttribute('aria-hidden')).toBeNull();
    });
  });
});
