# `@libs/theme`

Styles-only package: the project's design tokens, shared by the apps (`apps/main`, `apps/docs`).
No TypeScript, nothing to build: apps import the CSS by relative path, the way they import
`libs/ui/styles`.

| File                | What it is                                                                                                                                                                                                             | Who imports it                                    |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `styles/tokens.css` | Brand primary / secondary scales (50-950), the style-guide palette, shadows, fonts and the type scale (`text-heading-*`, `text-body-*`, `text-expressive-*`). **Definitions only**: importing it changes no component. | every app                                         |
| `styles/brand.css`  | Re-brands `@libs/ui`: points `--color-primary` / `--color-secondary` at the brand scales. Unlayered, so one `:root` rule also wins in dark mode.                                                                       | only the app that carries the brand (`apps/main`) |

```css
/* apps/main/src/styles/index.css: branded */
@import '../../../../libs/theme/styles/tokens.css';
@import '../../../../libs/theme/styles/brand.css';
@import '../../../../libs/ui/styles/index.css';

/* apps/docs/src/styles.css: neutral look, but can show the tokens */
@import '../../../libs/ui/styles/index.css';
@import '../../../libs/theme/styles/tokens.css';
```

## Rules

- **`libs/ui` never imports this package.** It stays neutral and publishable; the brand is applied on
  top by the app.
- **Keep `tokens.css` free of side effects.** No re-defining semantic tokens (`--color-primary`), no
  global `@layer base` rules, and no bare-number `--opacity-<n>` tokens: with one defined, Tailwind
  compiles `bg-error/<n>` to `color-mix(... var(--opacity-<n>) ...)`, which is invalid with a number,
  so the colour silently becomes transparent. (`apps/main` still carries four such tokens in
  `_themes.css`; see the note there.)
- Tailwind v4 only emits a theme variable or utility that a scanned file actually uses, so docs that
  list tokens must write the class names out in full (see the docs Theme page).

The tokens are documented live on the docs site, page **Theme**.
