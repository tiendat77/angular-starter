const chroma = require('chroma-js');
const plugin = require('tailwindcss/plugin');

const flattenColorPalette = require('tailwindcss/lib/util/flattenColorPalette').default;

import { omitBy, flatten } from 'es-toolkit';
import { fromPairs, get } from 'es-toolkit/compat';
import { map } from './utils/object-map';

import material from './material';
import normalizeTheme from './utils/normalize-theme';
import generateContrasts from './utils/generate-contrasts';

// -----------------------------------------------------------------------------------------------------
// @ TailwindCSS Main Plugin
// -----------------------------------------------------------------------------------------------------

/** @type {import('./theming').Theme} */
const theming = plugin.withOptions(
  (options) =>
    ({ addComponents, e }) => {
      /**
       * Generate the CSS variables for each color in the theme.
       */
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

      /**
       * Generate themes.scss for Material UI configuration.
       */
      material(options.theme);
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
