---
trigger: always_on
---

# Coding Style & Conventions

This document outlines the coding standards, rules, and conventions for the project. All AI agents and developers must follow these rules to maintain consistency and code quality.

---

## 🏗️ General Standards

- **Language**: TypeScript for all logic.
- **Indentation**: 2 spaces.
- **Formatting**: Automated via Prettier (see `.prettierrc.json`).
- **Linting**: Automated via ESLint (see `eslint.config.cjs`).
- **Language/Locale**: Vietnamese is the primary locale for UI strings.

---

## 🔷 TypeScript Rules

### 1. Naming Conventions

- **Classes/Interfaces/Types**: `PascalCase` (e.g., `ProductCategoryModel`).
- **Variables/Methods/Functions**: `camelCase` (e.g., `filterForm`, `reload()`).
- **Private Members**: Prefix with an underscore `_` (e.g., `private _api`).
- **Protected Members**: Used for members shared with templates or base classes.
- **Signals**: Properties containing Signals must be prefixed with `$` (e.g., `$dataTable`, `$page`).
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `ERROR_MESSAGES`).

### 2. Code Organization

- Use section dividers for clarity:
  ```typescript
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------
  ```
- Order: Imports -> Component Decorator -> Class -> Public Properties -> Signals -> DI (`inject`) -> Lifecycle Hooks -> Public Methods -> Private Methods.

---

## 🅰️ Angular Components

### 1. Standalone Architecture

- All components MUST be **Standalone**.
- No `NgModules`. Imports are defined directly in the `@Component` decorator.
- Use `templateUrl` for HTML templates (separate logic from view).

### 2. Dependency Injection

- Use the **`inject()`** function instead of constructor injection.
- Prefer `private` for injected services unless required by inheritance or template.
  ```typescript
  private _api = inject(ProductCategoryAPIService);
  ```

### 3. State & Reactivity

- Use **Signals** (`signal`, `computed`, `effect`) for component state.
- Prefer `computed` for derived state to ensure reactivity.
- Explicitly set `changeDetection: ChangeDetectionStrategy.OnPush` where possible (signals work best with OnPush).

### 4. Inheritance

- Use base classes for common patterns:
  - `TableBaseComponent`: For list/table views with pagination.
  - `BaseApiService`: For API services.

---

## 🛤️ Angular Routing & Folders

### 1. Folder Structure

- Feature modules are located in `src/app/modules/`.
- Folder structure per feature:
  - `routes.ts`: Lazy-loaded route definitions.
  - `feature-name.ts`: Main component.
  - `feature-name.html`: Template.
  - `sub-component/`: Dedicated folders for dialogs or nested components.
  - `columns.ts`: (Optional) Table column definitions.

### 2. Lazy Loading

- All feature modules must be **lazy-loaded** in `app.routes.ts`.
- Use functional guards (`AuthGuard`, `NoAuthGuard`, `ngxPermissionsGuard`).

---

## 🌐 API Calling & Resources

### 1. Service Structure

- Location: `src/app/api/resources/`.
- Services must extend `BaseApiService<T>`.
- Use `override _baseUrl` and `override _schema` (Zod).

### 2. CRUD Pattern

- Standard methods: `paginate`, `read`, `create`, `update`, `delete`.
- Return Observables.
- Use custom operators: `.pipe(BaseAPIOperator.responseHandler())`.

### 3. Input Trimming

- Always trim string data before sending to `update` or `create` using `DataHelper.trim(data)`.

---

## 📄 HTML & Templates

### 1. UI Components

- Use **NG-ZORRO** components for all core UI elements (`nz-table`, `nz-form`, `nz-modal`, `nz-select`).
- Use the custom `SvgIcon` component from `@libs/svg-icon`.

### 2. Layout Structure

- Use `StateLayoutComponent` to handle loading, error, and empty states.
- Follow the multi-layout approach managed in `core/layouts`.

---

## 🎨 CSS & Styling

### 1. Tailwind CSS 4.0

- Use **Tailwind utility classes** for layout, spacing, and simple styling.
- Prefer utility classes over component-specific SCSS.

### 2. Design System

- Use CSS variables defined in `src/styles/` (e.g., `_colors.css`, `_themes.css`) for consistent branding.
- Leverage **DaisyUI** classes for common UI patterns where they don't conflict with NG-ZORRO.

---

## 📊 Interfaces, Models & Enums

### 1. Definitions

- **Models**: Suffix with `Model` (e.g., `UserModel`).
- **Zod Schemas**: Suffix with `Schema` (e.g., `UserSchema`).
- **Enums/Constants**: Grouped in `src/shared/constants/` or `src/models/`.

### 2. Data Transfer

- Centralized models in `src/models/` for general types.
- API-specific models in `src/app/api/models/`.

---

## 🔍 Error Handling

- Never silence errors. Use `console.error` and show notifications via `NzNotificationService`.
- Use global constants for error messages: `ERROR_MESSAGES.ERROR_TITLE`.
