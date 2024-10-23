# Angular Starter

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.0.4.

## Git Branch Naming Convention

The [Git Branching Naming Convention](https://dev.to/couchcamote/git-branching-name-convention-cch) article is an excellent base.
However, you can simplify even more.

**Category**

A git branch should start with a category. Pick one of these: `feature`, `bugfix`, `hotfix`, or `test`.

- `feature` is for adding, refactoring or removing a feature
- `bugfix` is for fixing a bug
- `hotfix` is for changing code with a temporary solution and/or without following the usual process (usually because of an emergency)
- `test` is for experimenting outside of an issue/ticket

**Reference**

After the category, there should be a `"/"` followed by the reference of the issue/ticket you are working on. If there's no reference, just add `no-ref`.

**Description**

After the reference, there should be another `"/"` followed by a description which sums up the purpose of this specific branch. This description should be short and "kebab-cased".

By default, you can use the title of the issue/ticket you are working on. Just replace any special character by `"-"`.

**Examples:**

- You need to add, refactor or remove a feature: `git branch feature/issue-42/create-new-button-component`
- You need to fix a bug: `git branch bugfix/issue-342/button-overlap-form-on-mobile`
- You need to fix a bug really fast (possibly with a temporary solution): `git branch hotfix/no-ref/registration-form-not-working`
- You need to experiment outside of an issue/ticket: `git branch test/no-ref/refactor-components-with-atomic-design`

## Git Commit Naming Convention

The commit message should be structured as follows:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

The commit contains the following structural elements, to communicate intent to the consumers of your library:

1. **fix:** a commit of the type `fix` patches a bug in your codebase (this correlates with PATCH in Semantic Versioning).

2. **feat:** a commit of the type `feat` introduces a new feature to the codebase (this correlates with MINOR in Semantic Versioning).

3. **BREAKING CHANGE**: a commit that has a footer `BREAKING CHANGE:`, or appends a `!` after the type/scope, introduces a breaking API change (correlating with MAJOR in Semantic Versioning). A BREAKING CHANGE can be part of commits of any type.

4. *types* other than `fix:` and `feat:` are allowed, for example @commitlint/config-conventional (based on the Angular convention) recommends `build:`, `chore:`, `ci:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`, and others.

5. *footers* other than `BREAKING CHANGE: <description>` may be provided and follow a convention similar to git trailer format.

Additional types are not mandated by the Conventional Commits specification, and have no implicit effect in Semantic Versioning (unless they include a BREAKING CHANGE). A scope may be provided to a commit’s type, to provide additional contextual information and is contained within parenthesis, e.g., `feat(parser): add ability to parse arrays`.

To write a friendly commit message, recommends to use `Commitizen`. It will help you to write a commit message that follows the convention.

First, run `npm run prepare` to install `husky`. Then, run `npm run commit` to write a friendly commit message.

## Commit with Commitizen friendly

Run `npm run cz`, you'll be prompted to fill in any required fields, and your commit messages will be formatted according to the standards defined by project maintainers.

## Coding

If you are using `Visual Studio Code`, install these extensions:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)
- [Angular Language Service](https://marketplace.visualstudio.com/items?itemName=Angular.ng-template)

## Development server

Run `npm start` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/browser` directory.

## Build Docker image

Run `npm run build:image` to build the project with docker and automatic push to Github Packages

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
