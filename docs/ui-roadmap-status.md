# `@libs/ui` — Roadmap Status & Next Steps

_Snapshot: 2026-09-28, branch `feat/tooltip`, after Tooltip & Tabs implementation & review._
_Sources: `.idea/roadmap.md` (the plan) and `.idea/ui-progress-and-next-steps.md` (the earlier review)._

---

## 1. Summary

The consolidation and presentational phases are completed:

- **One package:** everything lives in `libs/ui` as secondary entry points. Nothing depends on the host app.
- **One styling approach:** every component takes its look from shared CSS utilities (CVA + tokens).
- **Self-contained tokens:** `libs/ui` ships neutral defaults. The app overrides only its brand colors.
- **Everything documented and tested:** all 20 entry points have a docs page and tests (44 test files, 247 tests, all passing).

Phase 1 navigation components are now completed: **Tooltip**, **Tabs**, and **Menu / Dropdown**.

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
| `b2ca891` | Add basic UI components: `ui-select` (single + multi-select with search, option groups, label caching, tags, and CDK overlay). |
| `fb1080e` | Feedback & Data Display batch: `ui-alert`, `ui-spinner`, `ui-progress-bar`, `ui-card`, `ui-badge`, `ui-avatar`, `ui-tag`, corresponding CSS utilities and docs pages. |
| `5cfb49c` | Tooltip feature package: `[uiTooltip]` directive on CDK Overlay, auto-flip collision detection, rich templates, interactive transit buffer, pointer arrow, docs playground, and 203 passing tests. |
| `478143a` | Tabs feature package: compound directives on `@angular/aria/tabs` (`[uiTabs]`, `[uiTabList]`, `[uiTab]`, `[uiTabPanel]`, `[uiTabContent]`), CVA variants (`bordered`, `lift`, `pill`), responsive sizes, vertical layouts, lazy content deferral, docs playground, and 223 passing tests. |
| `06d6a60` | Menu / Dropdown feature package: compound directives on CDK Overlay (`[uiMenuTriggerFor]`, `[uiMenu]`, `[uiMenuItem]`, `[uiMenuDivider]`, `[uiMenuLabel]`), auto-flipping, WAI-ARIA roving tabindex, focus management, danger/disabled items, docs playground, and 247 passing tests. |
| _(feat/table)_ | Table feature package: `ui-table` with a headless signal store, sorting, list/custom filters, key-based selection kept across pages, pagination, sticky header, fixed columns, density, loading/empty states, and a docs page with full and server-mode examples. |


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
| `@libs/ui/select` (single + multi) | `@angular/aria` + CDK Overlay + `select-*` | ✅ | ✅ |
| `@libs/ui/alert` | `alert-*` + tokens | ✅ | ✅ |
| `@libs/ui/progress` (spinner, progress bar) | `spinner`, `progress-bar` | ✅ | ✅ |
| `@libs/ui/card` | `card-*` | ✅ | ✅ |
| `@libs/ui/badge` | `badge-*` | ✅ | ✅ |
| `@libs/ui/avatar` | `avatar-*` | ✅ | ✅ |
| `@libs/ui/tag` | `tag-*` | ✅ | ✅ |
| `@libs/ui/tooltip` | `tooltip`, `tooltip-*`, `tooltip-arrow` | ✅ | ✅ |
| `@libs/ui/tabs` | `tabs`, `tabs-*`, `tab-*` | ✅ | ✅ |
| `@libs/ui/menu` | `menu`, `menu-*` + CDK Overlay | ✅ | ✅ |
| `@libs/ui/svg-icon` | SCSS + `icon-size-*` | ✅ | ✅ |
| `@libs/ui/dialog` | CDK Dialog + `btn`/`alert` + own keyframes | ✅ | ✅ |
| `@libs/ui/toast` | CDK Overlay + `alert`/`btn` | ✅ | ✅ |
| `@libs/ui/loader` | CDK Overlay + SCSS on tokens | ✅ | ✅ |
| `@libs/ui/date-picker` | Material port, SCSS on tokens | ✅ | ✅ |
| `@libs/ui/paginator` | `join`/`btn`/`select` | ✅ | ✅ |
| `@libs/ui/table` | `data-table-*` + CDK Overlay/A11y | ✅ | ✅ |


### 3.2 Styling system (`@libs/ui/styles`)

| File | Contents |
|---|---|
| `tokens.css` | Semantic colors (light in `@theme`, dark in `@layer base`), `--icon-size-*` and the `icon-size-*` utility, the `dark` variant |
| `components/button.css` | `btn` + colors, styles (outline, dash, soft, ghost, link), sizes xs–xl, shapes |
| `components/form.css` | `form-control`, `label*`, `input-*`, `textarea-*`, `select-*` (incl. `-filled`) |
| `components/controls.css` | `checkbox-*`, `radio-*`, `toggle-*` |
| `components/select.css` | `select-*` container, options, search input, tag wrappers |
| `components/alert.css` | `alert` + colors, soft/outline/dash, layouts |
| `components/progress.css` | `spinner`, `progress-bar` determinate / indeterminate |
| `components/card.css` | `card` + border, shadow, part directives |
| `components/badge.css` | `badge` + colors, sizes, anchor placement |
| `components/avatar.css` | `avatar` + shapes, sizes, initials, `avatar-group` |
| `components/tag.css` | `tag` + colors, removable, checkable |
| `components/tooltip.css` | `tooltip` container, sizes, arrow, interactive, placement offsets |
| `components/tabs.css` | `tabs` base, variants (`bordered`, `lift`, `pill`), items, sizing, orientation, panel |
| `components/table.css` | `data-table` container, densities, bordered/striped, row states, sort/filter header, fixed columns, loading mask, skeleton, empty state |
| `components/layout.css` | `divider-*`, `join-*` |
| `components/navigation.css` | `menu-*`, `dropdown`, `modal-*` |

