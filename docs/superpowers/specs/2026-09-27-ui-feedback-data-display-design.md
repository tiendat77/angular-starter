# Feedback & Data Display — Alert, Spinner / Progress, Card, Badge, Avatar, Tag

_Status: draft, awaiting spec review · 2026-09-27_
_Roadmap: Phase 1 "Alert / Banner", "Spinner / Progress (circular + linear)", "Card, Badge, Avatar, Tag / Chip" (`.idea/roadmap.md`, `docs/ui-roadmap-status.md` §4 and §6 step 6)_

---

## 1. Goal

Add the remaining presentational Phase 1 components to `@libs/ui`:

| Component | Entry point | Selector(s) |
|---|---|---|
| Alert / Banner | `@libs/ui/alert` | `ui-alert` |
| Spinner (circular) + Progress bar (linear) | `@libs/ui/progress` | `ui-spinner`, `ui-progress-bar` |
| Card | `@libs/ui/card` | `ui-card` / `[uiCard]` + part directives |
| Badge | `@libs/ui/badge` | `ui-badge`, `[uiBadge]` |
| Avatar | `@libs/ui/avatar` | `ui-avatar`, `ui-avatar-group` |
| Tag / Chip | `@libs/ui/tag` | `ui-tag` |

All of them are presentational: no CDK Overlay, no `@angular/aria`. They follow the library convention set by `btn` and `input`: **the look lives in `@utility` CSS driven by custom properties; the component only picks class names through `cva`**. The same classes stay usable without Angular.

### Decisions (proposed — confirm in review)

| Topic | Decision |
|---|---|
| Shared color scale | New `UiColor = 'neutral' \| 'primary' \| 'info' \| 'success' \| 'warning' \| 'error'` in `@libs/ui/core`, used by alert, progress, badge, tag |
| Spinner vs progress circle | One component, Material style: `ui-spinner` is indeterminate by default and becomes a determinate ring when `value` is set |
| Linear progress | `ui-progress-bar`; indeterminate when `value` is `null` |
| Button spinner | Button keeps no dependency on `@libs/ui/progress`; both use a new `spinner` CSS utility |
| Badge vs Tag | **Badge** = count / dot indicator (inline `ui-badge`, or overlaid on another element with `[uiBadge]`). **Tag** = text label chip (color, removable, checkable). There is no separate "label badge"; use `ui-tag` |
| Chip | `ui-tag` covers "chip" (removable, checkable). Chip grid / chip input (keyboard-navigable set bound to a form value) is **out of scope** |
| Card | Attribute-friendly directive (`ui-card` element or `[uiCard]` on `<article>`, `<a>`, `<button>`) with part directives, no wrapper markup |
| Alert dismissal | `dismissible` + two-way `open` model; the alert doesn't remove itself from the DOM, it hides and emits |
| Banner | `ui-alert banner` modifier: full width, square corners, no side borders; placement is the consumer's job |
| Icons | Inline SVG in templates (like the `ui-select` clear icon), not the `svg-icon` registry, so the entry points stay dependency-free |
| `ui-select` tags | Unchanged in v1 — it keeps the `tag tag-sm` utility classes, which stay backward compatible |
| Loader | Unchanged in v1; moving `@libs/ui/loader` onto `ui-spinner` is a follow-up |

---

## 2. Foundations

### 2.1 `@libs/ui/core` additions

```ts
// core/src/types/color.type.ts
export type UiColor = 'neutral' | 'primary' | 'info' | 'success' | 'warning' | 'error';
```

`UiSize` (`xs | sm | md | lg | xl`) already exists and is reused. Each component documents which sizes it supports; unsupported ones are not in its type (narrowed with `Extract<UiSize, …>`).

No new `UI_CONFIG` keys in v1. Defaults fall back to `UI_CONFIG.defaultSize ?? 'md'` where a size exists, like `ui-select`.

### 2.2 Shared CSS pattern

Every new utility follows `alert.css`:

