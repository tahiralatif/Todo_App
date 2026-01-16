---
id: 0007
title: implement phase 2 foundation tasks
stage: misc
date: 2026-01-10
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-backend-evolution
branch: none
user: User
command: /sp.implement
labels: ["backend","foundation","auth","db"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/src/config.py
  - backend/src/db.py
  - backend/src/middleware/auth.py
  - backend/src/middleware/errors.py
  - backend/src/models/user.py
  - backend/src/models/task.py
  - backend/src/main.py
  - backend/pyproject.toml
  - backend/.flake8
  - .flake8
  - specs/001-backend-evolution/tasks.md
tests:
  - none
---

## Prompt

continue with T006–T010 and use my @.claude\skills
 and @.claude\agents\

## Response snapshot

- Implemented Phase 2 foundation tasks T006–T010:
  - config/settings loader (`backend/src/config.py`) + verified `.env.example`
  - HS256 JWT verification dependency (`backend/src/middleware/auth.py`) using `BETTER_AUTH_SECRET` and extracting `sub`
  - Standardized error handlers (`backend/src/middleware/errors.py`) mapping status codes to spec error codes
  - SQLModel User model (`backend/src/models/user.py`)
  - SQLModel Task model (`backend/src/models/task.py`) replacing Phase-1 dataclass
- Wired database initialization into FastAPI startup (`backend/src/main.py`) by calling `init_db()` and importing models to register SQLModel metadata.
- Updated lint/type tool excludes to stop excluding the new Task SQLModel model.
- Marked T006–T010 as complete in `specs/001-backend-evolution/tasks.md`.

## Outcome

- ✅ Impact: Phase 2 foundation is complete: async DB, config, auth verification, error handling, and SQLModel entities are in place.
- 🧪 Tests: Not run yet (testing tasks are in later phases).
- 📁 Files: Created middleware + models; updated app startup and config/tooling.
- 🔁 Next prompts: Proceed to Phase 3 (US1) schemas/services/routes and register routers in main.py.
- 🧠 Reflection: Main.py should only have a single `if __name__ == '__main__'` block (currently duplicated). Clean up before running the server.

## Evaluation notes (flywheel)

- Failure modes observed: None.
- Graders run and results (PASS/FAIL): Not run.
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): Remove duplicated blocks in main.py, then run uv sync and a smoke-start of uvicorn.