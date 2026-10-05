# Angular Starter

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 22.

## Project structure (Feature-Sliced Design)

The workspace has three projects: `apps/main` (the application), `apps/docs` (component showcase) and `libs/*` (the `@libs/ui` kit and friends). `apps/main/src` follows [Feature-Sliced Design](https://feature-sliced.design/): code is split into **layers**, and a layer may only import from the layers **below** it.

```
apps/main/src/
├── app/         bootstrap: app.config.ts, app.routes.ts, guards/, interceptors/
├── pages/       one slice per route: sign-in, sign-up, products, not-found, ...
├── widgets/     large composite blocks reused across pages: layouts
├── features/    user actions with business value: auth, theme-toggle, product-filter, product-manage
├── entities/    business data: session (tokens + current user), product (model, api, detail dialog)
├── shared/      domain-free building blocks: api/, lib/, config/, ui/, directives/, pipes/
├── environments/, styles/, main.ts, index.html   build entry and static files (not layers)
```

### Import rules

| Layer      | May import                                 |
| ---------- | ------------------------------------------ |
| `app`      | pages, widgets, features, entities, shared |
| `pages`    | widgets, features, entities, shared        |
| `widgets`  | features, entities, shared                 |
| `features` | entities, shared                           |
| `entities` | shared                                     |
| `shared`   | nothing from the app (`@libs/*` is fine)   |

- **Slices on the same layer never import each other** (`entities/product` must not use `entities/session`). If two slices need the same thing, move it down a layer or compose them in a higher one.
- **Import a slice through its `index.ts` only**: `import { SessionStore } from '@/entities/session'`, never `@/entities/session/model/session.store`.
- Inside a slice, use relative imports. Across slices and layers, use the `@/` alias (it points to `apps/main/src/*`).
- `shared` is split by segment and has no slice `index.ts`; import from the segment, e.g. `@/shared/lib/theme`, `@/shared/ui/logo`.

### Anatomy of a slice

Create a segment folder only when the slice has something to put in it:

```
entities/product/
├── api/      HTTP calls (product-api.service.ts)
├── model/    types, zod schemas, stores
├── ui/       presentation components
└── index.ts  the slice's public API
```

`pages/<name>/` additionally has a `routes.ts`, exposed as the default export of `index.ts` (`export { default } from './routes'`), and `app.routes.ts` lazy-loads it with `loadChildren: () => import('@/pages/<name>')`. Page-local state (for example the products list store) lives in the page's own `model/`.

### Where does my code go?

1. A route's screen? `pages/<route>`.
2. A reusable user action (a form, a dialog that changes data, a toggle)? `features/<action>`.
3. A business object and how it is fetched and shown (`product`, `session`)? `entities/<name>`.
4. A shell shared by many pages (sidebar + header)? `widgets/<name>`.
5. Knows nothing about this app's domain (HTTP base class, helpers, pipes, generic UI)? `shared/<segment>`.
6. Wires the application together (providers, guards, interceptors, root routes)? `app/`.

### Enforced by the linter

The rules above are checked by `eslint-plugin-boundaries` (see `eslint.config.js`) and fail as errors:

```bash
npx eslint apps/main          # reports upward imports, cross-slice imports and deep imports
```

### Adding a page, feature or entity

Use the generator instead of copying a neighbour: it creates the slice with the right structure, naming and a passing test.

```bash
npm run new:page -- invoice-list            # pages/invoice-list: routes, component, spec
npm run new:feature -- invoice-filter       # presentational component
npm run new:entity -- invoice               # zod model + API service
npm run new:page -- invoice-list --dry-run  # show what would be written (keep the `--`)
```

Routes and the sidebar stay hand-written, in one place each: add the page's route to `app/app.routes.ts` and, if it belongs in the menu, an item to `widgets/layouts/config/navigation.config.ts`. For a page the generator prints the route snippet to paste.

### Checks (CI)

`npm run verify` runs exactly what CI runs on every pull request: lint (with the boundary rules above), the unit tests, the production builds of the app, the docs and the libraries. It is the one command to run before pushing. The lint warning count is capped (`lint:ci` in `package.json`): fix warnings you touch and lower the cap.

### Analyzing the bundle

`npm run analyze` builds with `--stats-json`, writes an interactive treemap to `dist/main/stats.html` and prints what is in the initial bundle. `npm run analyze:report` reprints the report from the last build, and `npm run analyze:open` opens the treemap.

## Libraries and Utilities

When contributing to this project, please ensure you use the following installed libraries as per our standards:

- **Date and Time**: Use `dayjs` instead of `moment` for all date-time calculations.
- **Schema Validation**: Use `zod` for all schema validation needs.
- **Utilities**: Use `es-toolkit` instead of `lodash` for general utility functions.
- **Animations**: Use `@lottiefiles` for handling UI animations.
- **Excel Manipulating**: Use `exceljs` for reading, writing, and manipulating Excel worksheets.

## Git Branch Naming Convention

The [Git Branching Naming Convention](https://dev.to/couchcamote/git-branching-name-convention-cch) article is an excellent base.
However, you can simplify even more.

**Category**

A git branch should start with a category. Pick one of these: `feat`, `fix`, `hotfix`, or `test`.

- `feat` is for adding, refactoring or removing a feature
- `fix` is for fixing a bug
- `hotfix` is for changing code with a temporary solution and/or without following the usual process (usually because of an emergency)
- `test` is for experimenting outside of an issue/ticket

**Reference**

After the category, there should be a `"/"` followed by the reference of the issue/ticket you are working on. If there's no reference, just add `no-ref`.

**Description**

After the reference, there should be another `"/"` followed by a description which sums up the purpose of this specific branch. This description should be short and "kebab-cased".

By default, you can use the title of the issue/ticket you are working on. Just replace any special character by `"-"`.

---

**Examples:**

- You need to add, refactor or remove a feature: `git branch feat/issue-42/create-new-button-component`
- You need to fix a bug: `git branch fix/issue-342/button-overlap-form-on-mobile`
- You need to fix a bug really fast (possibly with a temporary solution): `git branch hotfix/no-ref/registration-form-not-working`
- You need to experiment outside of an issue/ticket: `git branch test/no-ref/refactor-components-with-atomic-design`

## Git Commit Naming Convention

The commit message should be structured as follows:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

The commit contains the following structural elements, to communicate intent to the consumers of your library:

1. **fix:** a commit of the type `fix` patches a bug in your codebase (this correlates with PATCH in Semantic Versioning).

2. **feat:** a commit of the type `feat` introduces a new feature to the codebase (this correlates with MINOR in Semantic Versioning).

3. **BREAKING CHANGE**: a commit that has a footer `BREAKING CHANGE:`, or appends a `!` after the type/scope, introduces a breaking API change (correlating with MAJOR in Semantic Versioning). A BREAKING CHANGE can be part of commits of any type.

4. _types_ other than `fix:` and `feat:` are allowed, for example @commitlint/config-conventional (based on the Angular convention) recommends `build:`, `chore:`, `ci:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`, and others.

5. _footers_ other than `BREAKING CHANGE: <description>` may be provided and follow a convention similar to git trailer format.

Additional types are not mandated by the Conventional Commits specification, and have no implicit effect in Semantic Versioning (unless they include a BREAKING CHANGE). A scope may be provided to a commit’s type, to provide additional contextual information and is contained within parenthesis, e.g., `feat(parser): add ability to parse arrays`.

To write a friendly commit message, recommends to use `Commitizen`. It will help you to write a commit message that follows the convention.

First, run `npm run prepare` to install `husky`. Then, run `npm run commit` to write a friendly commit message.

## Commit with Commitizen friendly

Run `npm run cz`, you'll be prompted to fill in any required fields, and your commit messages will be formatted according to the standards defined by project maintainers.

## Coding

If you are using `Visual Studio Code`, install these extensions:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)
- [Angular Language Service](https://marketplace.visualstudio.com/items?itemName=Angular.ng-template)

## Development server

Run `npm start` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/browser` directory.

## Build Docker image

Run `npm run build:image` to build the project with docker and automatic push to Github Packages

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
