# E2E smoke tests

[Playwright](https://playwright.dev) drives the **production builds** of `apps/main` and `apps/docs` in
Google Chrome. They answer one question: _does the app still start and do its main things?_ Unit tests
cover the logic; these catch a broken build, a bad route, a console error or a regression in a flow.

```bash
npm run e2e:build   # ng build main + docs (skip when dist/ is fresh)
npm run e2e         # all tests, ~10 s
npx playwright test -c e2e --project=main -g "products"   # a subset
```

`e2e:ui` and `e2e:report` serve a web page instead of opening a window, so they work where there is no
display (an SSH session, a Linux VM such as OrbStack). Open the printed URL in a browser; the tests run
headless and the page replays them from recorded snapshots.

`npm run verify` and the CI workflow run `npm run e2e` after the builds.

## What is covered

| File             | Tests                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------ |
| `main.spec.ts`   | boot and redirect, navigation, theme switch, 404, every lazy route, sign-in (fail, success, guard), products CRUD   |
| `docs.spec.ts`   | every route of the docs app renders an `h1`; theme toggle. The route list is read from `app.routes.ts`            |

Every test also fails when the page throws or calls `console.error` (`fixtures.ts`), so a docs page that
breaks only at runtime is caught without writing an assertion for it.

## How it works

- **Builds, not the dev server.** `serve.mjs` serves `dist/main/browser` (port 4310) and `dist/docs/browser`
  (4311) with the SPA fallback; a missing file with an extension is a 404, like in nginx. The nginx config
  itself is not under test.
- **The network is mocked.** The product list calls DummyJSON and sign-in calls the API from
  `environments/env.js`, which do not exist in a test run. `products.mock.ts` answers DummyJSON in memory and
  records the create / update / delete calls; the sign-in tests stub `**/api/auth/login` and hand out an
  unsigned JWT. Any other third-party host (avatars, fonts) gets an empty answer.
- **System Chrome.** `channel: 'chrome'` uses the Chrome installed on the machine (GitHub's runners have it),
  so no browser is downloaded. To use Playwright's own Chromium, run `npx playwright install chromium` and
  remove `channel` from `playwright.config.ts`.
- **Output** goes to `dist/e2e/` (git-ignored): `report/` (HTML) and `results/` (traces of failed tests; open
  with `npx playwright show-trace <trace.zip>`). CI uploads the folder when a test fails.

## Writing a test

- Add it to `main.spec.ts` / `docs.spec.ts`, and import `test` and `expect` from `./fixtures`, not from
  `@playwright/test`.
- Mock the API before `page.goto` (`await mockProductApi(page)`).
- Locate by role, text or placeholder. The app has no `data-testid`. Prefer `exact: true` when one title is a
  prefix of another (`Beauty item 1` and `Beauty item 10`).
- Keep it a smoke test: a flow per test, no pixel comparisons.

## Known limitations

- Only Chrome is run. Add a project to the config to cover Firefox or WebKit (needs `playwright install`).
