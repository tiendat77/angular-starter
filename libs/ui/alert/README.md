# Alert

An inline message, or a full-width banner. Dismissing only hides it and updates `open`: your code decides whether to remove it.

```ts
import { UiAlertModule } from '@libs/ui/alert';
```

`UiAlertModule` brings `ui-alert` and its title, icon and actions parts: add it to a component's `imports`. The parts are standalone, so you can also import them one by one.

## Usage

```html
<ui-alert color="success">Your changes were saved.</ui-alert>

<!-- Title, actions and a dismiss button -->
<ui-alert
  color="warning"
  appearance="outline"
  dismissible
  [(open)]="showMaintenance"
  (closed)="log('dismissed')"
>
  <span uiAlertTitle>Scheduled maintenance</span>
  The service will be unavailable on Sunday from 02:00 to 04:00.
  <div uiAlertActions>
    <button uiButton size="sm">Details</button>
  </div>
</ui-alert>

<!-- Full-width banner, custom icon -->
<ui-alert banner color="info">
  <svg uiAlertIcon>…</svg>
  A new version is available.
</ui-alert>
```

## API

### `ui-alert`

| Input         | Type                                                                    | Default     | Description                                                                     |
| ------------- | ----------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------- |
| `color`       | `'neutral' \| 'primary' \| 'info' \| 'success' \| 'warning' \| 'error'` | `'neutral'` | Tone of the alert.                                                              |
| `appearance`  | `'soft' \| 'outline' \| 'dash' \| 'solid'`                              | `'soft'`    | Look of the alert.                                                              |
| `icon`        | `boolean`                                                               | `true`      | Shows the icon of the colour. Replace it with `uiAlertIcon`.                    |
| `banner`      | `boolean`                                                               | `false`     | Full width, square corners.                                                     |
| `dismissible` | `boolean`                                                               | `false`     | Adds a close button.                                                            |
| `closeLabel`  | `string`                                                                | `'Dismiss'` | Accessible name of the close button.                                            |
| `role`        | `'alert' \| 'status' \| 'none' \| null`                                 | `null`      | Live-region role. By default `alert` for error and warning, `status` otherwise. |
| `open`        | `boolean` (`model`)                                                     | `true`      | Whether the alert is shown. Two-way: `[(open)]`.                                |

| Output   | Type   | Description              |
| -------- | ------ | ------------------------ |
| `closed` | `void` | The alert was dismissed. |

Method: `close()` hides the alert.

### Slots

| Directive        | Use                                 |
| ---------------- | ----------------------------------- |
| `uiAlertTitle`   | The bold first line.                |
| `uiAlertIcon`    | Replaces the default icon.          |
| `uiAlertActions` | A row of actions under the message. |
