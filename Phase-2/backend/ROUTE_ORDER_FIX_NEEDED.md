# Route Order Issue - mark-all-read Endpoint

## Problem
The `PUT /api/notifications/mark-all-read` endpoint is returning 422 error because FastAPI is matching it to `PUT /api/notifications/{notification_id}` instead.

## Root Cause
In `Phase-2/backend/src/routes/notifications.py`, the routes are defined in this order:

1. Line 417: `PUT /{notification_id}` - Parameterized route
2. Line 579: `PUT /mark-all-read` - Specific route

FastAPI matches routes in the order they're defined. When you call `/mark-all-read`, it matches the first route `/{notification_id}` and tries to parse "mark-all-read" as an integer, causing the validation error.

## Solution
Move the `/mark-all-read` route BEFORE the `/{notification_id}` route.

**Correct order:**
1. `PUT /mark-all-read` - Specific route (should be first)
2. `PUT /{notification_id}` - Parameterized route (should be after)

## FastAPI Route Matching Rules
- More specific routes must be defined BEFORE parameterized routes
- Routes are matched in the order they're defined
- First match wins

## How to Fix

In `Phase-2/backend/src/routes/notifications.py`:

1. Cut the entire "MARK ALL AS READ ENDPOINT" section (lines 575-675)
2. Paste it BEFORE the "UPDATE NOTIFICATION ENDPOINT" section (before line 417)

This will ensure `/mark-all-read` is matched before `/{notification_id}`.

## Temporary Workaround
For now, you can mark individual notifications as read using:
```
PUT /api/notifications/{notification_id}
{
  "is_read": true
}
```

Or get all notifications and mark them one by one.

## Status
⚠️ Needs code refactoring to fix route order

---
**Issue**: Route order causing 422 validation error
**File**: `Phase-2/backend/src/routes/notifications.py`
**Fix**: Move mark-all-read route before {notification_id} route
