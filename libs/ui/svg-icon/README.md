# SVG Icon

Named SVG icons from sprite sheets (icon sets), loaded over HTTP once and cached, drawn inline so they take the text colour. Based on Angular Material's `mat-icon` registry.

```ts
import { provideIcons, SvgIcon, SvgIconRegistry } from '@libs/ui/svg-icon';
```

## Usage

Register the icon sets once, as `{ name: namespace, url }`. The URL is relative to the page's `<base href>`:

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideIcons([
      { name: 'heroicons_outline', url: 'icons/heroicons-outline.svg' },
      { name: 'heroicons_solid', url: 'icons/heroicons-solid.svg' },
    ]),
  ],
};
```

Then use an icon by `namespace:icon`. Size it with a class (`icon-size-5`) or by the font size, and colour it with the text colour:

```html
<svg-icon name="heroicons_outline:home" class="icon-size-5 text-primary" />

<!-- Follows the font size of the text around it -->
<span class="text-lg">Settings <svg-icon name="heroicons_solid:cog-6-tooth" inline /></span>
```

An icon font works too: `<svg-icon fontSet="material-icons" fontIcon="home" />`.

`SvgIconModule` bundles `SvgIcon` for module-based code. Because of `provideIcons()` an `HttpClient` is provided as well.

## API

### `svg-icon`

| Input      | Type      | Default | Description                                                                                                                                             |
| ---------- | --------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`     | `string`  | –       | The icon, as `namespace:icon` (or just `icon` in the default namespace).                                                                                |
| `inline`   | `boolean` | `false` | Sizes the icon to the font size of the element it is in.                                                                                                |
| `color`    | `string`  | –       | Adds the class `svg-<color>` (the Material convention: `primary`, `accent`, `warn`). To colour an icon, use a text colour class such as `text-primary`. |
| `fontSet`  | `string`  | –       | Class alias of an icon font (registered with `registerFontClassAlias`).                                                                                 |
| `fontIcon` | `string`  | –       | Name of the icon inside that font.                                                                                                                      |

### `provideIcons(namespaces)`

Registers icon sets and creates the registry at bootstrap. Each entry is `{ name, url }`.

### `SvgIconRegistry` and `IconsService`

| Method                                                                      | Description                                                         |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `addSvgIcon(name, url, options?)`                                           | Registers one icon by URL.                                          |
| `addSvgIconLiteral(name, html, options?)`                                   | Registers one icon from an SVG string.                              |
| `addSvgIconSet(url)` / `addSvgIconSetInNamespace(ns, url)`                  | Registers an icon set (a sprite of `<symbol>`s or nested `<svg>`s). |
| `addSvgIconInNamespace(ns, name, url)`                                      | Registers an icon in a namespace.                                   |
| `addSvgIconResolver(fn)`                                                    | Resolves a URL for any name `(name, namespace) => url`.             |
| `registerFontClassAlias(alias, classNames?)`, `setDefaultFontSetClass(...)` | Icon fonts.                                                         |
| `getNamedSvgIcon(name, ns?)`                                                | `Observable<SVGElement>` of a registered icon.                      |
| `getIconNames(ns?)` / `IconsService.list(ns)`                               | The names in a namespace (for an icon gallery).                     |
| `IconsService.register(namespaces)`, `.namespaces()`                        | The namespaces registered by `provideIcons()`.                      |
