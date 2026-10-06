import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { ComputedStyleDirective } from './computed-style.directive';
import {
  BRAND_SCALES,
  FONT_FAMILIES,
  ICON_SIZES,
  SEMANTIC_COLORS,
  SHADOWS,
  STYLE_GUIDE_COLORS,
  TYPE_SCALE,
} from './theme-tokens';

interface Layer {
  readonly name: string;
  readonly source: string;
  readonly provides: string;
  readonly usedBy: string;
}

@Component({
  selector: 'doc-theme',
  imports: [ComputedStyleDirective, CodeBlockComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './theme-doc.component.html',
})
export class ThemeDocComponent {
  readonly semanticColors = SEMANTIC_COLORS;
  readonly brandScales = BRAND_SCALES;
  readonly styleGuideColors = STYLE_GUIDE_COLORS;
  readonly fontFamilies = FONT_FAMILIES;
  readonly typeScale = TYPE_SCALE;
  readonly shadows = SHADOWS;
  readonly iconSizes = ICON_SIZES;

  readonly layers: readonly Layer[] = [
    {
      name: '@libs/ui tokens',
      source: 'libs/ui/styles/tokens.css',
      provides:
        'Neutral semantic colors (light and dark), icon sizes, the dark: variant and the component utilities.',
      usedBy: 'Every app',
    },
    {
      name: '@libs/theme tokens',
      source: 'libs/theme/styles/tokens.css',
      provides:
        'Brand primary and secondary scales, the style-guide palette, shadows, fonts and the type scale. Definitions only: importing it changes no component.',
      usedBy: 'apps/main, apps/docs',
    },
    {
      name: '@libs/theme brand',
      source: 'libs/theme/styles/brand.css',
      provides:
        'Re-brands @libs/ui: points --color-primary and --color-secondary at the brand scales. Unlayered, so it also wins in dark mode.',
      usedBy: 'apps/main only (the docs stay neutral)',
    },
    {
      name: 'App styles',
      source: 'apps/main/src/styles/',
      provides:
        'Legacy RGB surfaces (bg-card, text-hint, ...), safe-area utilities, extra spacing keys, vendor tweaks.',
      usedBy: 'apps/main only',
    },
  ];

  readonly colorUsage = `<!-- Semantic: follows the theme and the app's brand -->
<button class="bg-primary text-primary-content">Save</button>
<p class="text-muted-foreground">Secondary text</p>

<!-- Brand scale step -->
<div class="bg-primary-50 text-primary-700 border-primary-200">Soft brand callout</div>

<!-- Style-guide palette (numbered 1 = lightest) -->
<span class="bg-green-1 text-green-3">Paid</span>`;

  readonly typeUsage = `<h1 class="text-heading-xl">Page title</h1>
<p class="text-body-md">Body copy in Roboto.</p>
<span class="text-expressive-xs">NEW</span>

<!-- The utilities set family, size, line-height and weight together:
     don't add text-sm / font-medium on top. -->`;

  readonly shadowUsage = `<div class="shadow-small">Resting card</div>
<div class="shadow-medium">Raised card</div>
<div class="shadow-notification">Toast / notification</div>`;

  readonly darkUsage = `<!-- The theme is data-theme="light" | "dark" on <html> -->
<html data-theme="dark">

<!-- Tokens flip by themselves; only use dark: for raw palette colors -->
<div class="bg-background text-foreground border-border"></div>`;
}
