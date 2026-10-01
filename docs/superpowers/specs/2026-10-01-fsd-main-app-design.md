# Feature-Sliced Design for `apps/main` — design

Status: **implemented** on branch `refactor/fsd-main-app` (one commit per step; deviations in section 10). Layers live directly under `apps/main/src/` (section 3.2); open decisions resolved as recommended (section 9). Source: `.idea/PROMPT.md`, plus a review of the code in `apps/main/src`.

## 1. Goal

Reorganise `apps/main/src` into Feature-Sliced Design layers (`app`, `pages`, `widgets`, `features`, `entities`, `shared` as sibling folders, `app/` holding only the app layer) so that:

1. Every file has one obvious home, decided by a rule, not by taste.
2. Dependencies only point downward, and a tool enforces it.
3. Each slice has one public entry point (`index.ts`), so slices can be moved or deleted without touching their consumers.

**Non-goals:** changing behaviour, visuals or routes' URLs; touching `libs/ui`, `apps/docs`; rewriting components beyond what a layer rule forces.

## 2. Current state (facts from the code)

| Area | Where | Size / notes |
| --- | --- | --- |
| Base HTTP layer | `app/api/base` (`BaseApiService`, operators, operations), `app/api/helpers` (`data.helper`, `excel/*`), `app/api/models/{request,response,entity.base}` | `excel.helper.ts` alone is 525 lines |
| Dead code | `app/api/resources/example/example.service.ts`, `app/api/models/example/*` | referenced only by each other |
| Auth + session | `app/core/auth` (`auth.service` 261 lines, `auth.utils`, interceptor, provider), `app/services/user.service` (73 lines) | `AuthService` also calls `LayoutService.get(permissions)` (twice) |
| Guards | `app/core/guard` (`AuthGuard`, `NoAuthGuard`) | depend only on `AuthService` |
| Layout | `app/core/layouts` (`layout`, `dense`, `empty`, `modern`, `LayoutService`), `app/core/commons/{logo,theme-toggler}` | `LayoutService` imports `@configs/navigation.config` |
| Theme | `app/services/theme.service` | uses `@configs/storage.config`, `@models` (`ColorSchemeType`) |
| Feature code | `app/features/auth/{sign-in,sign-up,forgot-password,reset-password,access-denied}`, `features/not-found`, `features/example/{welcome,aria,example-dialog,products}` | `products` is already a vertical slice (`api/`, `model/`, `ui/`, `index.ts`, `routes.ts`) |
| Shared | `app/shared/{components,directives,helpers,pipes}` | pure, no upward imports |
| Outside `app/` | `src/models` (`@models`: `BaseComponent`, `Pagination`, `ColumnModel`, theme type, `UserModel`), `src/configs` (`@configs`: permission, storage, navigation), `src/environments` (`@environment`) | `Pagination` and `ColumnModel` have no importers |
| Tests | 4 spec files, all under `products` | the safety net is thin: build + lint + manual smoke matter more than `ng test` |

Two existing couplings break FSD and must be resolved by design, not by moving files:

- **`AuthService` → `LayoutService`** (session reaching up into a widget).
- **`ProductFilterComponent` → `ProductStore`**, and the store holds list-screen state (`page`, `pageSize`, search, category) next to CRUD calls.

## 3. Target structure

