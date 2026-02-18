# Implementation Plan: Mark Complete

**Feature:** 005_mark_complete
**Date:** 2026-01-01
**Spec:** mark_complete_spec.md

---

## Summary

Design the Mark Complete feature for toggling task status to completed.

---

## Technical Context

**Language/Version:** Python 3.13+
**Primary Dependencies:** rich, questionary
**Storage:** In-memory

---

## Constitution Check

| Gate | Status | Notes |
|------|--------|-------|
| Already Completed Check | ✅ | Prevent re-marking completed tasks |

---

## Data Flow

```
User selects "Mark Task as Complete"
         ↓
Prompt: Enter task ID (Questionary)
         ↓
Validate: Task exists AND not already complete
         ↓
TaskManager.mark_complete(id)
         ↓
Rich success panel with ✅ icon
```

---

## TaskManager Method

```python
def mark_complete(self, id: int) -> Task:
    """Mark task as completed. Raises error if already complete."""
    task = self.get_task_by_id(id)
    if task.completed:
        raise ValueError("Task already completed")
    task.completed = True
    return task
```

---

**Plan Generated:** 2026-01-01
**Feature:** Mark Complete (005_mark_complete)
**Status:** Ready for /sp.tasks
