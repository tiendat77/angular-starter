import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';

export class TableDataSource<T = any> extends DataSource<T> {
  data = new BehaviorSubject<T[]>([]);

  connect(): Observable<T[]> {
    return this.data;
  }

  disconnect() {
    this.data.complete();
  }
}