```
apps/main/src/
├── main.ts, index.html, declare.d.ts, environments/, styles/   (build entry and static files, not layers)
├── app/                       app.ts, app.html, app.config.ts, app.routes.ts, guards/, interceptors/
├── pages/                     one slice per route
│   ├── sign-in/               ui/, routes.ts, index.ts
│   ├── sign-up/
│   ├── forgot-password/       enter-email, email-sent as page-local ui
│   ├── reset-password/        invalid-link, reset-success as page-local ui
│   ├── access-denied/
│   ├── not-found/
│   ├── welcome/               welcome view, plus the (unrouted) example showcase and example dialog as page-local ui
│   ├── aria-example/          aria demo
│   └── products/              ui/products-page, model/product-list.store.ts, routes.ts
├── widgets/
│   └── layouts/               layout, dense, empty, modern, layout.service, navigation config
├── features/
│   ├── auth/                  api/ (sign-in, sign-up, forgot/reset calls), model/ (validators, form schemas)
│   ├── theme-toggle/          ui/
│   ├── product-manage/        ui/product-dialog (create/edit form)
│   └── product-filter/        ui/ (presentational: inputs/outputs only)
├── entities/
│   ├── session/               model/ (session.store, auth.utils, user.model), api/ (current-user load)
│   └── product/               api/product-api.service, model/ (model, schema, categories), ui/product-detail-dialog
└── shared/
    ├── api/                   base/ (BaseApiService, operators, operations), models/ (request, response, entity.base)
    ├── lib/                   data.helper, excel/, file/nanoid/string helpers, theme/ (ThemeService, ColorSchemeType), base-component
    ├── config/                storage.config
    ├── ui/                    empty-, error-, not-found-placeholder, logo
    ├── directives/
    └── pipes/
```

Segments (`api/`, `model/`, `ui/`, `lib/`, `config/`) are created only when a slice has something to put in them.

### 3.1 Layer rules

A layer may import only from layers **strictly below** it; slices on the same layer never import each other (no cross-entity or cross-feature imports). `app` and `shared` have no slices — `shared` segments may import each other.

| Layer | May import |
| --- | --- |
| `app` | pages, widgets, features, entities, shared |
| `pages` | widgets, features, entities, shared |
| `widgets` | features, entities, shared |
| `features` | entities, shared |
| `entities` | shared |
| `shared` | (nothing in the app; `@libs/*` and `@environment` are fine) |

Everything outside a slice is imported through its `index.ts` only — no deep imports like `@/features/auth/api/...`.

### 3.2 Aliases

`@/*` moves from `apps/main/src/app/*` to `apps/main/src/*`, so imports read `@/features/auth`, `@/shared/ui`. During the migration it lists both places, `["./apps/main/src/*", "./apps/main/src/app/*"]`, so old `@/core/...` imports keep compiling; step 8 drops the fallback. No per-layer aliases. `@environment` stays (build-level). `@models` and `@configs` are **retired** once their contents have moved (their last importer is removed in the final phase).

## 4. Placement table

| Current | Target | Why |
| --- | --- | --- |
| `api/base`, `api/models/{request,response,entity.base}` | `shared/api/{base,models}` | generic HTTP plumbing |
| `api/helpers`, `shared/helpers` | `shared/lib` | pure utilities |
| `api/resources/example`, `api/models/example` | **deleted** | unused |
| `@models` `BaseComponent`, theme type | `shared/lib` | generic |
| `@models` `UserModel` | `entities/session/model` | part of the session (see 5.1) |
| `@models` `Pagination`, `ColumnModel` | **deleted** | no importers (confirm in phase 1) |
| `@configs/storage.config` | `shared/config` | used by session and theme |
| `@configs/navigation.config` | `widgets/layouts/config` | only the layout reads it |
| `@configs/permission.config` | `shared/config` | read by routes, navigation and permission checks |
| `services/theme.service` | `shared/lib/theme` | UI infrastructure, no domain logic |
| `core/commons/theme-toggler` | `features/theme-toggle/ui` | a user action |
| `core/commons/logo` | `shared/ui/logo` | presentational, no app state |
| `core/layouts/*` | `widgets/layouts` | composite shell |
| `core/guard/*` | `app/guards` | wired in `app.routes.ts` |
| `core/auth/auth.interceptor.ts`, `auth.provider.ts` | `app/interceptors`, `app.config.ts` | wired at bootstrap |
| `core/auth/auth.service.ts` | split: `entities/session` + `features/auth` (see 5.1) | two responsibilities today |
| `services/user.service.ts` | `entities/session/api` + `model` | current user |
| `features/auth/sign-in` … `access-denied` | `pages/<name>` (+ shared form logic in `features/auth`) | route views vs interactions |
| `features/not-found` | `pages/not-found` | route view |
| `features/example/{welcome,aria,example-dialog,example.ts,routes.ts}` | `pages/welcome`, `pages/aria-example`; routes composed in `app.routes.ts` | demos, used only by their page |
| `features/example/products/api`, `model` (types, schema) | `entities/product/{api,model}` | domain data |
| `features/example/products/model/product.store.ts` | `pages/products/model/product-list.store.ts` | list-screen state (see 5.2) |
| `features/example/products/ui/product-detail-dialog` | `entities/product/ui` | read-only view of one product |
| `features/example/products/ui/product-dialog` | `features/product-manage/ui` | create / edit interaction |
| `features/example/products/ui/product-filter` | `features/product-filter/ui` | filter interaction, made presentational |
| `features/example/products/ui/product-list`, `routes.ts` | `pages/products/ui/product-list`, `routes.ts` | composes the above |

