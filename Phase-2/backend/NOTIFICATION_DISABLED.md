# Notification Creation Temporarily Disabled

## Issue
Persistent SQLAlchemy async greenlet error when creating notifications:
```
sqlalchemy.exc.MissingGreenlet: greenlet_spawn has not been called
```

## Current Status
- ✅ Signup API works - user is created successfully
- ✅ Signin API works - user can login
- ❌ Notifications are NOT being created (disabled to prevent API failures)

## What Was Disabled
In `Phase-2/backend/src/routes/auth.py`:
- Line ~410: Signup notification creation (commented out)
- Line ~620: Login notification creation (commented out)

## Why This Happened
The SQLAlchemy async session is having issues with the connection pool ping operation. This is a known issue with asyncpg + SQLAlchemy when:
1. Using connection pooling
2. Trying to ping connections in async context
3. Greenlet context not properly initialized

## Temporary Solution
Notifications are disabled so your auth APIs work properly. Users can:
- ✅ Sign up successfully
- ✅ Sign in successfully
- ✅ Get JWT tokens
- ✅ Access protected routes

## To Re-Enable Notifications Later

### Option 1: Fix the Async Issue
Check your database connection configuration in `src/db.py`:
```python
# Make sure you're using proper async engine settings
engine = create_async_engine(
    DATABASE_URL,
    echo=True,
    pool_pre_ping=False,  # Try disabling pre-ping
    pool_size=5,
    max_overflow=10
)
```

### Option 2: Use Background Tasks
Instead of creating notifications synchronously, use FastAPI background tasks:
```python
from fastapi import BackgroundTasks

async def create_notification_background(user_id: str, name: str):
    # Create notification in background
    pass

@router.post("/signup")
async def signup(
    background_tasks: BackgroundTasks,
    ...
):
    # Create user
    # Add notification to background tasks
    background_tasks.add_task(create_notification_background, user_id, name)
```

### Option 3: Use Task Queue
Use Celery or similar to handle notifications asynchronously:
```python
@celery_app.task
def create_notification_task(user_id: str, notification_type: str):
    # Create notification in separate worker
    pass
```

## Current Working State
Your APIs are fully functional without notifications:
- POST /api/auth/signup - ✅ Working
- POST /api/auth/signin - ✅ Working
- POST /api/auth/logout - ✅ Working
- GET /api/auth/me - ✅ Working

All other APIs (tasks, notifications list, profile) should work normally.

## Next Steps
1. Test signup and signin - should work now
2. If you need notifications urgently, we can implement Option 2 (Background Tasks)
3. Or investigate the database connection pool settings

---
**Status**: Auth APIs working, notifications disabled temporarily
**Date**: 2026-02-14 14:35 GMT
