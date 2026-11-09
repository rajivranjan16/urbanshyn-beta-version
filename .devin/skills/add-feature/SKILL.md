---
name: add-feature
description: Add one new feature end to end (Spring Boot backend + React frontend) with tests, then open a PR
---
# Add a feature end to end

## Procedure
1. Read AGENTS.md and an existing feature to copy its structure and naming.
2. Backend: create Entity, Repository, Service, Controller and DTOs. Add a DB migration if the schema changes.
3. Backend tests: JUnit 5 + Mockito for the service, MockMvc for the controller.
4. Run `mvn clean verify` in /backend and fix any failures.
5. Frontend: add the API client call, the component and the route or page.
6. Frontend tests: add at least one component test, then run `npm test` and `npm run build` in /frontend.
7. Update README.md if run or build steps changed.
8. Create a branch `feature/<short-name>`, commit with clear messages and open a PR with a short summary.

## Specifications
- Backend and frontend builds and tests pass
- No unrelated files changed
- PR description lists what was added and how to test it

## Forbidden
- Do not change existing public API contracts
- Do not commit secrets, .env files or credentials
- Do not push to main directly

## Required from user
- Feature name and a short description
- Fields or data involved
