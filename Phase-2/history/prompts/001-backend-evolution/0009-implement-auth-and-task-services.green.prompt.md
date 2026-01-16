---
id: "0009"
title: "Implement auth and task services"
stage: "green"
date: "2026-01-10"
surface: "agent"
model: "sonnet-4-5-20250929"
feature: "001-backend-evolution"
branch: "001-backend-evolution"
user: "User"
command: "sp.implement"
labels: ["phase-2","services","auth","tasks"]
links:
  spec: "specs/001-backend-evolution/spec.md"
  ticket: null
  adr: null
  pr: null
files:
  - "backend/src/services/auth_service.py"
  - "backend/src/services/task_service.py"
  - "specs/001-backend-evolution/tasks.md"
tests: []
---

## Prompt

- [ ] T013 [US1] Implement auth service: Create `backend/src/services/auth_service.py` with `verify_jwt_token(token) → user_id` method (extracts sub claim, verifies signature/expiry), `get_or_create_user(session, user_id, email) → User` method (lazy creation pattern)
- [ ] T014 [US1] Implement task service: Create `backend/src/services/task_service.py` with `create_task(session, user_id, title, description) → Task` (validates title, creates task linked to user_id), `get_user_tasks(session, user_id) → List[Task]` (scoped query by user_id, no filtering/sorting per MVP)

## Response snapshot

Implemented T013 and T014:
- Created `backend/src/services/auth_service.py` with:
  - `verify_jwt_token(token)`: Reuses middleware JWT verification, returns user_id from sub claim
  - `get_or_create_user(session, user_id, email)`: Lazy user creation pattern - checks if user exists, creates if not
- Created `backend/src/services/task_service.py` with:
  - `create_task(session, user_id, title, description)`: Creates task linked to user_id
  - `get_user_tasks(session, user_id)`: Returns all tasks scoped to user_id (no filtering per MVP)
  - `get_task(session, task_id, user_id)`: Single task fetch with ownership check
  - `update_task()` and `delete_task()`: Bonus helper methods for later phases
- Updated tasks.md to mark T013 and T014 as [X] completed

## Outcome

- ✅ Impact: Service layer implemented with business logic and user isolation for US1
- 🧪 Tests: None (tests added in Phase 6)
- 📁 Files: Created 2 service files, updated tasks.md
- 🔁 Next prompts: T015 (auth routes), T016 (task GET endpoints), T017 (task POST endpoint), T018 (register routes)
- 🧠 Reflection: Services follow lazy creation pattern per data-model.md spec; user isolation enforced at query level

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
