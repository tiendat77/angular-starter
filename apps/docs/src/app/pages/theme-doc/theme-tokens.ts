/**
 * What the Theme page lists. Only NAMES live here; every value shown on the page is read from the
 * browser's computed style, so it always matches the CSS.
 *
 * The class names are written out in full on purpose: Tailwind only emits a utility if it finds the
 * complete class name in a scanned source file, so `'bg-' + name` would render empty swatches.
 */

export interface Swatch {
  /** The CSS variable behind the utility, e.g. `--color-red-1`. */
  readonly token: string;
  /** The utility that paints it, e.g. `bg-red-1`. */
  readonly cls: string;
}

export interface SwatchGroup {
  readonly title: string;
  readonly note?: string;
  readonly swatches: readonly Swatch[];
  /** Draw a checkerboard behind translucent colors. */
  readonly checker?: boolean;
}

const s = (token: string, cls: string): Swatch => ({ token, cls });

/** Semantic tokens defined by `@libs/ui` (neutral defaults, re-branded per app, flip in dark mode). */
export const SEMANTIC_COLORS: readonly SwatchGroup[] = [
  {
    title: 'Surfaces & text',
    swatches: [
      s('--color-background', 'bg-background'),
      s('--color-foreground', 'bg-foreground'),
      s('--color-muted', 'bg-muted'),
      s('--color-muted-foreground', 'bg-muted-foreground'),
      s('--color-border', 'bg-border'),
      s('--color-input', 'bg-input'),
    ],
  },
  {
    title: 'Actions',
    swatches: [
      s('--color-primary', 'bg-primary'),
      s('--color-primary-content', 'bg-primary-content'),
      s('--color-secondary', 'bg-secondary'),
      s('--color-secondary-content', 'bg-secondary-content'),
    ],
  },
  {
    title: 'Status',
    swatches: [
      s('--color-info', 'bg-info'),
      s('--color-info-content', 'bg-info-content'),
      s('--color-success', 'bg-success'),
      s('--color-success-content', 'bg-success-content'),
      s('--color-warning', 'bg-warning'),
      s('--color-warning-content', 'bg-warning-content'),
      s('--color-error', 'bg-error'),
      s('--color-error-content', 'bg-error-content'),
    ],
  },
];

/** Brand scales from `@libs/theme` (50 to 950). */
export const BRAND_SCALES: readonly SwatchGroup[] = [
  {
    title: 'Primary',
    swatches: [
      s('--color-primary-50', 'bg-primary-50'),
      s('--color-primary-100', 'bg-primary-100'),
      s('--color-primary-200', 'bg-primary-200'),
      s('--color-primary-300', 'bg-primary-300'),
      s('--color-primary-400', 'bg-primary-400'),
      s('--color-primary-500', 'bg-primary-500'),
      s('--color-primary-600', 'bg-primary-600'),
      s('--color-primary-700', 'bg-primary-700'),
      s('--color-primary-800', 'bg-primary-800'),
      s('--color-primary-900', 'bg-primary-900'),
      s('--color-primary-950', 'bg-primary-950'),
    ],
  },
  {
    title: 'Secondary',
    swatches: [
      s('--color-secondary-50', 'bg-secondary-50'),
      s('--color-secondary-100', 'bg-secondary-100'),
      s('--color-secondary-200', 'bg-secondary-200'),
      s('--color-secondary-300', 'bg-secondary-300'),
      s('--color-secondary-400', 'bg-secondary-400'),
      s('--color-secondary-500', 'bg-secondary-500'),
      s('--color-secondary-600', 'bg-secondary-600'),
      s('--color-secondary-700', 'bg-secondary-700'),
      s('--color-secondary-800', 'bg-secondary-800'),
      s('--color-secondary-900', 'bg-secondary-900'),
      s('--color-secondary-950', 'bg-secondary-950'),
    ],
  },
];

