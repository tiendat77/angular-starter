# Avatar

A user picture with a fallback chain: the image, then the initials of `name`, then projected content, then a user icon. The fallback stays underneath until the image has loaded and comes back if it fails.

```ts
import { UiAvatarComponent, UiAvatarGroupComponent } from '@libs/ui/avatar';
```

## Usage

```html
<ui-avatar src="/images/linh.jpg" alt="Linh Tran" name="Linh Tran" />

<!-- Initials when there is no picture -->
<ui-avatar name="Linh Tran" size="lg" shape="square" />

<!-- A group: avatars beyond max collapse into a +N avatar -->
<ui-avatar-group [max]="3" size="sm">
  @for (member of team; track member) {
    <ui-avatar [name]="member" />
  }
</ui-avatar-group>
```

## API

### `ui-avatar`

| Input   | Type                                   | Default                      | Description                                                       |
| ------- | -------------------------------------- | ---------------------------- | ----------------------------------------------------------------- |
| `src`   | `string \| null`                       | `null`                       | Picture URL.                                                      |
| `alt`   | `string \| null`                       | `null`                       | Text alternative of the picture. Leave empty if it is decorative. |
| `name`  | `string \| null`                       | `null`                       | Full name: the initials fallback, and the accessible name.        |
| `size`  | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | the group's, else `'md'`     | Size.                                                             |
| `shape` | `'circle' \| 'square'`                 | the group's, else `'circle'` | Shape.                                                            |

### `ui-avatar-group`

| Input   | Type                                   | Default    | Description                                        |
| ------- | -------------------------------------- | ---------- | -------------------------------------------------- |
| `max`   | `number \| null`                       | `null`     | Avatars shown; the rest hide behind a `+N` avatar. |
| `size`  | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'`     | Size of every avatar in the group.                 |
| `shape` | `'circle' \| 'square'`                 | `'circle'` | Shape of every avatar in the group.                |
