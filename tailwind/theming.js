import { flatten, omitBy } from 'es-toolkit';
import { fromPairs, get } from 'es-toolkit/compat';

const chroma = require('chroma-js');
const plugin = require('tailwindcss/plugin');

const flattenColorPalette = require('tailwindcss/lib/util/flattenColorPalette').default;

// -----------------------------------------------------------------------------------------------------
// @ Utilities
// -----------------------------------------------------------------------------------------------------

/**
 * Maps the provided object with the given function.
 *
 * @param obj: any
 * @param fn: (value: any, key: string) => any)
 */
const map = (obj, fn) => {
  return Object.keys(obj).map((key) => fn(obj[key], key));
};

/**
 * Normalizes the provided theme by omitting empty values and values that
 * start with "on" from each palette. Also sets the correct DEFAULT value
 * of each palette.
 * @type {import('./theming').Theme}
 * @param theme: Theme
 */
const normalizeTheme = (theme) => {
  return fromPairs(
    map(
      omitBy(
        theme,
        (palette, paletteName) => `${paletteName}`.startsWith('on') || !Object.keys(palette).length
      ),
      (palette, paletteName) => [
        paletteName,
        {
          ...palette,
          DEFAULT: palette['DEFAULT'] || palette[500],
        },
      ]
    )
  );
};

/**
 * Generates contrasting counterparts of the given palette.
 * The provided palette must be in the same format with
 * default Tailwind color palettes.
 * @type {import('./theming').Palette}
 * @param palette: Palette
 */
const generateContrasts = (palette) => {
  const lightColor = '#FFFFFF';
  let darkColor = '#FFFFFF';

  // Iterate through the palette to find the darkest color
  Object.keys(palette).forEach((hue) => {
    darkColor =
      chroma.contrast(palette[hue], '#FFFFFF') > chroma.contrast(darkColor, '#FFFFFF')
        ? palette[hue]
        : darkColor;
  });

  // Generate the contrasting colors
  return fromPairs(
    map(palette, (color, hue) => [
      hue,
      chroma.contrast(color, darkColor) > chroma.contrast(color, lightColor)
        ? darkColor
        : lightColor,
    ])
  );
};

// -----------------------------------------------------------------------------------------------------
// @ TailwindCSS Main Plugin
// -----------------------------------------------------------------------------------------------------

/** @type {import('./theming').Theme} */
const theming = plugin.withOptions(
  (options) =>
    ({ addComponents, e }) => {
      addComponents({
        ':root': fromPairs(
          flatten(
            map(
              flattenColorPalette(
                fromPairs(
                  flatten(
                    map(normalizeTheme(options.theme), (palette, paletteName) => [
                      [e(paletteName), palette],
                      [
                        `on-${e(paletteName)}`,
                        fromPairs(
                          map(generateContrasts(palette), (color, hue) => [
                            hue,
                            get(options.theme, [`on-${paletteName}`, hue]) || color,
                          ])
                        ),
                      ],
                    ])
                  )
                )
              ),
              (value, key) => [
                [`--${e(key)}`, value],
                [`--${e(key)}-rgb`, chroma(value).rgb().join(',')],
              ]
            )
          )
        ),
      });
    },
  (options) => {
    return {
      theme: {
        extend: {
          /**
           * Add 'Primary', 'Accent' and 'Warn' palettes as colors so all color utilities
           * are generated for them; "bg-primary", "text-on-primary", "bg-accent-600" etc.
           * This will also allow using arbitrary values with them such as opacity and such.
           */
          colors: fromPairs(
            flatten(
              map(Object.keys(flattenColorPalette(normalizeTheme(options.theme))), (name) => [
                [name, `rgba(var(--${name}-rgb), <alpha-value>)`],
                [`on-${name}`, `rgba(var(--on-${name}-rgb), <alpha-value>)`],
              ])
            )
          ),
        },
      },
    };
  }
);

module.exports = theming;
