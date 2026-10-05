import { Injectable } from '@angular/core';

import { BaseApiService } from '@/shared/api/base/api.base';
import { environment } from '@environment';
import { __Pascal__Model, __Pascal__Schema } from '../model';

@Injectable({
  providedIn: 'root',
})
export class __Pascal__ApiService extends BaseApiService<__Pascal__Model> {
  protected override _baseUrl = `${environment.apiUrl}/__kebab__`;
  protected override _schema = __Pascal__Schema;
}
