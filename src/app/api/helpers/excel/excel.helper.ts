import { Cell, Row, Workbook, Worksheet } from 'exceljs';
import { ExcelDatasetModel } from './excel-dataset.model';
import { ExcelLabelModel } from './excel-label.model';

export class ExcelHelper {
  static meta(
    worksheet: Worksheet,
    options: {
      title: string;
      description?: string;
    }
  ) {
    let row: Row;
    let cell: Cell;

    /** Title */
    row = worksheet.addRow([]);
    cell = row.getCell(1);
    cell.value = options.title;
    cell.font = {
      bold: true,
      size: 20,
    };

    if (options.description) {
      row = worksheet.addRow([]);
      cell = row.getCell(1);
      cell.value = options.description;
      cell.font = {
        size: 12,
      };
    }

    /** Empty row */
    worksheet.addRow([]);
  }

  static table(worksheet: Worksheet, labels: ExcelLabelModel[], datasets: ExcelDatasetModel[]) {
    /**
     * Widths of the columns
     * This will be used to auto width the columns
     */
    const widths: Record<string, number> = {
      /**
       * Example: 'column_1': 10
       */
    };

    for (const label of labels) {
      widths[label.key] = (label.name?.length || 0) + 4; // 6 is the padding
    }

    /**
     * Add the header row
     */
    const header = worksheet.addRow([]);
    ExcelHelper.insertHeader(header, labels);

    worksheet.autoFilter = {
      from: {
        row: header.number,
        column: 1,
      },
      to: {
        row: header.number,
        column: labels.length,
      },
    };

    /**
     * Add the data rows
     */
    datasets.forEach((dataset) => {
      const row = worksheet.addRow([]);
      ExcelHelper.insertRow(row, labels, dataset);
      ExcelHelper.calculateTableWidths(labels, dataset, widths);
    });

    /**
     * Auto width
     */
    for (let i = 0; i < labels.length; i++) {
      const column = worksheet.getColumn(i + 1);
      if (column) {
        column.width = widths[labels[i].key];
      }
    }

    return worksheet;
  }

  static insertHeader(row: Row, labels: ExcelLabelModel[]) {
    for (let i = 0; i < labels.length; i++) {
      const cell = row.getCell(i + 1);

      /**
       * Header value
       */
      cell.value = labels[i].name ?? labels[i].key;

      /**
       * Header formatting
       */
      // Text Color
      cell.font = {
        bold: true,
        size: 12,
      };

      if (
        labels[i].type === 'currency' ||
        labels[i].type === 'number' ||
        labels[i].type === 'date' ||
        labels[i].type === 'percent'
      ) {
        cell.alignment = {
          horizontal: 'right',
        };
      }
    }
  }

  static insertRow(row: Row, labels: ExcelLabelModel[], dataset: ExcelDatasetModel) {
    /**
     * Each loop will add a new column in the row
     */
    for (let i = 0; i < labels.length; i++) {
      const cell = row.getCell(i + 1);
      let value: any = dataset[labels[i].key];

      /**
       * Header alignment
       */
      cell.alignment = Object.assign(cell.alignment || {}, { vertical: 'top' });

      if (
        typeof value === 'string' &&
        (labels[i].type === 'number' ||
          labels[i].type === 'currency' ||
          labels[i].type === 'date' ||
          labels[i].type === 'percent')
      ) {
        cell.alignment = Object.assign(cell.alignment || {}, { horizontal: 'right' });
      }

      /**
       * Data type formatting
       */
      if (labels[i].type === 'currency') {
        cell.numFmt = '#,##0';
        value = value || 0;
      }

      if (labels[i].type === 'number' && labels[i].format) {
        cell.numFmt = labels[i].format ?? '#,##0.00';
      }

      if (labels[i].type === 'percent') {
        cell.numFmt = '0.00%';
      }

      if (labels[i].type === 'date') {
        cell.numFmt = labels[i].format ?? 'mm/dd/yyyy HH:mm';

        /**
         * ExcelJS doesn't support timezone, so we need to cheat
         * by converting the date to UTC and then back to local
         */
        if (value) {
          const date = new Date(value);
          const isValid = !isNaN(date.getTime()) && date.getFullYear() > 1900;
          value = isValid ? new Date(date.toISOString().slice(0, -1) /** Remove 'Z' */) : null;
        }
      }

      if (labels[i].type === 'image') {
        /**
         * `imageId` is a numeric identifier for an image.
         * You must first add the image (in base64 format) to the workbook to obtain this ID.
         * For this data type, it is assumed that the value has already been converted to an `imageId`.
         */
        if (typeof value === 'number') {
          row.worksheet.addImage(value /** imageId */, {
            tl: {
              col: cell.fullAddress.col,
              row: cell.fullAddress.row,
            },
            ext: { width: 100, height: 100 },
          });
        }
      }

      /**
       * Set the value to the cell
       */
      cell.value = value;
    }
  }