**Theming contract:** override tokens in an **unlayered** `:root` rule. That single rule wins in both light and dark mode. The app does this in `src/styles/_colors.css`, overriding only `--color-primary`, `--color-primary-content` and `--color-secondary`.

### 3.3 Docs app (`projects/docs`)

- 21 pages in 4 groups: Navigation (Tabs, Menu / Dropdown); Forms (Button, Form Field & Input, Checkbox & Switch, Radio Group, Select, Date Picker); Overlays & Feedback (Alert, Dialog, Toast, Loader, Spinner & Progress, Tooltip); Data & Media (Avatar, Badge, Card, Paginator, SVG Icon, Table, Tag).
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
| **Select (single)** | ✅ | `ui-select` on `@angular/aria` combobox + listbox and a CDK overlay |
| **Multi-select** | ✅ | `ui-select multiple` with removable tags |
| Toast | ✅ | Works, on tokens, documented. Uses `@angular/animations`, so apps need an animations provider |
| Alert / Banner | ✅ | `ui-alert` (soft/outline/dash/solid, banner, actions, dismiss) |
| Spinner / Progress | ✅ | `ui-spinner` (circular, determinate or not) and `ui-progress-bar`; button uses the shared `spinner` utility |
| Card, Badge, Avatar, Tag | ✅ | `ui-card` + parts, `ui-badge` / `[uiBadge]`, `ui-avatar` / `ui-avatar-group`, `ui-tag` (removable, checkable) |
| Dialog / Modal | ✅ | CDK Dialog, confirm + layout, documented |
| **Tooltip** | ✅ | `[uiTooltip]` directive on CDK Overlay, auto-flip collision detection, rich templates, interactive transit buffer, pointer arrow |
| **Popover** | ❌ | |
| Tabs | ✅ | Compound directives on `@angular/aria/tabs` (`uiTabs`, `uiTabList`, `uiTab`, `uiTabPanel`, `uiTabContent`), CVA variants (`bordered`, `lift`, `pill`), vertical layout, lazy content deferral |
| **Menu / Dropdown** | ✅ | Compound directives on CDK Overlay (`uiMenuTriggerFor`, `uiMenu`, `uiMenuItem`, `uiMenuDivider`, `uiMenuLabel`), WAI-ARIA roving tabindex, focus management, danger/disabled items |
| Divider / Space | 🟡 | `divider` utility only |
| Icon | ✅ | |

**Phase 1: 14 done · 1 partial · 1 missing.**

### Phase 2 — High priority (already available)

| Item | Status |
|---|---|
| Date Picker | ✅ Works and documented. It's a Material port; no `@angular/aria` Grid review and no date range UI yet (range CSS exists) |
| Pagination | ✅ |
| Table | ✅ `@libs/ui/table`: sorting, filters, selection, pagination, sticky header, fixed columns |
| Everything else in Phase 2 | ❌ |

### Foundations

| Item | Status |
|---|---|
| Design tokens | ✅ In `libs/ui`, with the override contract |
| Theme (light/dark) | ✅ |
| Icon system | ✅ |
| Typography utilities | ❌ |
| Focus / a11y helpers | 🟡 Per component; CDK a11y CSS is shipped |
| Centralized Overlay foundation | 🟡 In progress / used in `ui-select`, `dialog`, `toast`, `loader`, `ui-tooltip` |
| Form utilities | ✅ `UiFormFieldControl` |
| Responsive utilities | ❌ |
| `@angular/aria` in the library | ✅ Used in `ui-select` (Combobox + Listbox) and `tabs` (Tabs) |

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

1. **Select + Multi-select** ✅ (`@angular/aria` Combobox + Listbox on CDK overlay, tag chips, search, docs + tests).
2. **Presentational batch** ✅ (Alert, Spinner / Progress bar, Card, Badge, Avatar, Tag, docs + tests).
3. **Tooltip** ✅ (`[uiTooltip]` directive on CDK overlay, hover/focus triggers, positions, delay, transit buffer, arrow, styles, docs + tests).
4. **Tabs** ✅ (`@libs/ui/tabs` compound directives on `@angular/aria/tabs`, variants, docs + tests).
5. **Menu / Dropdown** ⏳ (Next up: `@angular/aria/menu` or CDK menu on overlay, reusing `menu-*` / `dropdown` utilities).
6. **Divider / Space polish** ⏳ (Wrap utility into component/part if needed).

Once steps 4–5 are done, **Roadmap Phase 1 is complete** (except Popover). Phase 2 then starts with Date Picker and Pagination already in hand.


---

## 7. Working notes

- **Rebuild before checking the docs.** The docs app and the host app resolve `@libs/ui/*` to the prebuilt `packages/ui` first. After changing library TS or templates, run `ng build ui` (and `ng build navigation`), then restart `ng serve`. A running dev server can keep serving stale code.
- **Build order.** `yarn build:libs` builds `ui` before `navigation`, because navigation depends on `@libs/ui/svg-icon`.
- **Where to theme.** Brand changes go in `src/styles/_colors.css` (unlayered `:root`), never in `libs/ui/styles/tokens.css`.
