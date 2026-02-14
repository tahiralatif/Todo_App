# 🔧 Notification Fix - Database Save Issue

## Problem
Notifications create nahi ho rahi hain signup/signin ke time pe.

**Logs se pata chal raha hai:**
```
DEBUG: Creating notification for user a3a53910-dc37-4b9c-81b6-5867ddc6afdb
ROLLBACK  ← Ye problem hai!
```

## Root Cause

Auth route mein:
1. User create hota hai → `await session.commit()` ✅
2. Notification create hoti hai → `await session.commit()` ❌ (fails silently)
3. Session already committed hai, notification ka commit fail ho jata hai

## Solution

### Option 1: Notification Service Fix (Recommended)

**File:** `src/services/notification_service.py`

**Change:**
```python
# BEFORE (Line 50-55)
notification = Notification(
    user_id=user_id,
    type=notification_type,
    title=title,
    message=message,
    task_id=task.id if task else None,
)
session.add(notification)
await session.commit()  # ❌ Ye problem hai
await session.refresh(notification)
```

**AFTER:**
```python
notification = Notification(
    user_id=user_id,
    type=notification_type,
    title=title,
    message=message,
    task_id=task.id if task else None,
)
session.add(notification)
# Don't commit here - let caller handle it
# await session.commit()  # ❌ Remove this
# await session.refresh(notification)  # ❌ Remove this
await session.flush()  # ✅ Add this instead
```

### Option 2: Auth Route Fix

**File:** `src/routes/auth.py`

**Change in signup function (around line 428):**

```python
# BEFORE
# Create signup notification (non-blocking, don't fail on error)
try:
    await NotificationService.create_signup_notification(
        session=session,
        user_id=user_data["id"],
        user_name=user_data["name"],
    )
    logger.info(f"[{request_id}] Signup notification created")
except Exception as e:
    # Log but don't fail the signup
    logger.warning(f"[{request_id}] Notification creation failed: {e}")
```

**AFTER:**
```python
# Create signup notification BEFORE final commit
try:
    notification = Notification(
        user_id=user_data["id"],
        type="SIGNUP",
        title="Account Created",
        message=f"Welcome to the app, {user_data['name']}! Your account has been created.",
        is_read=False
    )
    session.add(notification)
    await session.commit()  # Commit notification with user
    logger.info(f"[{request_id}] Signup notification created")
except Exception as e:
    # Log but don't fail the signup
    logger.warning(f"[{request_id}] Notification creation failed: {e}")
    await session.rollback()
```

## Complete Fixed Code

### Fixed notification_service.py

```python
@staticmethod
async def create_notification(
    session: AsyncSession,
    user_id: str,
    notification_type: str,
    title: str,
    message: str,
    task: Optional[Task] = None,
) -> Notification:
    """
    Create a new notification for a user.
    NOTE: Does NOT commit - caller must commit!
    """
    print(f"DEBUG: Creating notification for user {user_id}")
    notification = Notification(
        user_id=user_id,
        type=notification_type,
        title=title,
        message=message,
        task_id=task.id if task else None,
    )
    session.add(notification)
    await session.flush()  # Flush to get ID but don't commit
    print(f"DEBUG: Notification added to session: {notification.id}")
    return notification
```

### Fixed auth.py signup

```python
# After user creation and BEFORE returning response
# Create signup notification
try:
    from src.models.user import Notification
    
    notification = Notification(
        user_id=user_data["id"],
        type="SIGNUP",
        title="Account Created",
        message=f"Welcome to the app, {user_data['name']}! Your account has been created.",
        is_read=False,
        task_id=None
    )
    session.add(notification)
    await session.commit()  # Commit notification
    await session.refresh(notification)
    logger.info(f"[{request_id}] Signup notification created: {notification.id}")
except Exception as e:
    logger.warning(f"[{request_id}] Notification creation failed: {e}")
    # Don't fail signup if notification fails
```

## Quick Fix Commands

### Step 1: Backup Current Files
```bash
cd Phase-2\backend\src
copy services\notification_service.py services\notification_service.py.backup
copy routes\auth.py routes\auth.py.backup
```

### Step 2: Apply Fix

Open `src/services/notification_service.py` and change line 55-57:

```python
# Line 55-57: Change from
await session.commit()
await session.refresh(notification)

# To:
await session.flush()
# await session.commit()  # Commented out
# await session.refresh(notification)  # Commented out
```

### Step 3: Test

```bash
# Restart server
uvicorn src.main:app --reload

# Test signup
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test@123"}'

# Check notifications
curl http://localhost:8000/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Alternative: Transaction Management

Better approach - use proper transaction management:

```python
# In auth.py signup function
async with session.begin():
    # Create user
    user = User(...)
    session.add(user)
    await session.flush()
    
    # Create notification
    notification = Notification(...)
    session.add(notification)
    
    # Both will commit together
    # await session.commit() is automatic with begin()
```

## Verification

After fix, logs should show:
```
DEBUG: Creating notification for user xxx
DEBUG: Notification added to session: 1
COMMIT  ← Should see COMMIT, not ROLLBACK
```

And notifications API should return data:
```json
[
  {
    "id": 1,
    "type": "SIGNUP",
    "title": "Account Created",
    "message": "Welcome to the app, Test User!",
    "is_read": false
  }
]
```

## Root Cause Summary

The issue was **double commit**:
1. User creation commits the session
2. Notification service tries to commit again
3. Second commit fails silently
4. Session rolls back
5. Notification lost

**Solution:** Don't commit in notification service, let caller handle commits.
