const fs = require('fs');
const path = require('path');
const chroma = require('chroma-js');
const plugin = require('tailwindcss/plugin');

const { omitBy, mapKeys } = require('es-toolkit');
const { fromPairs, get, pick } = require('es-toolkit/compat');
const { map } = require('./utils/object-map');

const jsonToSassMap = require('./utils/json-to-sass-map');
const normalizeTheme = require('./utils/normalize-theme');
const generateContrasts = require('./utils/generate-contrasts');

// -----------------------------------------------------------------------------------------------------
// @ TailwindCSS Main Plugin
// -----------------------------------------------------------------------------------------------------

/** @type {import('./theming').Theme} */
const material = (theme) => {
  /**
   * Normalize the themes and assign it to the themes object. This will
   * be the final object that we create a SASS map from
   */
  let themes = normalizeTheme(theme);

  /**
   * Go through the theme to generate the contrasts and filter the
   * palettes to only have "primary", "accent" and "warn" objects.
   */
  themes = pick(
    fromPairs(
      map(themes, (palette, paletteName) => [
        paletteName,
        {
          ...palette,
          contrast: fromPairs(
            map(generateContrasts(palette), (color, hue) => [
              hue,
              get(themes, [`on-${paletteName}`, hue]) || color,
            ])
          ),
        },
      ])
    ),
    ['primary', 'accent', 'warn']
  );

  /* Generate the SASS map using the themes object */
  const sassMap = jsonToSassMap(JSON.stringify({ themes: themes }));

  /* Get the file path */
  const filename = path.resolve(__dirname, '../src/styles/material-themes.scss');

  /* Read the file and get its data */
  let data;
  try {
    data = fs.readFileSync(filename, { encoding: 'utf8' });
  } catch (err) {
    console.error(err);
  }

  /* Write the file if the map has been changed */
  if (data.replace(/[\s,]+/g, '').toLowerCase() !== sassMap.replace(/[\s,]+/g, '').toLowerCase()) {
    try {
      fs.writeFileSync(filename, sassMap, { encoding: 'utf8' });
    } catch (err) {
      console.error(err);
    }
  }
};

module.exports = material;
