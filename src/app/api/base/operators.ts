import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import z from 'zod';

import { PagingDataModel, ResponseModel } from '../models';

export class BaseAPIOperator {
  /**
   * RxJS Operator to handle API response
   */
  static responseHandler = <T = any>(schema?: z.ZodSchema<T>) =>
    function (source: Observable<ResponseModel<T>>) {
      return source.pipe(
        switchMap((response) => {
          if (response.isError) {
            return throwError(() => new Error(response.message || 'Unknown error occurred'));
          }

          return of(response.data as T);
        }),
        map((data) => (schema ? schema.parse(data) : data) as T),
        catchError((error) => {
          return throwError(() => error);
        })
      );
    };

  /**
   * RxJS Operator to handle API pagination response
   */
  static pagingHandler = <T = any>(schema?: z.ZodSchema<any>) =>
    function (source: Observable<PagingDataModel<T>>) {
      return source.pipe(
        map((response) => {
          return {
            list: schema
              ? (response.list || []).map((item) => schema.parse(item))
              : response.list || [],
            total: response.totalCount ?? 0,
            hasNext: response.hasNext,
            totalPages: response.totalPages,
          };
        }),
        catchError((error) => {
          return throwError(() => error);
        })
      );
    };
}
