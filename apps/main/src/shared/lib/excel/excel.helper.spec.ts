import { afterEach, describe, expect, it, vi } from 'vitest';
import { FileHelper } from '../file.helper';
import { ExcelLabelModel } from './excel-label.model';
import { ExcelHelper } from './excel.helper';

async function roundTrip(
  build: (workbook: Awaited<ReturnType<typeof ExcelHelper.createWorkbook>>) => void
) {
  const workbook = await ExcelHelper.createWorkbook();
  build(workbook);

  return ExcelHelper.read(new File([await workbook.xlsx.writeBuffer()], 'data.xlsx'));
}

describe('ExcelHelper', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('pickFields', () => {
    it('keeps primitives and dates, and drops null, objects and arrays', () => {
      const date = new Date();

      expect(
        ExcelHelper.pickFields(
          { a: 1, b: 'x', c: date, d: null, e: { f: 1 }, g: [1], h: undefined },
          ['a', 'b', 'c', 'd', 'e', 'g', 'h', 'missing']
        )
      ).toEqual({ a: 1, b: 'x', c: date });
    });
  });

  describe('dates', () => {
    const labels: ExcelLabelModel[] = [{ key: 'at', name: 'At', type: 'date' }];

    it.each([
      ['Asia/Ho_Chi_Minh', -420],
      ['America/New_York', 240],
      ['UTC', 0],
    ])('shows the local clock in Excel and reads it back (%s)', async (timeZone, offset) => {
      vi.stubEnv('TZ', timeZone);
      // make sure the time zone really changed, or the test proves nothing
      expect(new Date(2026, 9, 23).getTimezoneOffset()).toBe(offset);
      const date = new Date(2026, 9, 23, 14, 41, 35);

      const workbook = await roundTrip((wb) => {
        ExcelHelper.table(wb.addWorksheet('a'), labels, [{ at: date }]);
      });
      const worksheet = workbook.worksheets[0];
      const cell = worksheet.getCell('A2').value as Date;

      // what Excel displays: the UTC clock of the stored date
      expect([cell.getUTCHours(), cell.getUTCMinutes()]).toEqual([14, 41]);
      expect(ExcelHelper.parse<{ at: Date }>(worksheet, labels)[0].at.getTime()).toBe(
        date.getTime()
      );
    });

    it('leaves invalid dates empty', async () => {
      const workbook = await roundTrip((wb) => {
        ExcelHelper.table(wb.addWorksheet('a'), labels, [{ at: 'not a date' }]);
      });

      expect(workbook.worksheets[0].getCell('A2').value).toBeNull();
    });
  });

  describe('labels', () => {
    it('applies bold and wrapText', async () => {
      const workbook = await roundTrip((wb) => {
        ExcelHelper.table(
          wb.addWorksheet('a'),
          [
            { key: 'name', name: 'Name', bold: true, wrapText: true },
            { key: 'other', name: 'Other' },
          ],
          [{ name: 'x', other: 'y' }]
        );
      });
      const worksheet = workbook.worksheets[0];

      expect(worksheet.getCell('A2').font?.bold).toBe(true);
      expect(worksheet.getCell('A2').alignment?.wrapText).toBe(true);
      expect(worksheet.getCell('B2').font?.bold).toBeFalsy();
      expect(worksheet.getCell('B2').alignment?.wrapText).toBeFalsy();
    });
  });

  describe('columns', () => {
    it('hides and locks columns past Z', async () => {
      const workbook = await ExcelHelper.createWorkbook();
      const worksheet = workbook.addWorksheet('a');
      worksheet.getCell(1, 27).value = 'AA';

      ExcelHelper.hideColumn(worksheet, 26);
      ExcelHelper.lockColumn(worksheet, 26);

      expect(worksheet.getColumn(27).hidden).toBe(true);
      expect(worksheet.getCell(1, 27).protection?.locked).toBe(true);
      expect(worksheet.getColumn(1).hidden).toBeFalsy();
    });
  });

  describe('parse', () => {
    const labels: ExcelLabelModel[] = [
      { key: 'title', name: 'Title' },
      { key: 'qty', name: 'Qty', type: 'number' },
      { key: 'ok', name: 'Ok', type: 'boolean' },
    ];

    it('reads the rows with their Excel row number', async () => {
      const workbook = await roundTrip((wb) => {
        ExcelHelper.table(wb.addWorksheet('a'), labels, [
          { title: 'A', qty: 1, ok: true },
          { title: 'B', qty: 2, ok: false },
        ]);
      });

      expect(ExcelHelper.parse(workbook.worksheets[0], labels)).toEqual([
        { title: 'A', qty: 1, ok: true, rowIndex: 2 },
        { title: 'B', qty: 2, ok: false, rowIndex: 3 },
      ]);
    });

    it('reads a sheet that has a title above the header', async () => {
      const workbook = await roundTrip((wb) => {
        const worksheet = wb.addWorksheet('a');

        ExcelHelper.meta(worksheet, { title: 'Report', description: 'Some data' });
        ExcelHelper.table(worksheet, labels, [{ title: 'A', qty: 1, ok: true }]);
      });
      const worksheet = workbook.worksheets[0];

      // title, description and an empty row come first, so the header is on row 4
      expect(ExcelHelper.parse(worksheet, labels, { headerRow: 4 })).toEqual([
        { title: 'A', qty: 1, ok: true, rowIndex: 5 },
      ]);
    });

    it('throws when there is no data row', async () => {
      const workbook = await roundTrip((wb) => {
        ExcelHelper.table(wb.addWorksheet('a'), labels, []);
      });

      expect(() => ExcelHelper.parse(workbook.worksheets[0], labels)).toThrow();
    });
  });

  describe('download', () => {
    it('returns a promise that resolves once the file is saved', async () => {
      const save = vi.spyOn(FileHelper, 'download').mockImplementation(() => undefined);
      const workbook = await ExcelHelper.createWorkbook();
      workbook.addWorksheet('a');

      await ExcelHelper.download(workbook, { title: 'my report' });

      expect(save).toHaveBeenCalledTimes(1);
      expect(save.mock.calls[0][1]).toMatch(/^My Report \d{8}\.xlsx$/);
    });
  });
});
