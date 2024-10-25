import { Injectable, inject } from '@angular/core';

/**
 * Resources
 **/
import { ExampleAPIService } from './resources/example.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  public example = inject(ExampleAPIService);
}
