# QA Automation Suite

A focused QA automation project with two deliverables:

1. **Lighthouse Performance Monitoring Tool** — a CLI tool that scans any URL, generates a full Lighthouse report, and prints a colour-coded summary with specific fix recommendations.
2. **Playwright Login Automation** — an automated test suite covering the complete login use case for the [Horizon+ web application](https://horizon-plus.dfp8hwwhcxnpq.amplifyapp.com).

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features Implemented](#features-implemented)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Libraries & Frameworks](#libraries--frameworks)
- [Setup Instructions](#setup-instructions)
- [Running the Lighthouse Tool](#running-the-lighthouse-tool)
- [Running the Login Tests](#running-the-login-tests)
- [Project Structure](#project-structure)
- [Sample Output](#sample-output)

---

## Project Overview

This project was built as part of a QA engineering evaluation. It demonstrates:

- **Automation skills** — programmatic Lighthouse scanning with structured output.
- **Test design** — well-defined, independent test cases with clear pass/fail criteria.
- **Code quality** — documented, modular code that is easy to extend.
- **Engineering approach** — purposeful tool selection and a clean, minimal architecture.

---

## Features Implemented

### Lighthouse Performance Monitoring Tool
- Accepts **any URL** as a CLI argument.
- Runs Google Lighthouse across **4 audit categories**: Performance, Accessibility, Best Practices, SEO.
- Saves a **full interactive HTML report** to `./reports/`.
- Saves **raw JSON results** to `./reports/` for programmatic use.
- Prints a **colour-coded console summary**:
  - 🟢 GOOD (90–100)  🟡 NEEDS IMPROVEMENT (50–89)  🔴 POOR (0–49)
- Lists **every failed/warning audit** with its current value and a specific fix recommendation.

### Login Automation (Playwright)
7 test cases covering the full login flow:

| Test ID | Scenario | Type |
|---------|----------|------|
| TC-01 | Navigate from `/languages` → click "Log In" → redirects to `/signin` | Navigation |
| TC-02 | All required UI elements are visible on the sign-in page | UI Validation |
| TC-03 | Submitting empty form shows validation error | Negative |
| TC-04 | Submitting with invalid email format shows error | Negative |
| TC-05 | Valid-format credentials trigger a login attempt | Positive |
| TC-06 | "Continue as Guest" link navigates away from sign-in | Navigation |
| TC-07 | "Sign Up" link navigates to `/signup` with all required fields | Navigation |

---

## Technology Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Runtime | Node.js (≥18) | Native ESM support, async/await, wide ecosystem |
| Test Framework | Playwright | Modern, fast, auto-waits, built-in assertions |
| Performance Scanner | Lighthouse (npm) | Official Google tool, programmatic API, structured JSON output |
| Browser Control | chrome-launcher | Works with any installed Chrome; no separate ChromeDriver needed |
| Package Manager | npm | Standard; no extra setup needed |

---

## Architecture

```
qa-automation-suite/
│
├── src/
│   └── lighthouse/
│       ├── scanner.js              ← CLI entry point; orchestrates the scan
│       └── report-summarizer.js    ← Parses LHR JSON → console summary + recommendations
│
├── tests/
│   ├── fixtures/
│   │   └── test-data.js            ← All test constants (URLs, credentials, expected text)
│   └── login.spec.js               ← 7 Playwright test cases for login flow
│
├── reports/                        ← Auto-created; stores .html and .json scan outputs
│
├── playwright.config.js            ← Playwright: base URL, browser, timeout, reporters
├── package.json                    ← Scripts, dependencies, project metadata
├── .gitignore
└── README.md
```

**Design principles:**
- **Single responsibility** — each file does exactly one thing.
- **Flat & readable** — no nested abstractions or monorepo overhead.
- **Centralised test data** — all selectors and strings live in `test-data.js`; change one file, update all tests.

---

## Libraries & Frameworks

| Package | Version | Purpose |
|---------|---------|---------|
| `@playwright/test` | ^1.47.0 | Test runner, assertions, browser control |
| `lighthouse` | ^12.0.0 | Programmatic Lighthouse audits |
| `chrome-launcher` | ^1.1.2 | Launch/manage headless Chrome instances |

---

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) **v18 or higher** — verify with `node --version`
- [Google Chrome](https://www.google.com/chrome/) — required by chrome-launcher and Playwright
- Internet access — tests hit a live external app; the Lighthouse scanner requires network access to the target URL

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd qa-automation-suite
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Playwright Browsers

```bash
npx playwright install chromium
```

That's it. No additional configuration needed.

---

## Running the Lighthouse Tool

```bash
# Scan any URL
node src/lighthouse/scanner.js https://example.com

# Shorthand via npm script
npm run lighthouse -- https://example.com

# Scan the Horizon+ app specifically
npm run lighthouse -- https://horizon-plus.dfp8hwwhcxnpq.amplifyapp.com/languages

# Show help / usage
npm run lighthouse:help
```

**Reports are saved to:**
```
reports/<domain>-<timestamp>.html   ← Open in browser for the full interactive report
reports/<domain>-<timestamp>.json   ← Raw Lighthouse result for programmatic use
```

---

## Running the Login Tests

```bash
# Run all login tests (headless by default)
npm test

# Run only login tests
npm run test:login

# Run in headed mode (see the browser)
npx playwright test --headed

# Run a specific test case by name
npx playwright test --grep "TC-01"

# Open the HTML test report after a run
npm run test:report
```

---

## Project Structure

```
src/lighthouse/scanner.js
```
- Parses and validates the CLI argument.
- Launches Chrome headless via `chrome-launcher`.
- Calls Lighthouse with all 4 audit categories.
- Saves HTML + JSON reports to `./reports/`.
- Passes the Lighthouse result object to `report-summarizer.js`.

```
src/lighthouse/report-summarizer.js
```
- Iterates `lhr.categories` to build the score table.
- Iterates `lhr.audits` to find failed/warning audits.
- Prints a structured, colour-coded summary to stdout.
- Returns a plain JavaScript object for programmatic consumers.

```
tests/fixtures/test-data.js
```
- Single source of truth for: URL paths, test credentials, expected UI strings.
- Import in any test file — no hardcoded strings in spec files.

```
tests/login.spec.js
```
- 7 independent Playwright tests.
- Each test navigates to the correct URL first (no shared state between tests).
- Uses `#id` selectors where available; `getByText` for elements without IDs.

```
playwright.config.js
```
- `baseURL`: Horizon+ app root.
- `screenshot: 'only-on-failure'`: captures evidence automatically.
- `trace: 'on-first-retry'`: enables step-by-step trace replay on flaky failures.

---

## Sample Output

### Lighthouse Console Summary

```
══════════════════════════════════════════════════════════════════
  LIGHTHOUSE REPORT
  URL     : https://example.com
  Scanned : 2026-09-11 22:30:00
══════════════════════════════════════════════════════════════════

  Category               Score  Status
  ──────────────────────────────────────────────────────────────
  Performance               72  🟡 NEEDS IMPROVEMENT
  Accessibility             91  🟢 GOOD
  Best Practices            95  🟢 GOOD
  SEO                       82  🟡 NEEDS IMPROVEMENT

══════════════════════════════════════════════════════════════════
  FIX RECOMMENDATIONS  (failed & warning audits only)
══════════════════════════════════════════════════════════════════

  ▸ PERFORMANCE

    🔴 [12] Eliminate render-blocking resources
       Current : Potential savings of 1,200 ms
       Fix     : Resources are blocking the first paint of your page.

    🟡 [55] Serve images in next-gen formats
       Current : Potential savings of 320 KiB
       Fix     : Image formats like WebP and AVIF often provide better compression.

  📄 Full HTML report : C:\...\reports\example_com-2026-09-11T22-30-00.html
  📄 Raw JSON results : C:\...\reports\example_com-2026-09-11T22-30-00.json
```

### Playwright Test Output

```
Running 7 tests using 1 worker

  ✓  TC-01: Clicking "Log In" from /languages navigates to /signin (3.2s)
  ✓  TC-02: Sign-in page renders all required UI elements (1.8s)
  ✓  TC-03: Submitting empty form shows validation error (2.1s)
  ✓  TC-04: Submitting with invalid email format shows error (2.3s)
  ✓  TC-05: Filling valid-format credentials and submitting triggers a login attempt (5.4s)
  ✓  TC-06: "Continue as Guest" link navigates away from the sign-in page (2.0s)
  ✓  TC-07: "Sign Up" link navigates to /signup page with all required fields (3.1s)

  7 passed (21.4s)
```
