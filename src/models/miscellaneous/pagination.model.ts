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
  private _index = 1;

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
  private _size = 10;

  /**
   * Total Records
   */
  total = 0;

  /**
   * Sort By
   */
  set sort(value: string | null) {
    const [sortBy, sortOrder] = (value || '').split(' ');

    if (!sortBy || !sortOrder || !['asc', 'desc'].includes(sortOrder)) {
      this._sortBy = null;
      this._sortOrder = null;
      return;
    }

    this._sortBy = sortBy;
    this._sortOrder = sortOrder as 'asc' | 'desc';
  }
  get sort(): string | null {
    return this._sortBy && this._sortOrder ? `${this._sortBy} ${this._sortOrder}` : null;
  }
  protected _sortBy: string | null = null;
  protected _sortOrder: 'asc' | 'desc' | null = null;

  constructor(data: Partial<Pagination> = {}) {
    Object.assign(this, data);
  }
}
