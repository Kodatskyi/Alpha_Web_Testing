// spec: specs/plan.md
// @ts-check
const { test, expect } = require('./fixtures');

test.describe('Search', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto('/search');
    await homePage.dismissCookieBanner();
  });

  test('Search by keyword returns results', async ({ searchPage }) => {
    // 1. Navigate to /search (done in beforeEach)
    // 2. Type "Winter" into the search input
    await searchPage.searchFor('Winter');

    // 3. Verify at least one result card is visible
    await expect(searchPage.startReadingLinks.first()).toBeVisible();

    // 4. Verify each result card shows a "Start Reading" button and a favorite (heart) icon
    await expect(searchPage.likeButtons.first()).toBeVisible();
  });

  test('Search with a query matching no title still shows fallback recommendations', async ({ searchPage }) => {
    // NOTE: deviates from the original plan wording ("no results / empty state"). Live exploration showed
    // AlphaNovel's search never renders a true empty state — for any query with no title/tag match it falls
    // back to a fixed list of ~10 recommended novels alongside a randomized "Top Tags" list. This test asserts
    // that actually observed behavior instead of a "no results" state that does not exist on the site.
    // 1. Navigate to /search (done in beforeEach)
    // 2. Type an unlikely string
    await searchPage.searchFor('zzznonexistentquery999');

    // 3. Verify the fallback recommendation cards are shown rather than an error or blank page
    await expect(searchPage.startReadingLinks.first()).toBeVisible();
  });
});
