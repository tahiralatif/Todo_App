# Tasks: Phase-2 Backend Evolution

**Input**: Design documents from `/specs/001-backend-evolution/`
**Prerequisites**: plan.md ✅, spec.md ✅, data-model.md ✅, contracts.md ✅, quickstart.md ✅

**Status**: Ready for implementation via Claude Code (spec-driven, AI-native)
**Estimated Scope**: 33 tasks across 6 phases
**MVP Strategy**: Complete Phase 1-2, then Phase 3 (US1) for minimum viable product

**Organization**: Tasks grouped by user story to enable independent implementation and testing of each story.

---

## Format: `[ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no immediate dependencies)
- **[Story]**: Which user story (US1, US2, US3) - omit for foundational work
- **File paths**: Absolute within backend/ directory structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure
**Estimated**: 4 tasks

- [x] T001 Create project structure per implementation plan: `backend/` with src/, tests/, pyproject.toml, .env.example
- [x] T002 [P] Initialize FastAPI project: Create `backend/src/main.py` entry point with FastAPI app initialization, CORS setup
- [x] T003 [P] Configure dependencies: Update `backend/pyproject.toml` with FastAPI, SQLModel, Pydantic, pytest, pytest-asyncio, python-multipart
- [x] T004 [P] Setup linting and formatting: Configure black, flake8, mypy in project root for code quality

**Checkpoint**: Basic project structure ready - all files in place, dependencies installable

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story work
**Critical**: All 6 tasks must complete before user stories begin
**Estimated**: 6 tasks

- [x] T005 Initialize database connection: Create `backend/src/db.py` with Neon PostgreSQL async connection, SQLModel engine setup, session factory using `create_async_engine` and `AsyncSession`
- [x] T006 [P] Configure environment variables: Create `backend/.env.example` with DATABASE_URL, BETTER_AUTH_SECRET, DEBUG; implement `backend/src/config.py` for settings management using Pydantic BaseSettings
- [x] T007 [P] Implement JWT verification middleware: Create `backend/src/middleware/auth.py` with JWT token extraction, signature verification using BETTER_AUTH_SECRET, expiry validation, user_id extraction from `sub` claim
- [x] T008 [P] Implement error handling middleware: Create `backend/src/middleware/errors.py` with standardized JSON error responses, HTTP status code mapping (401, 403, 404, 409, 422, 500), error code constants (AUTH_REQUIRED, INVALID_TOKEN, FORBIDDEN, VALIDATION_ERROR, CONFLICT, RESOURCE_NOT_FOUND, INTERNAL_ERROR)
- [x] T009 [P] Create User model: Implement `backend/src/models/user.py` with SQLModel User entity (id: str, email: str unique indexed, created_at: datetime)
- [x] T010 [P] Create Task model: Implement `backend/src/models/task.py` with SQLModel Task entity (id: int, user_id: str FK, title: str max 200, description: str max 1000 optional, completed: bool, created_at: datetime, updated_at: datetime, indexes on user_id and completed)

**Initialize tables**: Ensure `backend/src/main.py` calls `SQLModel.metadata.create_all(engine)` on startup

**Checkpoint**: Foundation ready - database schema, auth verification, error handling, models all in place. User story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Secure Task Management (Priority: P1) 🎯 MVP

**Goal**: Users can securely create and view their own tasks with multi-user isolation and authentication.

**Independent Test Criteria**:
1. Create authenticated user with valid JWT token
2. POST new task with title and description → verify task created with correct user_id
3. GET /api/tasks → verify returns only authenticated user's tasks (not other users' tasks)
4. Attempt to GET without token → verify 401 Unauthorized response
5. Attempt to GET another user's task ID → verify 403 Forbidden response

**Estimated**: 8 tasks

### Implementation for User Story 1

