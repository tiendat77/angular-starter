# Angular 21 Project Guidelines

## Core Tech Stack

- **Framework:** Angular 21+ (Signals, Standalone Components by default)
- **UI Library:** DaisyUI 5
- **Styling:** Tailwind CSS 4

## Architectural Rules

- **Standalone:** All components, directives, and pipes MUST be standalone.
  - _Note:_ In Angular 21, `standalone: true` is the default. Do not add it unless necessary for clarity.
- **State Management:** Use **Signals** (`signal()`, `computed()`) for local and shared state. Avoid RxJS for simple state; use it only for complex async streams.
- **Control Flow:** Use the new `@if`, `@for`, and `@switch` syntax. DO NOT use `*ngIf` or `*ngFor`.
- **Dependency Injection:** Use the `inject()` function instead of constructor injection.

## UI Standards

- **Icons:** Use `svg-icon`. Ensure `SvgIconModule` is imported in the standalone component.
- **Forms:** Use Signal Forms first, then Reactive Forms if needed.
- **OnPush:** Every component must use `changeDetection: ChangeDetectionStrategy.OnPush`.
- **Index** Every component must be exported in index.ts file.
