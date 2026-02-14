# 🔧 Apply Notification Fix - Step by Step Guide

## Problem
```
✅ Signin successful
✅ Status: 200
❌ ROLLBACK ← Notification lost!
```

## Solution
Add notifications IN THE SAME TRANSACTION as user operations.

---

## 📝 Step-by-Step Fix

### Step 1: Backup Current File

```bash
cd Phase-2\backend\src\routes
copy auth.py auth.py.backup
```

### Step 2: Add Import (if missing)

Open `auth.py` and check if this import exists at the top:

```python
from src.models.user import User, Notification  # Add Notification if missing
```

If not, add it around line 15-20 where other imports are.

### Step 3: Fix Signup Function

Find the signup function (around line 200-450) and locate this part:

```python
# Around line 340-360
user = User(
    id=user_id,
    name=name,
    email=email,
    hashed_password=hashed_password
)
session.add(user)

# Commit to database with error handling
try:
    await session.commit()
    await session.refresh(user)
    logger.info(f"[{request_id}] User created successfully: {user_id}")
```

**CHANGE TO:**

```python
user = User(
    id=user_id,
    name=name,
    email=email,
    hashed_password=hashed_password
)
session.add(user)

# ADD NOTIFICATION BEFORE COMMIT
notification = Notification(
    user_id=user_id,
    type="SIGNUP",
    title="Account Created",
    message=f"Welcome to the app, {name}! Your account has been created.",
    is_read=False,
    task_id=None
)
session.add(notification)

# Commit both together
try:
    await session.commit()
    await session.refresh(user)
    await session.refresh(notification)  # Add this line
    logger.info(f"[{request_id}] User and notification created: {user_id}")
```

**THEN REMOVE** the old notification code (around line 428):

```python
# DELETE THIS ENTIRE BLOCK:
try:
    await NotificationService.create_signup_notification(
        session=session,
        user_id=user_data["id"],
        user_name=user_data["name"],
    )
    logger.info(f"[{request_id}] Signup notification created")
except Exception as e:
    logger.warning(f"[{request_id}] Notification creation failed: {e}")
```

### Step 4: Fix Signin Function

Find the signin function (around line 500-670) and locate this part:

```python
# Around line 650-660
# Generate JWT token
logger.info(f"[{request_id}] Generating JWT token for user: {user.id}")
try:
    if USE_PRODUCTION_UTILS:
        token = TokenManager.create_access_token(...)
    else:
        token = create_access_token(user.id)
except Exception as e:
    logger.error(f"[{request_id}] Token generation failed: {e}")
    raise HTTPException(...)
```

**ADD THIS BEFORE TOKEN GENERATION:**

```python
# Create login notification
logger.info(f"[{request_id}] Creating login notification")
try:
    notification = Notification(
        user_id=user.id,
        type="LOGIN",
        title="Login Successful",
        message=f"Welcome back, {user.name}!",
        is_read=False,
        task_id=None
    )
    session.add(notification)
    await session.commit()
    await session.refresh(notification)
    logger.info(f"[{request_id}] Login notification created: {notification.id}")
except Exception as e:
    logger.warning(f"[{request_id}] Notification failed: {e}")
    await session.rollback()

# Generate JWT token (existing code continues here)
logger.info(f"[{request_id}] Generating JWT token for user: {user.id}")
```

### Step 5: Save and Restart

```bash
# Save auth.py
# Restart server
uvicorn src.main:app --reload
```

---

## 🎯 Quick Copy-Paste Method

If you want to avoid manual editing:

1. Open `COMPLETE_AUTH_FIX.py`
2. Copy the entire `signup` function
3. Replace your signup function in `auth.py`
4. Copy the entire `signin` function
5. Replace your signin function in `auth.py`
6. Save and restart

---

## ✅ Verification

### Test Signup:
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test@123"}'
```

**Expected Logs:**
```
Creating user with ID: xxx
Creating signup notification
User and notification created successfully: xxx
COMMIT  ← Should see COMMIT, not ROLLBACK!
```

### Test Signin:
```bash
curl -X POST http://localhost:8000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123"}'
```

**Expected Logs:**
```
Password verified successfully
Creating login notification
Login notification created: 1
COMMIT  ← Should see COMMIT!
Signin completed successfully
```

### Check Notifications:
```bash
curl http://localhost:8000/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "type": "SIGNUP",
    "title": "Account Created",
    "message": "Welcome to the app, Test User!",
    "is_read": false
  },
  {
    "id": 2,
    "type": "LOGIN",
    "title": "Login Successful",
    "message": "Welcome back, Test User!",
    "is_read": false
  }
]
```

---

## 🐛 Troubleshooting

### Still seeing ROLLBACK?

Check:
1. ✅ Import added: `from src.models.user import User, Notification`
2. ✅ Notification added BEFORE commit
3. ✅ Both user and notification in same transaction
4. ✅ Old NotificationService call removed

### Import Error?

Make sure Notification model exists in `src/models/user.py`:

```python
class Notification(SQLModel, table=True):
    __tablename__ = "notifications"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id")
    type: str
    title: str
    message: str
    is_read: bool = Field(default=False)
    task_id: Optional[int] = Field(default=None, foreign_key="tasks.id")
    created_at: datetime = Field(default_factory=datetime.now)
```

### Database Error?

Reset database:
```bash
# Delete old database
rm test.db

# Restart server (tables will be recreated)
uvicorn src.main:app --reload
```

---

## 📊 Before vs After

### BEFORE (Broken):
```
User create → COMMIT ✅
Notification create → COMMIT ❌ (fails)
Result: ROLLBACK → Notification lost
```

### AFTER (Fixed):
```
User create + Notification create → COMMIT ✅
Result: Both saved successfully!
```

---

## 🎉 Success Indicators

When fixed, you'll see:

1. ✅ No ROLLBACK in logs
2. ✅ "User and notification created" message
3. ✅ Notifications appear in API response
4. ✅ Database has notification records

---

## 📞 Need Help?

If still not working:
1. Check `COMPLETE_AUTH_FIX.py` for complete working code
2. Compare your code with the fixed version
3. Make sure all imports are correct
4. Verify Notification model exists

---

**Ready to apply? Follow Step 1-5 above!** 🚀
