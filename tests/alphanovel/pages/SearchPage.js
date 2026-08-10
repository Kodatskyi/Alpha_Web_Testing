class SearchPage {
  constructor(page) {
    this.page = page;
    this.searchInput = page.getByPlaceholder('Search by title or tag...');
    this.startReadingLinks = page.getByRole('link', { name: 'Start Reading' });
    this.likeButtons = page.getByTestId('book-card-like');
  }

  async goto() {
    await this.page.goto('/search');
  }

  async searchFor(query) {
    await this.searchInput.fill(query);
  }
}

module.exports = { SearchPage };
