# Tooltip

A short hint on hover and keyboard focus: put `uiTooltip` on any element. It opens on the CDK overlay, flips to stay on screen, closes on `Escape` and links itself to the host with `aria-describedby` while it is open. The content is text, or a template for something richer (and then you can move the pointer into it).

```ts
import { UiTooltipDirective } from '@libs/ui/tooltip';
```

## Usage

```html
<button uiButton uiTooltip="Save the document">Save</button>

<button uiButton uiTooltip="Not allowed" uiTooltipPosition="right" uiTooltipColor="error">…</button>

<!-- Only on hover, never on keyboard focus -->
<span uiTooltip="Created 3 days ago" [uiTooltipShowOnFocus]="false">3d</span>

<!-- A template: interactive, you can move into it -->
<button [uiTooltip]="details">Plan</button>
<ng-template #details><strong>Team</strong> plan: <a href="/pricing">see the details</a></ng-template>

<!-- Off for some hosts, and a state to react to -->
<button uiTooltip="Copy" [uiTooltipDisabled]="copied()" (tooltipVisibleChange)="onTip($event)">…</button>
```

App-wide defaults: `{ provide: UI_TOOLTIP_CONFIG, useValue: { position: 'bottom', showDelay: 400, arrow: false } }`.

## API

| Input                  | Type                                                                    | Default                         | Description                                                     |
| ---------------------- | ----------------------------------------------------------------------- | ------------------------------- | --------------------------------------------------------------- |
| `uiTooltip`            | `string \| TemplateRef \| null`                                         | `null`                          | The content. Empty or `null`: no tooltip.                       |
| `uiTooltipPosition`    | `'top' \| 'bottom' \| 'left' \| 'right'`                                | `'top'`                         | Preferred side (it flips when there is no room).                |
| `uiTooltipColor`       | `'neutral' \| 'primary' \| 'info' \| 'success' \| 'warning' \| 'error'` | `'neutral'`                     | Colour.                                                         |
| `uiTooltipSize`        | `'sm' \| 'md'`                                                          | `'md'`                          | Size.                                                           |
| `uiTooltipArrow`       | `boolean`                                                               | `true`                          | The little arrow.                                               |
| `uiTooltipDelay`       | `number`                                                                | `200`                           | Milliseconds before it shows on hover (focus shows it at once). |
| `uiTooltipHideDelay`   | `number`                                                                | `0`                             | Milliseconds before it hides.                                   |
| `uiTooltipDisabled`    | `boolean`                                                               | `false`                         | Never shows.                                                    |
| `uiTooltipShowOnFocus` | `boolean`                                                               | `true`                          | Keyboard focus shows it too; `false` is hover only.             |
| `uiTooltipInteractive` | `boolean`                                                               | template: `true`, text: `false` | The pointer can move into the tooltip without closing it.       |
| `uiTooltipClass`       | `string`                                                                | `''`                            | Extra classes on the tooltip.                                   |

| Output                 | Type      | Description          |
| ---------------------- | --------- | -------------------- |
| `tooltipVisibleChange` | `boolean` | It opened or closed. |

Methods: `show(delay?)`, `hide(delay?)`, `toggle()`; reach them with `#t="uiTooltip"`.

`UiTooltipConfig` (`UI_TOOLTIP_CONFIG`): `position`, `color`, `size`, `arrow`, `showDelay`, `hideDelay`.
