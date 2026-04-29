# Angular 20 & NG-ZORRO Project Guidelines

## Core Tech Stack

- **Framework:** Angular 20+ (Signals, Standalone Components by default)
- **UI Library:** ng-zorro-antd (Ant Design)
- **Styling:** Tailwind CSS (if applicable) or LESS for Ant Design overrides.

## Architectural Rules

- **Standalone:** All components, directives, and pipes MUST be standalone.
  - _Note:_ In Angular 20, `standalone: true` is the default. Do not add it unless necessary for clarity.
- **State Management:** Use **Signals** (`signal()`, `computed()`) for local and shared state. Avoid RxJS for simple state; use it only for complex async streams.
- **Control Flow:** Use the new `@if`, `@for`, and `@switch` syntax. DO NOT use `*ngIf` or `*ngFor`.
- **Dependency Injection:** Use the `inject()` function instead of constructor injection.

## UI Standards (NG-ZORRO)

- **Icons:** Use `svg-icon`. Ensure `SvgIconModule` is imported in the standalone component.
- **Forms:** Use Reactive Forms
- **OnPush:** Every component must use `changeDetection: ChangeDetectionStrategy.OnPush`.
