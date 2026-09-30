import { inject, Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs';

import { SvgIconRegistry } from './icon-registry';
import { IconNamespace } from './icon.interface';
import { ICON_NAMESPACES } from './icon.token';

@Injectable({ providedIn: 'root' })
export class IconsService {
  protected _domSanitizer = inject(DomSanitizer);
  protected _svgIconRegistry = inject(SvgIconRegistry);
  protected _namespaces = inject(ICON_NAMESPACES);

  constructor() {
    if (this._namespaces?.length) {
      this.register(this._namespaces);
    }
  }

  register(namespaces: IconNamespace[]) {
    for (const namespace of namespaces) {
      this._svgIconRegistry.addSvgIconSetInNamespace(
        namespace.name,
        this._domSanitizer.bypassSecurityTrustResourceUrl(namespace.url)
      );
    }
  }

  /** Namespaces with registered icons or icon sets. */
  namespaces(): string[] {
    return this._svgIconRegistry.getNamespaces();
  }

  /** Names of every icon in a namespace, e.g. to render an icon gallery. */
  list(namespace: string): Observable<string[]> {
    return this._svgIconRegistry.getIconNames(namespace);
  }
}
