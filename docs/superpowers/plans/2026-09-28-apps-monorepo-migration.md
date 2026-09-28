# Apps Monorepo Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize the workspace into a standard monorepo with `apps/main`, `apps/docs`, and `libs/`, while keeping `public/` at workspace root shared across applications.

**Architecture:** Move application source trees into isolated subdirectories under `apps/`, keep `public/` at root, update `angular.json` multi-project definitions, adjust root `tsconfig.json` path mappings and per-app tsconfigs, update `package.json` scripts, and verify all build and lint targets.

**Tech Stack:** Angular 22, TypeScript 6.0+, Angular CLI, Tailwind CSS 4, ESLint, Docker.

**Spec:** [docs/superpowers/specs/2026-09-28-apps-monorepo-migration-design.md](file:///home/tiendat/Code/angular-starter/docs/superpowers/specs/2026-09-28-apps-monorepo-migration-design.md)

## Global Constraints

- Preserve all git file history where possible using `git mv`.
- Keep `public/` at workspace root (`public/`) to share static assets across applications.
- Keep shared libraries intact under `libs/` (`ui`, `navigation`, `hotkeys`).
- Main application is named `main` and lives in `apps/main/`.
- Docs showcase application is named `docs` and lives in `apps/docs/`.
- Root output directories for builds should be `dist/main` and `dist/docs`.
- Vietnamese is the primary locale for user-facing documentation/rules where applicable.
- All commits must follow Conventional Commits with emojis (e.g. `refactor(workspace): 📦 ...`).

## Review Focus

1. Asset resolution: Verify that icons and environments in root `public/` resolve correctly in both `main` and `docs`.
2. Path alias breakage: Ensure `@/*`, `@configs/*`, `@models`, and `@environment` correctly point to `apps/main/src/*`.
3. Dockerfile parity: Verify `dist/main/browser` matches the `COPY` instruction in `Dockerfile`.
4. Git status cleanly removes `projects/` without dangling untracked files.
5. `yarn build`, `yarn docs:build`, and `yarn build:libs` all succeed without compilation or bundler errors.

---

### Task 1: Directory Reorganization via Git Move

**Files:**
- Move: `src/` -> `apps/main/src/`
- Move: `tsconfig.app.json` -> `apps/main/tsconfig.app.json`
- Move: `tsconfig.spec.json` -> `apps/main/tsconfig.spec.json`
- Move: `projects/docs/*` -> `apps/docs/`
- Keep: `public/` at workspace root
- Delete: `projects/` (empty directory)

**Interfaces:**
- Consumes: Existing files in root `src/`, `tsconfig.*.json`, `projects/docs/`
- Produces: `apps/main/` and `apps/docs/` directories populated with respective sources

- [ ] **Step 1: Create target directory structure**
Run: `mkdir -p apps/main apps/docs`

- [ ] **Step 2: Move main app files using `git mv` (keeping `public/` at root)**
Run:
```bash
git mv src apps/main/src
git mv tsconfig.app.json apps/main/tsconfig.app.json
git mv tsconfig.spec.json apps/main/tsconfig.spec.json
```

- [ ] **Step 3: Move docs app files using `git mv` and remove `projects/`**
Run:
```bash
git mv projects/docs/* apps/docs/
rmdir projects/docs projects 2>/dev/null || true
```

- [ ] **Step 4: Verify git status reflects cleanly renamed files**
Run: `git status`
Expected: Renames staged for all files from `src/` to `apps/main/src/` and `projects/docs/` to `apps/docs/`. `public/` remains untracked/unchanged at root.

- [ ] **Step 5: Commit reorganization**
```bash
git commit -m "refactor(workspace): 📦 move applications into apps/main and apps/docs"
```

---

### Task 2: TypeScript Configuration Updates

**Files:**
- Modify: `tsconfig.json`
- Modify: `apps/main/tsconfig.app.json`
- Modify: `apps/main/tsconfig.spec.json`
- Modify: `apps/docs/tsconfig.app.json`

**Interfaces:**
- Consumes: Target directory structure from Task 1
- Produces: Correct TypeScript path aliases and compiler options for root and child configs

- [ ] **Step 1: Update path aliases in root `tsconfig.json`**
Update `paths` to:
```json
"@/*": ["./apps/main/src/app/*"],
"@configs/*": ["./apps/main/src/configs/*"],
"@models": ["./apps/main/src/models/index"],
"@environment": ["./apps/main/src/environments/environment"],
"@libs/hotkeys": ["./packages/hotkeys", "./libs/hotkeys/src/public-api"],
"@libs/navigation": ["./packages/navigation", "./libs/navigation/src/public-api"],
"@libs/ui": ["./packages/ui", "./libs/ui/src/public-api"],
"@libs/ui/*": ["./packages/ui/*", "./libs/ui/*/src/public-api"]
```

- [ ] **Step 2: Update `apps/main/tsconfig.app.json`**
Update `extends` to `"../../tsconfig.json"` and `outDir` to `"../../out-tsc/app"`.
Verify `files` is `["src/main.ts"]` and `include` is `["src/**/*.d.ts"]`.

- [ ] **Step 3: Update `apps/main/tsconfig.spec.json`**
Update `extends` to `"../../tsconfig.json"` and `outDir` to `"../../out-tsc/spec"`.
Verify `include` is `["src/**/*.spec.ts", "src/**/*.d.ts"]`.

- [ ] **Step 4: Update `apps/docs/tsconfig.app.json`**
Verify `extends` is `"../../tsconfig.json"`, `files` is `["src/main.ts"]`, `include` is `["src/**/*.d.ts", "src/**/*.ts"]`.

- [ ] **Step 5: Run type-check to verify path resolution**
Run: `npx tsc --noEmit`
Expected: No path resolution errors for `@/*`, `@libs/*`, etc.

- [ ] **Step 6: Commit TypeScript configuration changes**
```bash
git add tsconfig.json apps/main/tsconfig.app.json apps/main/tsconfig.spec.json apps/docs/tsconfig.app.json
git commit -m "refactor(config): 📦 update tsconfig paths for apps/main and apps/docs"
```

---

### Task 3: Angular CLI Configuration (`angular.json`) Updates

**Files:**
- Modify: `angular.json`

**Interfaces:**
- Consumes: File locations from Task 1 and tsconfigs from Task 2
- Produces: Working Angular CLI targets for `main` and `docs`

- [ ] **Step 1: Update `angular.json` project `angular-starter` -> `main`**
Rename `"angular-starter"` key to `"main"`.
Update:
- `"root"`: `"apps/main"`
- `"sourceRoot"`: `"apps/main/src"`
- `"architect.build.options.outputPath"`: `"dist/main"`
- `"architect.build.options.index"`: `"apps/main/src/index.html"`
- `"architect.build.options.browser"`: `"apps/main/src/main.ts"`
- `"architect.build.options.tsConfig"`: `"apps/main/tsconfig.app.json"`
- `"architect.build.options.assets"`: `[ { "glob": "**/*", "input": "public" } ]`
- `"architect.build.options.styles"`: `["apps/main/src/styles/index.css"]`
- `"architect.serve.configurations.production.buildTarget"`: `"main:build:production"`
- `"architect.serve.configurations.development.buildTarget"`: `"main:build:development"`
- `"architect.test.options.tsConfig"`: `"apps/main/tsconfig.spec.json"`
- `"architect.lint.options.lintFilePatterns"`: `["apps/main/**/*.ts", "apps/main/**/*.html"]`

- [ ] **Step 2: Update `angular.json` project `docs`**
Update:
- `"root"`: `"apps/docs"`
- `"sourceRoot"`: `"apps/docs/src"`
- `"architect.build.options.outputPath"`: `"dist/docs"`
- `"architect.build.options.index"`: `"apps/docs/src/index.html"`
- `"architect.build.options.browser"`: `"apps/docs/src/main.ts"`
- `"architect.build.options.tsConfig"`: `"apps/docs/tsconfig.app.json"`
- `"architect.build.options.assets"`: `[ { "glob": "**/*", "input": "public/icons", "output": "icons" } ]`
- `"architect.build.options.styles"`: `["apps/docs/src/styles.css"]`
- `"architect.serve.configurations.production.buildTarget"`: `"docs:build:production"`
- `"architect.serve.configurations.development.buildTarget"`: `"docs:build:development"`

- [ ] **Step 3: Commit `angular.json` updates**
```bash
git add angular.json
git commit -m "refactor(config): 📦 update angular.json projects to apps/main and apps/docs"
```

---

### Task 4: Build Scripts, Dockerfile & Tooling Updates

**Files:**
- Modify: `package.json`
- Modify: `Dockerfile`
- Modify: `.ci/build.sh`

**Interfaces:**
- Consumes: Configured project names `main` and `docs` from Task 3
- Produces: Correct CLI invocation scripts and container build artifacts

- [ ] **Step 1: Update `package.json` scripts**
Update scripts to:
```json
"start": "ng serve main --open",
"dev": "ng serve main --open",
"build": "ng build main",
"build:libs": "node .ci/build-libs.js",
"build:staging": "ng build main --configuration staging",
"build:prod": "ng build main --configuration production",
"docs:dev": "ng serve docs",
"docs:build": "ng build docs",
"lint": "npx eslint . --fix",
"prepare": "husky",
"lint-staged": "lint-staged",
"test": "ng test main"
```

- [ ] **Step 2: Update `Dockerfile`**
Update line 28 of `Dockerfile`:
```dockerfile
COPY --from=build /workspace/dist/main/browser /usr/share/nginx/html
```

- [ ] **Step 3: Update `.ci/build.sh`**
Ensure `APP_NAME="angular-starter"` or update docker tag settings as appropriate without breaking container builds.

- [ ] **Step 4: Commit build scripts and Dockerfile updates**
```bash
git add package.json Dockerfile .ci/build.sh
git commit -m "refactor(build): 📦 update npm scripts and Dockerfile for apps/main"
```

---

### Task 5: Documentation & Agent Rules Updates

**Files:**
- Modify: `.agents/rules/coding-style.md`
- Modify: `.agents/architect.md`
- Modify: `docs/ui-roadmap-status.md`

**Interfaces:**
- Consumes: New project layout
- Produces: Updated developer and agent rules referencing `apps/main` and `apps/docs`

- [ ] **Step 1: Update `.agents/rules/coding-style.md`**
Update path references from `src/app/` to `apps/main/src/app/`, `src/models/` to `apps/main/src/models/`, `src/styles/` to `apps/main/src/styles/`.

- [ ] **Step 2: Update `.agents/architect.md`**
Update architecture diagram and folder structure descriptions to show `apps/main`, `apps/docs`, and `libs/`.

- [ ] **Step 3: Update `docs/ui-roadmap-status.md`**
Update references from `projects/docs` to `apps/docs` and `src/styles` to `apps/main/src/styles`.

- [ ] **Step 4: Commit documentation updates**
```bash
git add .agents/rules/coding-style.md .agents/architect.md docs/ui-roadmap-status.md
git commit -m "docs(architecture): 📚 update documentation and agent rules for apps monorepo"
```

---

### Task 6: Full Verification & Sanity Checks

**Files:**
- None (verification only)

- [ ] **Step 1: Build `main` application**
Run: `yarn build`
Expected: Output generated in `dist/main/browser` with exit code 0.

- [ ] **Step 2: Build `docs` application**
Run: `yarn docs:build`
Expected: Output generated in `dist/docs/browser` with exit code 0.

- [ ] **Step 3: Build libraries**
Run: `yarn build:libs`
Expected: All libraries in `libs/` compile successfully.

- [ ] **Step 4: Run linter**
Run: `yarn lint`
Expected: ESLint passes across all files.

- [ ] **Step 5: Verify git status is completely clean**
Run: `git status`
Expected: Clean working tree on branch.
