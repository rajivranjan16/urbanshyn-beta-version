---
name: centralized-test
description: Run backend and frontend test suites sequentially with one retry, capture logs, and generate unified HTML/JSON summary reports under .test-reports/
---
# Centralized Test Orchestrator

## Procedure
1. Read AGENTS.md for environment requirements (the script exports JAVA_HOME and Node PATH itself).
2. Run `scripts/test-orchestrator.sh` from the repo root in Git Bash.
3. Suites run in order: backend `./mvnw.cmd clean verify`, frontend `npm test` (Vitest with JSON reporter), frontend `npm run build`.
4. Failing suites are retried once; logs land in `.test-reports/logs/<suite>.log`.
5. Results aggregate into `.test-reports/summary-report.json` and `.test-reports/summary-report.html` (per-module status, attempts, duration, Total/Passed/Failed/Skipped).

## Specifications
- All suites pass, or the report marks failures with linked logs
- Reports contain overall metrics and a per-module breakdown
- No source files modified

## Forbidden
- Do not commit `.test-reports/`, `target/`, or `dist/` output
- Do not change dependency versions to make suites pass
- Do not push to main directly
