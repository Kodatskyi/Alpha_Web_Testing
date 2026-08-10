# AlphaNovel Playwright Test Suite

End-to-end tests for [alphanovel.io](https://alphanovel.io/) using [Playwright](https://playwright.dev/), built with the Page Object Model, running across Chromium, Firefox, and WebKit, with Allure and HTML reporting.

## Setup

```bash
npm install
npx playwright install          # downloads Chromium/Firefox/WebKit
cp .env.example .env            # then fill in real test-account credentials
```

`.env` holds the test account used by the auth/favorites tests. It is git-ignored — never commit real credentials. See [.env.example](.env.example) for the required shape:

```
ALPHANOVEL_TEST_EMAIL=
ALPHANOVEL_TEST_PASSWORD=
```

## Running tests

```bash
npm test                        # all specs, all browsers (chromium, firefox, webkit)
npm run test:headed             # same, with a visible browser window
npx playwright test tests/alphanovel/navigation.spec.js   # a single file
npx playwright test --project=chromium                     # a single browser
npx playwright test -g "Genre navigation"                  # by test title
```

## Reports

Two reporters are configured (`playwright.config.js`): `html` and `allure-playwright`, plus `list` for terminal output. Screenshots and video are captured `only-on-failure`/`retain-on-failure`, and traces `retain-on-failure` — Allure picks these up automatically.

```bash
npm run test:report             # open the native Playwright HTML report

npm run allure:generate         # build the Allure report from allure-results/
npm run allure:open             # serve and open the generated report
npm run allure:serve            # generate + open in one step, without persisting allure-report/
```

Allure report generation requires a Java runtime (via `allure-commandline`). On macOS: `brew install openjdk`, then make sure it's on `PATH` (Homebrew installs it keg-only):
```bash
export PATH="/opt/homebrew/opt/openjdk/bin:$PATH"
```

## Project structure

```
tests/alphanovel/
  pages/                  Page Object Model — one class per page/component
    HomePage.js             header nav, Novels dropdown/genre links, cookie banner, novel cards
    AuthPanel.js            sign-up/sign-in/reset-request slide-in drawer
    SearchPage.js           search input and result cards
    NovelDetailPage.js      title/genre/author/chapters/tags, favorite icon
    ReaderPage.js           chapter title/body, next-chapter control
    LibraryPage.js          gated sign-up prompt, favorited novel list
    ProfileSettingsPage.js  logout
  fixtures.js             wires page objects into Playwright's `test` (e.g. `{ homePage }`)
  env.js                  reads ALPHANOVEL_TEST_EMAIL/PASSWORD from .env, throws if unset
  *.spec.js               the actual tests, grouped by feature area

specs/plan.md             test plan this suite was generated from, plus notes on
                           quirks discovered against the live site (selector gotchas,
                           known flakiness, root causes and fixes)

.github/agents/            planner/generator/healer agent definitions for VS Code
                           Copilot Chat's agentic Playwright workflow
.github/copilot-instructions/playwright-e2e/
                            the "playwright-e2e" QA skill (POM/fixtures/best-practices
                            reference), installed via `npx @qaskills/cli`
.vscode/mcp.json            Playwright MCP servers for VS Code (browser automation +
                             test-runner-aware tools)
```

## Test coverage

| Suite | File | Covers |
|---|---|---|
| Homepage & Navigation | `navigation.spec.js` | core nav, cookie consent, all 8 genres via the Novels dropdown |
| Search | `search.spec.js` | keyword search results, no-match fallback behavior |
| Authentication | `auth.spec.js` | valid/invalid sign-in, forgot-password navigation, logout |
| Novel Discovery & Reading | `novel-reading.spec.js` | novel detail metadata, chapter reader, favorite/un-favorite (see below) |
| Library | `library.spec.js` | gated sign-up prompt when logged out |

Out of scope, deliberately: account deletion, changing Account Details, Subscription/Top Up Balance (real payment surfaces), posting Novel Reviews, and the password-reset *email* round-trip (requires reading a real inbox — verified manually once, not automated).

## Known issues

- **The favorite/un-favorite test is marked `test.fixme()`.** It fails reproducibly across all three browsers because AlphaNovel's Library list is eventually-consistent after a "like" click, with highly variable and sometimes very long lag. This is confirmed live-backend behavior, not a bug in the test — see `specs/plan.md` for the full investigation.
- **Cloudflare bot-challenge interstitials.** Under sustained automated traffic, alphanovel.io occasionally serves a "Performing security verification" page instead of real content. `HomePage.resolveSecurityChallengeIfPresent()` detects and retries past it; the genre-navigation tests wrap their assertions in `expect(...).toPass()` for this reason.
- Credentials for the real account live only in `.env` (git-ignored). If you rotate the test password, update `.env` — nothing else references it directly except through `tests/alphanovel/env.js`.

## VS Code MCP integration

`.vscode/mcp.json` configures two MCP servers so VS Code's Copilot Chat (or Claude) can drive Playwright directly:
- `playwright` — general browser automation (`@playwright/mcp`)
- `playwright-test` — test-runner-aware tools (`npx playwright run-test-mcp-server`), used by the planner/generator/healer agents in `.github/agents/`

To run the general-purpose MCP server standalone (e.g. for other local tooling):
```bash
npm run mcp
```
