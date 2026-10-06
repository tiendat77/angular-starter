# Styling Context (Tailwind v4) — READ BEFORE WRITING ANY CLASS

> Audience: AI agents and developers writing templates / `cva()` variants in `apps/main`, `apps/docs`, `libs/ui`.
> Source of truth: `libs/ui/styles/tokens.css`, `apps/main/src/styles/*.css`, `apps/docs/src/styles.css`.
> If a class is not listed here or defined in those files, **it does not exist**. Do not guess.

## 0. Hard rules

1. **No DaisyUI.** `base-100`, `base-200`, `base-300`, `base-content`, `bg-base-*`, `text-base-content`, `primary-focus`, `neutral-content` etc. are NOT defined anywhere. Tailwind v4 silently emits nothing for unknown colors, so the element renders unstyled with no error.
   - Known offenders to fix: `libs/ui/collapse/src/collapse.variants.ts`, `libs/ui/collapse/src/collapse-panel.component.ts` (`base-100/200/50`), `apps/docs/.../collapse-doc.component.html` (`text-base-content/*`).
2. **Inside `libs/ui` use only the semantic tokens in §2.** Never raw palette classes (`gray-*`, `zinc-*`, `white`, `black`, hex). Raw colors do not follow dark mode or rebranding.
   - Existing violations (do not copy): `libs/ui/menu/src` uses `text-gray-*`/`bg-gray-*`.
3. **Dark mode is automatic via tokens.** Do not add `dark:` variants for anything in §2; the token value flips under `[data-theme='dark']`. Use `dark:` only for raw-palette exceptions.
4. **Opacity uses the slash modifier** on semantic tokens: `bg-muted/50`, `border-border/50`, `bg-error/10`, `text-foreground/60`. This works because tokens are plain `var(--color-*)`.
5. Prefer the existing component utilities (`btn`, `card`, `badge`, `alert`, …, §5) over re-building them with raw Tailwind.

## 1. Project layout of the style system

| Project | Entry | What it adds |
|---|---|---|
| `libs/ui` | `libs/ui/styles/index.css` → `tokens.css` + `components/*.css` | Semantic color tokens, icon sizes, `dark` variant, component `@utility` classes. Neutral zinc defaults so the lib renders standalone. |
| `libs/theme` | `libs/theme/styles/tokens.css` (+ `brand.css`) | Styles-only package shared by the apps. `tokens.css`: brand primary/secondary scales, style-guide palette, shadows, fonts, type scale (definitions only, no side effects). `brand.css`: re-brands `@libs/ui` (`--color-primary` → scale 500), imported only by the app that carries the brand. |
| `apps/main` | `apps/main/src/styles/index.css` (imports Tailwind, `@libs/theme` tokens + brand, `_colors`, `_themes`, lib styles, `_vendors`) | Everything from `@libs/theme`, plus legacy RGB tokens + utilities (`bg-card`, `text-hint`…), extra spacing keys, safe-area. |
| `apps/docs` | `apps/docs/src/styles.css` | Imports Tailwind + `libs/ui` styles + `@libs/theme` **tokens only** (not `brand.css`, so the docs keep the neutral look). Adds highlight.js token colors. The Theme page documents the tokens. |

Consequence: **a class that only `apps/main` defines (`text-hint`, `bg-card`, safe-area, the extra spacing keys) does not exist in `apps/docs` or in `libs/ui`.** The `@libs/theme` classes (`text-heading-md`, `red-4`, `shadow-medium`, `bg-primary-50`…) exist in `apps/main` and `apps/docs`, **never** in `libs/ui`: library code may only rely on §2.

Dark mode: `data-theme="dark" | "light"` on `<html>` (set by `ThemeService`, `apps/main/src/shared/lib/theme/theme.service.ts`). The variant is `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *))`, not the `.dark` class and not `prefers-color-scheme`.

## 2. Semantic tokens — the ONLY colors for `libs/ui` and docs (also valid in main)

Defined in `libs/ui/styles/tokens.css` (`@theme`, dark values in `@layer base [data-theme='dark']`). Each yields `bg-*`, `text-*`, `border-*`, `ring-*`, `divide-*`, `outline-*`, `fill-*`, `stroke-*`.

| Token (class suffix) | Light | Dark | Use for |
|---|---|---|---|
| `background` | #fff | #09090b | Page/surface base, card and panel surfaces, popovers, inputs |
| `foreground` | #09090b | #fafafa | Primary text |
| `muted` | #f4f4f5 | #27272a | Subtle fill: hover rows, filled cards, striped rows, disabled fills, code blocks |
| `muted-foreground` | #71717a | #a1a1aa | Secondary text: descriptions, hints, placeholders, icons |
| `border` | #e4e4e7 | #27272a | All borders and dividers (`border-border`, `divide-border`) |
| `input` | #e4e4e7 | #27272a | Form-control borders |
| `primary` / `primary-content` | #18181b / #fafafa | #fafafa / #18181b | Main action fill and the text on it |
| `secondary` / `secondary-content` | #f4f4f5 / #18181b | #27272a / #fafafa | Secondary action fill and the text on it |
| `info` `success` `warning` `error` (+ `-content`) | blue/green/amber/red, content #fff | same | Status. Solid: `bg-error text-error-content`. Soft: `bg-error/10 text-error`. Border: `border-error/30` |

