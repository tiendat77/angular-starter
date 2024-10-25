// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = tseslint.config(
  {
    files: ['**/*.js'],
    extends: [prettierRecommended],
    rules: {
      'eol-last': 'error',
      semi: 'error',
      indent: ['error', 2, { SwitchCase: 1 }],
      quotes: ['error', 'single', { avoidEscape: true }],
    },
  },
  {
    files: ['**/*.ts'],
    extends: [
      prettierRecommended,
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      'prettier/prettier': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: '',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      'eol-last': 'error',
      semi: 'error',
      indent: ['error', 2, { SwitchCase: 1 }],
      quotes: ['error', 'single', { avoidEscape: true }],
    },
  },
  {
    files: ['**/*.html'],
    extends: [
      prettierRecommended,
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {
      'prettier/prettier': 'warn',
      '@angular-eslint/template/attributes-order': 'warn',
      '@angular-eslint/template/alt-text': 'warn',
      '@angular-eslint/template/banana-in-box': 'warn',
      '@angular-eslint/template/click-events-have-key-events': 'warn',
      '@angular-eslint/template/elements-content': 'warn',
      '@angular-eslint/template/no-duplicate-attributes': 'warn',
      '@angular-eslint/template/no-interpolation-in-attributes': 'warn',
      '@angular-eslint/template/no-negated-async': 'warn',
      '@angular-eslint/template/prefer-control-flow': 'warn',
      '@angular-eslint/template/prefer-self-closing-tags': 'warn',
      '@angular-eslint/template/use-track-by-function': 'warn',
      '@angular-eslint/template/conditional-complexity': ['warn', { maxComplexity: 3 }],
      '@angular-eslint/template/eqeqeq': ['error', { allowNullOrUndefined: true }],
      '@angular-eslint/template/no-call-expression': [
        'warn',
        {
          allowList: ['get', 'hasError'],
          allowPrefix: '$',
          allowSuffix: '$',
        },
      ],
    },
  },
  {
    ignores: ['**/*.spec.ts', 'dist/**', 'node_modules/**', 'public/**', 'projects/**'],
  }
);
