# Tasks: Phase I - Todo Console Application

**Input:** Design documents from `specs/phase_1/`
**Prerequisites:** plan.md (required), spec.md (required)

**Tests:** Optional - unit tests recommended for TaskManager

**Organization:** Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below assume single project structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose:** Project initialization and basic structure

- [X] T001 Initialize Python project with uv and pyproject.toml
- [X] T002 [P] Install dependencies: rich, questionary in pyproject.toml
- [X] T003 Create src/ directory structure with __init__.py files
- [X] T004 Create tests/ directory structure with __init__.py file

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose:** Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL:** No user story work can begin until this phase is complete

### Task Model (Required by All Stories)

- [X] T005 [P] [FOUNDATION] Create Task dataclass in src/models/task.py
- [X] T006 [P] [FOUNDATION] Add Task validation (title length, description length)
- [X] T007 [P] [FOUNDATION] Add Task.update() method for partial updates

### TaskManager Service (Required by All Stories)

- [X] T008 [P] [FOUNDATION] Create TaskManager singleton in src/services/task_manager.py
- [X] T009 [P] [FOUNDATION] Implement TaskManager.create_task() method
- [X] T010 [P] [FOUNDATION] Implement TaskManager.get_all_tasks() method
- [X] T011 [P] [FOUNDATION] Implement TaskManager.get_task_by_id() method
- [X] T012 [P] [FOUNDATION] Implement TaskManager.update_task() method
- [X] T013 [P] [FOUNDATION] Implement TaskManager.delete_task() method
- [X] T014 [P] [FOUNDATION] Implement TaskManager.mark_complete() method

**Checkpoint:** Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Add Task (Priority: P1) 🎯 MVP

**Goal:** User can create a new task with title and optional description

**Independent Test:** Run `python -m src.main`, select "Add Task", enter title, verify task is created and displayed in View Tasks

### CLI Controller - Add Task

- [X] T015 [P] [US1] Create CLIController class in src/ui/cli_controller.py
- [X] T016 [P] [US1] Implement CLIController.add_task() using questionary.text()
- [X] T017 [P] [US1] Add title validation (non-empty, non-whitespace)
- [X] T018 [P] [US1] Add Rich success panel feedback in add_task()

**Checkpoint:** User Story 1 complete - Add Task feature is fully functional

---

## Phase 4: User Story 2 - View Tasks (Priority: P1)

**Goal:** User can see all tasks in a formatted table

**Independent Test:** After adding tasks via US1, run View Tasks and verify all tasks display correctly

### CLI Controller - View Tasks

- [X] T019 [P] [US2] Implement CLIController.view_tasks() using Rich Table
- [X] T020 [P] [US2] Add empty state handling (no tasks message)
- [X] T021 [P] [US2] Style completed tasks with ✅ green
- [X] T022 [P] [US2] Style pending tasks with ⏳ yellow

**Checkpoint:** User Stories 1 AND 2 complete - basic CRUD operations working

---

## Phase 5: User Story 3 - Mark Complete (Priority: P2)

**Goal:** User can mark a task as completed

**Independent Test:** Add a task, mark it complete, verify status changes in View Tasks

### CLI Controller - Mark Complete

- [X] T023 [P] [US3] Implement CLIController.mark_complete() using questionary.text()
- [X] T024 [P] [US3] Add validation for already-completed tasks
- [X] T025 [P] [US3] Add Rich success feedback with ✅ icon
- [X] T026 [P] [US3] Add error handling for invalid IDs

**Checkpoint:** User Stories 1, 2, 3 complete - status tracking working

---

## Phase 6: User Story 4 - Update Task (Priority: P3)

**Goal:** User can modify task title and/or description

**Independent Test:** Create task, update title/description, verify changes in View Tasks

### CLI Controller - Update Task

- [X] T027 [P] [US4] Implement CLIController.update_task() using questionary.text()
- [X] T028 [P] [US4] Preserve existing values when empty input
- [X] T029 [P] [US4] Add Rich confirmation feedback
- [X] T030 [P] [US4] Handle invalid ID errors gracefully

**Checkpoint:** User Stories 1-4 complete - full task management working

---

## Phase 7: User Story 5 - Delete Task (Priority: P4)

**Goal:** User can remove a task with confirmation

**Independent Test:** Create task, delete it, verify it's removed from View Tasks

### CLI Controller - Delete Task

- [X] T031 [P] [US5] Implement CLIController.delete_task() using questionary.text()
- [X] T032 [P] [US5] Add confirmation prompt using questionary.confirm()
- [X] T033 [P] [US5] Add Rich success/cancellation messages
- [X] T034 [P] [US5] Handle invalid ID errors safely

**Checkpoint:** User Stories 1-5 complete - all task operations working

---

## Phase 8: User Story 6 - Exit App (Priority: P5)

**Goal:** User can exit the application gracefully

**Independent Test:** Select Exit and verify application terminates cleanly

### Main Entry Point

- [X] T035 [P] [US6] Create main.py entry point
- [X] T036 [P] [US6] Implement main() function calling CLIController.run()
- [X] T037 [P] [US6] Add Rich goodbye message using Panel
- [X] T038 [P] [US6] Implement clean sys.exit(0) termination

**Checkpoint:** All user stories complete - application is fully functional

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose:** Improvements that affect multiple user stories

- [X] T039 [P] Create pyproject.toml with project configuration
- [X] T040 [P] Write unit tests for TaskManager methods in tests/test_task_manager.py
- [X] T041 [P] Verify all Rich styling follows UI specifications
- [X] T042 [P] Test error handling scenarios
- [X] T043 [P] Verify no raw print() statements used

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-8)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staff available)
  - Or sequentially in priority order (US1 → US2 → US3 → US4 → US5 → US6)
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (Add Task)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (View Tasks)**: Can start after Foundational - No dependencies on other stories
- **User Story 3 (Mark Complete)**: Can start after Foundational - No dependencies on other stories
- **User Story 4 (Update Task)**: Can start after Foundational - No dependencies on other stories
- **User Story 5 (Delete Task)**: Can start after Foundational - No dependencies on other stories
- **User Story 6 (Exit App)**: Can start after Foundational - No dependencies on other stories

### Within Each User Story

- Models before services
- Services before CLI methods
- Core implementation before error handling
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel
- All tasks for a user story marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
Task: "Create CLIController class in src/ui/cli_controller.py"
Task: "Implement CLIController.add_task() using questionary.text()"
Task: "Add title validation (non-empty, non-whitespace)"
Task: "Add Rich success panel feedback in add_task()"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test Add Task independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Add User Story 6 → Test independently → Deploy/Demo
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 43 |
| Setup Tasks | 4 |
| Foundational Tasks | 10 |
| User Story Tasks | 24 |
| Polish Tasks | 5 |
| Parallelizable Tasks | All marked with [P] |
| Independent Stories | 6 (all can be tested independently) |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
