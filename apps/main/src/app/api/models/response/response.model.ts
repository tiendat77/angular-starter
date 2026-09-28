export interface ResponseModel<T = any> {
  data: T;
  isError: boolean;
  message: string | null;
  statusCode: number | null;
  errorCode?: string | number | null;
}
