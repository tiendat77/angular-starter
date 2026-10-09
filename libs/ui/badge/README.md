# Badge

A count or a status dot: inline (`ui-badge`), or overlaid on another element (`[uiBadge]`, like Material's `matBadge`). It is hidden when there is nothing to show.

```ts
import { UiBadgeAnchorDirective, UiBadgeComponent } from '@libs/ui/badge';
```

## Usage

```html
<!-- Inline, e.g. next to a menu label -->
Inbox <ui-badge [count]="unread" color="primary" />

<!-- Over another element -->
<button
  uiButton
  [uiBadge]="notifications"
  [uiBadgeMax]="99"
  uiBadgeColor="error"
  uiBadgeDescription="3 unread notifications"
>
  Notifications
</button>

<!-- A status dot -->
<ui-avatar name="Linh Tran" uiBadge uiBadgeDot uiBadgeColor="success" uiBadgePosition="bottom-end" uiBadgeOverlap="circular" />
```

## API

### `ui-badge`

| Input      | Type                                                                    | Default   | Description                       |
| ---------- | ----------------------------------------------------------------------- | --------- | --------------------------------- |
| `count`    | `number \| string \| null`                                              | `null`    | What to show.                     |
| `max`      | `number`                                                                | `99`      | A number above it shows as `99+`. |
| `showZero` | `boolean`                                                               | `false`   | Shows `0` (otherwise hidden).     |
| `dot`      | `boolean`                                                               | `false`   | A dot without a count.            |
| `color`    | `'neutral' \| 'primary' \| 'info' \| 'success' \| 'warning' \| 'error'` | `'error'` | Colour.                           |
| `size`     | `'sm' \| 'md'`                                                          | `'md'`    | Size.                             |

### `[uiBadge]`

| Input                | Type                                                                    | Default         | Description                                                                               |
| -------------------- | ----------------------------------------------------------------------- | --------------- | ----------------------------------------------------------------------------------------- |
| `uiBadge`            | `number \| string \| null`                                              | `null`          | What to show.                                                                             |
| `uiBadgeMax`         | `number`                                                                | `99`            | A number above it shows as `99+`.                                                         |
| `uiBadgeShowZero`    | `boolean`                                                               | `false`         | Shows `0`.                                                                                |
| `uiBadgeDot`         | `boolean`                                                               | `false`         | A dot without a count.                                                                    |
| `uiBadgeColor`       | `'neutral' \| 'primary' \| 'info' \| 'success' \| 'warning' \| 'error'` | `'error'`       | Colour.                                                                                   |
| `uiBadgeSize`        | `'sm' \| 'md'`                                                          | `'md'`          | Size.                                                                                     |
| `uiBadgePosition`    | `'top-end' \| 'top-start' \| 'bottom-end' \| 'bottom-start'`            | `'top-end'`     | Corner of the host.                                                                       |
| `uiBadgeOverlap`     | `'rectangular' \| 'circular'`                                           | `'rectangular'` | Use `circular` over a round host (an avatar).                                             |
| `uiBadgeHidden`      | `boolean`                                                               | `false`         | Hides the badge.                                                                          |
| `uiBadgeDescription` | `string`                                                                | `''`            | What assistive technology announces (`aria-describedby`). The badge itself is decorative. |
