import { Observable } from 'rxjs';

import { PagingDataModel } from '../models/response';

/**
 * API Read Interface
 */
export declare interface ApiRead<T = any> {
  read(id: string): Observable<T>;
}

/**
 * API Create Interface
 */
export declare interface ApiCreate<T = any> {
  create(data: T): Observable<T>;
}

/**
 * API Update Interface
 */
export declare interface ApiUpdate<T = any> {
  update(id: string, data: T): Observable<T>;
}

/**
 * API Patch Interface
 */
export declare interface ApiPatch<T = any> {
  patch(id: string, data: Partial<T>): Observable<T>;
}

/**
 * API Delete Interface
 */
export declare interface ApiDelete<T = any> {
  delete(id: Partial<T> | string): Observable<boolean>;
}

/**
 * API List Interface
 */
export declare interface ApiList<T = any> {
  list(): Observable<T[]>;
}

/**
 * API Paginate Interface
 */
export declare interface ApiPaginate<T = any> {
  paginate(page: number, size: number): Observable<PagingDataModel<T>>;
}
