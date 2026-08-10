# Test Plan: alphanovel.io

**Target:** https://alphanovel.io/
**Seed:** `tests/alphanovel/seed.spec.js` (loads homepage, dismisses cookie-consent banner)
**Browsers:** chromium, firefox, webkit (existing `playwright.config.js` projects)
**Test account:** loaded from `.env` (`ALPHANOVEL_TEST_EMAIL` / `ALPHANOVEL_TEST_PASSWORD`, see `tests/alphanovel/env.js`) — never hardcoded, see `.env.example` for the required shape.

Out of scope / will not automate: "Delete My Profile", changing Account Details (name/DOB/avatar), Subscription/Top Up Balance (real payment surfaces), posting Novel Reviews. The password-reset email round-trip was already verified manually this session (see chat) and will not be re-run automatically since it depends on reading a real email.

---

### 1. Homepage & Navigation
**Seed:** `tests/alphanovel/seed.spec.js`

#### 1.1 Homepage loads with core navigation
**Steps:**
1. Navigate to `/`
2. Verify page title contains "AlphaNovel"
3. Verify header nav links are visible: Discover, Novels, Library, Gifts, Writer, Blog, Search
4. Verify "Sign Up" button is visible (logged-out state)

#### 1.2 Cookie consent banner can be accepted
**Steps:**
1. Navigate to `/` (fresh context, before dismissing consent)
2. Verify "We value your privacy" banner is visible
3. Click "Accept All"
4. Verify banner is no longer visible

#### 1.3 Genre navigation via Novels dropdown (data-driven, all genres)
**Steps:**
For each genre in the "Novels" dropdown — All Novels (`/novels`), Werewolf (`/novels/werewolf`),
Billionaire/CEO (`/novels/billionaire`), Romance (`/novels/romance`), Paranormal (`/novels/paranormal`),
Fantasy (`/novels/fantasy`), YA/Teen (`/novels/ya-teen`), LGBTQ+ (`/novels/lgbtq`):
1. Open the "Novels" nav dropdown
2. Click the genre link
3. Verify the URL matches the genre's expected path
4. Verify at least one novel card is visible on the resulting page

---

### 2. Search
**Seed:** `tests/alphanovel/seed.spec.js`

#### 2.1 Search by keyword returns results
**Steps:**
1. Navigate to `/search`
2. Type "Winter" into the "Search by title or tag..." input
3. Verify at least one result card is visible
4. Verify each result card shows a "Start Reading" button and a favorite (heart) icon

#### 2.2 Search with a nonsense query returns no results / empty state
**Steps:**
1. Navigate to `/search`
2. Type an unlikely string (e.g. "zzznonexistentquery999")
3. Verify no novel result cards are rendered (or an explicit empty state is shown)

---

### 3. Authentication
**Seed:** `tests/alphanovel/seed.spec.js`

#### 3.1 Sign in with valid credentials
**Steps:**
1. Click "Sign Up" to open the auth panel
2. Click "Sign In" to switch to the login form
3. Fill email: test account email (from `.env`)
4. Fill password: test account password (from `.env`)
5. Click "Sign In"
6. Verify the header now shows a "Profile" button and no longer shows "Sign Up"

#### 3.2 Sign in with an incorrect password shows inline error
**Steps:**
1. Open the auth panel and switch to "Sign In"
2. Fill email: test account email (from `.env`)
3. Fill password: an incorrect value (e.g. WrongPassword999!)
4. Click "Sign In"
5. Verify inline error text "Invalid password" is shown under the password field
6. Verify the user remains logged out (header still shows "Sign Up")

#### 3.3 Forgot-password link opens the reset-request form (navigation only, no submit)
**Steps:**
1. Open the auth panel and switch to "Sign In"
2. Click "Forgot your password? Reset"
3. Verify the reset-request form is shown with an email input and "Send" button
4. Do not submit — no email should be sent by this automated test

#### 3.4 Logout ends the session
**Steps:**
1. Sign in with valid credentials (test account from `.env`)
2. Navigate to `/profile/settings`
3. Click "Logout"
4. Verify header shows "Sign Up" again (logged-out state)

---

### 4. Novel Discovery & Reading
**Seed:** `tests/alphanovel/seed.spec.js`

#### 4.1 Novel detail page shows expected metadata
**Steps:**
1. Navigate to a known novel detail page, e.g. `/novels/werewolf/winter-s-mate-fated-on-ice-by-royhan-h`
2. Verify title "Winter's Mate: Fated on Ice" is visible
3. Verify Genre, Author, Chapters, Status, Age Rating fields are visible
4. Verify tag chips (e.g. "Alpha", "Slow Burn") are visible

