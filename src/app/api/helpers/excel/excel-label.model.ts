export interface ExcelLabelModel {
  /**
   * ID of the column
   */
  id?: string;

  /**
   * Property name of the dataset
   */
  key: string;

  /**
   * Column header name
   * If not provided, it will be the same as prop
   */
  name: string;

  /**
   * Data type of column
   * string | number | currency | date | percent | boolean
   * Its value will be used to align the column header
   */
  type?: 'string' | 'number' | 'currency' | 'date' | 'percent' | 'boolean' | 'image';

  /**
   * Data format: date | currency $ | percentage %
   *
   * For date time format: mm/dd/yyyy hh:mm AM/PM
   * |                                          |            |
   * |------------------------------------------|------------|
   * | m                                        | 1          |
   * | mm                                       | 01         |
   * | mmm                                      | Jan        |
   * | mmmm                                     | January    |
   * | mmmmm                                    | J (stands for January, June and July) |
   * | d                                        | 1          |
   * | dd                                       | 01         |
   * | ddd                                      | Mon        |
   * | dddd                                     | Monday     |
   * | yy                                       | 05         |
   * | yyyy                                     | 2005       |
   * | h                                        | 0-23       |
   * | hh                                       | 00-23      |
   * | m                                        | 0-59       |
   * | mm                                       | 00-59      |
   * | s                                        | 0-59       |
   * | ss                                       | 00-59      |
   * | AM/PM                                    | AM or PM   |
   *
   * For number format: Example 1234.56
   * |                                          |            |
   * |------------------------------------------|------------|
   * | 0.00                                     | 1234,56    |
   * | 0                                        | 1235       |
   * | #,##0                                    | 1.235      |
   * | #,##0.00                                 | 1.234,56   |
   * | #,##0_);(#,##0)                          | 1.235      |
   * | #,##0_);[Red](#,##0)                     | 1.235      |
   * | #,##0.00_);(#,##0.00)                    | 1.234,56   |
   * | #,##0.00_);[Red](#,##0.00)               | 1.234,56   |
   * | $#,##0_);($#,##0)$                       | 1.235      |
   * | $#,##0_);[Red]($#,##0)$                  | 1.235      |
   * | $#,##0.00_);($#,##0.00)$                 | 1.234,56   |
   * | $#,##0.00_);[Red]($#,##0.00)$            | 1.234,56   |
   * | @                                        | 1234,56    |
   * | 0%                                       | 123456%    |
   * | 0.00%                                    | 123456,00% |
   * | 0.00E+00                                 | 1,23E+03   |
   * | ##0.0E+0                                 | 1,2E+3     |
   * | # ?/?                                    | 1234 5/9   |
   * | # ??/??                                  | 1234 14/25 |
   * | _($* #,##0_);_(...($* "-"_);_(@_)$       | 1.235      |
   * | _(* #,##0_);_(*..._(* "-"_);_(@_)        | 1.235      |
   * | _($* #,##0.00_)...* "-"??_);_(@_)$       | 1.234,56   |
   * | _(* #,##0.00_);...* "-"??_);_(@_)        | 1.234,56   |
   */
  format?: string;

  wrapText?: boolean;

  /**
   * Cell font bold
   */
  bold?: boolean;

  /**
   * Maximum width of the column. If not set, it will be calculated based on the content.
   */
  maxWidth?: number;
}