## 5. Design decisions

### 5.1 Auth and session

`AuthService` mixes "who is signed in" with "how to sign in". Split:

- **`entities/session`** owns the signed-in state: access token (read/write via `STORAGE_KEYS`), decoded claims (`auth.utils`), the current user and its permissions, `isAuthenticated`, `signOut()`. The current user lives here, not in a separate `entities/user`, because a user model separate from the session would force one entity to import the other.
- **`features/auth`** owns the transactions: sign-in, sign-up, forgot / reset password calls and their form validators. On success it calls `session.start(...)`.
- **`app/guards` and `app/interceptors`** read `entities/session`. Allowed, since `app` sits above `entities`.

### 5.2 Layout no longer driven by auth

Today `AuthService` and a route `resolve` in `app.routes.ts` both call `LayoutService.get(permissions)`. After the split `LayoutService` reads `entities/session` itself (an `effect` on the user's permissions rebuilds the navigation). Auth and routes stop knowing about layout, and the route `resolve` is removed. Direction: `widgets → entities`.

### 5.3 Products

- `entities/product` keeps data only: model, schema, categories, `ProductApiService`, and the detail dialog (pure presentation of one product).
- The list state (`page`, `pageSize`, search, category, loading, CRUD orchestration) moves to `pages/products/model`, because it describes one screen, not the product domain.
- `ProductFilterComponent` stops injecting `ProductStore`. It becomes presentational (`search` / `category` inputs, change outputs) and the page wires it to the store. This is the one deliberate component API change.
- `ProductDialogComponent` already only needs model types and moves as is.

### 5.4 Pages

One slice per route. `forgot-password` and `reset-password` keep their sub-views (`enter-email`, `email-sent`, `invalid-link`, `reset-success`) as page-local `ui/`, because nothing else uses them. Each page exposes its `routes` through `routes.ts`, loaded lazily from `app.routes.ts` with `loadChildren: () => import('@/pages/<name>/routes')`.

### 5.5 What is deliberately not done

- No `widgets/product-table`, no `entities/user`, no extra aliases, no barrel `index.ts` inside `shared` segments beyond what imports need.
- Specs move with their slices; no new tests are written as part of the move (the lint rule and the build are the checks).

## 6. Boundary enforcement

Added **before** any file moves, so the migration is checked as it happens.

- Tool: `eslint-plugin-boundaries` (new dev dependency). Element types: `app`, `pages`, `widgets`, `features`, `entities`, `shared`, each with `capture: ['slice']` where applicable.
- Rules:
  - `boundaries/element-types`: the matrix in 3.1; same-layer cross-slice imports disallowed (`entities/product` → `entities/session` is an error).
  - `boundaries/entry-point`: slices are imported through `index.ts` only (a slice may deep-import itself).
- Rollout: on in `warn` mode in phase 0 with the current violations recorded as the baseline; flipped to `error` in the last phase when the count reaches zero.
- Scope: `apps/main/src/{app,pages,widgets,features,entities,shared}/**`; `main.ts`, `environments/`, `styles/` are not layers and are ignored.

## 7. Migration plan

One commit per step. Gate for every commit: `ng build main`, `ng test main`, `eslint apps/main`, and a manual smoke of sign-in → example → products (create / edit / delete / filter / paginate) for steps that touch them.

| Step | Content | Notes |
| --- | --- | --- |
| 0 | Boundary lint (warn) + baseline; `@/*` alias with fallback; no file moves | |
| 1 | `shared/`: api, lib, config, ui, directives, pipes; delete dead `example` code and unused models | `@models` / `@configs` re-export shims keep other code compiling |
| 2 | `entities/session`; `AuthService` split; layout inversion (5.2) | riskiest step: sign-in, token refresh, guards |
| 3 | `entities/product` (api, model, detail dialog) | |
| 4 | `widgets/layouts`; `features/theme-toggle`; logo to `shared/ui` | |
| 5 | `features/auth` + `pages/{sign-in,sign-up,forgot-password,reset-password,access-denied}` | |
| 6 | `features/product-filter`, `features/product-manage`, `pages/products` (store moves, filter becomes presentational) | the only step that changes a component API |
| 7 | `pages/example`, `pages/not-found` | |
| 8 | `app/guards`, `app/interceptors`; remove `core/`, `api/`, `services/`, `features/example`, `@models` / `@configs` aliases; lint → `error` | |

## 8. Risks

| Risk | Mitigation |
| --- | --- |
| Few tests, so regressions in auth go unnoticed | step 2 is isolated in its own commit with a manual checklist (sign-in, reload while signed in, sign-out, guard redirects, 401 handling) |
| Circular imports during the move (session ↔ layout) | the inversion in 5.2 happens in step 2, before layouts move |
| `features/` changes meaning mid-migration | steps are ordered bottom-up; the old `features/` content is only emptied in steps 5–7 |
| Shims left behind | step 8 removes them and the lint baseline must be zero |

## 9. Decisions (resolved as recommended)

1. **Lint tool.** `eslint-plugin-boundaries` (recommended: declarative matrix, entry-point rule) vs `no-restricted-imports` only (no new dependency, but the matrix becomes many patterns and cross-slice checks are awkward).
2. **Session vs user.** One `entities/session` that contains the current user (recommended) vs separate `entities/user` and `entities/session` (then session cannot import user, so the current-user state would have to sit in a feature or in `app`).
3. **Example demos.** Keep `welcome`, `aria`, `example-dialog` as page slices (recommended: they are showcase code) vs drop them from the starter.
4. **Product features.** Follow your draft (`features/product-filter`, `features/product-manage`) vs keep both page-local in `pages/products/ui` because each has a single consumer (the FSD guidance against premature extraction).
5. **Permission config.** `shared/config` (recommended) vs `app/config`; the only readers are routes and the navigation config, so `app/` would work if you want `shared` to stay free of authorisation concepts.

## 10. Implementation notes (deviations from the plan above)

- **Lint rule** is `boundaries/dependencies` (v7 of the plugin deprecates `element-types` / `entry-point`); entry-point is expressed as a `fileInternalPath: '!index.ts'` policy. It is `error` and clean.
- **Pages expose routes through `index.ts`** (`export { default } from './routes'`), so `app.routes.ts` loads them with `loadChildren: () => import('@/pages/<name>')`.
- **`pages/example` was split** into `pages/welcome` and `pages/aria-example`; the `/app/example/...` route tree is composed in `app.routes.ts` so URLs are unchanged. `ExampleComponent` (a dialog / loader / toast showcase) was already unrouted before the refactor; it is kept under `pages/welcome/ui/example-showcase` rather than deleted.
- **Products page component** stays `ProductListComponent`, under `pages/products/ui/product-list` (not `products-page`); its store is `ProductListStore`.
- **`LayoutService`** rebuilds the navigation from an `effect` on `SessionStore.$user()`; it now also runs once with no permissions at startup.
- **`SessionStore.check()`** was simplified: the old implementation returned the token string from a `switchMap`, which re-ran the restore once per character; the result is the same boolean.
- **Permission config** is in `shared/config` (decision 5). `@models` and `@configs` aliases are removed; the `@/*` alias no longer has the `app/*` fallback.
- **Behaviour kept as is**: `canActivate: [AuthGuard]` on the `app` route is commented out in the original `app.routes.ts`, so a hard reload on `/app/example` with a stored session still redirects to `/access-denied` (permissions load only when a guard calls `SessionStore.check()`, e.g. via `/sign-in`).
