# Tag

A small text chip: a label, a removable tag (an `×` button) or a checkable one (the whole tag is a toggle button). Removable and checkable are exclusive.

```ts
import { UiTagComponent, UiTagIconDirective } from '@libs/ui/tag';
```

## Usage

```html
<ui-tag color="success">Active</ui-tag>
<ui-tag appearance="outline" size="sm">v1.4</ui-tag>

<!-- Removable: you remove it, the tag only says it was asked to go -->
@for (tag of tags(); track tag) {
  <ui-tag removable removeLabel="Remove {{ tag }}" (removed)="remove(tag)">{{ tag }}</ui-tag>
}

<!-- Checkable: a filter chip -->
<ui-tag checkable [(checked)]="onlyOpen">Open</ui-tag>

<!-- With an icon or an avatar -->
<ui-tag color="info"><svg-icon uiTagIcon name="heroicons_outline:bolt" /> Beta</ui-tag>
```

## API

### `ui-tag`

| Input         | Type                                                                    | Default     | Description                                       |
| ------------- | ----------------------------------------------------------------------- | ----------- | ------------------------------------------------- |
| `color`       | `'neutral' \| 'primary' \| 'info' \| 'success' \| 'warning' \| 'error'` | `'neutral'` | Colour.                                           |
| `appearance`  | `'soft' \| 'outline' \| 'solid'`                                        | `'soft'`    | Look.                                             |
| `size`        | `'sm' \| 'md' \| 'lg'`                                                  | `'md'`      | Size.                                             |
| `removable`   | `boolean`                                                               | `false`     | Adds the `×` button.                              |
| `removeLabel` | `string`                                                                | `'Remove'`  | Accessible name of the `×` button.                |
| `checkable`   | `boolean`                                                               | `false`     | The tag is a toggle button.                       |
| `checked`     | `boolean` (`model`)                                                     | `false`     | State of a checkable tag. Two-way: `[(checked)]`. |
| `disabled`    | `boolean`                                                               | `false`     | Disables the tag.                                 |

| Output    | Type   | Description                                         |
| --------- | ------ | --------------------------------------------------- |
| `removed` | `void` | The `×` was clicked. Remove the tag from your data. |

`uiTagIcon` marks a leading icon or avatar, sized to the tag's text.
