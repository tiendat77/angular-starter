import { Injectable } from '@angular/core';
import { environment } from '@environment';

import { ApiList, BaseAPIOperator, BaseApiService } from '../../base';
import { ExampleModel, ExampleSchema, ResponseModel } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class ExampleAPIService extends BaseApiService<ExampleModel> implements ApiList {
  override _baseUrl = `${environment.apiUrl}/examples`;

  read(id: string) {
    return this._http
      .get<ResponseModel<ExampleModel>>(`${this._baseUrl}/${id}`)
      .pipe(BaseAPIOperator.responseHandler<ExampleModel>(ExampleSchema));
  }

  list() {
    return this._list();
  }

  create(data: Partial<ExampleModel>) {
    return this._create(data);
  }

  update(id: string, data: Partial<ExampleModel>) {
    return this._update(id, data);
  }

  delete(id: string) {
    return this._delete(id);
  }
}
