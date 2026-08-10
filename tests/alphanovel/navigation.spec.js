// spec: specs/plan.md
// @ts-check
const { test, expect } = require('./fixtures');

const GENRES = [
  { name: 'All Novels', path: '/novels' },
  { name: 'Werewolf', path: '/novels/werewolf' },
  { name: 'Billionaire/CEO', path: '/novels/billionaire' },
  { name: 'Romance', path: '/novels/romance' },
  { name: 'Paranormal', path: '/novels/paranormal' },
  { name: 'Fantasy', path: '/novels/fantasy' },
  { name: 'YA/Teen', path: '/novels/ya-teen' },
  { name: 'LGBTQ+', path: '/novels/lgbtq' },
];

test.describe('Homepage & Navigation', () => {
  test('Homepage loads with core navigation', async ({ page, homePage }) => {
    // 1. Navigate to /
    await homePage.goto('/');
    await homePage.dismissCookieBanner();

    // 2. Verify page title contains "AlphaNovel"
    await expect(page).toHaveTitle(/AlphaNovel/);

    // 3. Verify header nav links are visible
    for (const label of ['Discover', 'Novels', 'Library', 'Gifts', 'Writer', 'Blog', 'Search']) {
      await expect(homePage.navLink(label)).toBeVisible();
    }

    // 4. Verify "Sign Up" button is visible (logged-out state)
    await expect(homePage.signUpButton).toBeVisible();
  });

  test('Cookie consent banner can be accepted', async ({ page, homePage }) => {
    // 1. Navigate to / (fresh context, before dismissing consent)
    await homePage.goto('/');

    // 2. Verify "We value your privacy" banner is visible
    await expect(homePage.cookieBanner).toBeVisible();

    // 3. Click "Accept All"
    await homePage.acceptAllButton.click();

    // 4. Verify banner is no longer visible
    await expect(homePage.cookieBanner).not.toBeVisible();
  });

  for (const genre of GENRES) {
    test(`Genre navigation via Novels dropdown - ${genre.name}`, async ({ page, homePage }) => {
      await homePage.goto('/');
      await homePage.dismissCookieBanner();

      // 1. Open the "Novels" nav dropdown
      // 2. Click the genre link
      await homePage.goToGenre(genre.name);

      // Cloudflare occasionally serves a "Performing security verification" interstitial instead of
      // the genre page under automated traffic (confirmed via error-context snapshots on live runs).
      // The real content genuinely isn't there yet in that case, so retry by reloading rather than
      // just waiting longer on the same locator.
      await expect(async () => {
        await homePage.resolveSecurityChallengeIfPresent();
        // 3. Verify the URL matches the genre's expected path
        await expect(page).toHaveURL(new RegExp(`${genre.path}$`));
        // 4. Verify at least one novel card is visible on the resulting page
        await expect(homePage.novelCards.first()).toBeVisible({ timeout: 5000 });
      }).toPass({ timeout: 20000 });
    });
  }
});