/** Style-guide palette from `@libs/theme`: numbered 1 (lightest) upwards, NOT the Tailwind 50-950 scale. */
export const STYLE_GUIDE_COLORS: readonly SwatchGroup[] = [
  {
    title: 'Red',
    swatches: [
      s('--color-red-1', 'bg-red-1'),
      s('--color-red-2', 'bg-red-2'),
      s('--color-red-3', 'bg-red-3'),
      s('--color-red-4', 'bg-red-4'),
      s('--color-red-5', 'bg-red-5'),
    ],
  },
  {
    title: 'Yellow',
    swatches: [
      s('--color-yellow-1', 'bg-yellow-1'),
      s('--color-yellow-2', 'bg-yellow-2'),
      s('--color-yellow-3', 'bg-yellow-3'),
      s('--color-yellow-4', 'bg-yellow-4'),
      s('--color-yellow-5', 'bg-yellow-5'),
    ],
  },
  {
    title: 'Cyan',
    swatches: [
      s('--color-cyan-1', 'bg-cyan-1'),
      s('--color-cyan-2', 'bg-cyan-2'),
      s('--color-cyan-3', 'bg-cyan-3'),
      s('--color-cyan-4', 'bg-cyan-4'),
      s('--color-cyan-5', 'bg-cyan-5'),
    ],
  },
  {
    title: 'Blue',
    swatches: [
      s('--color-blue-1', 'bg-blue-1'),
      s('--color-blue-2', 'bg-blue-2'),
      s('--color-blue-3', 'bg-blue-3'),
      s('--color-blue-4', 'bg-blue-4'),
      s('--color-blue-5', 'bg-blue-5'),
    ],
  },
  {
    title: 'Purple',
    swatches: [
      s('--color-purple-1', 'bg-purple-1'),
      s('--color-purple-2', 'bg-purple-2'),
      s('--color-purple-3', 'bg-purple-3'),
    ],
  },
  {
    title: 'Green',
    swatches: [
      s('--color-green-1', 'bg-green-1'),
      s('--color-green-2', 'bg-green-2'),
      s('--color-green-3', 'bg-green-3'),
    ],
  },
  {
    title: 'Orange',
    swatches: [
      s('--color-orange-1', 'bg-orange-1'),
      s('--color-orange-2', 'bg-orange-2'),
      s('--color-orange-3', 'bg-orange-3'),
    ],
  },
  {
    title: 'Neutral',
    swatches: [
      s('--color-white', 'bg-white'),
      s('--color-gray-1', 'bg-gray-1'),
      s('--color-gray-2', 'bg-gray-2'),
      s('--color-gray-3', 'bg-gray-3'),
      s('--color-gray-4', 'bg-gray-4'),
      s('--color-gray-5', 'bg-gray-5'),
      s('--color-gray-6', 'bg-gray-6'),
      s('--color-black', 'bg-black'),
    ],
  },
  {
    title: 'Translucent',
    note: 'White and black at a fixed alpha, for overlays.',
    checker: true,
    swatches: [
      s('--color-white-10', 'bg-white-10'),
      s('--color-white-30', 'bg-white-30'),
      s('--color-white-60', 'bg-white-60'),
      s('--color-white-80', 'bg-white-80'),
      s('--color-black-30', 'bg-black-30'),
      s('--color-black-60', 'bg-black-60'),
      s('--color-black-80', 'bg-black-80'),
    ],
  },
  {
    title: 'Semantic aliases',
    note: 'Named roles that point at the neutrals above.',
    swatches: [
      s('--color-content-primary', 'bg-content-primary'),
      s('--color-content-secondary', 'bg-content-secondary'),
      s('--color-content-tertiary', 'bg-content-tertiary'),
      s('--color-background-primary', 'bg-background-primary'),
      s('--color-background-secondary', 'bg-background-secondary'),
      s('--color-background-tertiary', 'bg-background-tertiary'),
      s('--color-border-opaque', 'bg-border-opaque'),
      s('--color-border-selected', 'bg-border-selected'),
    ],
  },
];

export interface TypeToken {
  /** The utility, e.g. `text-heading-xl`. */
  readonly cls: string;
}

export interface TypeGroup {
  readonly title: string;
  readonly note: string;
  readonly tokens: readonly TypeToken[];
}

export const FONT_FAMILIES: readonly TypeToken[] = [{ cls: 'font-heading' }, { cls: 'font-body' }];

export const TYPE_SCALE: readonly TypeGroup[] = [
  {
    title: 'Heading',
    note: 'Lexend, medium (500)',
    tokens: [
      { cls: 'text-heading-xxl' },
      { cls: 'text-heading-xl' },
      { cls: 'text-heading-lg' },
      { cls: 'text-heading-md' },
      { cls: 'text-heading-sm' },
      { cls: 'text-heading-xs' },
    ],
  },
  {
    title: 'Body',
    note: 'Roboto, regular (400)',
    tokens: [
      { cls: 'text-body-lg' },
      { cls: 'text-body-md' },
      { cls: 'text-body-md-short' },
      { cls: 'text-body-md-long' },
      { cls: 'text-body-sm' },
    ],
  },
  {
    title: 'Expressive',
    note: 'Roboto, medium (500) or bold (700)',
    tokens: [
      { cls: 'text-expressive-xl' },
      { cls: 'text-expressive-lg' },
      { cls: 'text-expressive-md-short' },
      { cls: 'text-expressive-md-long' },
      { cls: 'text-expressive-sm' },
      { cls: 'text-expressive-xs' },
    ],
  },
];

export const SHADOWS: readonly TypeToken[] = [
  { cls: 'shadow-small' },
  { cls: 'shadow-medium' },
  { cls: 'shadow-large' },
  { cls: 'shadow-notification' },
];

/** Sizes for `svg-icon`, from `@libs/ui` (`icon-size-<n>`). */
export const ICON_SIZES: readonly TypeToken[] = [
  { cls: 'icon-size-3' },
  { cls: 'icon-size-4' },
  { cls: 'icon-size-5' },
  { cls: 'icon-size-6' },
  { cls: 'icon-size-7' },
  { cls: 'icon-size-8' },
  { cls: 'icon-size-10' },
  { cls: 'icon-size-12' },
  { cls: 'icon-size-14' },
  { cls: 'icon-size-16' },
  { cls: 'icon-size-18' },
  { cls: 'icon-size-20' },
  { cls: 'icon-size-22' },
  { cls: 'icon-size-24' },
];