  static calculateTableWidths(
    labels: ExcelLabelModel[],
    dataset: ExcelDatasetModel,
    widths: Record<string, number>
  ) {
    /**
     * Update the width of the columns
     * With the maximum length of the cell value
     */
    for (const label of labels) {
      if (label.type === 'date') {
        widths[label.key] = Math.max(widths[label.key], 26);
        continue;
      }

      const value = `${dataset[label.key] ?? ''}`;
      const length = value.length ?? 10;

      if (label.maxWidth) {
        widths[label.key] = Math.min(
          Math.max(
            widths[label.key],
            length + 8 // 8 is the padding
          ),
          label.maxWidth ?? 0
        );
      } else {
        widths[label.key] = Math.max(
          widths[label.key],
          length + 8 // 8 is the padding
        );
      }
    }
  }

  static createWorkbook(): Workbook {
    const workbook = new Workbook();
    workbook.creator = 'dev@dss.vn';
    workbook.lastModifiedBy = 'dev@dss.vn';
    workbook.title = 'DSS Export';
    workbook.created = new Date();
    return workbook;
  }

  static download(workbook: Workbook, options: { title: string }): void {
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const name = `${ExcelHelper._toPascalCase(options.title)} ${ExcelHelper._exportDate()}.xlsx`;

      const data = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = data;
      link.download = name;

      link.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window,
        })
      );

      setTimeout(() => {
        window.URL.revokeObjectURL(data);
        link.remove();
      }, 100);
    });
  }

  static isValidExcelFile(file: File | null | undefined): boolean {
    if (!file) {
      return false;
    }

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    const validExtensions = ['.xlsx', '.xls'];

    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const isValidType = validTypes.includes(file.type) || validExtensions.includes(fileExtension);

    return isValidType;
  }

  static async read(file: File) {
    const readAsBuffer = (file: File) =>
      new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onerror = (error) => reject(error);
        reader.onload = () => resolve(reader?.result as ArrayBuffer);
      });

    const buffer = await readAsBuffer(file);

    const workbook = new Workbook();
    await workbook.xlsx.load(buffer);

    return workbook;
  }

  static pickFields<T extends Record<string, any>>(obj: T, fields: string[]): ExcelDatasetModel {
    const result: ExcelDatasetModel = {};

    for (const field of fields) {
      if (
        Object.prototype.hasOwnProperty.call(obj, field) &&
        obj[field] !== null &&
        obj[field] !== undefined &&
        typeof obj[field] !== 'object' // Ignore objects and arrays
      ) {
        result[field] = obj[field];
      }
    }

    return result;
  }

  /**
   * Parse Excel worksheet data into an array of objects based on labels
   * @param worksheet - The Excel worksheet to parse
   * @param labels - Array of label definitions that map column names to keys
   * @returns Array of parsed data objects
   */
  static parse<T extends Record<string, any> = Record<string, any>>(
    worksheet: Worksheet,
    labels: ExcelLabelModel[]
  ): T[] {
    const rows = worksheet.getRows(1, worksheet.rowCount);

    if (!rows || rows.length < 2) {
      throw new Error('File Excel phải có ít nhất 1 dòng dữ liệu (không tính dòng tiêu đề)');
    }

    // Convert row.values to arrays (ExcelJS row.values can be array or object)
    const data = rows.map((row) => {
      const values = row.values;
      if (Array.isArray(values)) {
        return values;
      }
      // If values is an object, convert to array
      const arr: any[] = [];
      for (let i = 1; i <= row.cellCount; i++) {
        const cell = row.getCell(i);
        arr.push(cell.value ?? null);
      }
      return arr;
    });

    // First row is headers
    const headerRow = data[0] as any[];
    const dataRows = data.slice(1);

    // Create a mapping from column name to column index
    const columnIndexMap: Record<string, number> = {};
    labels.forEach((label) => {
      const index = headerRow.findIndex((header: any) => header === label.name);
      if (index !== -1) {
        columnIndexMap[label.key] = index;
      }
    });

    // Parse data rows
    const parsedData: T[] = dataRows
      .map((row, rowIndex) => {
        const rowArray = row as any[];

        const getValue = (key: string): any => {
          const colIndex = columnIndexMap[key];
          if (colIndex === undefined || colIndex >= rowArray.length) {
            return null;
          }
          return rowArray[colIndex] ?? null;
        };

        const getNumberValue = (key: string): number | null => {
          const value = getValue(key);
          if (value === null || value === undefined || value === '') {
            return null;
          }
          const num = typeof value === 'number' ? value : Number(value);
          return isNaN(num) ? null : num;
        };

        const getStringValue = (key: string): string | null => {
          const value = getValue(key);
          if (value === null || value === undefined) {
            return null;
          }
          return String(value).trim() || null;
        };

        const getBooleanValue = (key: string): boolean | null => {
          const value = getValue(key);
          if (value === null || value === undefined || value === '') {
            return null;
          }
          if (typeof value === 'boolean') {
            return value;
          }
          const str = String(value).toLowerCase().trim();
          return str === 'true' || str === '1' || str === 'yes' || str === 'có' || str === 'active';
        };

        const getDateValue = (key: string): Date | null => {
          const value = getValue(key);
          if (value === null || value === undefined || value === '') {
            return null;
          }
          if (value instanceof Date) {
            return value;
          }
          const date = new Date(value);
          return isNaN(date.getTime()) ? null : date;
        };

        // Build the result object based on labels
        const result: any = {};

        labels.forEach((label) => {
          switch (label.type) {
            case 'number':
            case 'currency':
            case 'percent':
              result[label.key] = getNumberValue(label.key);
              break;
            case 'boolean':
              result[label.key] = getBooleanValue(label.key);
              break;
            case 'date':
              result[label.key] = getDateValue(label.key);
              break;
            default:
              result[label.key] = getStringValue(label.key);
              break;
          }
        });

        // Add rowIndex if not already present
        if (result.rowIndex === undefined || result.rowIndex === null) {
          result.rowIndex = rowIndex + 2; // Excel row number (1-indexed, exclude header row)
        }

        return result as T;
      })
      .filter((item) => {
        // Filter out completely empty rows (check if at least one non-rowIndex field has a value)
        return Object.keys(item).some((key) => {
          if (key === 'rowIndex') {
            return false;
          }
          const value = item[key];
          return value !== null && value !== undefined && value !== '';
        });
      });

    if (parsedData.length === 0) {
      throw new Error('Không tìm thấy dữ liệu hợp lệ trong file Excel');
    }

    return parsedData;
  }

  static lockColumn(worksheet: Worksheet, columnIndex: number /** zero-based index */) {
    if (!worksheet) {
      return;
    }

    const columnLetter = String.fromCharCode(65 + columnIndex);
    const column = worksheet.getColumn(columnLetter);

    if (!column) {
      return;
    }

    column.eachCell((cell) => {
      cell.protection = {
        locked: true,
      };
    });
  }

  static hideColumn(worksheet: Worksheet, columnIndex: number /** zero-based index */) {
    if (!worksheet) {
      return;
    }

    const columnLetter = String.fromCharCode(65 + columnIndex);
    const column = worksheet.getColumn(columnLetter);

    if (!column) {
      return;
    }

    column.hidden = true;
  }

  private static _toPascalCase(text: string): string {
    if (!text) {
      return 'Báo Cáo';
    }

    return text
      .toLowerCase()
      .trim()
      .split(/\s+/) // Split by whitespace
      .filter((word) => !!word) // Remove empty strings
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize first letter of each word
      .join(' '); // Join with whitespace
  }

  private static _exportDate(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}${month}${day}`;
  }
}
