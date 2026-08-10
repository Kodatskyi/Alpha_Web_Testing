// spec: specs/plan.md
// @ts-check
const { test, expect } = require('./fixtures');

test.describe('Library (gated content)', () => {
  test('Unauthenticated Library shows sign-up prompt', async ({ homePage, libraryPage }) => {
    // 1. Navigate to /library while logged out
    await libraryPage.goto();
    await homePage.dismissCookieBanner();

    // 2. Verify prompt "Sign Up to build your unique library" is visible
    await expect(libraryPage.signUpPrompt).toBeVisible();
  });
});
