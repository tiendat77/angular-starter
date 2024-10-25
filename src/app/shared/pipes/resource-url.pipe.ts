import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '@environment';

@Pipe({
  standalone: true,
  name: 'resourceUrl',
})
export class ResourceUrlPipe implements PipeTransform {
  transform(url: string, fallback?: string) {
    if (!url) {
      return fallback || '';
    }

    if (/^(http|https):\/\//.test(url)) {
      return url;
    }

    return `${environment.apiUrl.replace(/\/api$/, '')}/${url}`;
  }
}
