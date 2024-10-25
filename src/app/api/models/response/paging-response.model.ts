export interface PagingResponseModel<T> {
  data: PagingDataModel<T>;
  isError: boolean;
  message: string | null;
  statusCode: number | null;
}

export interface PagingDataModel<T> {
  list: T[];
  total: number;

  totalCount?: number;
  pageSize?: number;
  currentPage?: number;
  totalPages?: number;
}