- The color modifier sets one variable (`--x-color: var(--color-info)`).
- The style modifier (`soft` / `outline` / `solid`) decides how it is applied via `color-mix()` over tokens.
- The size modifier only sets `--x-size`, `--x-fs`, `--x-p`.

That keeps modifiers order-independent and lets brand overrides flow through `--color-*`.

### 2.3 New / changed CSS files

```
libs/ui/styles/components/progress.css   spinner, progress-ring, progress-bar
libs/ui/styles/components/alert.css      + alert-title, alert-description, alert-actions, alert-close, alert-banner, alert-solid
libs/ui/styles/components/card.css       card + parts
libs/ui/styles/components/badge.css      badge, badge-anchor, badge-dot, positions
libs/ui/styles/components/avatar.css     avatar, avatar-group
libs/ui/styles/components/tag.css        + colors, styles, tag-lg, tag-checkable, tag-icon (existing classes unchanged)
libs/ui/styles/index.css                 import the new files
```

All animations respect `@media (prefers-reduced-motion: reduce)` (§3.4).

---

## 3. Spinner & Progress bar — `@libs/ui/progress`

### 3.1 Usage

```html
<ui-spinner />                                   <!-- 1em, currentColor, indeterminate -->
<ui-spinner size="lg" color="primary" label="Loading orders" />
<ui-spinner [value]="uploaded()" size="xl" showValue />   <!-- determinate ring, "42%" in the center -->

<ui-progress-bar [value]="42" color="success" label="Upload" />
<ui-progress-bar color="primary" />              <!-- indeterminate -->
```

### 3.2 `UiSpinner` — `ui-spinner`

| Member | Type | Default | Purpose |
|---|---|---|---|
| `value` | `number \| null` | `null` | `null` → indeterminate (rotating arc); a number → determinate ring |
| `max` | `number` | `100` | |
| `size` | `UiSize \| 'inherit'` | `'inherit'` | `inherit` = `1em`, so it scales with the surrounding text; `xs`–`xl` = 12/16/24/32/48px |
| `strokeWidth` | `number \| null` | `null` | Defaults per size (scaled from the SVG viewBox) |
| `color` | `UiColor \| 'current'` | `'current'` | `current` uses `currentColor` |
| `showValue` | `boolean` | `false` | Renders the rounded percentage in the center (determinate only; ignored below `lg`) |
| `label` | `string` | `'Loading'` | `aria-label` |

Markup: one SVG, `viewBox="0 0 24 24"`, a track circle and an indicator circle.

- **Determinate:** `stroke-dasharray` = circumference; `stroke-dashoffset` computed from the percentage. Starts at 12 o'clock (`rotate(-90deg)`). Transition on `stroke-dashoffset`.
- **Indeterminate:** the indicator rotates (`ui-spin`) and its dash length oscillates (`ui-spinner-dash`), Material-like. The track is hidden.

Host a11y: `role="progressbar"`, `aria-label`, and, in determinate mode only, `aria-valuemin="0"`, `aria-valuemax`, `aria-valuenow`.

### 3.3 `UiProgressBar` — `ui-progress-bar`

| Member | Type | Default | Purpose |
|---|---|---|---|
| `value` | `number \| null` | `null` | `null` → indeterminate |
| `max` | `number` | `100` | |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Track height 4 / 8 / 12px |
| `color` | `UiColor` | `'primary'` | |
| `label` | `string` | `'Progress'` | `aria-label` |

- Track `progress-bar`, fill `progress-bar-fill` with `transform: scaleX(pct)` (GPU-friendly, `transform-origin: left`, flipped in RTL via `:dir(rtl)`).
- Indeterminate: the fill is a 40% segment sliding across (`ui-progress-indeterminate`).
- Same `role="progressbar"` / `aria-*` rules as the spinner.
- A visible label or percentage is the consumer's markup (keeps the component a single bar); the docs show the pattern.

### 3.4 Shared behavior

- `clampProgress(value, max): number` (pure, exported from the entry point for tests): returns a percentage in `[0, 100]`; `max <= 0` or `NaN` → `0`.
- **Reduced motion:** the indeterminate spinner keeps rotating but slower (1.5 s → 3 s) and stops the dash oscillation; the indeterminate bar becomes a static 40% segment with a pulsing opacity. Determinate transitions are removed.

