class AuthPanel {
  constructor(page) {
    this.page = page;
    // Sign-up view (initial view of the panel)
    this.signInSwitchLink = page.getByText('Sign In', { exact: true });

    // Sign-in view
    this.emailInput = page.getByPlaceholder('Your email');
    this.passwordInput = page.getByPlaceholder('Your password');
    this.signInSubmitButton = page.getByRole('button', { name: 'Sign In', exact: true });
    this.invalidPasswordError = page.getByText('Invalid password');
    this.resetSwitchLink = page.getByText('Reset', { exact: true });

    // Reset-request view
    this.resetEmailInput = page.getByPlaceholder('Your email');
    this.resetSendButton = page.getByRole('button', { name: 'Send' });
  }

  /** Only valid while the sign-up view is showing (before the sign-in form renders). */
  async switchToSignIn() {
    await this.signInSwitchLink.click();
  }

  /** Only valid while the sign-in view is showing (before the reset form renders). */
  async switchToReset() {
    await this.resetSwitchLink.click();
  }

  async signIn(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInSubmitButton.click();
  }

  async fillResetEmail(email) {
    await this.resetEmailInput.fill(email);
  }
}

module.exports = { AuthPanel };
