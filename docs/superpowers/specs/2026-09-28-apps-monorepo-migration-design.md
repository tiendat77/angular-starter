# Apps Monorepo Migration Design Spec

**Date:** 2026-09-28  
**Topic:** Reorganize Angular CLI workspace into `apps/` and `libs/` structure with `main` and `docs` applications.

---

## 1. Overview & Goals

Currently, the repository has an asymmetrical and hybrid layout:
- Root application `angular-starter` sits at `src/` with `root: ""` in `angular.json`.
- Documentation showcase application sits at `projects/docs/`.
- Shared UI, navigation, and hotkeys libraries sit in `libs/`.

**Goals:**
1. Establish a standard, clean monorepo architecture:
   - All deployable applications live under `apps/` (`apps/main` and `apps/docs`).
   - All reusable packages live under `libs/` (`libs/ui`, `libs/navigation`, `libs/hotkeys`).
   - Remove the `projects/` directory entirely.
2. Update all Angular CLI configurations, TypeScript configurations, npm build scripts, Dockerfile, and agent coding guidelines to reflect this new layout.
3. Verify that both applications (`main` and `docs`) and all libraries build and test cleanly without regressions.

---

## 2. Target File Structure

```text
angular-starter/
├── apps/
│   ├── main/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── configs/
│   │   │   ├── environments/
│   │   │   ├── models/
│   │   │   ├── styles/
│   │   │   ├── declare.d.ts
│   │   │   ├── index.html
│   │   │   └── main.ts
│   │   ├── tsconfig.app.json
│   │   └── tsconfig.spec.json
│   └── docs/
│       ├── src/
│       │   ├── app/
│       │   ├── index.html
│       │   ├── main.ts
│       │   └── styles.css
│       └── tsconfig.app.json
├── libs/
│   ├── hotkeys/
│   ├── navigation/
│   └── ui/
├── public/                         # Shared root assets (icons, images, environments, styles, favicon.svg)
├── angular.json
├── tsconfig.json
├── package.json
├── Dockerfile
└── ...
```

---

## 3. Detailed Component & Configuration Changes

### 3.1 Directory Reorganization
1. Create `apps/main` and move:
   - Root `src/` -> `apps/main/src/`
   - Root `tsconfig.app.json` -> `apps/main/tsconfig.app.json`
   - Root `tsconfig.spec.json` -> `apps/main/tsconfig.spec.json`
   - Keep root `public/` at workspace root (`public/`) to share static assets across apps.
2. Create `apps/docs` and move:
   - `projects/docs/*` -> `apps/docs/`
3. Delete the now-empty `projects/` directory.

### 3.2 `angular.json`
- Rename project `"angular-starter"` to `"main"`:
  - `"root"`: `"apps/main"`
  - `"sourceRoot"`: `"apps/main/src"`
  - `"architect.build.options.outputPath"`: `"dist/main"`
  - `"architect.build.options.index"`: `"apps/main/src/index.html"`
  - `"architect.build.options.browser"`: `"apps/main/src/main.ts"`
  - `"architect.build.options.tsConfig"`: `"apps/main/tsconfig.app.json"`
  - `"architect.build.options.assets"`: `[{ "glob": "**/*", "input": "public" }]`
  - `"architect.build.options.styles"`: `["apps/main/src/styles/index.css"]`
  - `"architect.serve.configurations.production.buildTarget"`: `"main:build:production"`
  - `"architect.serve.configurations.development.buildTarget"`: `"main:build:development"`
  - `"architect.test.options.tsConfig"`: `"apps/main/tsconfig.spec.json"`
  - `"architect.lint.options.lintFilePatterns"`: `["apps/main/**/*.ts", "apps/main/**/*.html"]`
