# Toast

Short messages that appear over the page and go away by themselves: success, error, info, warning. Opened from code with `ToastService`; each one returns a reference you can dismiss or listen to.

```ts
import { ToastService, provideToast } from '@libs/ui/toast';
```

## Usage

```ts
private readonly toast = inject(ToastService);

save(): void {
  this.api.save().subscribe({
    next: () => this.toast.success('Your changes were saved.', 'Saved'),
    error: () => this.toast.error('Please try again in a moment.', 'Could not save'),
  });
}
```

`success`, `error`, `info` and `warning` take `(message, title?)`. For control over the duration and the place, use `open`:

```ts
const ref = this.toast.open('info', 'Update available', 'Reload to get the new version.', {
  duration: 10000,            // ms; the default is 5000
  verticalPosition: 'bottom', // 'top' (default) | 'bottom'
  horizontalPosition: 'end',  // 'start' | 'center' (default) | 'end' | 'left' | 'right'
});

ref.afterDismissed().subscribe(({ dismissedByAction }) => {
  if (dismissedByAction) location.reload();
});
```

App-wide defaults for every toast: `{ provide: TOAST_DEFAULT_OPTIONS, useValue: { duration: 8000, verticalPosition: 'bottom' } }`.

`ToastService` is available everywhere (`providedIn: 'root'`); `provideToast()` (optional) creates it at bootstrap:

```ts
providers: [provideToast()];
```

## API

### `ToastService`

| Method                                                          | Description                                                           |
| --------------------------------------------------------------- | --------------------------------------------------------------------- |
| `open(type, title, message, config?)`                           | Opens a toast. `type`: `'success' \| 'error' \| 'info' \| 'warning'`. |
| `success(message, title?)`, `error(…)`, `info(…)`, `warning(…)` | Shortcuts for `open` with default config.                             |
| `dismiss()`                                                     | Dismisses the toast that is open.                                     |

### `ToastConfig`

| Option               | Type                                                | Default    | Description                                                    |
| -------------------- | --------------------------------------------------- | ---------- | -------------------------------------------------------------- |
| `duration`           | `number`                                            | `5000`     | Milliseconds before it dismisses itself.                       |
| `verticalPosition`   | `'top' \| 'bottom'`                                 | `'top'`    | Edge of the screen.                                            |
| `horizontalPosition` | `'start' \| 'center' \| 'end' \| 'left' \| 'right'` | `'center'` | Side of the screen.                                            |
| `direction`          | `'ltr' \| 'rtl'`                                    | –          | Text direction.                                                |
| `viewContainerRef`   | `ViewContainerRef`                                  | –          | The dependency-injection parent (does not move it in the DOM). |

### `ToastRef`

| Method                | Description                                                     |
| --------------------- | --------------------------------------------------------------- |
| `dismiss()`           | Dismisses the toast.                                            |
| `dismissWithAction()` | Dismisses it and marks the action as clicked.                   |
| `afterOpened()`       | `Observable<void>`, when it has appeared.                       |
| `afterDismissed()`    | `Observable<{ dismissedByAction: boolean }>`, when it has gone. |
| `onAction()`          | `Observable<void>`, when its action was clicked.                |
