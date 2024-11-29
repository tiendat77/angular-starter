import { EnvironmentProviders, Provider } from '@angular/core';
import { IconNamespace } from './icon.interface';
export declare const provideIcons: (namespaces?: IconNamespace[]) => (Provider | EnvironmentProviders)[];
