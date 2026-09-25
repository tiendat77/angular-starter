---
trigger: always_on
---

# Coding Style & Conventions

This document outlines the coding standards, rules, and conventions for the project. All AI agents and developers must follow these rules to maintain consistency and code quality.

---

## 🏗️ General Standards

- **Language**: TypeScript 6.0+ for all logic.
- **Indentation**: 2 spaces per indentation level.
- **Variables**: Prefer `const` over `let`. Never use `var`.
- **Formatting**: Automated via Prettier (see `.prettierrc.json`).
- **Linting**: Automated via ESLint (see `eslint.config.cjs`).
- **Testing**: Automated via Vitest (`ng test`).
- **Language/Locale**: Vietnamese is the primary locale for UI strings.

---

## 🔷 TypeScript & Code Design

### 1. Naming Conventions

- **Classes/Interfaces/Types**: `PascalCase` (e.g., `ProductCategoryModel`, `UserSchema`).
- **Variables/Methods/Functions**: `camelCase`, descriptive and meaningful — prioritize **clarity over brevity** (e.g., `divide(dividend, divisor)` instead of `div(x, y)`).
- **Private/Protected Members**: Prefix with an underscore `_` (e.g., `private _api`, `protected _toast`).
- **Signals**: Properties containing Signals MUST be prefixed with `$` (e.g., `$dataTable`, `$page`, `$user`).
- **Observables**: Streams containing Observables MUST be suffixed with `$` (e.g., `user$`, `destroy$`, `_destroy$`).
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `ERROR_MESSAGES`, `PERMISSION`).

### 2. Single Responsibility & File Structure

- **One thing per file**: Define one component, service, or model per file.
- **File and Directory Naming**: All file and directory names must be in `lowercase` using kebab-case or dot-separation (e.g., `example-dialog.ts`, `example.service.ts`, `example.html`).
- **Index Exports**: Every feature, library, or shared module folder must export its public API via `index.ts`.

### 3. Small Pure Functions & Self-Explanatory Code

- Keep functions small, clean, and testable. Abstract complex logic into helper functions or dedicated services.
- **Avoid redundant code comments**: Write expressive code that explains itself. ("Code never lies, comments do.") Comments should only document non-obvious business reasons or edge-case constraints.

### 4. Code Organization & Member Ordering

Order inside TypeScript classes:

1. Public Properties (up top)
2. Private / Protected Properties (alphabetized, prefixed with `_`)
3. Dependency Injection (`inject()`)
4. Lifecycle Hooks (`ngOnInit`, `ngOnDestroy`, etc.)
5. Public Methods
6. Private Methods

Use section dividers for clarity:

```typescript
// -----------------------------------------------------------------------------------------------------
// @ Public methods
// -----------------------------------------------------------------------------------------------------
```

### 5. Import Organization

Organize imports cleanly, grouped by category and using path aliases:

```typescript
// Angular
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// RxJS
import { Observable, Subject } from 'rxjs';
import { catchError, map, takeUntil } from 'rxjs/operators';

// Third-party / Utilities
import dayjs from 'dayjs';
import { z } from 'zod';

// Internal Libraries (@libs/*)
import { DialogService } from '@libs/dialog';
import { SvgIcon } from '@libs/svg-icon';
import { ToastService } from '@libs/toast';

// Core & Services (@/core/*, @/services/*)
import { AuthGuard } from '@/core/guard';
import { UserService } from '@/services/user.service';

// Models & Configs (@models, @configs/*)
import { PERMISSION } from '@configs/permission.config';
import { UserModel } from '@models';
```

---

## 🅰️ Angular Components

### 1. Standalone Architecture

- All components, directives, and pipes MUST be **Standalone**.
- In Angular 22, `standalone: true` is the default. Do not add redundant `standalone: true`.
- No `NgModules`. Direct component dependencies are defined directly in `@Component({ imports: [...] })`.
- Separate logic from view using `templateUrl` (`./feature-name.html`).

### 2. Dependency Injection

- Use the **`inject()`** function instead of constructor injection.
- Prefix injected services with `_` and mark `private` (or `protected` if needed in templates):
  ```typescript
  protected _toast = inject(ToastService);
  protected _dialog = inject(DialogService);
  private _api = inject(ExampleAPIService);
  ```

### 3. State & Reactivity

- Use **Signals** (`signal`, `computed`, `effect`) for component and store state.
- Prefix signal variables with `$` (e.g., `readonly $items = signal<Item[]>([]);`).
- Explicitly set `changeDetection: ChangeDetectionStrategy.OnPush` on every component.

### 4. Inheritance & Base Classes

- `TableBaseComponent`: For list and table views with pagination.
- `BaseApiService<T>`: For backend API service integrations.

---

## 🔄 RxJS Best Practices

### 1. Pipeable Operators

- Separate each pipeable operator onto its own line for readability:
  ```typescript
  const data$ = this.loadData().pipe(
    map((response) => response.data),
    catchError((error) => of(null))
  );
  ```

