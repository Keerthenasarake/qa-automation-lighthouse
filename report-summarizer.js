/**
 * src/lighthouse/report-summarizer.js
 *
 * Takes a Lighthouse result object (parsed JSON) and produces:
 *  1. A colour-coded score summary table printed to the console.
 *  2. A list of failed/warning audits grouped by category, each with
 *     the audit title, current value, and a specific fix recommendation.
 *  3. A structured summary object returned to the caller.
 *
 * Colour thresholds follow the official Lighthouse 3-tier system:
 *   🟢 GOOD    — score 90–100
 *   🟡 NEEDS IMPROVEMENT — score 50–89
 *   🔴 POOR    — score 0–49
 */

'use strict';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns an emoji + label for a given numeric score (0–1 scale from Lighthouse).
 * @param {number} score - Score between 0 and 1 (Lighthouse uses 0–1 scale).
 * @returns {{ emoji: string, label: string, score100: number }}
 */
function classifyScore(score) {
  const score100 = Math.round((score ?? 0) * 100);
  if (score100 >= 90) return { emoji: '🟢', label: 'GOOD', score100 };
  if (score100 >= 50) return { emoji: '🟡', label: 'NEEDS IMPROVEMENT', score100 };
  return { emoji: '🔴', label: 'POOR', score100 };
}

/**
 * Pads a string to a fixed width with spaces (left-aligned).
 * @param {string} str
 * @param {number} width
 */
function pad(str, width) {
  return String(str).padEnd(width, ' ');
}

// ─── Main Export ──────────────────────────────────────────────────────────────

/**
 * Summarises a Lighthouse result and prints it to the console.
 *
 * @param {object} lhr  - Full Lighthouse result object (lhr.categories, lhr.audits).
 * @param {string} url  - The URL that was scanned (for display purposes).
 * @returns {object}    - Structured summary: { url, scannedAt, categories, recommendations }
 */
function summarize(lhr, url) {
  const scannedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const divider = '═'.repeat(62);
  const thinLine = '─'.repeat(62);

  // ── Header ──────────────────────────────────────────────────
  console.log(`\n${divider}`);
  console.log(`  LIGHTHOUSE REPORT`);
  console.log(`  URL     : ${url}`);
  console.log(`  Scanned : ${scannedAt}`);
  console.log(`${divider}\n`);

  // ── Score Summary Table ──────────────────────────────────────
  console.log(`  ${'Category'.padEnd(22)} ${'Score'.padStart(5)}  Status`);
  console.log(`  ${thinLine}`);

  const categorySummaries = [];

  for (const [, category] of Object.entries(lhr.categories)) {
    const { emoji, label, score100 } = classifyScore(category.score);
    console.log(`  ${pad(category.title, 22)} ${String(score100).padStart(5)}  ${emoji} ${label}`);
    categorySummaries.push({
      id: category.id,
      title: category.title,
      score: score100,
      label,
    });
  }

  // ── Fix Recommendations ───────────────────────────────────────
  console.log(`\n${divider}`);
  console.log(`  FIX RECOMMENDATIONS  (failed & warning audits only)`);
  console.log(`${divider}\n`);

  const recommendations = [];

  for (const [, category] of Object.entries(lhr.categories)) {
    // Collect audit refs for this category that scored below 1.0 (not passing)
    const failedAuditRefs = (category.auditRefs || []).filter((ref) => {
      const audit = lhr.audits[ref.id];
      // Only include audits that have a numeric score and are not passing
      return audit && audit.score !== null && audit.score < 1;
    });

    if (failedAuditRefs.length === 0) continue;

    console.log(`  ▸ ${category.title.toUpperCase()}`);

    for (const ref of failedAuditRefs) {
      const audit = lhr.audits[ref.id];
      const { emoji } = classifyScore(audit.score);
      const score100 = Math.round((audit.score ?? 0) * 100);

      // Build a human-readable display value (time, bytes, count, etc.)
      let displayValue = audit.displayValue || `score: ${score100}`;

      console.log(`\n    ${emoji} [${score100}] ${audit.title}`);
      console.log(`       Current : ${displayValue}`);

      // Lighthouse provides a description that includes the fix rationale.
      // We truncate to the first sentence for brevity, then show a short hint.
      const descriptionFull = (audit.description || '').replace(/\[Learn.*?\]\(.*?\)/g, '').trim();
      const shortDesc = descriptionFull.split('.')[0] + '.';
      console.log(`       Fix     : ${shortDesc}`);

      recommendations.push({
        category: category.title,
        auditId: ref.id,
        title: audit.title,
        score: score100,
        currentValue: displayValue,
        recommendation: shortDesc,
      });
    }

    console.log('');
  }

  if (recommendations.length === 0) {
    console.log('  ✅  All audits passed! No recommendations at this time.\n');
  }

  console.log(divider);

  // ── Return structured summary for programmatic use ────────────
  return {
    url,
    scannedAt,
    categories: categorySummaries,
    recommendations,
  };
}

module.exports = { summarize };
