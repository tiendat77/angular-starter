import { Observable, of, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { PagingDataModel, ResponseModel } from '../models/response';

export class BaseAPIOperator {
  /**
   * RxJS Operator to handle API response
   */
  static responseHandler = () =>
    function <T>(source: Observable<ResponseModel<T>>) {
      return source.pipe(
        switchMap((response) => {
          if (response.isError) {
            return throwError(() => new Error(response.message || 'An error occurred'));
          }

          return of(response.data);
        })
      );
    };

  /**
   * RxJS Operator to handle API pagination response
   */
  static pagingHandler = () =>
    function <T>(source: Observable<PagingDataModel<T>>) {
      return source.pipe(
        switchMap((response) => {
          return of({
            list: response.list || [],
            total: response.totalCount ?? 0,
          });
        })
      );
    };
}
