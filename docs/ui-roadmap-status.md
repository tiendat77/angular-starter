# `@libs/ui` — Roadmap Status & Next Steps

_Snapshot: 2026-09-26, branch `feat/libs-ui-design-system`, after `5b01824`._
_Sources: `.idea/roadmap.md` (the plan) and `.idea/ui-progress-and-next-steps.md` (the earlier review)._

---

## 1. Summary

The consolidation phase ("Step 0" in the earlier review) is essentially done:

- **One package:** everything lives in `libs/ui` as secondary entry points. Nothing depends on the host app any more.
- **One styling approach:** every component takes its look from shared CSS utilities, the way `btn` works. The daisyUI names are gone.
- **Self-contained tokens:** `libs/ui` ships neutral defaults. The app overrides only its brand colors.
- **Everything documented and tested:** all 11 entry points have a docs page and tests (36 tests, all passing).

What is still missing is **new components**. Roadmap Phase 1 is roughly half done. The next milestone is the overlay foundation, then Select.

---

## 2. What changed since the review

| Commit | Change |
|---|---|
| `c905282` | Form controls use shared utilities. New `checkbox`, `radio`, `toggle` utilities and `input-filled` / `textarea-filled`. Checkbox and switch are native inputs. |
| `79abf90` | daisyUI token aliases removed (`bg-base-*`, `rounded-box`, …) and `theme.css` deleted. |
| `66c78d3` | Moved-in entries use the design tokens. The dialog has its own animations (no `animate.css`). CDK overlay and a11y CSS ship with `@libs/ui/styles`. About 390 lines of dead date-picker SCSS removed. |
| `f15eb98` | Paginator `(page)` event fixed (off-by-one `previousPageIndex`, missing `length`). `PageEvent` and `DialogConfirmConfig` are now exported. |
| `21401c9` | Tests for svg-icon, dialog, toast, loader, date-picker, paginator. |
| `d406833` | Docs pages for dialog, toast, loader, date-picker, paginator. Grouped sidebar and a shared API table. |
| `5b01824` | Two-tier tokens: `libs/ui/styles/tokens.css` holds the defaults, and the app overrides its brand in an unlayered `:root`. The docs app imports only `@libs/ui/styles`. |

Earlier on this branch: highlight.js code blocks, separate `.html` / `.ts` per docs component, a real button loading state, the checkbox layout-shift fix, form-field prefix/suffix, and svg-icon plus the five older libraries moved into `libs/ui`.

---

## 3. Current state

### 3.1 Entry points

| Entry point | Look comes from | Docs page | Tests |
|---|---|---|---|
| `@libs/ui/core` | `cva`, `cn`, `UI_CONFIG`, `UiFormFieldControl` | – | ✅ |
| `@libs/ui/button` | `btn-*` | ✅ | ✅ |
| `@libs/ui/input` (form field, input, textarea, prefix/suffix) | `input-*`, `textarea-*` | ✅ | ✅ |
| `@libs/ui/checkbox` (+ switch) | `checkbox-*`, `toggle-*` | ✅ | ✅ |
| `@libs/ui/radio` | `radio-*` (+ `data-checked`) | ✅ | ✅ |
| `@libs/ui/svg-icon` | SCSS + `icon-size-*` | ✅ | ✅ |
| `@libs/ui/dialog` | CDK Dialog + `btn`/`alert` + own keyframes | ✅ | ✅ |
| `@libs/ui/toast` | CDK Overlay + `alert`/`btn` | ✅ | ✅ |
| `@libs/ui/loader` | CDK Overlay + SCSS on tokens | ✅ | ✅ |
| `@libs/ui/date-picker` | Material port, SCSS on tokens | ✅ | ✅ |
| `@libs/ui/paginator` | `join`/`btn`/`select` | ✅ | ✅ |

### 3.2 Styling system (`@libs/ui/styles`)

| File | Contents |
|---|---|
| `tokens.css` | Semantic colors (light in `@theme`, dark in `@layer base`), `--icon-size-*` and the `icon-size-*` utility, the `dark` variant |
| `components/button.css` | `btn` + colors, styles (outline, dash, soft, ghost, link), sizes xs–xl, shapes |
| `components/form.css` | `form-control`, `label*`, `input-*`, `textarea-*`, `select-*` (incl. `-filled`) |
| `components/controls.css` | `checkbox-*`, `radio-*`, `toggle-*` |
| `components/alert.css` | `alert` + colors, soft/outline/dash, layouts |
| `components/layout.css` | `divider-*`, `join-*` |
| `components/navigation.css` | `menu-*`, `dropdown`, `modal-*` |

**Theming contract:** override tokens in an **unlayered** `:root` rule. That single rule wins in both light and dark mode. The app does this in `src/styles/_colors.css`, overriding only `--color-primary`, `--color-primary-content` and `--color-secondary`.

### 3.3 Docs app (`projects/docs`)

- 10 pages in 3 groups: Forms (Button, Form Field & Input, Checkbox & Switch, Radio Group, Date Picker); Overlays & Feedback (Dialog, Toast, Loader); Data & Media (Paginator, SVG Icon).
- Each page has a live playground, generated usage code (highlighted html/ts/css/scss/json) and an API table.
- The docs render the **library's neutral defaults**. The app's brand is not loaded there on purpose.

---

## 4. Roadmap scorecard

### Phase 1 — Must-have

