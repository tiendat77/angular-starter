# ExcelHelper

Export tables to `.xlsx` and import `.xlsx` files back into typed rows. Built on
[ExcelJS](https://github.com/exceljs/exceljs), which is loaded with a dynamic `import()` the first time
you call `createWorkbook()` or `read()`, so it is not part of the initial bundle (`exceljs` is listed in
`allowedCommonJsDependencies` in `angular.json` because it is CommonJS).

```ts
import { ExcelDatasetModel, ExcelHelper, ExcelLabelModel } from '@/shared/lib/excel';
```

## Concepts

- **Labels** (`ExcelLabelModel[]`) describe the columns: which property of a row (`key`), the header
  text (`name`) and how to format it (`type`, `format`).
- **Dataset** (`ExcelDatasetModel[]`) is the rows: flat objects of `string | number | boolean | Date | null`.
- A **workbook** comes from `createWorkbook()` (export) or `read(file)` (import); you add or read
  **worksheets** on it with the normal ExcelJS API.

## Export

```ts
const labels: ExcelLabelModel[] = [
  { key: 'title', name: 'Product', maxWidth: 40 },
  { key: 'category', name: 'Category' },
  { key: 'price', name: 'Price', type: 'currency' },
  { key: 'stock', name: 'Stock', type: 'number', format: '#,##0' },
  { key: 'rating', name: 'Rating', type: 'number', format: '0.0' },
];

async function exportProducts(products: ProductModel[]) {
  const workbook = await ExcelHelper.createWorkbook();
  const worksheet = workbook.addWorksheet('Products');

  ExcelHelper.meta(worksheet, { title: 'Products', description: 'Exported from the product list' });
  ExcelHelper.table(
    worksheet,
    labels,
    products.map((p) =>
      ExcelHelper.pickFields(
        p,
        labels.map((l) => l.key)
      )
    )
  );

  await ExcelHelper.download(workbook, { title: 'Products' }); // -> "Products 20261023.xlsx"
}
```

What each step does:

| Method                                     | Does                                                                                                                             |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `createWorkbook()`                         | Loads ExcelJS and returns a `Workbook` (creator `dev@angular-starter`, created now)                                              |
| `meta(worksheet, { title, description? })` | Adds a bold 20pt title row, an optional description row and an empty row. Optional; call it **before** `table()`                 |
| `table(worksheet, labels, datasets)`       | Adds the header row (bold, with an auto filter), one row per dataset, and sizes the columns to the content                       |
| `pickFields(obj, keys)`                    | Copies only the listed keys of an object into a dataset row (keeps `Date`s; skips `null`, objects and arrays)                    |
| `download(workbook, { title })`            | Saves `<Title In Pascal Case> <YYYYMMDD>.xlsx` (an empty title gives `Báo Cáo`). Returns a `Promise`: `await` it to catch errors |

### Column types

Set `type` on a label to format the cells and align the header:

| `type`                          | Cell format                                     | Notes                                                                        |
| ------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------- |
| _(none)_ / `string` / `boolean` | General                                         | Default alignment                                                            |
| `number`                        | `format` if given, otherwise General            | Right aligned header. Pass a format such as `#,##0` or `0.00`                |
| `currency`                      | `#,##0`                                         | No symbol and no decimals. `null` becomes `0`                                |
| `percent`                       | `0.00%`                                         | The value must be a **fraction**: `0.25` shows `25.00%`                      |
| `date`                          | `format` if given, otherwise `mm/dd/yyyy HH:mm` | Column is at least 26 wide. Invalid dates and years before 1901 become empty |
| `image`                         | –                                               | The value must be an ExcelJS **image id**, see below                         |

`format` takes any Excel number or date format code (`dd/mm/yyyy HH:mm`, `#,##0.00`, `0%`...). The full
list of examples is in `excel-label.model.ts`.

Other label fields:

| Field      | Description                                           |
| ---------- | ----------------------------------------------------- |
| `maxWidth` | Cap for the auto-calculated column width              |
| `wrapText` | Wraps the text of the data cells                      |
| `bold`     | Makes the data cells bold (the header is always bold) |
| `id`       | Not used by the helper; free for your own bookkeeping |

Column width is the larger of the header length + 4 and the longest value + 8 (capped by `maxWidth`).

### Images

Add the image to the workbook first, then put the returned id in the row:

```ts
const workbook = await ExcelHelper.createWorkbook();
const imageId = workbook.addImage({ base64: dataUrlOrBase64, extension: 'png' });
const sheet = workbook.addWorksheet('Photos');

ExcelHelper.table(sheet, [{ key: 'photo', name: 'Photo', type: 'image' }], [{ photo: imageId }]);
```

The image is drawn at 100 × 100 px from the cell's top-left corner. The row height is **not** adjusted,
so set `sheet.getRow(n).height` yourself if the picture overlaps the next row.

### Hide or lock a column

```ts
ExcelHelper.hideColumn(worksheet, 0); // zero-based index: 0 is column A, 26 is column AA
ExcelHelper.lockColumn(worksheet, 1); // marks the cells locked
```

`lockColumn` only has an effect once the sheet is protected (`await worksheet.protect('password', {})`).

## Import

```ts
async function importProducts(file: File) {
  if (!ExcelHelper.isValidExcelFile(file)) {
    throw new Error('Please choose an .xlsx or .xls file');
  }

  const workbook = await ExcelHelper.read(file);
  const rows = ExcelHelper.parse<ProductImportRow>(workbook.worksheets[0], labels);

  // rows[0] -> { title, category, price, stock, rating, rowIndex: 2 }
  return rows;
}
```

| Method                        | Does                                                                        |
| ----------------------------- | --------------------------------------------------------------------------- |
| `isValidExcelFile(file)`      | `true` for `.xlsx` / `.xls` (by MIME type or extension); `false` for `null` |
| `read(file)`                  | Reads the file and returns the ExcelJS `Workbook`                           |
| `parse<T>(worksheet, labels)` | Turns the rows into objects keyed by `label.key`                            |

How `parse` works:

- **Row 1 is the header row** unless you pass `{ headerRow }`. Columns are matched by the exact header text, `label.name`, in any
  order. Labels whose header is missing from the file come back as `null`.
- Values are converted by `type`: `number`, `currency` and `percent` give numbers; `boolean` accepts
  `true`/`false` or the text `1`, `yes`, `có`, `active` (case-insensitive); `date` gives a `Date`;
  everything else is a trimmed string. Empty cells are `null`.
- Each object gets `rowIndex`, the row number in Excel (the first data row is `2`), so you can point
  at a row in an error message.
- Completely empty rows are dropped.
- It **throws** an `Error` (the message is in Vietnamese) when the sheet has no data row, or when no row
  has a value.

A sheet exported with `meta()` has a title above the header (title, description and an empty row, so
the header is on row 4 with a description, row 3 without). Tell `parse` where it is:

```ts
ExcelHelper.parse(worksheet, labels, { headerRow: 4 }); // rowIndex counts from the sheet top
```

## Dates and time zones

ExcelJS has no time zone support: Excel shows the UTC clock of the `Date` it is given, so writing a
`Date` as is shows 07:41 to everybody for an event at 14:41 in Vietnam. `ExcelHelper` writes the
**local** clock instead, so what the user sees in the app is what they see in Excel, and `parse` reads
it back to the same instant:

```ts
// user in Ho Chi Minh City (UTC+7)
new Date('2026-10-23T07:41:35Z'); // shows 14:41:35 in Excel, and parse() returns the same instant
```

The exported cell holds a "floating" time with no zone, which is how Excel stores times, so someone
opening the file in another time zone sees the same clock.

## Gotchas

- **`parse` matches headers by their exact text.** `Price ` or `price` will not match the label
  `Price`; the column then comes back as `null` instead of failing. Export and import with the same
  labels.
- **`percent` expects a fraction** (`0.25` for 25%), both when writing and when reading.
- **`currency` writes whole numbers with no symbol** (`#,##0`). Use `type: 'number'` with your own
  `format` (`#,##0.00`, `$#,##0.00`) for decimals or a currency sign.
- **Images are not resized into the row.** The picture is 100 × 100 px; set the row height yourself.
- **`lockColumn` needs a protected sheet** to have any effect (`await worksheet.protect('password', {})`).
