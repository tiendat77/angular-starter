---
trigger: always_on
---

# Git Commit Rules

This document outlines the git commit conventions for the project. All commits must follow the **Conventional Commits** specification with specific emojis as integrated in the project's `commitlint` configuration.

---

## 🏗️ Structure

Commit messages must follow this structure:

```
<type>(<scope>): <emoji> <description>
```

- **type**: The category of the change (required).
- **scope**: The part of the project affected (optional, e.g., `sale`, `auth`, `ui`).
- **emoji**: A specific emoji corresponding to the type (required).
- **description**: A short, imperative description in lowercase (required).

---

## 🏷️ Commit Types & Emojis

| Type       | Emoji | Description                                             |
| :--------- | :---- | :------------------------------------------------------ |
| `feat`     | ✨    | A new feature                                           |
| `fix`      | 🐛    | A bug fix                                               |
| `fix`      | 💄    | UI/UX or Style fix                                      |
| `chore`    | 🔖    | Version bump / release                                  |
| `chore`    | ♻️    | General maintenance/cleanup                             |
| `chore`    | 🤖    | Tasks, scripts, automations                             |
| `wip`      | 🚧    | Work in progress                                        |
| `docs`     | 📚    | Documentation changes                                   |
| `style`    | 💄    | Formatting, missing semi-colons, etc (no logic change)  |
| `refactor` | 📦    | Code change that neither fixes a bug nor adds a feature |
| `perf`     | 🚀    | Performance improvements                                |
| `test`     | 🚨    | Adding/correcting tests                                 |
| `build`    | 🏷️    | Changes affecting build system or dependencies          |
| `ci`       | ⚙️    | CI configuration files and scripts                      |
| `revert`   | 🗑    | Reverts a previous commit                               |
| `init`     | 🎉    | Initializing the project                                |

---

## 📝 Rules & Best Practices

1. **Lowercase Only**: The description should always start with a lowercase letter.
2. **Imperative Mood**: Use "add" instead of "added", or "fix" instead of "fixed".
3. **Be Specific**: Use the `scope` if the change is isolated to a specific module or component (e.g., `fix(order): 🐛 correct calculation`).
4. **Breaking Changes**: For breaking changes, append a `!` after the type/scope and include a `BREAKING CHANGE:` footer in the commit body.
5. **Issue Linking**: Reference issues in the footer (e.g., `Closes #123`).

---

## 🚀 Examples

### Feature

```bash
feat: ✨ add bulk product update functionality
```

### Bug Fix with Scope

```bash
fix(auth): 🐛 prevent multiple refresh token requests
```

### UI Style Fix

```bash
fix: 💄 enhance order status styling for dark theme
```

### Version Bump

```bash
chore: 🔖 bump version to 1.1.42
```
