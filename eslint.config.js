// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const prettierRecommended = require('eslint-plugin-prettier/recommended');
const boundaries = require('eslint-plugin-boundaries');

// Feature-Sliced Design layers of apps/main (see docs/superpowers/specs/2026-10-01-fsd-main-app-design.md)
const SRC = 'apps/main/src';
const SLICED_LAYERS = ['pages', 'widgets', 'features', 'entities'];
const ALL_LAYERS = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'];
const LAYERS_ABOVE = {
  shared: ['app', 'pages', 'widgets', 'features', 'entities'],
  entities: ['app', 'pages', 'widgets', 'features'],
  features: ['app', 'pages', 'widgets'],
  widgets: ['app', 'pages'],
  pages: ['app'],
};

module.exports = tseslint.config(
  {
    files: ['**/*.js'],
    extends: [prettierRecommended],
    rules: {
      'eol-last': 'warn',
      semi: 'warn',
      indent: ['off', 2, { SwitchCase: 1 }],
      quotes: ['warn', 'single', { avoidEscape: true }],
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
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/prefer-for-of': 'warn',
      '@angular-eslint/no-async-lifecycle-method': ['warn'],
      '@angular-eslint/no-attribute-decorator': ['warn'],
      '@angular-eslint/no-duplicates-in-metadata-arrays': ['warn'],
      '@angular-eslint/no-lifecycle-call': ['warn'],
      '@angular-eslint/no-inputs-metadata-property': ['warn'],
      '@angular-eslint/no-output-native': ['warn'],
      '@angular-eslint/no-outputs-metadata-property': ['warn'],
      '@angular-eslint/no-empty-lifecycle-method': ['warn'],
      '@angular-eslint/no-pipe-impure': ['warn'],
      '@angular-eslint/no-queries-metadata-property': ['warn'],
      '@angular-eslint/use-injectable-provided-in': ['warn'],
      '@angular-eslint/use-lifecycle-interface': ['warn'],
      '@angular-eslint/prefer-output-readonly': ['warn'],
      '@angular-eslint/prefer-standalone': ['warn'],
      '@angular-eslint/relative-url-prefix': ['warn'],
      '@angular-eslint/sort-lifecycle-methods': ['warn'],
      '@angular-eslint/use-pipe-transform-interface': ['warn'],
      '@angular-eslint/no-output-on-prefix': ['off'],
      '@angular-eslint/directive-selector': [
        'warn',
        {
          type: 'attribute',
          prefix: '',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'warn',
        {
          type: 'element',
          prefix: '',
          style: 'kebab-case',
        },
      ],
      'eol-last': 'warn',
      semi: 'warn',
      indent: ['off', 2, { SwitchCase: 1 }],
      quotes: ['warn', 'single', { avoidEscape: true }],
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
      '@angular-eslint/template/eqeqeq': ['warn', { allowNullOrUndefined: true }],
      '@angular-eslint/template/no-call-expression': 'off',
    },
  },
  {
    // FSD boundaries
    files: [`${SRC}/{app,pages,widgets,features,entities,shared}/**/*.ts`],
    plugins: { boundaries },
    settings: {
      'import/resolver': { typescript: { alwaysTryTypes: true } },
      'boundaries/elements': [
        ...SLICED_LAYERS.map((layer) => ({
          type: layer,
          pattern: `${SRC}/${layer}/*`,
          capture: ['slice'],
        })),
        { type: 'app', pattern: `${SRC}/app` },
        { type: 'shared', pattern: `${SRC}/shared` },
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'allow',
          policies: [
            // A layer never imports a layer above it
            ...Object.entries(LAYERS_ABOVE).map(([layer, above]) => ({
              from: { element: { type: layer } },
              disallow: { to: { element: { type: above } } },
              message: `{{ from.element.types.[0] }} must not import from {{ to.element.types.[0] }} (layers only depend downward)`,
            })),
            // Slices of the same layer are independent of each other
            ...SLICED_LAYERS.map((layer) => ({
              from: { element: { type: layer } },
              disallow: { to: { element: { type: layer } } },
              message: `${layer} slices must not import each other ({{ from.element.captured.slice }} -> {{ to.element.captured.slice }})`,
            })),
            // Cross-slice imports go through the slice's public API (index.ts)
            {
              disallow: {
                to: {
                  element: {
                    type: SLICED_LAYERS,
                    fileInternalPath: '!index.ts',
                  },
                },
              },
              message:
                'Import {{ to.element.captured.slice }} through its index.ts, not a deep path',
            },
            // A slice may import itself freely (overrides the rules above)
            { allow: { dependency: { relationship: { to: 'internal' } } } },
          ],
        },
      ],
    },
  },
  {
    ignores: [
      '**/*.spec.ts',
      'dist/**',
      'node_modules/**',
      'public/**',
      'packages/**',
      'libs/**',
      '.angular/**',
    ],
  }
);
