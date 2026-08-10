class LibraryPage {
  constructor(page) {
    this.page = page;
    this.signUpPrompt = page.getByText('Sign Up to build your unique library');
  }

  async goto() {
    await this.page.goto('/library');
  }

  novelEntry(title) {
    return this.page.getByRole('link', { name: title });
  }
}

module.exports = { LibraryPage };
