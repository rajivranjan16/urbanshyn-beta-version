---
name: test
description: Run backend (Maven) and frontend (npm) tests plus builds to verify the monorepo is healthy
---
# Run tests and verify the build

## Procedure
1. Read AGENTS.md for current versions and commands.
2. Backend: run `./mvnw.cmd clean verify` in /backend (Windows) or `./mvnw clean verify` (Unix). If JAVA_HOME is not set, export the local JDK 21 path first.
3. Backend tests use JUnit 5 + MockMvc; check `backend/src/test` for coverage of controllers and services.
4. Frontend: run `npm install` (if node_modules missing), `npm test`, and `npm run build` in /frontend.
5. Optionally smoke-test the backend with `./mvnw.cmd spring-boot:run` and `GET http://localhost:8080/api/hello`.

## Specifications
- `mvn clean verify` exits 0 with all tests passing
- `npm test` and `npm run build` exit 0
- No source files are modified by the verification run

## Forbidden
- Do not commit build artifacts or target/ output
- Do not change dependency versions just to make tests pass
- Do not push to main directly
