# Tabs

Tabs built on `@angular/aria/tabs`: roving focus, arrow-key navigation, ARIA roles, and lazy content. A set of directives you put on your own elements, so you control the markup.

```ts
import { UiTabsModule } from '@libs/ui/tabs';   // all the directives below
```

## Usage

```html
<div uiTabs uiTabsVariant="bordered" uiTabsSize="md">
  <div uiTabList [(selectedTab)]="tab">
    <button uiTab value="account">Account</button>
    <button uiTab value="password">Password</button>
    <button uiTab value="billing" disabled>Billing</button>
  </div>

  <div uiTabPanel value="account">
    <ng-template uiTabContent>Account settings…</ng-template>
  </div>
  <div uiTabPanel value="password">
    <ng-template uiTabContent>Change your password…</ng-template>
  </div>
</div>
```

The `ng-template[uiTabContent]` makes the panel lazy: its content is created when the tab is first shown. Left out, the content is always rendered.

Vertical tabs, a colour and an app-wide default:

```html
<div uiTabs uiTabsVariant="pill" uiTabsOrientation="vertical" uiTabsColor="primary" class="flex gap-6">…</div>
```

```ts
{ provide: UI_TABS_CONFIG, useValue: { variant: 'bordered', size: 'md', selectionMode: 'follow' } }
```

Keyboard: Arrow Left / Right (Up / Down when vertical) move between tabs, Home / End go to the first / last. With `selectionMode: 'follow'` (the default) the focused tab is selected; with `'explicit'`, Enter or Space selects it.

## API

### `[uiTabs]` (the container)

| Input                      | Type                                                                    | Default        | Description                        |
| -------------------------- | ----------------------------------------------------------------------- | -------------- | ---------------------------------- |
| `uiTabs` / `uiTabsVariant` | `'bordered' \| 'lift' \| 'pill'`                                        | `'bordered'`   | Look (`uiTabs="pill"` also works). |
| `uiTabsSize`               | `'sm' \| 'md' \| 'lg'`                                                  | `'md'`         | Size.                              |
| `uiTabsOrientation`        | `'horizontal' \| 'vertical'`                                            | `'horizontal'` | Direction.                         |
| `uiTabsColor`              | `'neutral' \| 'primary' \| 'info' \| 'success' \| 'warning' \| 'error'` | `'primary'`    | Colour of the selected tab.        |

### `[uiTabList]`

| Input / Output      | Type                         | Default         | Description                                         |
| ------------------- | ---------------------------- | --------------- | --------------------------------------------------- |
| `selectedTab`       | `string` (two-way)           | –               | The `value` of the selected tab. `[(selectedTab)]`. |
| `selectionMode`     | `'follow' \| 'explicit'`     | `'follow'`      | Whether focus selects.                              |
| `wrap`              | `boolean`                    | `true`          | Arrow keys wrap around.                             |
| `orientation`       | `'horizontal' \| 'vertical'` | the container's | Overrides the container.                            |
| `softDisabled`      | `boolean`                    | `false`         | Disabled tabs stay focusable.                       |
| `selectedTabChange` | `string`                     |                 | Output: the selection changed.                      |

### `[uiTab]`, `[uiTabPanel]`, `[uiTabContent]`

| Directive                   | Inputs                                                           | Use                      |
| --------------------------- | ---------------------------------------------------------------- | ------------------------ |
| `uiTab`                     | `value` (required), `disabled`, `uiTabColor` (this tab's colour) | A tab button.            |
| `uiTabPanel`                | `value` (required): the tab it belongs to                        | The panel of a tab.      |
| `ng-template[uiTabContent]` | –                                                                | Lazy content of a panel. |