### 3.5 CSS utilities (`progress.css`)

| Utility | Purpose |
|---|---|
| `spinner` | The minimal border spinner used by `uiButton` (`1em`, `border-2 border-current border-r-transparent`, `animate-spin`). Replaces the inline class string in the button template |
| `spinner-{xs…xl}`, `spinner-{color}` | Sizing / color for `ui-spinner` via `--spinner-size`, `--spinner-color` |
| `progress-bar`, `progress-bar-fill`, `progress-bar-{sm,md,lg}`, `progress-bar-{color}`, `progress-bar-indeterminate` | Linear bar |

### 3.6 Button migration

`UiButtonComponent`'s template swaps the inline class list for `<span class="spinner" aria-hidden="true">`. `button.spec.ts` currently asserts on `.animate-spin`; update it to `.spinner`. No visual change.

---

## 4. Alert / Banner — `@libs/ui/alert`

### 4.1 Usage

```html
<ui-alert color="warning">
  <span uiAlertTitle>Your trial ends in 3 days</span>
  Upgrade to keep your projects.
  <div uiAlertActions>
    <button uiButton size="sm">Upgrade</button>
  </div>
</ui-alert>

<ui-alert color="error" appearance="outline" dismissible [(open)]="showError">
  Payment failed.
</ui-alert>

<!-- banner at the top of a page -->
<ui-alert banner color="info" dismissible>Scheduled maintenance on Sunday.</ui-alert>

<!-- custom icon / no icon -->
<ui-alert color="success"><svg uiAlertIcon>…</svg> Saved.</ui-alert>
<ui-alert [icon]="false">Plain note.</ui-alert>
```

### 4.2 `UiAlert` — `ui-alert`

| Member | Type | Default | Purpose |
|---|---|---|---|
| `color` | `UiColor` | `'neutral'` | Maps to `alert-{color}` |
| `appearance` | `'soft' \| 'outline' \| 'dash' \| 'solid'` | `'soft'` | `solid` is a new utility: `--alert-bg: var(--alert-color)`, text `--color-{color}-content` |
| `icon` | `boolean` | `true` | Show the default icon for the color (neutral has none). A projected `[uiAlertIcon]` always wins |
| `banner` | `boolean` | `false` | `alert-banner`: `border-radius: 0`, no inline borders, full width |
| `dismissible` | `boolean` | `false` | Renders a close button |
| `closeLabel` | `string` | `'Dismiss'` | Close button `aria-label` |
| `open` | `model<boolean>` | `true` | When `false` the host gets `hidden`; two-way bindable |
| `role` | `'alert' \| 'status' \| 'none' \| null` | `null` | `null` = auto: `alert` for `error` / `warning`, `status` otherwise. `none` for purely static notes |
| `(closed)` | `OutputEmitterRef<void>` | | Emitted after the close button sets `open` to `false` |

Part directives (selector only, class via host binding):

| Directive | Class | Notes |
|---|---|---|
| `[uiAlertTitle]` | `alert-title` | `font-weight: 600`; rendered in the body column above the description |
| `[uiAlertIcon]` | – | Replaces the default icon slot |
| `[uiAlertActions]` | `alert-actions` | Row of actions under the description (`flex gap-2 mt-2`) |

### 4.3 Template outline

```html
<!-- host: class="alert alert-horizontal alert-{color} alert-{appearance} [alert-banner]" -->
<div class="alert-icon">
  <ng-content select="[uiAlertIcon]">
    @if (icon() && defaultIcon()) { <svg aria-hidden="true">…per color…</svg> }
  </ng-content>
</div>
<div class="alert-description">
  <ng-content select="[uiAlertTitle]" />
  <ng-content />
  <ng-content select="[uiAlertActions]" />
</div>
@if (dismissible()) {
  <button type="button" class="alert-close" [attr.aria-label]="closeLabel()" (click)="close()">
    <svg aria-hidden="true"><!-- x --></svg>
  </button>
}
```

