# Agent Guide

## Styling (Tailwind v4) — read first

Before writing or editing any Tailwind class, `cva()` variant or CSS in `apps/main`, `apps/docs` or `libs/ui`, read **[docs/styling-context.md](docs/styling-context.md)**.

Key rules:
- Colors come from the semantic tokens (`bg-background`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary text-primary-content`, …).
- `libs/ui` must not use raw palette colors or `@libs/theme` / `apps/main` classes (`text-heading-*`, the `red-1` palette, `shadow-medium`, `text-hint`, `bg-card`). `apps/docs` may use `@libs/theme` classes but not `apps/main`-only ones (`text-hint`, `bg-card`, safe-area).
- Dark mode is driven by `data-theme` tokens; don't add `dark:` where a token already handles it.

## Component library

`libs/ui/README.md` is the engineering guide for `@libs/ui` components.
