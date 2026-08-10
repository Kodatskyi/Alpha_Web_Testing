class NovelDetailPage {
  constructor(page) {
    this.page = page;
    this.likeButton = page.getByTestId('novel-details-card-like');
    this.shareButton = page.getByTestId('novel-details-card-share');
    this.genreMeta = page.getByText(/^Genre:/);
    this.authorMeta = page.getByText(/^Author:/);
    this.chaptersMeta = page.getByText(/^Chapters:/);
    this.statusMeta = page.getByText(/^Status:/);
    this.ageRatingMeta = page.getByText(/^Age Rating:/);
  }

  async goto(path) {
    await this.page.goto(path);
  }

  heading(title) {
    return this.page.getByRole('heading', { name: title });
  }

  tag(label) {
    return this.page.getByText(label, { exact: true });
  }

  async toggleFavorite() {
    await this.likeButton.click();
    // The like action gives no observable DOM/network signal to wait on, and the Library page only
    // fetches its list once on load - navigating away too quickly races the persist call server-side.
    await this.page.waitForTimeout(2000);
  }

  chapterLink(chapterNumber) {
    return this.page.getByRole('link', { name: `Chapter ${chapterNumber}` }).first();
  }
}

module.exports = { NovelDetailPage };
