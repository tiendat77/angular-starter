# Dialog

Modal dialogs on the Angular CDK: open a component or a template, lay it out with `dialog-layout`, or ask a yes/no question with `confirm()`. It keeps focus inside, closes on `Escape` and returns focus when it closes.

```ts
import { DialogModule, DialogService } from '@libs/ui/dialog';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
```

## Usage

A dialog is a component laid out with `dialog-layout`:

```ts
@Component({
  imports: [DialogModule],
  template: `
    <dialog-layout>
      <ng-template dialog-title>Delete project</ng-template>

      <ng-template dialog-body>
        <p>Delete {{ data.name }}? This cannot be undone.</p>
      </ng-template>

      <ng-template dialog-actions>
        <button class="btn btn-outline" dialog-dismiss>Cancel</button>
        <button class="btn btn-primary" (click)="dialogRef.close(true)">Delete</button>
      </ng-template>
    </dialog-layout>
  `,
})
export class DeleteDialog {
  protected readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  protected readonly data = inject<{ name: string }>(DIALOG_DATA);
}
```

Open it, and read what it closes with:

```ts
private readonly dialog = inject(DialogService);

remove(): void {
  this.dialog
    .open<DeleteDialog, { name: string }, boolean>(DeleteDialog, { data: { name: 'Atlas' } })
    .closed.subscribe((deleted) => deleted && this.api.delete());
}
```

A quick question, without writing a component (it closes with `true` when confirmed, `undefined` when cancelled):

```ts
this.dialog
  .confirm({ type: 'warning', title: 'Discard changes?', message: 'Your edits will be lost.' })
  .closed.subscribe((ok) => ok && this.discard());
```

An alert-style or full-screen layout:

```html
<dialog-layout alert>…</dialog-layout>
<dialog-layout fullscreen>…</dialog-layout>
```

## API

### `DialogService`

| Method                               | Description                                                                                                                            |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `open(componentOrTemplate, config?)` | Opens a dialog and returns the CDK `DialogRef` (`config` is the CDK `DialogConfig`: `data`, `width`, `disableClose`, `panelClass`, …). |
| `confirm(config)`                    | Opens a confirmation. `config`: `{ type?: 'info' \| 'success' \| 'warning' \| 'error' (default 'info'), title?, message? }`.           |
| `closeAll()`                         | Closes every open dialog.                                                                                                              |

### `dialog-layout`

| Input        | Type      | Default | Description               |
| ------------ | --------- | ------- | ------------------------- |
| `alert`      | `boolean` | `false` | The compact alert layout. |
| `fullscreen` | `boolean` | `false` | Fills the screen.         |

### Parts

| Directive        | Use                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------ |
| `dialog-title`   | The title (in the header).                                                           |
| `dialog-header`  | An element that starts hidden; `visibility(true)` shows it (`false` hides it again). |
| `dialog-body`    | The scrollable content.                                                              |
| `dialog-actions` | The buttons of the footer.                                                           |
| `dialog-dismiss` | On a button: closes the dialog when clicked.                                         |
