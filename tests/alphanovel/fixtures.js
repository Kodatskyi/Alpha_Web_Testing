const base = require('@playwright/test');
const { HomePage } = require('./pages/HomePage');
const { AuthPanel } = require('./pages/AuthPanel');
const { SearchPage } = require('./pages/SearchPage');
const { NovelDetailPage } = require('./pages/NovelDetailPage');
const { ReaderPage } = require('./pages/ReaderPage');
const { LibraryPage } = require('./pages/LibraryPage');
const { ProfileSettingsPage } = require('./pages/ProfileSettingsPage');

const test = base.test.extend({
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },
  authPanel: async ({ page }, use) => {
    await use(new AuthPanel(page));
  },
  searchPage: async ({ page }, use) => {
    await use(new SearchPage(page));
  },
  novelDetailPage: async ({ page }, use) => {
    await use(new NovelDetailPage(page));
  },
  readerPage: async ({ page }, use) => {
    await use(new ReaderPage(page));
  },
  libraryPage: async ({ page }, use) => {
    await use(new LibraryPage(page));
  },
  profileSettingsPage: async ({ page }, use) => {
    await use(new ProfileSettingsPage(page));
  },
});

module.exports = { test, expect: base.expect };
