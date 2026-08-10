// spec: specs/plan.md
// @ts-check
const { test, expect } = require('./fixtures');
const { testEmail, testPassword } = require('./env');

test.describe('Authentication', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto('/');
    await homePage.dismissCookieBanner();
  });

  test('Sign in with valid credentials', async ({ homePage, authPanel }) => {
    // 1. Click "Sign Up" to open the auth panel
    await homePage.signUpButton.click();
    // 2. Click "Sign In" to switch to the login form
    await authPanel.switchToSignIn();
    // 3-4. Fill email and password
    // 5. Click "Sign In"
    await authPanel.signIn(testEmail, testPassword);

    // 6. Verify the header now shows a "Profile" button and no longer shows "Sign Up"
    await expect(homePage.profileButton).toBeVisible();
    await expect(homePage.signUpButton).not.toBeVisible();
  });

  test('Sign in with an incorrect password shows inline error', async ({ homePage, authPanel }) => {
    // 1. Open the auth panel and switch to "Sign In"
    await homePage.signUpButton.click();
    await authPanel.switchToSignIn();
    // 2-4. Fill email and an incorrect password, click "Sign In"
    await authPanel.signIn(testEmail, 'WrongPassword999!');

    // 5. Verify inline error text "Invalid password" is shown under the password field
    await expect(authPanel.invalidPasswordError).toBeVisible();

    // 6. Verify the user remains logged out (header still shows "Sign Up")
    await expect(homePage.signUpButton).toBeVisible();
  });

  test('Forgot-password link opens the reset-request form without submitting', async ({ homePage, authPanel }) => {
    // 1. Open the auth panel and switch to "Sign In"
    await homePage.signUpButton.click();
    await authPanel.switchToSignIn();
    // 2. Click "Forgot your password? Reset"
    await authPanel.switchToReset();

    // 3. Verify the reset-request form is shown with an email input and "Send" button
    await expect(authPanel.resetEmailInput).toBeVisible();
    await expect(authPanel.resetSendButton).toBeVisible();

    // 4. Do not submit - no email should be sent by this automated test
  });

  test('Logout ends the session', async ({ homePage, authPanel, profileSettingsPage }) => {
    // 1. Sign in with valid credentials
    await homePage.signUpButton.click();
    await authPanel.switchToSignIn();
    await authPanel.signIn(testEmail, testPassword);
    await expect(homePage.profileButton).toBeVisible();

    // 2. Navigate to /profile/settings
    await profileSettingsPage.goto();
    // 3. Click "Logout"
    await profileSettingsPage.logout();

    // 4. Verify header shows "Sign Up" again (logged-out state)
    await expect(homePage.signUpButton).toBeVisible();
  });
});
