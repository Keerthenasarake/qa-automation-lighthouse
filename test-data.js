/**
 * tests/fixtures/test-data.js
 *
 * Central store for all test constants: URLs, credentials, and selectors.
 * Keeping them here means a single edit updates every test that uses them.
 *
 * NOTE: These are test credentials for UI-flow validation only.
 * Replace VALID_EMAIL / VALID_PASSWORD with real credentials if available.
 */

// ─── URL Paths ───────────────────────────────────────────────────────────────
const PATHS = {
  /** Languages/home page — entry point of the app */
  LANGUAGES: '/languages',

  /** Sign-in page */
  SIGN_IN: '/signin',

  /** Sign-up / registration page */
  SIGN_UP: '/signup',
};

// ─── Test Credentials ────────────────────────────────────────────────────────
const CREDENTIALS = {
  /** A valid-looking email that exercises the happy-path submission */
  VALID_EMAIL: 'testuser@example.com',

  /** Placeholder password — replace with real value if credentials are provided */
  VALID_PASSWORD: 'TestPassword@123',

  /** Clearly malformed email — used to test client-side format validation */
  INVALID_EMAIL: 'not-an-email',

  /** Short password — used to test minimum-length validation */
  SHORT_PASSWORD: '123',
};

// ─── Expected UI Text ────────────────────────────────────────────────────────
// Strings we assert exist on the page; update if the app copy changes.
const EXPECTED_TEXT = {
  SIGN_IN_HEADING: 'Sign in',
  SIGN_UP_HEADING: 'Sign up',
  FORGOT_PASSWORD_LINK: 'Forget Password ?',
  SIGN_UP_LINK: 'Sign Up',
  GUEST_LINK: 'Continue as Guest',
  LOGIN_BUTTON: 'Login Now',
};

module.exports = { PATHS, CREDENTIALS, EXPECTED_TEXT };
