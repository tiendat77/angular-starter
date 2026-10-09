# Collapse (Accordion)

A list of panels that open and close. Open several at once, or set `accordion` so that opening one closes the others. The state is `activeIds`, two-way bindable.

```ts
import { UiCollapseModule } from '@libs/ui/collapse';
```

`UiCollapseModule` brings `ui-collapse`, `ui-collapse-panel` and the header, extra, content and icon templates: add it to a component's `imports`. The parts are standalone, so you can also import them one by one.

## Usage

```html
<ui-collapse accordion [(activeIds)]="open">
  <ui-collapse-panel id="overview" header="System overview">
    Latency, memory and cluster status.
  </ui-collapse-panel>

  <ui-collapse-panel id="access" header="Access control" extra="3 roles">
    Policies and signing certificates.
  </ui-collapse-panel>

  <ui-collapse-panel id="billing" [disabled]="true" header="Billing">…</ui-collapse-panel>
</ui-collapse>
```

A panel can carry its own open state, without a parent binding:

```html
<ui-collapse-panel header="Details" [(expanded)]="detailsOpen">…</ui-collapse-panel>
```

Rich header, extra content and icon:

```html
<ui-collapse-panel id="rich">
  <div *uiCollapseHeader><strong>Deploys</strong> <ui-badge [count]="4" /></div>
  <button *uiCollapseExtra uiButton size="sm">Retry</button>
  <ng-template uiCollapseIcon>＋</ng-template>
  …content…
</ui-collapse-panel>
```

## API

### `ui-collapse`

| Input                | Type                                                         | Default      | Description                                           |
| -------------------- | ------------------------------------------------------------ | ------------ | ----------------------------------------------------- |
| `accordion`          | `boolean`                                                    | `false`      | Only one panel is open at a time.                     |
| `variant`            | `'bordered' \| 'frameless' \| 'ghost'`                       | `'bordered'` | Look.                                                 |
| `bordered`           | `boolean`                                                    | `true`       | `false` is the `frameless` variant.                   |
| `ghost`              | `boolean`                                                    | `false`      | The `ghost` variant (no background or border).        |
| `expandIconPosition` | `'left' \| 'right'`                                          | `'left'`     | Side of the arrow.                                    |
| `activeIds`          | `string \| number \| (string \| number)[] \| null` (`model`) | `null`       | The ids of the open panels. Two-way: `[(activeIds)]`. |
| `disabled`           | `boolean`                                                    | `false`      | Disables every panel.                                 |

Methods: `togglePanel(id)`, `expandPanel(id)`, `collapsePanel(id)`, `isPanelActive(id)`.

### `ui-collapse-panel`

| Input       | Type                | Default | Description                                                    |
| ----------- | ------------------- | ------- | -------------------------------------------------------------- |
| `id`        | `string \| number`  | auto    | Id used in `activeIds`. Give it one to control the state.      |
| `header`    | `string`            | `''`    | Header text (or use `uiCollapseHeader`).                       |
| `extra`     | `string`            | `''`    | Text on the far side of the header (or use `uiCollapseExtra`). |
| `disabled`  | `boolean`           | `false` | This panel cannot be toggled.                                  |
| `showArrow` | `boolean`           | `true`  | Shows the arrow.                                               |
| `expanded`  | `boolean` (`model`) | `false` | Whether it is open. Two-way: `[(expanded)]`.                   |

### Templates

| Directive                       | Use                                    |
| ------------------------------- | -------------------------------------- |
| `ng-template[uiCollapseHeader]` | Rich header content.                   |
| `ng-template[uiCollapseExtra]`  | Content on the far side of the header. |
| `ng-template[uiCollapseIcon]`   | Replaces the arrow icon.               |
| `[uiCollapseContent]`           | Marks the content explicitly.          |
