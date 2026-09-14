/**
 * src/lighthouse/scanner.js
 *
 * CLI entry point for the Lighthouse Performance Monitoring Tool.
 *
 * Usage:
 *   node src/lighthouse/scanner.js <url>
 *   node src/lighthouse/scanner.js https://example.com
 *   npm run lighthouse -- https://example.com
 *
 * What it does:
 *  1. Validates the supplied URL.
 *  2. Launches a headless Chrome instance via chrome-launcher.
 *  3. Runs Lighthouse across all 4 categories: Performance, Accessibility,
 *     Best Practices, SEO.
 *  4. Saves the full HTML report to ./reports/<domain>-<timestamp>.html
 *  5. Saves the raw JSON results to ./reports/<domain>-<timestamp>.json
 *  6. Passes the results to report-summarizer.js which prints a human-readable
 *     summary with colour-coded scores and fix recommendations to the console.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { launch } = require('chrome-launcher');
const { default: lighthouse } = require('lighthouse');
const { summarize } = require('./report-summarizer');

// ─── Help Text ────────────────────────────────────────────────────────────────
const HELP_TEXT = `
Lighthouse Performance Monitoring Tool
────────────────────────────────────────────────────────────────
Usage:
  node src/lighthouse/scanner.js <url>
  npm run lighthouse -- <url>

Examples:
  node src/lighthouse/scanner.js https://example.com
  npm run lighthouse -- https://horizon-plus.dfp8hwwhcxnpq.amplifyapp.com

Output:
  - Console: colour-coded score summary + fix recommendations
  - File:    reports/<domain>-<timestamp>.html  (full Lighthouse report)
  - File:    reports/<domain>-<timestamp>.json  (raw results)
────────────────────────────────────────────────────────────────
`;

// ─── Argument Parsing ─────────────────────────────────────────────────────────

const args = process.argv.slice(2);

// Show help if requested or no argument provided
if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.log(HELP_TEXT);
  process.exit(0);
}

const inputUrl = args[0];

// ─── URL Validation ───────────────────────────────────────────────────────────

/**
 * Validates that the input string is a proper http/https URL.
 * @param {string} url
 * @returns {URL} Parsed URL object
 * @throws {Error} If the URL is invalid or uses a non-http(s) protocol
 */
function validateUrl(url) {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error(`Protocol must be http or https, got: ${parsed.protocol}`);
    }
    return parsed;
  } catch (err) {
    console.error(`\n❌  Invalid URL: "${url}"`);
    console.error(`    ${err.message}`);
    console.error(`    Run with --help for usage information.\n`);
    process.exit(1);
  }
}

// ─── Report Directory Setup ───────────────────────────────────────────────────

/**
 * Ensures the ./reports directory exists.
 * @returns {string} Absolute path to the reports directory.
 */
function ensureReportsDir() {
  const reportsDir = path.resolve(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  return reportsDir;
}

/**
 * Builds a filesystem-safe base name for report files.
 * Example: "example.com-2026-09-11T22-30-00"
 * @param {URL} parsedUrl
 */
function buildReportBaseName(parsedUrl) {
  const domain = parsedUrl.hostname.replace(/\./g, '_');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  return `${domain}-${timestamp}`;
}

// ─── Lighthouse Runner ────────────────────────────────────────────────────────

/**
 * Launches headless Chrome, runs Lighthouse on the given URL,
 * saves reports to disk, and prints a console summary.
 *
 * @param {string} url - The URL to scan.
 */
async function runScan(url) {
  const parsedUrl = validateUrl(url);
  const reportsDir = ensureReportsDir();
  const baseName = buildReportBaseName(parsedUrl);
  const chromeProfileDir = fs.mkdtempSync(path.join(reportsDir, '.chrome-profile-'));

  console.log(`\n🔍  Starting Lighthouse scan for: ${url}`);
  console.log(`    Please wait — this may take 30–60 seconds...\n`);

  // Launch a headless Chrome instance
  // chrome-launcher handles finding the Chrome binary automatically
  const chrome = await launch({
    userDataDir: chromeProfileDir,
    chromeFlags: [
      '--headless',          // No visible window
      '--no-sandbox',        // Required in some CI / container environments
      '--disable-gpu',       // Reduces resource usage in headless mode
    ],
  });

  try {
    // Lighthouse configuration
    const options = {
      logLevel: 'silent',        // Suppress Lighthouse's own verbose logs
      output: ['html', 'json'],  // We need both formats
      port: chrome.port,

      // Run all 4 categories for maximum insight
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    };

    // Run the scan — lhr = Lighthouse Result object
    const runnerResult = await lighthouse(url, options);
    const { lhr, report } = runnerResult;

    // report is an array because we requested 2 output formats: [html, json]
    const [htmlReport, jsonReport] = Array.isArray(report) ? report : [report, null];

    // ── Save HTML Report ───────────────────────────────────────
    const htmlPath = path.join(reportsDir, `${baseName}.html`);
    fs.writeFileSync(htmlPath, htmlReport, 'utf8');

    // ── Save JSON Report ───────────────────────────────────────
    const jsonPath = path.join(reportsDir, `${baseName}.json`);
    if (jsonReport) {
      fs.writeFileSync(jsonPath, jsonReport, 'utf8');
    } else {
      // Fallback: serialise the lhr object directly
      fs.writeFileSync(jsonPath, JSON.stringify(lhr, null, 2), 'utf8');
    }

    // ── Print Summary ──────────────────────────────────────────
    const summary = summarize(lhr, url);

    // Append file paths at the end of the console output
    console.log(`\n  📄 Full HTML report : ${htmlPath}`);
    console.log(`  📄 Raw JSON results : ${jsonPath}`);
    console.log('');

    return summary;
  } finally {
    // Always shut down Chrome, even if Lighthouse threw an error
    await chrome.kill();
    try {
      fs.rmSync(chromeProfileDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.warn(`    Warning: could not remove temporary Chrome profile: ${cleanupError.message}`);
    }
  }
}

// ─── Entry Point ──────────────────────────────────────────────────────────────

runScan(inputUrl).catch((err) => {
  console.error(`\n❌  Scan failed: ${err.message}\n`);
  process.exit(1);
});