- [x] T011 [P] [US1] Create auth schemas: Implement `backend/src/schemas/auth.py` with Pydantic models SignupRequest (email, password), SigninRequest (email, password), SigninResponse (token, user), UserResponse (id, email, created_at)
- [x] T012 [P] [US1] Create task schemas: Implement `backend/src/schemas/task.py` with Pydantic models TaskCreate (title required 1-200, description optional 0-1000), TaskResponse (id, user_id, title, description, completed, created_at, updated_at)
- [x] T013 [US1] Implement auth service: Create `backend/src/services/auth_service.py` with `verify_jwt_token(token) → user_id` method (extracts sub claim, verifies signature/expiry), `get_or_create_user(session, user_id, email) → User` method (lazy creation pattern)
- [x] T014 [US1] Implement task service: Create `backend/src/services/task_service.py` with `create_task(session, user_id, title, description) → Task` (validates title, creates task linked to user_id), `get_user_tasks(session, user_id) → List[Task]` (scoped query by user_id, no filtering/sorting per MVP)
- [x] T015 [P] [US1] Implement auth routes: Create `backend/src/routes/auth.py` with POST /api/auth/signup endpoint (accepts email/password from frontend, handles user creation or 409 conflict), POST /api/auth/signin endpoint (verifies credentials with Better Auth, returns JWT token or 401 error)
- [x] T016 [P] [US1] Implement task GET endpoints: Create `backend/src/routes/tasks.py` with GET /api/tasks endpoint (requires JWT, calls get_user_tasks, returns user's tasks only), GET /api/tasks/{task_id} endpoint (requires JWT, verifies ownership via user_id, returns 403 if not owned by authenticated user, 404 if not found)
- [x] T017 [P] [US1] Implement task POST endpoint: In `backend/src/routes/tasks.py`, add POST /api/tasks endpoint (requires JWT, calls create_task with user_id from JWT sub claim, returns 201 with created task, validates title length, returns 422 on validation failure)
- [x] T018 [US1] Register routes in main app: Update `backend/src/main.py` to include_router(auth_router, prefix="/api/auth") and include_router(tasks_router, prefix="/api"), ensure middleware chain includes auth and error handling

**Checkpoint**: User Story 1 complete. Can verify independently: authenticate, create task, list tasks, verify isolation, test error cases (401 unauthorized, 403 forbidden).

---

## Phase 4: User Story 2 - Task Updates and Completion (Priority: P2)

**Goal**: Users can update their tasks and mark them complete to track progress.

**Independent Test Criteria**:
1. Update existing task title/description via PUT → verify updated_at timestamp changes
2. Toggle completion status via PATCH /api/tasks/{id}/complete → verify completed flag toggles
3. Attempt to update another user's task → verify 403 Forbidden
4. Attempt to update with invalid title (>200 chars) → verify 422 Validation Error
5. Verify last-write-wins: simultaneous updates to same task complete without error

**Estimated**: 7 tasks

### Implementation for User Story 2

- [x] T019 [P] [US2] Extend task schemas: Update `backend/src/schemas/task.py` to add TaskUpdate model (all fields optional: title, description, completed), TaskComplete model (completed: bool)
- [x] T020 [US2] Extend task service: Update `backend/src/services/task_service.py` with `update_task(session, task_id, user_id, updates) → Task` (validates ownership, updates only provided fields, sets updated_at to now, validates title if provided), `toggle_complete(session, task_id, user_id, completed) → Task` (validates ownership, toggles completed flag, updates updated_at)
- [x] T021 [P] [US2] Implement task PUT endpoint: In `backend/src/routes/tasks.py`, add PUT /api/tasks/{task_id} endpoint (requires JWT, full replacement of title/description/completed, calls update_task, validates all required fields present, returns 403 if not owned, 404 if not found)
- [x] T022 [P] [US2] Implement task PATCH endpoints: In `backend/src/routes/tasks.py`, add PATCH /api/tasks/{task_id} endpoint (requires JWT, partial update with optional fields, calls update_task), add PATCH /api/tasks/{task_id}/complete endpoint (requires JWT, toggles completion, calls toggle_complete, returns updated task)
- [x] T023 [US2] Add validation for updates: Ensure title validation (1-200 chars) applied in PUT/PATCH, description validation (max 1000), return 422 errors with field details for validation failures in `backend/src/routes/tasks.py`
- [x] T024 [P] [US2] Add logging for US2 operations: Add structured logging to `backend/src/services/task_service.py` (log task updates with user_id, old/new values), log completion toggles
- [x] T025 [US2] Verify last-write-wins concurrency: Test that concurrent PATCH requests to same task complete without error (no optimistic locking in Phase II), verify final state reflects last write

**Checkpoint**: User Story 1 + 2 complete. Can verify: create, read, update (PUT/PATCH), toggle completion, all with proper ownership validation and error handling.

---

## Phase 5: User Story 3 - Task Deletion (Priority: P3)

**Goal**: Users can delete their own tasks to keep task list clean.

**Independent Test Criteria**:
1. DELETE own task → verify task no longer exists (404 on subsequent GET)
2. Attempt DELETE another user's task → verify 403 Forbidden
3. DELETE non-existent task → verify 404 Not Found
4. Verify deleted task user_id still scoped correctly (can't see other user's deleted task history)

**Estimated**: 4 tasks

### Implementation for User Story 3

- [x] T026 [US3] Implement delete service: Update `backend/src/services/task_service.py` with `delete_task(session, task_id, user_id) → None` (validates ownership via query filter, deletes task, raises 404 if not found, implicit 403 if user_id mismatch)
- [x] T027 [P] [US3] Implement DELETE endpoint: In `backend/src/routes/tasks.py`, add DELETE /api/tasks/{task_id} endpoint (requires JWT, calls delete_task with user_id from JWT, returns 204 No Content or 200 with empty response, handles 403 if not owned, 404 if not found)
- [x] T028 [P] [US3] Add logging for deletions: Add structured logging to `backend/src/services/task_service.py` for delete operations (log user_id and task_id deleted)
- [x] T029 [US3] Verify cascade delete behavior: Test that deleting a User cascades delete to all User's tasks (database-level ON DELETE CASCADE), verify foreign key constraints working correctly

**Checkpoint**: All user stories complete. Core task management (create, read, update, delete, complete) fully implemented with multi-user isolation and error handling.

---

## Phase 6: Testing & Quality Assurance

**Purpose**: Comprehensive test coverage and validation
**Estimated**: 4 tasks

- [x] T030 [P] [US1] Implement auth tests: Create `backend/tests/test_auth.py` with test_signup_success, test_signup_duplicate_email_409, test_signin_valid_credentials, test_signin_invalid_credentials_401, test_jwt_verification_valid, test_jwt_verification_expired_401, test_jwt_verification_invalid_token_401
- [x] T031 [P] [US1] Implement task CRUD tests: Create `backend/tests/test_tasks.py` with test_create_task_valid, test_create_task_invalid_title_422, test_get_user_tasks, test_get_user_tasks_empty, test_get_single_task_own, test_get_single_task_not_found_404
- [x] T032 [P] [US1] [US2] [US3] Implement user isolation tests: Create `backend/tests/test_user_isolation.py` with test_cross_user_task_access_forbidden_403, test_update_other_user_task_forbidden_403, test_delete_other_user_task_forbidden_403, test_task_queries_scoped_by_user_id, test_user_isolation_with_multiple_users
- [x] T033 [P] Implement edge case tests: Create `backend/tests/test_edge_cases.py` with test_invalid_task_id_uuid_422, test_concurrent_task_updates_last_write_wins, test_title_boundary_1_char, test_title_boundary_200_chars, test_description_boundary_1000_chars, test_token_expiry_validation, test_missing_auth_header_401

**Configure test database**: Create `backend/tests/conftest.py` with pytest fixtures for in-memory SQLite test database, async session factory, test client, sample auth tokens

**Checkpoint**: Test coverage complete. Run `pytest -v --cov=src` to verify all core functionality tested.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final quality assurance, documentation, and deployment readiness
**Estimated**: 5 tasks

- [x] T034 [P] Backend README: Create `backend/README.md` with setup instructions, dependency installation, environment configuration, running dev/prod servers, running tests, troubleshooting from quickstart.md
- [x] T035 [P] Run pytest full suite: Execute all tests (`pytest -v --cov=src`), verify all passing, coverage >80%, fix any failures
- [x] T036 [P] Run type checking: Execute `mypy src/` to verify all type hints correct, fix type errors
- [x] T037 [P] Code formatting: Run `black src/ tests/` and `flake8 src/ tests/` to ensure consistent code style
- [x] T038 Validate quickstart guide: Follow `quickstart.md` instructions step-by-step, verify all endpoints work via curl examples, verify test execution works, verify developer setup is clear

**Final Checkpoint**: Backend fully implemented, tested, documented, ready for frontend integration.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - start immediately ✅
- **Phase 2 (Foundational)**: Depends on Phase 1 completion - BLOCKS all user stories
- **Phase 3 (US1)**: Depends on Phase 2 - can start immediately after foundation
- **Phase 4 (US2)**: Depends on Phase 2, builds on US1 entities/routes
- **Phase 5 (US3)**: Depends on Phase 2, builds on US1 entities/routes
- **Phase 6 (Testing)**: Depends on Phase 3+ (tests cover implemented functionality)
- **Phase 7 (Polish)**: Depends on Phases 3-6 - final validation before completion

### User Story Dependencies

- **User Story 1 (P1)**: Independent once foundational complete. Can test in isolation.
- **User Story 2 (P2)**: Depends on User Story 1 models/routes existing. Extends Task entity updates.
- **User Story 3 (P3)**: Depends on User Story 1 models/routes existing. Adds delete capability.

**Important**: Each user story is independently testable once Phase 2 foundation completes. Stories can be implemented in parallel by different developers or sequentially by one developer.

### Within Each User Story

1. Tests written first (if included), verified to FAIL before implementation
2. Schemas → Services → Routes (dependency order)
3. Core implementation before integration
4. Story complete and independently testable before next story

### Parallel Opportunities

**Phase 1 (Setup)**:
- T002, T003, T004 can run in parallel (different files)

**Phase 2 (Foundational)** - CRITICAL BLOCKING:
- T005, T006, T007, T008 can run in parallel (db, env, middleware, error handling)
- T009, T010 can run in parallel (User model, Task model)
- **All Phase 2 tasks must complete before user stories begin**

**Phase 3+ (User Stories)** - Once Phase 2 Complete:
- Different stories (US1, US2, US3) can be worked on simultaneously by different developers
- Within a story, models (T011, T012) can be parallel, then schemas (service layer) can follow

**Phase 6 (Testing)** - Parallel:
- T030, T031, T032, T033 can all run in parallel (different test files)

**Phase 7 (Polish)** - Parallel:
- T034, T035, T036, T037 can run in parallel (README, tests, type check, format)

---

## Parallel Example: After Foundation (Phase 2 Complete)

```bash
# Developer A works on US1:
T011 → T012 → T013 → T014 → T015 → T016 → T017 → T018

# Developer B works on US2 (after US1 routes exist):
T019 → T020 → T021 → T022 → T023 → T024 → T025

# Developer C works on US3 (after US1 routes exist):
T026 → T027 → T028 → T029

# All developers then run tests in parallel:
T030, T031, T032, T033 (all in parallel in Phase 6)

# Final polish in parallel:
T034, T035, T036, T037 (all in parallel in Phase 7)
```

---

## Implementation Strategy

### MVP First (Phases 1-3 Only) ✅ RECOMMENDED

1. **Complete Phase 1**: Setup (4 tasks, ~30 min)
2. **Complete Phase 2**: Foundation (6 tasks, ~2-3 hours) - BLOCKS all stories
3. **Complete Phase 3**: User Story 1 (8 tasks, ~2 hours)
4. **Stop and Validate**: Test User Story 1 independently ✅
   - Create user
   - Authenticate (get JWT)
   - Create task
   - List tasks (verify user isolation)
   - Test 401/403 error cases
5. **MVP Ready**: Deploy/demo User Story 1

**Phase 1-3 MVP Estimated**: 4-5 hours for full working backend with secure task creation/reading

### Incremental Delivery (Phases 1-5)

1. Complete Phase 1 + 2 → Foundation ready
2. Add Phase 3 (US1) → Test independently → Deploy MVP
3. Add Phase 4 (US2) → Test independently → Deploy with updates
4. Add Phase 5 (US3) → Test independently → Deploy with deletion
5. Each story adds value without breaking previous stories

### Full Implementation (Phases 1-7)

1. Phases 1-5: All user stories implemented (14 hours estimated)
2. Phase 6: Comprehensive test coverage (45 min)
3. Phase 7: Polish, documentation, validation (30 min)
4. **Total estimated**: 15-16 hours for production-ready backend

---

## Success Criteria

✅ Phase 1 Complete: Project structure in place, dependencies installable
✅ Phase 2 Complete: Database, auth, error handling, models ready - FOUNDATION
✅ Phase 3 Complete: Can create tasks, list tasks, verify multi-user isolation, handle auth errors
✅ Phase 4 Complete: Can update tasks (PUT/PATCH), toggle completion, verify ownership
✅ Phase 5 Complete: Can delete tasks, verify ownership constraints
✅ Phase 6 Complete: 80%+ test coverage, all tests passing
✅ Phase 7 Complete: Code formatted, types checked, documentation complete

---

## Notes

- **[P] tasks**: Can run in parallel (different files, no blocking dependencies)
- **[US1], [US2], [US3]**: User story tags for traceability
- **Each user story**: Independently completable and testable
- **Tests**: Included per spec requirement (fixture-based pytest with async support)
- **File paths**: Exact locations for each task artifact
- **No manual code**: All implementation via Claude Code from this spec-driven task list
- **Commits**: After each phase completion or every 3-4 tasks for progress tracking
- **Validation**: Stop at each checkpoint to verify story independently works

---

## Task Summary

| Phase | Name | Tasks | Estimated | Status |
|-------|------|-------|-----------|--------|
| 1 | Setup | T001-T004 | 0.5h | ✅ Complete |
| 2 | Foundational | T005-T010 | 2-3h | ✅ Complete |
| 3 | US1 - Secure Management | T011-T018 | 2h | ✅ Complete |
| 4 | US2 - Updates/Completion | T019-T025 | 1.5h | ✅ Complete |
| 5 | US3 - Deletion | T026-T029 | 1h | ✅ Complete |
| 6 | Testing | T030-T033 | 0.75h | ✅ Complete |
| 7 | Polish | T034-T038 | 0.5h | Pending |
| **Total** | | **33 tasks** | **8-9h** | **33/33 Complete** |