`apps/main` overrides (unlayered `:root` in `_colors.css`): `--color-primary` → `--primary-500` (#ff2d3e), `--color-primary-content` → white, `--color-secondary` → `--secondary-500` (#ff840a). So in main, `bg-primary` is brand red in both themes. Only override what the brand changes.

### Pairing rules (mapping the DaisyUI names an agent may be tempted to use)

| Agent wants (WRONG) | Use instead |
|---|---|
| `bg-base-100` (surface) | `bg-background` |
| `bg-base-200` (subtle fill / hover) | `bg-muted` (hover: `hover:bg-muted/50`) |
| `bg-base-300` (stronger fill) | `bg-muted` or `bg-foreground/10` |
| `border-base-200`, `divide-base-200` | `border-border`, `divide-border` |
| `text-base-content`, `text-base-content/70` | `text-foreground`, `text-muted-foreground` |
| `bg-base-50/30` (panel tint) | `bg-muted/30` |
| `bg-white`, `text-gray-500`, `border-gray-200` (in lib/docs) | `bg-background`, `text-muted-foreground`, `border-border` |

Always pair fill + text: `bg-primary text-primary-content`, `bg-secondary text-secondary-content`, `bg-{status} text-{status}-content`.

Hierarchy of text: `text-foreground` (main) → `text-muted-foreground` (secondary) → `text-foreground/60` or `text-muted-foreground/70` (tertiary/disabled).

### Corrected collapse example

```ts
bordered: 'border border-border rounded-lg divide-y divide-border bg-background',
frameless: 'divide-y divide-border bg-transparent border-0',
hover: 'hover:bg-muted/50',           // was hover:bg-base-200/50
panel: 'p-4 border-t border-border bg-muted/30',
```

## 3. Sizing, spacing, radius, shadow

- **Spacing / sizing / breakpoints / radius**: default Tailwind v4 scale (`p-4` = 1rem, `rounded-lg`, `text-sm`, `gap-2`). `libs/ui` and `apps/docs` add nothing to it.
- **Lib component conventions** (from `components/*.css`): control height `2.5rem` (btn md; `sm` 2rem), control padding-inline `1rem`, control radius `0.5rem`, card radius `0.75rem`, card padding `sm 0.75rem / md 1.5rem / lg 2rem`, font-size of controls `0.875rem`, transitions `150ms`. Match these when building new components.
- **Icon sizes** (`libs/ui`): `icon-size-{3,4,5,6,7,8,10,12,14,16,18,20,22,24}` = 0.75rem … 6rem (e.g. `icon-size-4` = 1rem). Apply to `svg-icon` or a wrapper; sets width/height/min-* and nested `<svg>`.
- **`apps/main` only** extra spacing keys: `13 15 18 22 26 30 50 90` (3.25–22.5rem), `100 120 128 132 140 160 180 192 200 240 256 280 320 360 400 480` (25–120rem), fractions `1/2 1/3 2/3 1/4 2/4 3/4`. Extra scale/opacity: `scale-96/97/98`, `opacity-12/38/87` (also `opacity-10/30/60/80`).
- **Safe area (main only)**: `m-safe mx-safe my-safe mt/mr/mb/ml-safe`, `p-safe px-safe py-safe pt/pr/pb/pl-safe`, `top-safe`, `bottom-safe`.
- **Shadows (main only)**: `shadow-small`, `shadow-medium`, `shadow-large`, `shadow-notification`. In lib/docs use Tailwind `shadow-sm|md|lg` or the card utilities (`card-elevated`).
- **Misc utility**: `scrollbar-none` (main).

## 4. `@libs/theme` and `apps/main` tokens (do NOT use in `libs/ui`; `apps/docs` may use the `@libs/theme` ones)

> What is shared lives in `libs/theme/styles/tokens.css` (brand scales, style-guide palette, shadows, typography). Only the legacy RGB surfaces, safe-area utilities and extra spacing keys are `apps/main`-only. The docs Theme page (`/theme`) shows every shared token live.

### Brand scales (`libs/theme/styles/tokens.css`)
- `primary-{50,100,…,900,950}` red, `500` = brand (#ff2d3e); `secondary-{50…950}` orange, `500` = #ff840a. `on-primary`, `on-secondary` = white.
- Usage in main: `text-primary-500`, `bg-primary-50`, `border-primary-200`. For the plain brand color prefer `bg-primary` / `text-primary` (§2).

### Legacy RGB surface tokens (`_colors.css`; switch on `data-theme`)
| Utility | Var | Light | Dark |
|---|---|---|---|
| `bg-card` | `--background-card-rgb` | 255,255,255 | 15,23,42 |
| `bg-default` | `--background-default-rgb` | 248,250,252 | 2,6,23 |
| `text-default` | `--foreground-default-rgb` | 15,23,42 | 248,250,252 |
| `text-hint` | `--foreground-hint-rgb` | 100,116,139 | 148,163,184 |
| `text-disabled` | `--foreground-disabled-rgb` | 148,163,184 | 71,85,105 |
| (default border color, `@layer base`) | `--border-default-rgb` | 241,245,249 | 30,41,59 (opacity .12) |

Note: these are utilities, not `@theme` colors, so **no opacity modifier** (`bg-card/50` won't work). They overlap semantically with §2 (`bg-card`≈`bg-background`, `text-hint`≈`text-muted-foreground`); in new main code prefer §2 unless matching existing `bg-card`/`text-hint` code.

### Style-guide palette (`_branding.css`)
`red-1..5`, `yellow-1..5`, `cyan-1..5`, `blue-1..5`, `purple-1..3`, `green-1..3`, `orange-1..3`, `gray-1..6`, `white`, `black`, `white-{10,30,60,80}`, `black-{30,60,80}`. Numbers are 1–5, NOT the Tailwind 50–950 scale. Note `gray-1..6` coexists with Tailwind's `gray-50..950`, so `gray-500` is Tailwind's while `gray-5` is the brand's.

Semantic (branding): `text-content-primary|secondary|tertiary`, `bg-background-primary|secondary|tertiary`, `border-opaque`, `border-selected`. Gradients: `bg-gradient-to-bottom-white`, `bg-gradient-to-bottom-dark`. Do not confuse `bg-background-primary` (branding) with `bg-background` (lib token).

### Typography (`_branding.css`, main only)
Fonts loaded in `apps/main/src/index.html`: Inter, Lexend (400–700), Roboto (400/500/700). `font-heading` = Lexend, `font-body` = Roboto. Each `text-*` below sets family + size + line-height + weight, so don't add `text-sm`/`font-medium` on top.

| Class | Size / line-height | Weight |
|---|---|---|
| `text-heading-xxl` | 40 / 64px | 500 |
| `text-heading-xl` | 32 / 44 | 500 |
| `text-heading-lg` | 24 / 32 | 500 |
| `text-heading-md` | 18 / 28 | 500 |
| `text-heading-sm` | 16 / 24 | 500 |
| `text-heading-xs` | 14 / 20 | 500 |
| `text-body-lg` | 16 / 24 | 400 |
| `text-body-md` (`-short`) | 14 / 20 | 400 |
| `text-body-md-long` | 14 / 24 | 400 |
| `text-body-sm` | 12 / 16 | 400 |
| `text-expressive-xl` | 18 / 28 | 500 |
| `text-expressive-lg` | 16 / 24 | 500 |
| `text-expressive-md-short` / `-long` | 14 / 20 or 24 | 500 |
| `text-expressive-sm` | 12 / 16 | 500 |
| `text-expressive-xs` | 10 / 12 | 700 |

In `libs/ui` and `apps/docs` there is no custom type scale: use Tailwind `text-xs|sm|base|lg|xl`, `font-medium|semibold`. Docs body font is the system sans stack; `libs/ui` inherits the host's font.

## 5. Component utility classes (`libs/ui/styles/components/*.css`)

Use these instead of hand-rolling; modifiers only set `--<component>-*` vars, so they combine in any order.

- **btn**: `btn` + color (`btn-neutral|primary|secondary|info|success|warning|error|danger`) + style (`btn-outline|dash|soft|ghost|link`) + size (`btn-xs|sm|md|lg|xl`) + shape (`btn-square|icon|circle|wide|block`).
- **card**: `card` + `card-outline|elevated|filled` + `card-p-none|sm|md|lg` + `card-interactive`; parts `card-header|title|description|action|content|footer|media`.
- **alert**: `alert-{neutral,primary,info,success,warning,error}` + `alert-soft|outline|dash|solid|banner|vertical|horizontal`.
- **badge / tag**: `badge-{neutral,primary,info,success,warning,error}` `-sm|md|dot|circular`; `tag-*` same colors + `tag-outline|solid|checkable`.
- **form**: `input` (`-bordered|ghost|filled`), `checkbox|radio|toggle` (colors `neutral…error`, sizes `xs…xl`), `form-control`, `label`, `label-text`.
- **others**: `avatar-*`, `tabs`/`tab-*`, `menu-*`, `dropdown`, `divider-*`, `join`, `data-table-*`, `modal-*`, `bottom-sheet-*`.

Colors in these utilities map to the §2 tokens: `neutral` = `foreground`-based, `primary|secondary|info|success|warning|error` = the same-named token.

## 6. Checklist before committing styling code

1. Every color class ∈ {§2 token, or (main only) §4}. `grep -nE "base-(50|100|200|300|content)|primary-focus" <files>` must return nothing.
2. Surface = `bg-background`, subtle = `bg-muted`, border = `border-border`, text = `text-foreground` / `text-muted-foreground`.
3. Fill always paired with its `-content` text token.
4. No `dark:` where a token already handles it; no raw palette / hex in `libs/ui`.
5. Sizes come from the Tailwind default scale (or §3 lib conventions); main-only typography/spacing keys are not used in lib or docs.
6. Verify in the browser in **both** `data-theme` values.
