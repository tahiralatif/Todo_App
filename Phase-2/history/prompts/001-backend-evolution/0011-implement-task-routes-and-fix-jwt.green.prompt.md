---
id: "0011"
title: "Implement task routes and fix JWT"
stage: "green"
date: "2026-01-10"
surface: "agent"
model: "sonnet-4-5-20250929"
feature: "001-backend-evolution"
branch: "001-backend-evolution"
user: "User"
command: "sp.implement"
labels: ["phase-2","routes","tasks","jwt","bugfix"]
links:
  spec: "specs/001-backend-evolution/spec.md"
  ticket: null
  adr: null
  pr: null
files:
  - "backend/src/routes/tasks.py"
  - "backend/src/main.py"
  - "backend/src/middleware/auth.py"
  - "specs/001-backend-evolution/tasks.md"
tests: []
---

## Prompt

Implement T016 and T017:
- T016: Task GET endpoints (list tasks, get single task)
- T017: Task POST endpoint (create task)

## Response snapshot

Implemented T016 and T017:
- Created `backend/src/routes/tasks.py` with:
  - GET /api/tasks - List all tasks for authenticated user (requires JWT)
  - GET /api/tasks/{task_id} - Get single task with ownership check (403/404)
  - POST /api/tasks - Create task with user_id from JWT sub claim
- Updated `backend/src/main.py` to register tasks router
- Updated tasks.md to mark T016, T017, T018 as [X] completed

Bug fix in `backend/src/middleware/auth.py`:
- Fixed JWT signature comparison: was comparing base64-encoded expected_sig with raw decoded provided_sig
- Changed `expected_sig = base64.urlsafe_b64encode(mac.digest())` to `expected_sig = mac.digest()` (raw bytes)
- Now signatures match correctly

Test results:
- GET /api/tasks → `[]` (empty list for new user)
- POST /api/tasks → `{"id":1,"user_id":"user123","title":"Test task"...}`
- GET /api/tasks/1 → `{"id":1,...}`
- All endpoints require JWT authentication

## Outcome

- ✅ Impact: User Story 1 fully implemented - create, read tasks with auth
- 🧪 Tests: None (tests added in Phase 6)
- 📁 Files: Created tasks routes, updated main.py, fixed auth middleware
- 🔁 Next prompts: Phase 6 (testing), User Story 2 (updates/completion)
- 🧠 Reflection: JWT signature verification bug found during testing and fixed

## Evaluation notes (flywheel)

- Failure modes observed: JWT signature mismatch due to encoding comparison
- Graders run and results (PASS/FAIL): Manual testing all endpoints pass
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
