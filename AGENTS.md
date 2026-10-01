# Agent Guide

## Styling (Tailwind v4) — read first

Before writing or editing any Tailwind class, `cva()` variant or CSS in `apps/main`, `apps/docs` or `libs/ui`, read **[docs/styling-context.md](docs/styling-context.md)**.

Key rules:
- Colors come from the semantic tokens (`bg-background`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary text-primary-content`, …).
- `libs/ui` and `apps/docs` must not use raw palette colors or `apps/main`-only classes (`text-hint`, `bg-card`, `text-heading-*`).
- Dark mode is driven by `data-theme` tokens; don't add `dark:` where a token already handles it.

## Component library

`libs/ui/README.md` is the engineering guide for `@libs/ui` components.
