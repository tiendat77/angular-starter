export class Pagination {
  /**
   * Page Index
   */
  set index(value: number) {
    if (value < 1) {
      value = 1;
    }
    this._index = value;
  }
  get index(): number {
    return this._index;
  }
  private _index: number = 1;

  /**
   * Page Size
   */
  set size(value: number) {
    if (value < 1) {
      value = 1;
    }
    this._size = value;
  }
  get size(): number {
    return this._size;
  }
  private _size: number = 10;

  /**
   * Total Records
   */
  total: number = 0;

  /**
   * Sort By
   */
  set sortBy(value: string | null) {
    if (value && value.trim() === '') {
      value = null;
    }

    this._sortBy = value;
  }
  get sortBy(): string | null {
    return this._sortBy;
  }
  private _sortBy: string | null = null;

  /**
   * Sort Order
   */
  set sortOrder(value: string | 'ascend' | 'descend' | null) {
    if (value !== 'ascend' && value !== 'descend' && value !== null) {
      throw new Error('Invalid sort order');
    }

    this._sortOrder = value;
  }
  get sortOrder(): string | 'ascend' | 'descend' | null {
    return this._sortOrder;
  }
  private _sortOrder: string | 'ascend' | 'descend' | null = null;

  constructor(data: Partial<Pagination> = {}) {
    Object.assign(this, data);
  }
}
