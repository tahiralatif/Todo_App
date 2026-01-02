# Implementation Plan: Update Task

**Feature:** 003_update_task
**Date:** 2026-01-01
**Spec:** update_task_spec.md

---

## Summary

Design the Update Task feature for modifying task title and/or description by ID.

---

## Technical Context

**Language/Version:** Python 3.13+
**Primary Dependencies:** rich, questionary
**Storage:** In-memory (TaskManager)

---

## Constitution Check

| Gate | Status | Notes |
|------|--------|-------|
| OOP Design | ✅ | TaskManager.update_task() method |
| Validation | ✅ | Empty updates don't overwrite |

---

## Data Flow

```
User selects "Update Task"
         ↓
Prompt: Enter task ID (Questionary)
         ↓
Validate task exists
         ↓
Prompt: New title (optional - enter to keep)
         ↓
Prompt: New description (optional - enter to keep)
         ↓
TaskManager.update_task(id, title, description)
         ↓
Rich confirmation panel
```

---

## TaskManager Method

```python
def update_task(
    self,
    id: int,
    title: str | None = None,
    description: str | None = None
) -> Task:
    """Update task fields. Only non-None values are updated."""
    task = self.get_task_by_id(id)
    if title is not None and title.strip():
        task.title = title.strip()
    if description is not None:
        task.description = description.strip() if description.strip() else None
    return task
```

---

**Plan Generated:** 2026-01-01
**Feature:** Update Task (003_update_task)
**Status:** Ready for /sp.tasks
