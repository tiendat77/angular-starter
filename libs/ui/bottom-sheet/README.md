# Bottom Sheet

A panel that slides up from the bottom of the screen, built for touch: drag the handle between snap points, or flick it down to dismiss. Open it from code with a component or a template.

```ts
import { provideBottomSheet, UiBottomSheet, BOTTOM_SHEET_DATA } from '@libs/ui/bottom-sheet';
```

## Usage

`UiBottomSheet` is available everywhere (`providedIn: 'root'`). `provideBottomSheet()` is optional: it only creates the service at bootstrap, so the first `open()` is not delayed.

Open a template or a component, and wait for the result:

```ts
@Component({
  template: `
    <button uiButton (click)="open()">Filters</button>

    <ng-template #filters>
      <h2>Filters</h2>
      <button uiButton (click)="sheet.dismiss('applied')">Apply</button>
    </ng-template>
  `,
})
export class Page {
  protected readonly sheet = inject(UiBottomSheet);
  private readonly filters = viewChild.required<TemplateRef<unknown>>('filters');

  open(): void {
    const ref = this.sheet.open(this.filters(), {
      snapPoints: [0.4, 0.9], // fractions of the viewport height
      initialSnapIndex: 0,
      ariaLabel: 'Filters',
    });
    ref.afterDismissed().subscribe((result) => console.log(result)); // 'applied', or undefined
  }
}
```

A component receives its data through the `BOTTOM_SHEET_DATA` token:

```ts
this.sheet.open(PickerComponent, { data: { selected: 3 } });
// in PickerComponent: protected data = inject<{ selected: number }>(BOTTOM_SHEET_DATA);
```

Keyboard: on the drag handle, Arrow Up / Down move to the next / previous snap point and Home / End go to the lowest / highest; `Escape` dismisses the sheet (unless `disableClose`).

## API

### `UiBottomSheet` (service)

| Method                               | Description                                     |
| ------------------------------------ | ----------------------------------------------- |
| `open(componentOrTemplate, config?)` | Opens a sheet and returns a `UiBottomSheetRef`. |
| `dismiss(result?)`                   | Dismisses the sheet that is open, if any.       |

### Config (`open(…, config)`)

| Option             | Type                 | Default                   | Description                                                                                |
| ------------------ | -------------------- | ------------------------- | ------------------------------------------------------------------------------------------ |
| `data`             | `D \| null`          | `null`                    | Injected into the content as `BOTTOM_SHEET_DATA`.                                          |
| `snapPoints`       | `number[]`           | `[0.5]`                   | Ascending fractions (0–1) of the viewport height the sheet can snap to.                    |
| `initialSnapIndex` | `number`             | `0`                       | Index in `snapPoints` the sheet opens at.                                                  |
| `hasBackdrop`      | `boolean`            | `true`                    | Dims the page; a click on it dismisses the sheet.                                          |
| `disableClose`     | `boolean`            | `false`                   | Blocks backdrop click, Escape and dragging past the lowest point. `dismiss()` still works. |
| `disableDrag`      | `boolean`            | `false`                   | Turns off dragging and keyboard resizing (`snapTo()` still works).                         |
| `hasDragHandle`    | `boolean`            | `true`                    | Shows the drag handle.                                                                     |
| `restoreFocus`     | `boolean`            | `true`                    | Returns focus to the trigger when the sheet closes.                                        |
| `ariaLabel`        | `string \| null`     | `null`                    | Accessible name of the sheet (`role="dialog"`).                                            |
| `panelClass`       | `string \| string[]` | –                         | Extra class(es) on the overlay pane.                                                       |
| `backdropClass`    | `string`             | `'bottom-sheet-backdrop'` | Class of the backdrop.                                                                     |
| `direction`        | `'ltr' \| 'rtl'`     | –                         | Text direction.                                                                            |
| `viewContainerRef` | `ViewContainerRef`   | –                         | The dependency-injection parent of the content (does not move it in the DOM).              |

### `UiBottomSheetRef`

| Method             | Description                                                          |
| ------------------ | -------------------------------------------------------------------- |
| `dismiss(result?)` | Dismisses the sheet; `result` is what `afterDismissed()` emits.      |
| `snapTo(index)`    | Animates to a snap point (kept within `snapPoints`).                 |
| `afterOpened()`    | `Observable<void>`, when the sheet has opened.                       |
| `afterDismissed()` | `Observable<R \| undefined>`, with the result passed to `dismiss()`. |
| `backdropClick()`  | `Observable<MouseEvent>`.                                            |
| `keydownEvents()`  | `Observable<KeyboardEvent>`.                                         |