### 2. Avoid Memory Leaks

- Unsubscribe from all open observable streams:
  - Prefer `takeUntilDestroyed()` or compose with `takeUntil(this._destroy$)`.
  - Use Angular's `AsyncPipe` in templates where applicable.

### 3. Avoid Nested Subscriptions

- Never nest `.subscribe()` inside another `.subscribe()`.
- Use flattening and combination operators: `switchMap`, `concatMap`, `mergeMap`, `forkJoin`, `combineLatest`.

---

## 📄 HTML & Templates

### 1. Modern Control Flow

- Use `@if`, `@else if`, `@else` for conditional rendering.
- Use `@for (item of items; track item.id)` for lists. The `track` expression is mandatory.
- Use `@switch`, `@case`, `@default`.
- **DO NOT** use legacy structural directives (`*ngIf`, `*ngFor`, `*ngSwitch`).

### 2. Line-Wrapping & Readability

- Wrap long attribute lists across lines if it improves readability:
  ```html
  <!-- Good -->
  <input
    type="text"
    autocomplete="off"
    required
    formControlName="name"
    class="input input-bordered w-full"
  />
  ```

### 3. Attribute & Binding Order

Always order template attributes and bindings predictably:

1. Structural Directives / Control Flow
2. Animation Triggers (`@fade`, `[@fade]`)
3. Element Reference (`#myRef`)
4. HTML Attributes (`class`, `type`, `id`, `autocomplete`, etc.)
5. Non-interpolated String Inputs (`placeholder="Enter name"`)
6. Interpolated / Bound Inputs (`[data]="tableData"`)
7. Two-Way Bindings (`[(ngModel)]="keyword"`)
8. Event Outputs (`(click)="onClick($event)"`)

```html
<my-component
  #myRef
  class="flex items-center gap-2"
  title="User Profile"
  [user]="currentUser"
  [(isOpen)]="modalOpen"
  (closed)="onClosed($event)"
/>
```

---

## 🎨 UI & Styling

### 1. DaisyUI 5

- Use **DaisyUI 5** components for all core UI elements (`btn`, `table`, `modal`, `card`, `select`, `input`, `badge`).

### 2. Tailwind CSS 4.0

- Use **Tailwind CSS 4 utility classes** for layout, spacing, and micro-styling.
- Prefer utility classes over component-specific SCSS files.

### 3. Design System & CSS Variables

- Use predefined CSS variables and themes in `src/styles/` (`_colors.css`, `_themes.css`, `_daisyui.css`).

### 4. Internal Shared Libraries (`@libs/*`)

- Icons: `SvgIcon` from `@libs/svg-icon`.
- Notifications: `ToastService` from `@libs/toast` (`this._toast.success(...)`, `this._toast.error(...)`, `this._toast.warning(...)`).
- Dialogs/Modals: `DialogService` from `@libs/dialog`.
- Loaders: `LoaderService` from `@libs/loader`.
- Date Picker: `DatepickerModule` and `provideNativeDateAdapter()` from `@libs/date-picker`.
- Paginator: Table/list pagination from `@libs/paginator`.

---

## 🛤️ Angular Routing & Feature Modules

### 1. Folder Structure

- Feature modules are located in `src/app/features/`.
- Structure per feature:
  - `routes.ts`: Lazy-loaded route definitions.
  - `feature-name.ts`: Main component logic.
  - `feature-name.html`: Template view.
  - `sub-component/`: Dedicated subdirectories for child dialogs or nested components.
  - `index.ts`: Public API exports.

### 2. Lazy Loading & Guards

- All features MUST be **lazy-loaded** via `app.routes.ts`:
  ```typescript
  loadChildren: () => import('@/features/example/routes');
  ```
- Protect routes with functional guards (`AuthGuard`, `NoAuthGuard`, `ngxPermissionsGuard`).

---

## 🌐 API Calling & Resources

### 1. Service Structure

- Location: `src/app/api/resources/`.
- Services must extend `BaseApiService<T>` and implement standard API interfaces (e.g., `ApiList`).
- Specify `override _baseUrl`.
- Validate API responses with Zod schemas using `BaseAPIOperator.responseHandler(Schema)`.

### 2. Input Trimming

- Always trim string data before sending to `create` or `update` operations using `DataHelper.trim(data)`.

---

## 📊 Models & Zod Schemas

- **Models**: Suffix with `Model` (e.g., `UserModel`, `ExampleModel`).
- **Zod Schemas**: Suffix with `Schema` (e.g., `UserSchema`, `ExampleSchema`).
- Centralized data transfer models in `src/models/` or `src/app/api/models/`.

---

## 🔍 Error Handling

- Never swallow errors silently.
- Log error details with `console.error`.
- Notify users with `ToastService` from `@libs/toast`:
  ```typescript
  this._toast.error(error?.message || ERROR_MESSAGES.DEFAULT, ERROR_MESSAGES.ERROR_TITLE);
  ```
- Use global error message constants for standard texts.