| Item | Status | Notes |
|---|---|---|
| Button (variants, icon, loading) | ✅ | The CSS also supports `soft`, `dash`, `link`, `xs`, `xl`, `circle`, but `UiButtonVariant`/`UiButtonSize` don't expose them yet |
| Input, Textarea, Form Field (label/error/hint/prefix/suffix) | ✅ | |
| Checkbox, Radio, Switch | ✅ | |
| **Select (single)** | ❌ | Only a native `select` utility |
| **Multi-select** | ❌ | |
| Toast | ✅ | Works, on tokens, documented. Uses `@angular/animations`, so apps need an animations provider |
| Alert / Banner | 🟡 | `alert` utility only, no component |
| Spinner / Progress | 🟡 | The spinner is inline in button, and loader is full-screen only. No standalone `ui-spinner` or progress bar |
| Card, Badge, Avatar, Tag | ❌ | |
| Dialog / Modal | ✅ | CDK Dialog, confirm + layout, documented |
| **Tooltip** | ❌ | |
| **Popover** | ❌ | |
| Tabs | ❌ | An `@angular/aria` tabs example exists in the app, not in the library |
| **Menu / Dropdown** | 🟡 | `menu-*` / `dropdown` utilities only |
| Divider / Space | 🟡 | `divider` utility only |
| Icon | ✅ | |

**Phase 1: 6 done · 4 partial · 6 missing.**

### Phase 2 — High priority (already available)

| Item | Status |
|---|---|
| Date Picker | ✅ Works and documented. It's a Material port; no `@angular/aria` Grid review and no date range UI yet (range CSS exists) |
| Pagination | ✅ |
| Everything else in Phase 2 | ❌ |

### Foundations

| Item | Status |
|---|---|
| Design tokens | ✅ In `libs/ui`, with the override contract |
| Theme (light/dark) | ✅ |
| Icon system | ✅ |
| Typography utilities | ❌ |
| Focus / a11y helpers | 🟡 Per component; CDK a11y CSS is shipped |
| **Centralized Overlay service** | ❌ **This blocks the next four components** |
| Form utilities | ✅ `UiFormFieldControl` |
| Responsive utilities | ❌ |
| `@angular/aria` in the library | ❌ Installed, but no `libs/ui` component uses it yet |

---

## 5. Still open from the consolidation step

| Item | Why it matters |
|---|---|
| `cn()` has no `tailwind-merge` | Conflicting classes resolve by CSS order, not argument order. This will bite when consumers pass `class` overrides to components. |
| `uiInput` replaces a user-supplied `id` | The host binds `[id]` to an auto id, so `<input id="email" uiInput>` loses `email`. The docs input page shows it. |
| Button types don't expose all CSS variants | Easy win: add `soft`/`dash`/`link` and `xs`/`xl`/`circle` to the types. |
| Dangling `@libs/storage` path in `tsconfig.json` | `libs/storage` doesn't exist. |
| `libs/hotkeys` | Has a path in `tsconfig.json`, but isn't in `angular.json` and nothing imports it. Make it a project or remove it. |
| `styles/animate.css` build warning | The app still `<link>`s it from `src/index.html` for the splash screen; the library no longer needs it. |
| Deleted `docs/superpowers` plans/specs | They're deleted in your working tree but not committed. Commit the deletion or restore them. |

---

## 6. What to do next

1. **Quick wins (small, do first)**
   - Add `tailwind-merge` to `cn()` so user `class` overrides win predictably.
   - Fix the `uiInput` id override: respect an `id` input and fall back to the auto id.
   - Expose the remaining button variants and sizes in the types, plus the docs controls.
   - Housekeeping: tsconfig paths, `libs/hotkeys`, the plan/spec deletion.

2. **Overlay foundation** — `@libs/ui/overlay`, or put it in `core`:
   - position presets with fallbacks
   - scroll strategy
   - z-index layering
   - close on outside click / Escape

   Select, Tooltip, Popover and Menu all build on this. Toast, loader and date-picker can move onto it later.

3. **Select + Multi-select** (`@angular/aria` Combobox + Listbox on the overlay)
   - Implements `UiFormFieldControl`, so it works in `ui-form-field` with label, hint, error, prefix/suffix and `aria-invalid`.
   - `<ui-option>` projection, `compareWith`, disabled options, placeholder.
   - Multi-select needs a minimal **Tag**; build it here.
   - Docs page + tests (keyboard, forms, disabled).

4. **Tooltip + Popover** — thin wrappers on the overlay (`[uiTooltip]` directive; popover trigger + content template).

5. **Menu / Dropdown** — `@angular/aria` Menu on the overlay, reusing the `menu-*` / `dropdown` utilities.

6. **Presentational batch** — Card, Badge, Avatar, Tag (finish it), Alert component, `ui-spinner` (pull it out of button and reuse it in loader), Divider. Each is about an hour with the utility-first approach; each gets a docs page.

7. **Tabs** (`@angular/aria`, move the app example into the library) and an optional **brand toggle** in the docs header to preview app overrides.

Once step 7 is done, **Roadmap Phase 1 is complete**. Phase 2 then starts with Date Picker and Pagination already in hand.

---

## 7. Working notes

- **Rebuild before checking the docs.** The docs app and the host app resolve `@libs/ui/*` to the prebuilt `packages/ui` first. After changing library TS or templates, run `ng build ui` (and `ng build navigation`), then restart `ng serve`. A running dev server can keep serving stale code.
- **Build order.** `yarn build:libs` builds `ui` before `navigation`, because navigation depends on `@libs/ui/svg-icon`.
- **Where to theme.** Brand changes go in `src/styles/_colors.css` (unlayered `:root`), never in `libs/ui/styles/tokens.css`.