- `alert-horizontal` already produces `auto minmax(auto, 1fr)` columns with column flow; the close button takes an implicit `auto` column. The icon column collapses when empty (`.alert-icon:empty { display: none }`).
- Default icons are the same four paths used by `@libs/ui/toast` (info, success, warning, error), sized by the existing `.alert svg` rule.
- Title and message are plain projected content; nothing is bound through `innerHTML`.

### 4.4 Behavior

- Clicking close sets `open` to `false` and emits `(closed)`. Setting `open` back to `true` shows it again.
- No enter/leave animation in v1 (avoids the `@angular/animations` dependency that toast has); consumers can wrap it in `@if` with `animate.enter` / `animate.leave` themselves.
- Focus: the close button is a native `<button>`; if it had focus when the alert hides, focus is not managed (documented; the consumer decides where it goes).

---

## 5. Card — `@libs/ui/card`

### 5.1 Usage

```html
<ui-card>
  <img uiCardMedia src="cover.jpg" alt="" />
  <div uiCardHeader>
    <h3 uiCardTitle>Project Alpha</h3>
    <p uiCardDescription>Updated 2 hours ago</p>
    <button uiButton variant="ghost" size="icon" uiCardAction aria-label="More">⋯</button>
  </div>
  <div uiCardContent>…</div>
  <div uiCardFooter>
    <button uiButton variant="outline">Cancel</button>
    <button uiButton>Open</button>
  </div>
</ui-card>

<!-- whole card as a link -->
<a uiCard interactive routerLink="/projects/1">…</a>
```

### 5.2 `UiCard` — `ui-card, [uiCard]` (directive)

| Input | Type | Default | Purpose |
|---|---|---|---|
| `appearance` | `'outline' \| 'elevated' \| 'filled'` | `'outline'` | Border only / border + shadow / muted surface, no border |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Sets `--card-p` (0 / 12 / 24 / 32px) used by every part |
| `interactive` | `boolean` | `false` | Hover surface + shadow, `cursor: pointer`, visible focus ring (`focus-visible`). Automatic for `<a>` and `<button>` hosts |

It's a directive so it can sit on semantic hosts (`article`, `section`, `a`, `button`) without wrapper markup. `ui-card` as an element is a convenience and gets `display: flex; flex-direction: column`.

### 5.3 Part directives

| Directive | Class | Layout |
|---|---|---|
| `[uiCardHeader]` | `card-header` | Grid: title/description in column 1, `[uiCardAction]` pinned to the top-right |
| `[uiCardTitle]` | `card-title` | `font-semibold leading-none` |
| `[uiCardDescription]` | `card-description` | `text-sm text-muted-foreground` |
| `[uiCardAction]` | `card-action` | `grid-column: 2; grid-row: 1 / span 2; justify-self: end` |
| `[uiCardContent]` | `card-content` | Padding `--card-p` inline, flows between header and footer |
| `[uiCardFooter]` | `card-footer` | `flex items-center gap-2`, end-aligned by default |
| `[uiCardMedia]` | `card-media` | Full bleed (no padding), inherits the card's top radius when first child (`overflow: clip` on the card) |

Spacing uses `gap: var(--card-p)` on the card plus `padding-inline` on parts, so parts can be omitted in any combination without doubled spacing.

---

## 6. Badge — `@libs/ui/badge`

### 6.1 Usage

```html
<!-- inline count -->
Inbox <ui-badge [count]="12" />

<!-- overlaid on another element -->
<button uiButton variant="ghost" size="icon" aria-label="Notifications"
        [uiBadge]="unread()" uiBadgeColor="error" [uiBadgeMax]="99"
        uiBadgeDescription="{{ unread() }} unread notifications">
  <svg>…bell…</svg>
</button>

<ui-avatar name="Linh Tran" uiBadge uiBadgeDot uiBadgeColor="success" uiBadgePosition="bottom-end" />
```

### 6.2 `UiBadge` — `ui-badge` (inline)

