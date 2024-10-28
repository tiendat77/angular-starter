const { mapKeys } = require('es-toolkit');

/**
 * Converts a JSON object to a SASS map.
 * @param {*} data: string
 */
const jsonToSassMap = (data) => {
  if (!data) {
    return;
  }

  data = JSON.parse(data);

  const getSCSS = (chunk) => {
    let scss = '';

    if (typeof chunk === 'object' && !Array.isArray(chunk)) {
      mapKeys(chunk, (value, key) => {
        scss += key + ': ';

        if (typeof value === 'object') {
          if (Array.isArray(value)) {
            scss += '(';

            for (let i = 0; i < value.length; i++) {
              const val1 = value[i];
              if (Array.isArray(val1)) {
                for (let j = 0; j < val1.length; j++) {
                  scss += val1[j] + ' ';
                }
                scss = scss.slice(0, -1) + ', ';
              } else {
                scss += val1 + ', ';
              }
            }
            scss = scss.slice(0, -2);
            scss += ')';
          } else {
            scss += '(' + getSCSS(value) + ')';
          }
        } else {
          scss += getSCSS(value);
        }
        scss += ', ';
      });
      scss = scss.slice(0, -2);
    } else {
      scss += chunk;
    }

    return scss;
  };

  return '$' + getSCSS(data) + ';';
};

module.exports = jsonToSassMap;