#### 4.2 Reading a chapter shows chapter content and next-chapter navigation
**Steps:**
1. From the novel detail page, click into Chapter 1 (or navigate directly to `.../reader?chapter=1`)
2. Verify the chapter title and body text are visible
3. Verify a "Next Chapter" control is visible and points to `?chapter=2`

#### 4.3 Favorite a novel while logged in, then un-favorite it
**Steps:**
1. Sign in with valid credentials
2. Navigate to a novel detail page
3. Click the heart/favorite icon
4. Navigate to `/library`
5. Verify the novel now appears in the Library
6. Return to the novel detail page and click the heart icon again to un-favorite
7. Navigate to `/library` and verify the novel no longer appears (cleanup so the account ends in its original state)

---

### 5. Library (gated content)
**Seed:** `tests/alphanovel/seed.spec.js`

#### 5.1 Unauthenticated Library shows sign-up prompt
**Steps:**
1. Navigate to `/library` while logged out
2. Verify prompt "Sign Up to build your unique library" is visible

---

## Notes for the generator
- Cookie-consent banner appears on first load per context — every test should dismiss it (via the seed) before interacting with header/hero elements it overlaps.
- The auth panel is a slide-in drawer, not a full page navigation — reached via clicking "Sign Up" then "Sign In" (or "Reset") inside it. URL stays on the current route while it's open.
- Login/signup email & password inputs are ambiguous by placeholder alone ("New password" is a substring of "Confirm new password" on the recover-password page) — prefer `page.getByPlaceholder('Your email')` / `getByPlaceholder('Your password')` for the sign-in form specifically, and `data-testid` (`recover-password-form-password-input` / `-confirm-input`) on the recover-password page.
- Test 3.4 depends on 3.1's login step; keep each test independent by repeating the sign-in steps rather than depending on shared state between test files.
- **Header "Sign Up"/"Profile" ambiguity:** the same text appears inside the auth panel (footer "Sign Up" link, "Sign In" heading/submit button) and the profile sidebar. Locators for these must be scoped to `getByTestId('layout-header-actions')`, not matched by role+name alone.
- **"Profile" changes element type on login:** logged-out it's a `<button>`; logged-in it's an `<a>` (role "link") to `/profile`. Locate accordingly.
- **Favorite/Library persistence is genuinely flaky against the live backend.** Extensive live investigation (clicking the like button and polling the Library page, both via bare Playwright scripts and through the actual test runner) confirmed: the click itself always registers, but the Library list's read side is eventually consistent with highly variable lag - anywhere from ~3 seconds to over 90 seconds observed, and specifically slower/less predictable when driven through the `npx playwright test` runner than through a bare `chromium.launch()` script (cause not conclusively identified; disabling trace recording did not fix it). Re-clicking while waiting made this worse by racing multiple in-flight toggle requests. The shipped test (`novel-reading.spec.js`) clicks at most once per direction and polls the Library by reloading, with a 90s timeout and a 240s test-level budget - both intentional, not placeholders. This test may still occasionally fail or run long in CI through no fault of the test code; consider that acceptable, known flakiness rather than a regression.

## Architecture

**Page Object Model.** One class per distinct page/component under `tests/alphanovel/pages/`:
- `HomePage` — header nav, Novels dropdown/genre links, cookie-consent banner, novel card grid
- `AuthPanel` — the slide-in drawer: sign-up view, sign-in view (email/password/submit/error text), reset-request view, view-switch links ("Sign In", "Sign Up", "Reset")
- `SearchPage` — search input, result cards
- `NovelDetailPage` — title/genre/author/chapters/status/tags, favorite icon, chapter links
- `ReaderPage` — chapter title/body, next-chapter control
- `LibraryPage` — gated sign-up prompt, favorited novel list
- `ProfileSettingsPage` — Logout, tab navigation

Each page object exposes locators + intent-named methods (e.g. `authPanel.signIn(email, password)`), so spec files read as plain step sequences and selector changes are fixed in one place.

**Credentials.** Never hardcoded in spec/page-object files. Loaded from environment variables via `dotenv`:
- `tests/alphanovel/env.js` — small helper reading `process.env.ALPHANOVEL_TEST_EMAIL` / `ALPHANOVEL_TEST_PASSWORD` (throws a clear error if unset)
- `.env` — real credentials, **git-ignored**, already created locally
- `.env.example` — committed template with empty values, so the repo shows the required shape without leaking secrets
- `playwright.config.js` already calls `require('dotenv').config()` so `process.env` is populated for every test process
