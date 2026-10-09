# Menu

A dropdown of actions on the Angular CDK overlay: put `[uiMenuTriggerFor]` on any button and give it a template with a `[uiMenu]` container and `[uiMenuItem]` buttons. It opens under the trigger, closes on a click outside, and returns focus to the trigger when it closes.

```ts
import { UiMenuModule } from '@libs/ui/menu';
```

`UiMenuModule` brings the trigger, `uiMenu`, `uiMenuItem`, `uiMenuLabel` and `uiMenuDivider`: add it to a component's `imports`. The parts are standalone, so you can also import them one by one.

## Usage

```html
<button uiButton variant="outline" [uiMenuTriggerFor]="actions">Actions</button>

<ng-template #actions>
  <div uiMenu>
    <div uiMenuLabel>Project</div>
    <button uiMenuItem (click)="rename()">Rename</button>
    <button uiMenuItem value="copy" (triggered)="onPick($event)">Duplicate</button>
    <div uiMenuDivider></div>
    <button uiMenuItem danger (click)="remove()">Delete</button>
    <button uiMenuItem disabled>Archive</button>
  </div>
</ng-template>
```

Placement and size:

```html
<button [uiMenuTriggerFor]="actions" uiMenuPosition="bottom-end" [uiMenuOffsetY]="8">…</button>
<div uiMenu uiMenuSize="sm" (itemSelected)="onSelect($event)">…</div>
```

App-wide defaults: `{ provide: UI_MENU_CONFIG, useValue: { size: 'sm', position: 'bottom-end', offsetY: 6 } }`.

Keyboard: on the trigger, Arrow Down, Enter and Space open the menu on its first item and Arrow Up on its last. In the menu, Arrow Down / Up move between the enabled items, Home / End jump to the first / last, Enter or Space picks the item, and `Escape` or `Tab` close it.

## API

### `[uiMenuTriggerFor]`

| Input              | Type                                                                                          | Default          | Description               |
| ------------------ | --------------------------------------------------------------------------------------------- | ---------------- | ------------------------- |
| `uiMenuTriggerFor` | `TemplateRef`                                                                                 | required         | The template of the menu. |
| `uiMenuPosition`   | `'bottom-start' \| 'bottom-end' \| 'top-start' \| 'top-end' \| 'left-start' \| 'right-start'` | `'bottom-start'` | Where it opens.           |
| `uiMenuOffsetY`    | `number`                                                                                      | `4`              | Gap to the trigger (px).  |
| `uiMenuDisabled`   | `boolean`                                                                                     | `false`          | Cannot be opened.         |

| Output       | Type   | Description      |
| ------------ | ------ | ---------------- |
| `menuOpened` | `void` | The menu opened. |
| `menuClosed` | `void` | The menu closed. |

Methods: `open(focus?: 'first' | 'last')`, `close()`, `toggle()`. Reach them with a template reference: `#t="uiMenuTrigger"`.

### `[uiMenu]` (the container)

| Input        | Type                   | Default | Description                 |
| ------------ | ---------------------- | ------- | --------------------------- |
| `uiMenuSize` | `'sm' \| 'md' \| 'lg'` | `'md'`  | Size of the items.          |
| `id`         | `string`               | auto    | DOM id of the menu.         |
| `class`      | `string`               | `''`    | Extra classes on the panel. |

| Output           | Type      | Description                              |
| ---------------- | --------- | ---------------------------------------- |
| `itemSelected`   | `unknown` | The `value` of the item that was picked. |
| `closeRequested` | `void`    | The menu asked to close.                 |

### `[uiMenuItem]`

| Input      | Type      | Default | Description                               |
| ---------- | --------- | ------- | ----------------------------------------- |
| `value`    | `unknown` | –       | What `itemSelected` and `triggered` emit. |
| `danger`   | `boolean` | `false` | Destructive look.                         |
| `disabled` | `boolean` | `false` | Cannot be picked or focused.              |

| Output      | Type      | Description                        |
| ----------- | --------- | ---------------------------------- |
| `triggered` | `unknown` | The item was picked (its `value`). |

### Other parts

| Directive       | Use                        |
| --------------- | -------------------------- |
| `uiMenuLabel`   | A non-interactive heading. |
| `uiMenuDivider` | A separator line.          |
