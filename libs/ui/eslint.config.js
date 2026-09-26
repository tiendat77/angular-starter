// @ts-check
const tseslint = require('typescript-eslint');
const rootConfig = require('../../eslint.config.js');

module.exports = tseslint.config(
  ...rootConfig,
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'ui',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'ui',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    // Entry points moved in from standalone libs keep their original selectors and class names
    // (`svg-icon`, `dialog`, `DatepickerInput`, ...) for backward compatibility
    files: [
      'svg-icon/**/*.ts',
      'dialog/**/*.ts',
      'loader/**/*.ts',
      'toast/**/*.ts',
      'date-picker/**/*.ts',
      'paginator/**/*.ts',
    ],
    rules: {
      '@angular-eslint/prefer-on-push-component-change-detection': 'off',
      '@angular-eslint/component-class-suffix': 'off',
      '@angular-eslint/directive-selector': 'off',
      '@angular-eslint/component-selector': 'off',
    },
  },
  {
    files: ['**/*.html'],
    rules: {},
  }
);
