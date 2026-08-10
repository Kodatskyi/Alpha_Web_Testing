class ProfileSettingsPage {
  constructor(page) {
    this.page = page;
    this.logoutLink = page.getByText('Logout', { exact: true });
  }

  async goto() {
    await this.page.goto('/profile/settings');
  }

  async logout() {
    await this.logoutLink.click();
  }
}

module.exports = { ProfileSettingsPage };