| Input | Type | Default | Purpose |
|---|---|---|---|
| `count` | `number \| string \| null` | `null` | Content; numbers go through `formatBadgeCount` |
| `max` | `number` | `99` | `count > max` shows `"{max}+"` |
| `showZero` | `boolean` | `false` | `0` is hidden unless set |
| `dot` | `boolean` | `false` | 8px dot, no text |
| `color` | `UiColor` | `'error'` | Solid fill with `--color-{color}-content` text |
| `size` | `'sm' \| 'md'` | `'md'` | Height 16 / 20px |

When there's nothing to show (null, or 0 without `showZero`, and not `dot`) the host gets `hidden`.

### 6.3 `UiBadgeAnchor` — `[uiBadge]` (overlay)

| Input | Type | Default |
|---|---|---|
| `uiBadge` | `number \| string \| null \| ''` | `null` (attribute-only usage = dot or empty) |
| `uiBadgeMax`, `uiBadgeShowZero`, `uiBadgeDot`, `uiBadgeColor`, `uiBadgeSize` | as above | as above |
| `uiBadgePosition` | `'top-end' \| 'top-start' \| 'bottom-end' \| 'bottom-start'` | `'top-end'` |
| `uiBadgeOverlap` | `'rectangular' \| 'circular'` | `'rectangular'`; `circular` insets the badge by ~14% for round hosts (avatars, icon buttons) |
| `uiBadgeHidden` | `boolean` | `false` |
| `uiBadgeDescription` | `string` | `''` |

