# Fix Notification ENUM - Missing Values

## Problem
The database ENUM `notificationtype` is missing "SIGNUP" and "LOGOUT" values.

**Current ENUM values in database:**
- LOGIN
- TASK_CREATED
- TASK_UPDATED
- TASK_COMPLETED
- TASK_PENDING
- TASK_DELETED
- PROFILE_UPDATED

**Missing values:**
- ❌ SIGNUP
- ❌ LOGOUT

## Solution

### Option 1: Run SQL Script (Recommended)

1. Connect to your Neon PostgreSQL database
2. Run the SQL commands in `fix_enum.sql`:

```sql
ALTER TYPE notificationtype ADD VALUE IF NOT EXISTS 'SIGNUP';
ALTER TYPE notificationtype ADD VALUE IF NOT EXISTS 'LOGOUT';
```

### Option 2: Use psql Command Line

```bash
psql "your_database_connection_string" -f fix_enum.sql
```

### Option 3: Use Neon Dashboard

1. Go to your Neon dashboard
2. Open SQL Editor
3. Run these commands:

```sql
ALTER TYPE notificationtype ADD VALUE 'SIGNUP';
ALTER TYPE notificationtype ADD VALUE 'LOGOUT';
```

### Option 4: Use Python Script

Run the migration script:
```bash
cd Phase-2/backend
python add_enum_values.py
```

## After Running the Fix

1. Verify the ENUM values:
```sql
SELECT unnest(enum_range(NULL::notificationtype))::text;
```

Should show:
- LOGIN
- LOGOUT ✅ (new)
- PROFILE_UPDATED
- SIGNUP ✅ (new)
- TASK_COMPLETED
- TASK_CREATED
- TASK_DELETED
- TASK_PENDING
- TASK_UPDATED

2. Restart your FastAPI server:
```bash
uvicorn src.main:app --reload
```

3. Test signup/signin - notifications should now work!

## Why This Happened

The database ENUM was created with only task-related and login notification types, but the code also tries to create SIGNUP and LOGOUT notifications. PostgreSQL ENUMs are strict and don't allow values that aren't explicitly defined.

## Alternative: Disable SIGNUP/LOGOUT Notifications

If you can't modify the database, you can temporarily disable these notifications:

In `Phase-2/backend/src/routes/auth.py`:

```python
# Comment out these lines:
# background_tasks.add_task(create_signup_notification_task, user_id, name)
# background_tasks.add_task(create_login_notification_task, user.id, user.name)
```

But it's better to add the ENUM values to the database.

---
**Status**: Waiting for database ENUM update
**Files**: `fix_enum.sql`, `add_enum_values.py`
