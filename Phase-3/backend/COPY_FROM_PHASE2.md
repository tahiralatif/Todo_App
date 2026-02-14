# 🔄 Copy Phase-2 Backend to Phase-3

## Instructions

Phase-2 ki production-ready backend ko Phase-3 mein copy karne ke liye ye steps follow karo:

### Method 1: Manual Copy (Recommended)

```bash
# Windows PowerShell mein ye commands run karo:

# 1. Auth Routes
Copy-Item "Phase-2\backend\src\routes\auth.py" "Phase-3\backend\src\routes\auth.py" -Force

# 2. Tasks Routes  
Copy-Item "Phase-2\backend\src\routes\tasks.py" "Phase-3\backend\src\routes\tasks.py" -Force

# 3. Notifications Routes
Copy-Item "Phase-2\backend\src\routes\notifications.py" "Phase-3\backend\src\routes\notifications.py" -Force

# 4. Profile Routes
Copy-Item "Phase-2\backend\src\routes\profile.py" "Phase-3\backend\src\routes\profile.py" -Force

# 5. Copy All Services
Copy-Item "Phase-2\backend\src\services\*" "Phase-3\backend\src\services\" -Force -Recurse

# 6. Copy All Schemas
Copy-Item "Phase-2\backend\src\schemas\*" "Phase-3\backend\src\schemas\" -Force -Recurse

# 7. Copy Middleware
Copy-Item "Phase-2\backend\src\middleware\*" "Phase-3\backend\src\middleware\" -Force -Recurse

# 8. Copy Main Files
Copy-Item "Phase-2\backend\src\main.py" "Phase-3\backend\src\main.py" -Force
Copy-Item "Phase-2\backend\src\config.py" "Phase-3\backend\src\config.py" -Force
Copy-Item "Phase-2\backend\src\db.py" "Phase-3\backend\src\db.py" -Force
```

### Method 2: Batch Script

Create `copy_backend.bat` file:

```batch
@echo off
echo Copying Phase-2 backend to Phase-3...

REM Routes
xcopy /Y "Phase-2\backend\src\routes\auth.py" "Phase-3\backend\src\routes\"
xcopy /Y "Phase-2\backend\src\routes\tasks.py" "Phase-3\backend\src\routes\"
xcopy /Y "Phase-2\backend\src\routes\notifications.py" "Phase-3\backend\src\routes\"
xcopy /Y "Phase-2\backend\src\routes\profile.py" "Phase-3\backend\src\routes\"

REM Services
xcopy /Y /S "Phase-2\backend\src\services\*" "Phase-3\backend\src\services\"

REM Schemas
xcopy /Y /S "Phase-2\backend\src\schemas\*" "Phase-3\backend\src\schemas\"

REM Middleware
xcopy /Y /S "Phase-2\backend\src\middleware\*" "Phase-3\backend\src\middleware\"

REM Core files
xcopy /Y "Phase-2\backend\src\main.py" "Phase-3\backend\src\"
xcopy /Y "Phase-2\backend\src\config.py" "Phase-3\backend\src\"
xcopy /Y "Phase-2\backend\src\db.py" "Phase-3\backend\src\"

echo Done! Phase-2 backend copied to Phase-3
pause
```

Then run: `copy_backend.bat`

### Method 3: PowerShell Script

Create `copy_backend.ps1`:

```powershell
Write-Host "Copying Phase-2 backend to Phase-3..." -ForegroundColor Green

$files = @(
    @{src="Phase-2\backend\src\routes\auth.py"; dst="Phase-3\backend\src\routes\auth.py"},
    @{src="Phase-2\backend\src\routes\tasks.py"; dst="Phase-3\backend\src\routes\tasks.py"},
    @{src="Phase-2\backend\src\routes\notifications.py"; dst="Phase-3\backend\src\routes\notifications.py"},
    @{src="Phase-2\backend\src\routes\profile.py"; dst="Phase-3\backend\src\routes\profile.py"},
    @{src="Phase-2\backend\src\main.py"; dst="Phase-3\backend\src\main.py"},
    @{src="Phase-2\backend\src\config.py"; dst="Phase-3\backend\src\config.py"},
    @{src="Phase-2\backend\src\db.py"; dst="Phase-3\backend\src\db.py"}
)

foreach ($file in $files) {
    Copy-Item $file.src $file.dst -Force
    Write-Host "✓ Copied $($file.src)" -ForegroundColor Cyan
}

# Copy directories
$dirs = @(
    @{src="Phase-2\backend\src\services"; dst="Phase-3\backend\src\services"},
    @{src="Phase-2\backend\src\schemas"; dst="Phase-3\backend\src\schemas"},
    @{src="Phase-2\backend\src\middleware"; dst="Phase-3\backend\src\middleware"}
)

foreach ($dir in $dirs) {
    Copy-Item "$($dir.src)\*" $dir.dst -Force -Recurse
    Write-Host "✓ Copied $($dir.src)" -ForegroundColor Cyan
}

Write-Host "`n✅ All files copied successfully!" -ForegroundColor Green
```

Then run: `.\copy_backend.ps1`

---

## Files to Copy

### Routes (4 files)
- ✅ auth.py (4 endpoints)
- ✅ tasks.py (8 endpoints)
- ✅ notifications.py (7 endpoints)
- ✅ profile.py (4 endpoints)

### Services (6 files)
- ✅ auth_service.py
- ✅ task_service.py
- ✅ notification_service.py
- ✅ local_storage_service.py
- ✅ supabase_storage_service.py
- ✅ __init__.py

### Schemas (5 files)
- ✅ auth.py
- ✅ task.py
- ✅ notification.py
- ✅ profile.py
- ✅ __init__.py

### Middleware (4 files)
- ✅ auth.py
- ✅ errors.py
- ✅ logging_middleware.py
- ✅ rate_limit.py

### Core Files (3 files)
- ✅ main.py
- ✅ config.py
- ✅ db.py

---

## Verification

After copying, verify:

```bash
# Check if files exist
ls Phase-3\backend\src\routes\
ls Phase-3\backend\src\services\
ls Phase-3\backend\src\schemas\
ls Phase-3\backend\src\middleware\

# Test the backend
cd Phase-3\backend
uvicorn src.main:app --reload
```

---

## What Gets Copied

### ✅ Production-Ready Features:
1. Complete authentication system
2. Task CRUD with soft delete
3. Notification system
4. Profile management with photo upload
5. Comprehensive error handling
6. Security middleware
7. Logging system
8. Input validation
9. User isolation
10. Rate limiting support

### 📊 Total APIs: 23 Endpoints
- Authentication: 4
- Tasks: 8
- Notifications: 7
- Profile: 4

---

## Notes

- Phase-3 mein already kuch files hain (chat.py, websocket.py)
- Wo files preserve rahegi
- Sirf Phase-2 ki files overwrite hongi
- Backup lena chahte ho toh pehle backup le lo

---

## Quick Command (All in One)

```powershell
# Single command to copy everything
Copy-Item "Phase-2\backend\src\routes\auth.py","Phase-2\backend\src\routes\tasks.py","Phase-2\backend\src\routes\notifications.py","Phase-2\backend\src\routes\profile.py","Phase-2\backend\src\main.py","Phase-2\backend\src\config.py","Phase-2\backend\src\db.py" "Phase-3\backend\src\" -Force; Copy-Item "Phase-2\backend\src\services\*","Phase-2\backend\src\schemas\*","Phase-2\backend\src\middleware\*" "Phase-3\backend\src\" -Force -Recurse
```