- The directive adds `badge-anchor` (`position: relative`) to the host and appends one `<span class="badge …" aria-hidden="true">` with `Renderer2` (Material's `matBadge` approach). The span is created once and updated from an `effect()`; it's removed in `DestroyRef.onDestroy`.
- The visible badge is decorative. Accessibility comes from `uiBadgeDescription`, registered on the host with CDK `AriaDescriber` (`aria-describedby`), updated when it changes and removed on destroy.
- Hosts that are replaced elements (`<img>`, `<input>`) can't have children: the directive throws a dev-mode error telling the consumer to wrap them.
- Hosts with `overflow: hidden` clip the badge; documented, not worked around.

### 6.4 Helper

```ts
/** "5" · 120 with max 99 → "99+" · strings pass through · null / negative → "" */
export function formatBadgeCount(count: number | string | null, max: number, showZero: boolean): string;
```

---

## 7. Avatar — `@libs/ui/avatar`

### 7.1 Usage

```html
<ui-avatar src="/u/42.jpg" name="Nguyễn Văn An" />      <!-- image; "NA" if it fails -->
<ui-avatar name="Linh Tran" size="lg" shape="square" />
<ui-avatar />                                             <!-- generic user icon -->
<ui-avatar><svg>…team icon…</svg></ui-avatar>             <!-- custom fallback -->

<ui-avatar-group [max]="3" size="sm">
  @for (u of members; track u.id) { <ui-avatar [src]="u.avatar" [name]="u.name" /> }
</ui-avatar-group>
```

### 7.2 `UiAvatar` — `ui-avatar`

| Input | Type | Default | Purpose |
|---|---|---|---|
| `src` | `string \| null` | `null` | Image URL |
| `alt` | `string \| null` | `null` | Falls back to `name`; `''` for decorative |
| `name` | `string \| null` | `null` | Initials fallback and default accessible name |
| `size` | `UiSize` | group size ?? `'md'` | 24 / 32 / 40 / 48 / 64px |
| `shape` | `'circle' \| 'square'` | `'circle'` | `square` uses `rounded-md` scaled with size |

Fallback chain, evaluated as a `computed`:

1. **image** — `src` set and not failed. `(error)` on the `<img>` flips a `failed` signal; changing `src` resets it.
2. **initials** — `name` gives at least one initial.
3. **projected content** — if present (`<ng-content>` inside the fallback slot).
4. **default icon** — inline user SVG.

While the image is loading, the initials/icon fallback stays underneath (the `<img>` is absolutely positioned and fades in on `load`), so there's no layout shift and no empty circle on slow networks.

A11y: the host is `role="img"` with `aria-label` = `alt ?? name` when showing initials/icon; when the `<img>` is showing, the `<img alt>` carries it and the host has no role. `alt=""` makes everything `aria-hidden`.

### 7.3 `getInitials(name: string): string`

- Split on whitespace; first letter of the first word + first letter of the last word, upper-cased with `toLocaleUpperCase()`.
- One word → its first letter. Empty / whitespace → `''`.
- Uses `Intl.Segmenter` (grapheme) when available so combined characters (Vietnamese "Đ", "Ễ", emoji) aren't split; falls back to `Array.from()`.
- Examples: `"Nguyễn Văn An"` → `"NA"`, `"linh"` → `"L"`, `"  "` → `""`.

### 7.4 `UiAvatarGroup` — `ui-avatar-group`

| Input | Type | Default | Purpose |
|---|---|---|---|
| `max` | `number \| null` | `null` | Avatars beyond `max` are hidden and replaced by a "+N" avatar |
| `size` | `UiSize` | `'md'` | Applied to every child that doesn't set its own |
| `shape` | `'circle' \| 'square'` | `'circle'` | Same |

- Provides `UI_AVATAR_GROUP` (size, shape, visible-index logic). Each `UiAvatar` injects it optionally and computes `hiddenByGroup` from its index in the group's `contentChildren(UiAvatar)`.
- Children overlap with `margin-inline-start: calc(var(--avatar-size) * -0.25)` and a 2px ring in `--color-background`.
- The "+N" item is an `avatar` span with `aria-label="{N} more"`. The group host is `role="group"`.

---

## 8. Tag / Chip — `@libs/ui/tag`

### 8.1 Usage

```html
<ui-tag>Draft</ui-tag>
<ui-tag color="success" appearance="soft">Paid</ui-tag>
<ui-tag color="primary" size="lg"><svg uiTagIcon>…</svg> Design</ui-tag>

<!-- removable chip -->
@for (f of filters(); track f) {
  <ui-tag removable (removed)="drop(f)">{{ f }}</ui-tag>
}

<!-- checkable (toggle) chip -->
<ui-tag checkable [(checked)]="onlyMine">Only mine</ui-tag>
```

### 8.2 `UiTag` — `ui-tag`

| Member | Type | Default | Purpose |
|---|---|---|---|
| `color` | `UiColor` | `'neutral'` | `neutral` = the current `tag` look (muted surface + border), so `ui-select` looks unchanged |
| `appearance` | `'soft' \| 'outline' \| 'solid'` | `'soft'` | |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | `tag-sm` / `tag-md` / new `tag-lg` (2rem, 0.875rem text) |
| `removable` | `boolean` | `false` | Renders a remove button (inline SVG ×) |
| `removeLabel` | `string` | `'Remove'` | Remove button `aria-label` is `"{removeLabel} {text content}"` |
| `checkable` | `boolean` | `false` | Toggle chip |
| `checked` | `model<boolean>` | `false` | Checkable state |
| `disabled` | `boolean` | `false` | Disables remove / toggle, dims the tag |
| `(removed)` | `OutputEmitterRef<void>` | | The tag does not hide itself; the consumer removes it from its list |

Part: `[uiTagIcon]` — leading icon / avatar slot, sized to `--tag-fs` + 2px.

### 8.3 Behavior and a11y

- **Plain tag:** a non-interactive `<span>`-like host; no role.
- **Removable:** the × is a native `<button type="button">`. When the tag itself is focused (it isn't by default) nothing happens; keyboard users reach the × by Tab. `Backspace` / `Delete` on the × also removes (matches chip conventions).
- **Checkable:** the host becomes the control: `role="button"`, `tabindex="0"` (or `-1` when disabled), `aria-pressed`, toggled by click, Enter and Space (Space prevents page scroll). Checked uses the `solid` look of its color; unchecked uses `outline`.
- `removable` and `checkable` are mutually exclusive: a dev-mode error is thrown if both are set (a button inside a button-role element is invalid).
- The text used in the remove label is read from the host's `textContent` at click/render time, trimmed, minus the icon slot.

### 8.4 CSS changes (`tag.css`)

Existing `tag`, `tag-sm`, `tag-md`, `tag-remove` keep their current output byte-for-byte when no new modifier is present. Additions:

| Utility | Effect |
|---|---|
| `tag-{color}` | Sets `--tag-color` (and `--tag-content` for solid) |
| `tag-soft` / `tag-outline` / `tag-solid` | `color-mix()` of `--tag-color` for bg/border/text, like `alert` |
| `tag-lg` | Size |
| `tag-checkable` | `cursor: pointer`, hover, `focus-visible` ring, `[aria-pressed='true']` look |
| `tag-disabled` | `opacity: .5; pointer-events: none` on the interactive parts |

---

## 9. Files

```
libs/ui/core/src/types/color.type.ts                  UiColor (+ export from core public-api)

libs/ui/progress/  ng-package.json, src/public-api.ts
  src/spinner.component.ts                            UiSpinner
  src/progress-bar.component.ts                       UiProgressBar
  src/progress.utils.ts                               clampProgress
  src/progress.variants.ts
  src/*.spec.ts
libs/ui/alert/     ng-package.json, src/public-api.ts
  src/alert.component.ts (+ .html)                    UiAlert
  src/alert-parts.directive.ts                        UiAlertTitle, UiAlertIcon, UiAlertActions
  src/alert-icons.ts                                  default icon paths per color
  src/alert.variants.ts, src/alert.spec.ts
libs/ui/card/      ng-package.json, src/public-api.ts
  src/card.directive.ts                               UiCard
  src/card-parts.directive.ts                         UiCardHeader/Title/Description/Action/Content/Footer/Media
  src/card.variants.ts, src/card.spec.ts
libs/ui/badge/     ng-package.json, src/public-api.ts
  src/badge.component.ts                              UiBadge
  src/badge-anchor.directive.ts                       UiBadgeAnchor
  src/badge.utils.ts                                  formatBadgeCount
  src/badge.variants.ts, src/*.spec.ts
libs/ui/avatar/    ng-package.json, src/public-api.ts
  src/avatar.component.ts (+ .html)                   UiAvatar
  src/avatar-group.component.ts                       UiAvatarGroup
  src/avatar.tokens.ts                                UI_AVATAR_GROUP
  src/initials.ts                                     getInitials
  src/avatar.variants.ts, src/*.spec.ts
libs/ui/tag/       ng-package.json, src/public-api.ts
  src/tag.component.ts (+ .html)                      UiTag
  src/tag-icon.directive.ts                           UiTagIcon
  src/tag.variants.ts, src/tag.spec.ts

libs/ui/button/src/button.component.ts                spinner utility class
libs/ui/button/src/button.spec.ts                     assert `.spinner`
libs/ui/styles/components/{progress,card,badge,avatar}.css   new
libs/ui/styles/components/{alert,tag}.css                    extended
libs/ui/styles/index.css                              imports
libs/ui/src/public-api.ts                             export * from the six new entry points
projects/docs/src/app/features/{alert,progress,card,badge,avatar,tag}-doc/*   + routes + sidebar
packages/ui                                           rebuilt
```

Components use `ChangeDetectionStrategy.OnPush`, signal `input()` / `model()` / `output()`, `booleanAttribute` / `numberAttribute` transforms, and `host: { '[class]': 'hostClass()' }` from a `cva` in `*.variants.ts`, matching `UiButtonComponent`.

---

## 10. Testing (Vitest, jsdom, host components)

### Pure units
- `clampProgress`: below 0, above max, `max = 0`, `NaN`, custom `max`.
- `formatBadgeCount`: under/at/over max, strings, `0` with and without `showZero`, negative, `null`.
- `getInitials`: one word, many words, extra whitespace, Vietnamese diacritics (`"Đặng Thị Ễ"` → `"ĐỄ"`), lowercase input, empty.

### Components
- **Spinner:** indeterminate has no `aria-valuenow`; determinate sets `aria-valuenow`/`max` and the dashoffset; `showValue` renders the rounded percent; size/color classes; `label` → `aria-label`.
- **Progress bar:** same aria rules; fill `transform` for 0 / 50 / 100 / out-of-range; indeterminate class.
- **Button:** loading renders `.spinner` (updated existing test).
- **Alert:** color / appearance / banner classes; default icon per color, none for neutral, `[icon]="false"`, projected `uiAlertIcon` replaces it; auto role (`alert` for error/warning, `status` otherwise) and override; dismiss sets `open` false, host `hidden`, emits `(closed)`; `[(open)]` two-way.
- **Card:** classes for appearance/padding; `interactive` automatic on `<a uiCard>`; parts get their classes.
- **Badge:** hidden when empty; `max` overflow; dot; anchor directive appends exactly one badge span, updates it, respects position/hidden; `uiBadgeDescription` sets and updates `aria-describedby`; span and description removed on destroy; error on `<img uiBadge>`.
- **Avatar:** fallback order (image → initials → content → icon); `error` event switches to initials; changing `src` retries; a11y attributes per state; group `max` hides extra avatars and renders "+N"; group size applies unless the child overrides.
- **Tag:** color/appearance/size classes, default neutral output unchanged; remove button label and `(removed)`; disabled blocks remove/toggle; checkable toggles on click / Enter / Space with `aria-pressed`; error when both removable and checkable.
- **Regression:** existing `ui-select` tag specs keep passing untouched.

### Visual
Headless screenshot run as for previous changes: every component in its color × appearance × size grid, light and dark, plus reduced-motion for the progress components.

---

## 11. Docs pages

| Page | Route | Group | Playground controls | Extra examples |
|---|---|---|---|---|
| Alert | `/alert` | Overlays & Feedback | color, appearance, icon, banner, dismissible, title, actions | Banner at top of a layout, reopening a dismissed alert |
| Progress | `/progress` | Overlays & Feedback | spinner/bar, determinate + value slider, size, color, showValue | Spinner in a button (`loading`), labelled bar with percentage |
| Card | `/card` | Data & Media | appearance, padding, interactive, media on/off | Card as a link, card grid |
| Badge | `/badge` | Data & Media | count, max, dot, showZero, color, size, position, overlap | On an icon button, on an avatar (status dot) |
| Avatar | `/avatar` | Data & Media | src (valid / broken), name, size, shape | Group with `max` |
| Tag | `/tag` | Data & Media | color, appearance, size, removable, checkable, disabled | Removable filter list, checkable filter chips |

Each page gets the generated usage code and an API table, like the existing pages.

---

## 12. Implementation order

1. `UiColor` in core; the `spinner` utility + button migration (smallest change, proves the CSS pattern).
2. `progress.css`, `clampProgress`, `UiSpinner`, `UiProgressBar`.
3. Alert: CSS additions (`alert-solid`, `alert-banner`, parts), `UiAlert` + parts.
4. Tag: CSS additions (keeping existing output), `UiTag` — run the `ui-select` specs.
5. Badge: `formatBadgeCount`, `UiBadge`, `UiBadgeAnchor`.
6. Avatar: `getInitials`, `UiAvatar`, `UiAvatarGroup` (the badge dot example depends on 5).
7. Card: CSS, `UiCard` + parts.
8. `@libs/ui` re-exports, docs pages, visual check, rebuild `packages/ui` (`ng build ui`, then `navigation`).

Each step is independently shippable and gets its own commit.

---

## 13. Out of scope (v1)

- Chip grid / chip input / chip listbox bound to a form control (belongs with a future `@angular/aria` based component)
- Buffer / query modes on the progress bar; segmented or stepped progress
- Alert enter/leave animations and auto-dismiss (that's Toast's job)
- Card loading skeleton (comes with the Phase 2 Skeleton component)
- Avatar status presence as a dedicated input (compose with `[uiBadge] uiBadgeDot` instead), color-from-name hashing, image `srcset`
- Moving `@libs/ui/loader` and `ui-select`'s loading row onto `ui-spinner`, and `ui-select` tags onto `ui-tag`
- New `UI_CONFIG` defaults for these components
