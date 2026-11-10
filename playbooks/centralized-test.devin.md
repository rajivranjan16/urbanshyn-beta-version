# Centralized Test Orchestrator

## Overview
Run all backend and frontend test suites sequentially via a single orchestrator script, retry failures once, and produce a unified HTML + JSON summary report under `.test-reports/`.

## Procedure
1. Read AGENTS.md for environment requirements. The orchestrator exports them itself:
   - `JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-21.0.13.9-hotspot"`
   - `PATH` includes `/c/Program Files/nodejs`
2. Run `scripts/test-orchestrator.sh` from the repo root (Git Bash).
3. The script executes each suite in order, capturing exit codes and logs:
   - **Backend tier:** `./mvnw.cmd clean verify` in `/backend` (JUnit 5 + MockMvc; results parsed from `target/surefire-reports/*.txt`)
   - **Frontend tier:** `npm test` (Vitest, JSON reporter output for metrics) and `npm run build` in `/frontend`
4. Any failing suite is retried once; per-attempt logs are appended to `.test-reports/logs/<suite>.log`.
5. Reports are aggregated into `.test-reports/summary-report.json` and `.test-reports/summary-report.html` with per-module status, attempts, duration, and test totals (Total/Passed/Failed/Skipped).

## Specifications
- Every suite exits 0, or the report shows status `fail` with logs to inspect
- `.test-reports/summary-report.json` contains overall metrics and a per-module breakdown
- `.test-reports/summary-report.html` renders the same data as a table
- No source files are modified by the run

## Advice
- To add a new suite, add a `run_suite` call in `scripts/test-orchestrator.sh` and, if it has parseable test counts, extend the Node merge step
- `.test-reports/` is gitignored — reports are local artifacts, not committed
- Vitest runs with `--reporter=default --reporter=json --outputFile.json=...` so console logs and machine-readable metrics are both captured

## Forbidden
- Do not commit `.test-reports/` output, `target/`, or `dist/`
- Do not change dependency versions to make suites pass
- Do not push to main directly

## Required from user
- Nothing; runs standalone from the repo root
