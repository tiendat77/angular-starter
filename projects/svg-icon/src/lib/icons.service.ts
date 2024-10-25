import { DomSanitizer } from '@angular/platform-browser';
import { inject, Injectable } from '@angular/core';

import { SvgIconRegistry } from './icon-registry';
import { ICON_NAMESPACES } from './icon.token';
import { IconNamespace } from './icon.interface';

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
}
