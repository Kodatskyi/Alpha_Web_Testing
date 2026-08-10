class ReaderPage {
  constructor(page) {
    this.page = page;
    this.chapterTitle = page.getByTestId('novel-reader-chapter-title');
    this.nextChapterButton = page.getByRole('button', { name: 'Next Chapter' });
  }

  async goto(path) {
    await this.page.goto(path);
  }
}

module.exports = { ReaderPage };
