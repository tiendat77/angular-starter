import { InjectionToken } from '@angular/core';

const UI_CONFIG = new InjectionToken('UI_CONFIG');
function provideUiConfig(config) {
    return { provide: UI_CONFIG, useValue: config };
}

class UiFormFieldControl {
}

function cn(...inputs) {
    return inputs.filter(Boolean).join(' ').trim();
}

function cva(config) {
    return (props, extraClass) => {
        const classes = [];
        if (config.base)
            classes.push(config.base);
        if (config.variants) {
            for (const variantKey in config.variants) {
                const propValue = props?.[variantKey] ?? config.defaultVariants?.[variantKey];
                if (propValue && config.variants[variantKey][propValue]) {
                    classes.push(config.variants[variantKey][propValue]);
                }
            }
        }
        if (extraClass)
            classes.push(extraClass);
        return cn(...classes);
    };
}

/**
 * Generated bundle index. Do not edit.
 */

export { UI_CONFIG, UiFormFieldControl, cn, cva, provideUiConfig };
//# sourceMappingURL=libs-ui-core.mjs.map
