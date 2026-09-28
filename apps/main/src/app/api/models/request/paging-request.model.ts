export interface PagingRequestModel {
  page: number;
  pageSize: number;
  keyword?: string;
  sortBy?: string | null;
  sortOrder?: string | 'ascend' | 'descend';

  [key: string]: string | number | null | undefined; // Allow additional properties
}
