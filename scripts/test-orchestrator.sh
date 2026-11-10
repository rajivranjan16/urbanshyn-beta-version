#!/usr/bin/env bash
# Centralized Test Orchestrator — runs backend + frontend suites sequentially,
# retries failures once, captures logs, and emits per-module JSON fragments
# under .test-reports/results/ for generate-report.js to aggregate.
set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# Environment (see AGENTS.md)
export JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-21.0.13.9-hotspot"
export PATH="/c/Program Files/nodejs:$PATH"

REPORT_DIR="$ROOT/.test-reports"
LOG_DIR="$REPORT_DIR/logs"
RESULTS_DIR="$REPORT_DIR/results"
mkdir -p "$LOG_DIR" "$RESULTS_DIR"

MAX_ATTEMPTS=2 # initial run + 1 retry

now() { date +%s; }

# run_suite <name> <workdir> <cmd...>
# Writes JSON fragment to $RESULTS_DIR/<name>.json. Returns 0 always; status is in the fragment.
run_suite() {
  local name="$1" workdir="$2"; shift 2
  local log="$LOG_DIR/$name.log"
  local fragment="$RESULTS_DIR/$name.json"
  local attempt=1 status="fail" rc=1 total_dur=0 attempt_dur

  : > "$log"
  while [ "$attempt" -le "$MAX_ATTEMPTS" ]; do
    echo "=== $name attempt $attempt ===" >> "$log"
    local start; start=$(now)
    (cd "$workdir" && "$@") >> "$log" 2>&1
    rc=$?
    attempt_dur=$(( $(now) - start ))
    total_dur=$(( total_dur + attempt_dur ))
    echo "=== exit code: $rc (${attempt_dur}s) ===" >> "$log"
    if [ "$rc" -eq 0 ]; then status="pass"; break; fi
    attempt=$((attempt + 1))
  done

  cat > "$fragment" <<EOF
{"name":"$name","status":"$status","attempts":$((attempt > MAX_ATTEMPTS ? MAX_ATTEMPTS : attempt)),"exitCode":$rc,"durationSeconds":$total_dur,"log":"logs/$name.log"}
EOF
  echo "[$name] $status (${total_dur}s, $(grep -c '=== .* attempt' "$log" || true) attempt(s))"
}

# ---- Backend tier ----
run_suite "backend" "$ROOT/backend" ./mvnw.cmd clean verify

# Parse surefire totals into the backend fragment
node - "$RESULTS_DIR/backend.json" "$ROOT/backend/target/surefire-reports" <<'EOF'
const fs = require('fs');
const [fragPath, reportsDir] = process.argv.slice(2);
const frag = JSON.parse(fs.readFileSync(fragPath, 'utf8'));
const totals = { total: 0, passed: 0, failed: 0, skipped: 0 };
if (fs.existsSync(reportsDir)) {
  for (const f of fs.readdirSync(reportsDir).filter(f => f.endsWith('.txt'))) {
    const m = fs.readFileSync(`${reportsDir}/${f}`, 'utf8')
      .match(/Tests run: (\d+), Failures: (\d+), Errors: (\d+), Skipped: (\d+)/);
    if (m) {
      const t = +m[1], fl = +m[2], e = +m[3], s = +m[4];
      totals.total += t; totals.failed += fl + e; totals.skipped += s;
      totals.passed += t - fl - e - s;
    }
  }
}
frag.tests = totals;
fs.writeFileSync(fragPath, JSON.stringify(frag));
EOF

# ---- Frontend tier: tests ----
VITEST_JSON="$REPORT_DIR/vitest-results.json"
run_suite "frontend-tests" "$ROOT/frontend" npm test -- --reporter=default --reporter=json --outputFile.json="$VITEST_JSON"

# Merge vitest metrics into the frontend-tests fragment
node - "$RESULTS_DIR/frontend-tests.json" "$VITEST_JSON" <<'EOF'
const fs = require('fs');
const [fragPath, jsonPath] = process.argv.slice(2);
const frag = JSON.parse(fs.readFileSync(fragPath, 'utf8'));
try {
  const v = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  frag.tests = {
    total: v.numTotalTests ?? 0,
    passed: v.numPassedTests ?? 0,
    failed: v.numFailedTests ?? 0,
    skipped: (v.numPendingTests ?? 0) + (v.numTodoTests ?? 0),
  };
} catch { frag.tests = { total: 0, passed: 0, failed: 0, skipped: 0 }; }
fs.writeFileSync(fragPath, JSON.stringify(frag));
EOF

# ---- Frontend tier: production build ----
run_suite "frontend-build" "$ROOT/frontend" npm run build

# ---- Aggregate reports ----
node "$ROOT/scripts/generate-report.js" "$REPORT_DIR"

echo "Reports written to $REPORT_DIR/summary-report.{json,html}"
