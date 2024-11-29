import { Injectable } from '@angular/core';
import { environment } from '@environment';

import {
  ApiCreate,
  ApiDelete,
  ApiList,
  ApiPaginate,
  ApiRead,
  ApiUpdate,
  BaseApiService,
} from '../base';

import { ExampleModel } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ExampleAPIService
  extends BaseApiService<ExampleModel>
  implements ApiList, ApiPaginate, ApiRead, ApiCreate, ApiUpdate, ApiDelete
{
  override _baseUrl = `${environment.apiUrl}/example`;

  list() {
    return this._list();
  }

  paginate(page = 1, size = 10) {
    return this._paginate(page, size);
  }

  create(data: Partial<ExampleModel>) {
    return this._create(data);
  }

  read(id: string) {
    return this._read(id);
  }

  update(id: string, data: Partial<ExampleModel>) {
    return this._update(id, data);
  }

  delete(id: string) {
    return this._delete(id);
  }
}