- Update project `"docs"`:
  - `"root"`: `"apps/docs"`
  - `"sourceRoot"`: `"apps/docs/src"`
  - `"architect.build.options.outputPath"`: `"dist/docs"`
  - `"architect.build.options.index"`: `"apps/docs/src/index.html"`
  - `"architect.build.options.browser"`: `"apps/docs/src/main.ts"`
  - `"architect.build.options.tsConfig"`: `"apps/docs/tsconfig.app.json"`
  - `"architect.build.options.assets"`: `[{ "glob": "**/*", "input": "public/icons", "output": "icons" }]`
  - `"architect.build.options.styles"`: `["apps/docs/src/styles.css"]`
  - `"architect.serve.configurations.production.buildTarget"`: `"docs:build:production"`
  - `"architect.serve.configurations.development.buildTarget"`: `"docs:build:development"`
  - Add `"lint"` architect target if appropriate to match `apps/docs/**/*.ts`, `apps/docs/**/*.html`.

### 3.3 TypeScript Configurations
- Root `tsconfig.json`:
  ```json
  "paths": {
    "@/*": ["./apps/main/src/app/*"],
    "@configs/*": ["./apps/main/src/configs/*"],
    "@models": ["./apps/main/src/models/index"],
    "@environment": ["./apps/main/src/environments/environment"],
    "@libs/hotkeys": ["./packages/hotkeys", "./libs/hotkeys/src/public-api"],
    "@libs/navigation": ["./packages/navigation", "./libs/navigation/src/public-api"],
    "@libs/ui": ["./packages/ui", "./libs/ui/src/public-api"],
    "@libs/ui/*": ["./packages/ui/*", "./libs/ui/*/src/public-api"]
  }
  ```
- `apps/main/tsconfig.app.json`:
  - `"extends": "../../tsconfig.json"`
  - `"compilerOptions.outDir": "../../out-tsc/app"`
  - `"files": ["src/main.ts"]`
  - `"include": ["src/**/*.d.ts"]`
- `apps/main/tsconfig.spec.json`:
  - `"extends": "../../tsconfig.json"`
  - `"compilerOptions.outDir": "../../out-tsc/spec"`
  - `"include": ["src/**/*.spec.ts", "src/**/*.d.ts"]`
- `apps/docs/tsconfig.app.json`:
  - `"extends": "../../tsconfig.json"`
  - `"compilerOptions.outDir": "../../out-tsc/docs"`
  - `"files": ["src/main.ts"]`
  - `"include": ["src/**/*.d.ts", "src/**/*.ts"]`

### 3.4 `package.json` Scripts
Update scripts to target the explicit project names:
- `"start": "ng serve main --open"`
- `"dev": "ng serve main --open"`
- `"build": "ng build main"`
- `"build:staging": "ng build main --configuration staging"`
- `"build:prod": "ng build main --configuration production"`
- `"docs:dev": "ng serve docs"`
- `"docs:build": "ng build docs"`
- `"test": "ng test main"`
- `"lint": "npx eslint . --fix"`

### 3.5 Dockerfile & Deployment
- Line 28 of `Dockerfile`:
  ```dockerfile
  COPY --from=build /workspace/dist/main/browser /usr/share/nginx/html
  ```

### 3.6 Documentation & Agent Rules
- Update `.agents/rules/coding-style.md`:
  - Update paths pointing to `src/app/` to `apps/main/src/app/`.
- Update `.agents/architect.md`:
  - Update architecture diagram and folder structure to reflect `apps/main` and `apps/docs`.

---

## 4. Verification Plan
1. **Build `main` application:** `yarn build` -> successfully creates `dist/main/browser`.
2. **Build `docs` application:** `yarn docs:build` -> successfully creates `dist/docs/browser`.
3. **Build libraries:** `yarn build:libs` -> builds `libs/hotkeys`, `libs/navigation`, `libs/ui`.
4. **Lint:** `yarn lint` -> executes without configuration errors across all `apps/` and `libs/`.
5. **Git status:** ensure clean migration without leftover dangling files in root or `projects/`.
