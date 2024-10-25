import { DomSanitizer } from '@angular/platform-browser';
import { SvgIconRegistry } from './icon-registry';
import { IconNamespace } from './icon.interface';
import * as i0 from "@angular/core";
export declare class IconsService {
    protected _domSanitizer: DomSanitizer;
    protected _svgIconRegistry: SvgIconRegistry;
    protected _namespaces: IconNamespace[];
    constructor();
    register(namespaces: IconNamespace[]): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<IconsService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<IconsService>;
}
