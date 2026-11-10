// Aggregates .test-reports/results/*.json fragments into summary-report.json and summary-report.html
const fs = require('fs');
const path = require('path');

const reportDir = process.argv[2];
const resultsDir = path.join(reportDir, 'results');

const modules = fs.readdirSync(resultsDir)
  .filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(fs.readFileSync(path.join(resultsDir, f), 'utf8')));

const totals = { total: 0, passed: 0, failed: 0, skipped: 0 };
for (const m of modules) {
  if (m.tests) {
    totals.total += m.tests.total;
    totals.passed += m.tests.passed;
    totals.failed += m.tests.failed;
    totals.skipped += m.tests.skipped;
  }
}
const allPassed = modules.every(m => m.status === 'pass') && totals.failed === 0;

const summary = {
  generatedAt: new Date().toISOString(),
  overall: {
    status: allPassed ? 'pass' : 'fail',
    totalTests: totals.total,
    passed: totals.passed,
    failed: totals.failed,
    skipped: totals.skipped,
    modules: modules.length,
    durationSeconds: modules.reduce((a, m) => a + (m.durationSeconds || 0), 0),
  },
  modules,
};

fs.writeFileSync(path.join(reportDir, 'summary-report.json'), JSON.stringify(summary, null, 2));

const rows = modules.map(m => `
  <tr class="${m.status === 'pass' ? 'pass' : 'fail'}">
    <td>${m.name}</td>
    <td>${m.status.toUpperCase()}</td>
    <td>${m.attempts}</td>
    <td>${m.durationSeconds ?? '-'}</td>
    <td>${m.tests ? m.tests.total : '-'}</td>
    <td>${m.tests ? m.tests.passed : '-'}</td>
    <td>${m.tests ? m.tests.failed : '-'}</td>
    <td>${m.tests ? m.tests.skipped : '-'}</td>
    <td><a href="${m.log}">log</a></td>
  </tr>`).join('');

const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Test Summary Report</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 2rem; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
  th { background: #f0f0f0; }
  tr.pass td:first-child { border-left: 4px solid #2e7d32; }
  tr.fail td:first-child { border-left: 4px solid #c62828; }
  .banner { padding: 10px 14px; border-radius: 6px; font-weight: 600; margin-bottom: 1rem; }
  .pass-banner { background: #e8f5e9; color: #2e7d32; }
  .fail-banner { background: #ffebee; color: #c62828; }
</style></head><body>
<h1>Centralized Test Orchestrator — Summary Report</h1>
<p>Generated: ${summary.generatedAt}</p>
<div class="banner ${allPassed ? 'pass-banner' : 'fail-banner'}">
  ${allPassed ? 'ALL SUITES PASSED' : 'FAILURES DETECTED'} —
  Total: ${totals.total} | Passed: ${totals.passed} | Failed: ${totals.failed} | Skipped: ${totals.skipped}
  | Modules: ${modules.length} | Duration: ${summary.overall.durationSeconds}s
</div>
<table>
  <tr><th>Module</th><th>Status</th><th>Attempts</th><th>Duration (s)</th>
      <th>Total</th><th>Passed</th><th>Failed</th><th>Skipped</th><th>Log</th></tr>
  ${rows}
</table>
</body></html>`;

fs.writeFileSync(path.join(reportDir, 'summary-report.html'), html);
console.log(`Overall: ${summary.overall.status.toUpperCase()} — ${totals.passed}/${totals.total} tests passed in ${summary.overall.durationSeconds}s`);
