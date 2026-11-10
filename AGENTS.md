# UrbanShyn

Monorepo with a Spring Boot backend (`/backend`) and a React + Vite frontend (`/frontend`).

## Prerequisites

- Java 21 (Temurin at `C:\Program Files\Eclipse Adoptium\jdk-21.0.13.9-hotspot`)
- Node.js + npm (at `C:\Program Files\nodejs`)
- Maven is NOT installed globally — use the Maven Wrapper (`mvnw.cmd` / `./mvnw`) in `/backend` for all Maven commands.
- In Git Bash, neither JAVA_HOME nor the Node dir is on PATH. Export before building:
  `export JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-21.0.13.9-hotspot"`
  `export PATH="/c/Program Files/nodejs:$PATH"`

## Backend (`/backend`)

Spring Boot 3.3.x, Java 21, Maven (wrapper included).

- Build + run tests: `cd backend && ./mvnw.cmd clean verify` (Windows) or `./mvnw clean verify` (Unix)
- Run the app: `cd backend && ./mvnw.cmd spring-boot:run` — serves on `http://localhost:8080`
- Useful endpoints: `GET /api/hello` → `{"message":"Hello from backend"}`

## Frontend (`/frontend`)

React 19 + TypeScript + Vite, Vitest + Testing Library for tests.

- Install deps: `cd frontend && npm install`
- Run tests: `cd frontend && npm test`
- Build: `cd frontend && npm run build`
- Dev server: `cd frontend && npm run dev` — `http://localhost:5173`, `/api` is proxied to `http://localhost:8080`

## Conventions

- Backend code lives in `com.urbanshyn.backend`; controllers return DTOs/`Map`, tests use JUnit 5 + MockMvc.
- Frontend tests live next to components as `*.test.tsx`; run `npm test` before committing.
- Never commit `.env` files or secrets.
