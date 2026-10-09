# Card

A surface for grouped content. Use `<ui-card>`, or the `uiCard` attribute on a semantic host (`article`, `a`, `button`): links and buttons get the interactive look by themselves.

```ts
import { UiCardModule } from '@libs/ui/card';
```

`UiCardModule` brings `ui-card` and its media, header, title, description, action, content and footer parts: add it to a component's `imports`. The parts are standalone, so you can also import them one by one.

## Usage

```html
<ui-card appearance="elevated">
  <img uiCardMedia src="/images/cover.jpg" alt="" />

  <div uiCardHeader>
    <h3 uiCardTitle>Project Atlas</h3>
    <p uiCardDescription>Updated 2 hours ago</p>
    <button uiCardAction uiButton variant="ghost" size="icon" aria-label="Options">⋯</button>
  </div>

  <div uiCardContent>Three tasks are due this week.</div>

  <div uiCardFooter>
    <button uiButton size="sm">Open</button>
  </div>
</ui-card>

<!-- A whole card that is a link -->
<a uiCard href="/projects/atlas" appearance="outline">…</a>
```

## API

### `ui-card`, `[uiCard]`

| Input         | Type                                  | Default     | Description                                                          |
| ------------- | ------------------------------------- | ----------- | -------------------------------------------------------------------- |
| `appearance`  | `'outline' \| 'elevated' \| 'filled'` | `'outline'` | Look of the surface.                                                 |
| `padding`     | `'none' \| 'sm' \| 'md' \| 'lg'`      | `'md'`      | Inner padding.                                                       |
| `interactive` | `boolean`                             | `false`     | Hover and focus look. Automatic on `a[uiCard]` and `button[uiCard]`. |

### Parts

| Directive           | Use                                                                      |
| ------------------- | ------------------------------------------------------------------------ |
| `uiCardHeader`      | Title and description column, with an optional action in the top-right.  |
| `uiCardTitle`       | The title.                                                               |
| `uiCardDescription` | The description under the title.                                         |
| `uiCardAction`      | A button or menu pinned to the top-right of the header.                  |
| `uiCardContent`     | The body.                                                                |
| `uiCardFooter`      | The footer (usually actions).                                            |
| `uiCardMedia`       | A full-bleed image or video; bleeds into the padding when first or last. |
