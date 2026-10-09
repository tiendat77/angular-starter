# Loader

A full-screen loading overlay with a small animation, shown and hidden from code. While it is open it blocks page scrolling.

```ts
import { LoaderService, provideLoader } from '@libs/ui/loader';
```

## Usage

```ts
private readonly loader = inject(LoaderService);

async save(): Promise<void> {
  this.loader.show();
  try {
    await this.api.save();
  } finally {
    this.loader.hide();
  }
}
```

`show()` returns a reference: a second `show()` while the loader is open returns the same one, so nested calls do not stack. Close it with `loader.hide()` or `ref.close()`.

`LoaderService` is available everywhere (`providedIn: 'root'`). `provideLoader()` (optional) creates it at bootstrap:

```ts
providers: [provideLoader()];
```

## API

### `LoaderService`

| Method   | Description                                                               |
| -------- | ------------------------------------------------------------------------- |
| `show()` | Opens the loader and returns a `LoaderOverlayRef` (the open one, if any). |
| `hide()` | Closes the loader.                                                        |

### `LoaderOverlayRef`

| Method    | Description        |
| --------- | ------------------ |
| `close()` | Closes the loader. |
