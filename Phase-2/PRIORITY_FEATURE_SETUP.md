# Priority Feature Setup Guide

## 🎯 Overview

The priority feature has been added to both backend and frontend! Tasks can now have three priority levels:
- **HIGH** (Red badge with AlertCircle icon)
- **MEDIUM** (Yellow badge with AlertTriangle icon)  
- **LOW** (Blue badge with Flag icon)

---

## 📋 Backend Changes

### 1. Database Schema
- Added `priority` column to `tasks` table
- Created `taskpriority` ENUM type with values: LOW, MEDIUM, HIGH
- Default priority: MEDIUM

### 2. Updated Files
- ✅ `src/models/user.py` - Added TaskPriorityEnum and priority field to Task model
- ✅ `src/schemas/task.py` - Added priority to all task schemas
- ✅ `src/routes/tasks.py` - Added priority filtering and response fields
- ✅ `src/services/task_service.py` - Added priority support in CRUD operations

---

## 🚀 Setup Instructions

### Step 1: Run Database Migration

You have two options:

#### Option A: Using Python Script (Recommended)
```bash
cd Phase-2/backend
python add_priority_migration.py
```

This script will:
- Create the `taskpriority` ENUM type
- Add the `priority` column with default value 'MEDIUM'
- Create an index on the priority column
- Verify the changes

#### Option B: Using SQL Directly
Run the SQL file on your Neon PostgreSQL database:
```sql
-- File: add_priority_column.sql
CREATE TYPE taskpriority AS ENUM ('LOW', 'MEDIUM', 'HIGH');
ALTER TABLE tasks ADD COLUMN priority taskpriority NOT NULL DEFAULT 'MEDIUM';
CREATE INDEX idx_tasks_priority ON tasks(priority);
```

### Step 2: Restart Backend Server
```bash
cd Phase-2/backend
uvicorn src.main:app --reload
```

The backend will now support priority in all task operations.

---

## 🎨 Frontend Changes

### 1. Updated Files
- ✅ `src/types/index.ts` - Added priority field to Task interface
- ✅ `src/lib/api.ts` - Added priority parameter to API calls
- ✅ `src/app/dashboard/tasks/page.tsx` - Complete priority UI

### 2. New Features in Tasks Page

#### Priority Filters
- All Priorities (shows all tasks)
- High Priority (red)
- Medium Priority (yellow)
- Low Priority (blue)

#### Priority Badges
Each task displays a colored badge with icon:
- 🔴 HIGH - Red with AlertCircle icon
- 🟡 MEDIUM - Yellow with AlertTriangle icon
- 🔵 LOW - Blue with Flag icon

#### Priority Selector
- Create Task Modal: Select priority when creating
- Edit Task Modal: Change priority when editing
- Visual buttons with icons and colors

---

## 📊 API Changes

### Create Task
```typescript
POST /api/tasks
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "priority": "HIGH"  // NEW: LOW, MEDIUM, or HIGH
}
```

### Update Task
```typescript
PATCH /api/tasks/{task_id}
{
  "title": "Updated title",
  "priority": "LOW"  // NEW: Can update priority
}
```

### List Tasks with Priority Filter
```typescript
GET /api/tasks?priority=HIGH
GET /api/tasks?status=pending&priority=MEDIUM
```

### Response Format
```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "priority": "HIGH",  // NEW FIELD
  "is_deleted": false,
  "created_at": "2026-02-15T10:30:00Z",
  "updated_at": "2026-02-15T10:30:00Z"
}
```

---

## ✅ Testing Checklist

### Backend Testing
1. ✅ Run migration script successfully
2. ✅ Verify priority column exists in database
3. ✅ Create task with HIGH priority
4. ✅ Create task with MEDIUM priority (default)
5. ✅ Create task with LOW priority
6. ✅ Update task priority
7. ✅ Filter tasks by priority
8. ✅ Combine status and priority filters

### Frontend Testing
1. ✅ Create new task with priority selector
2. ✅ See priority badges on task cards
3. ✅ Filter tasks by priority (High/Medium/Low)
4. ✅ Edit task and change priority
5. ✅ Combine status and priority filters
6. ✅ Toast notifications work for all operations

---

## 🎯 Usage Examples

### Create High Priority Task
1. Click "New Task" button
2. Enter title and description
3. Click "HIGH" priority button (red)
4. Click "Create Task"
5. See task with red HIGH badge

### Filter High Priority Pending Tasks
1. Click "Pending" status filter
2. Click "High" priority filter
3. See only pending tasks with high priority

### Change Task Priority
1. Click edit icon on any task
2. Select different priority (LOW/MEDIUM/HIGH)
3. Click "Save Changes"
4. See updated priority badge

---

## 🔧 Troubleshooting

### Migration Fails
If the migration script fails:
1. Check database connection in `.env` file
2. Ensure you have write permissions on the database
3. Try running the SQL manually in Neon console

### Priority Not Showing
If priority doesn't appear:
1. Clear browser cache
2. Restart frontend dev server
3. Check browser console for errors
4. Verify backend is running on port 8000

### Default Priority Issues
All existing tasks will have MEDIUM priority by default after migration.

---

## 📝 Notes

- **Backward Compatible**: Existing tasks get MEDIUM priority automatically
- **Database Index**: Priority column is indexed for fast filtering
- **Type Safe**: TypeScript ensures correct priority values
- **Visual Feedback**: Color-coded badges make priorities easy to identify
- **Toast Notifications**: All operations show success/error messages

---

## 🎉 What's New

### Status Filters (Existing)
- All Tasks
- Pending
- Completed  
- Deleted (with restore button)

### Priority Filters (NEW!)
- All Priorities
- High Priority (🔴)
- Medium Priority (🟡)
- Low Priority (🔵)

### Combined Filtering
You can now combine both filters:
- "Pending + High Priority" - Urgent tasks
- "Completed + Low Priority" - Done low-priority items
- Any combination you need!

---

## 🚀 Ready to Use!

Once you run the migration, the priority feature is fully functional:
1. Run `python add_priority_migration.py`
2. Restart backend server
3. Refresh frontend
4. Start using priorities!

Enjoy organizing your tasks with priorities! 🎯
