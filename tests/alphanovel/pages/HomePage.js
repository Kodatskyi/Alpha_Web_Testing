class HomePage {
  constructor(page) {
    this.page = page;
    this.header = page.locator('header');
    this.headerActions = page.getByTestId('layout-header-actions');
    // Rendered as a <button> when logged out and an <a> (role "link") once signed in, and "Sign Up" /
    // "Profile" text also appears inside the auth panel and profile sidebar - scope to header actions
    // to avoid strict-mode collisions with those.
    this.signUpButton = this.headerActions.getByRole('button', { name: 'Sign Up', exact: true });
    this.profileButton = this.headerActions.getByRole('link', { name: 'Profile', exact: true });
    this.cookieBanner = page.getByText('We value your privacy');
    this.acceptAllButton = page.getByRole('button', { name: 'Accept All' });
    this.rejectAllButton = page.getByRole('button', { name: 'Reject All' });
    this.novelsNavTrigger = this.header.getByText('Novels', { exact: true }).first();
    // Scoped to the card container testid, not a bare href-prefix selector: the closed Novels
    // dropdown also contains "/novels/{genre}" links matching that prefix, and being hidden while
    // closed, "a[href^=\"/novels/\"]" .first() intermittently resolved to one of those instead of an
    // actual card - confirmed via live run failures ("unexpected value \"hidden\"").
    this.novelCards = page.getByTestId('novels-card');
    // Cloudflare occasionally serves a "Performing security verification" interstitial instead of
    // the real page under automated traffic. It isn't a missing/renamed locator - the real content
    // genuinely isn't there yet - so the fix is to detect it and retry navigation, not wait longer.
    this.securityChallengeHeading = page.getByRole('heading', { name: 'Performing security verification' });
  }

  async goto(path = '/') {
    await this.page.goto(path);
  }

  async isSecurityChallengeShowing() {
    return this.securityChallengeHeading.isVisible().catch(() => false);
  }

  /** Reloads past a Cloudflare interstitial if one is currently showing; no-op otherwise. */
  async resolveSecurityChallengeIfPresent() {
    if (await this.isSecurityChallengeShowing()) {
      await this.page.waitForTimeout(3000);
      await this.page.reload();
      await this.dismissCookieBanner();
    }
  }

  async dismissCookieBanner() {
    if (await this.rejectAllButton.isVisible().catch(() => false)) {
      await this.rejectAllButton.click();
    }
  }

  navLink(label) {
    return this.header.getByText(label, { exact: true }).first();
  }

  async openNovelsDropdown() {
    await this.novelsNavTrigger.click();
  }

  async goToGenre(genreName) {
    await this.openNovelsDropdown();
    const genreLink = this.page.getByRole('link', { name: genreName, exact: true });
    await genreLink.waitFor({ state: 'visible' });
    await genreLink.click();
  }
}

module.exports = { HomePage };
