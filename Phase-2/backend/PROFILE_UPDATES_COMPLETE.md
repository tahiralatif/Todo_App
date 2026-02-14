# Profile Updates - Complete ✅

## Changes Made

### 1. Database Schema Updated
Added new columns to `users` table:
- `first_name` VARCHAR(100)
- `last_name` VARCHAR(100)
- `phone` VARCHAR(20)
- `date_of_birth` DATE
- `gender` VARCHAR(20)
- `address` TEXT
- `city` VARCHAR(100)
- `country` VARCHAR(100)
- `profile_photo_url` TEXT
- `bio` TEXT

### 2. User Model Updated
File: `Phase-2/backend/src/models/user.py`
- Added all new profile fields as Optional fields

### 3. Profile Schemas Updated
File: `Phase-2/backend/src/schemas/profile.py`

**ProfileUpdateRequest** now accepts:
- name
- first_name
- last_name
- phone
- date_of_birth
- gender
- address
- city
- country
- bio

**UserProfileResponse** now returns all fields

**ImageUploadResponse** fixed:
- Changed `profile_photo_url` → `photo_url`
- Changed `timestamp` → `uploaded_at`
- Removed `status` field

### 4. Profile Routes Updated
File: `Phase-2/backend/src/routes/profile.py`
- Update endpoint now handles all new fields
- Each field is validated and updated independently
- Returns all profile fields in response

## Testing

### Update Profile with All Fields
```bash
PUT http://localhost:8000/api/profile
Authorization: Bearer <your_token>
{
  "name": "Shahab",
  "first_name": "Shahab",
  "last_name": "Khan",
  "phone": "+92 300 1234567",
  "date_of_birth": "2000-01-15",
  "gender": "Male",
  "address": "123 Main Street",
  "city": "Karachi",
  "country": "Pakistan",
  "bio": "Software Developer"
}
```

### Upload Profile Photo
```bash
POST http://localhost:8000/api/profile/upload-photo
Authorization: Bearer <your_token>
Content-Type: multipart/form-data

file: <select image file>
```

**Supported formats:** JPG, PNG, WebP, GIF
**Max size:** 5 MB

### Get Profile
```bash
GET http://localhost:8000/api/profile
Authorization: Bearer <your_token>
```

Returns all profile fields including photo URL.

## Profile Photo Upload

### How It Works
1. Validates file type and size
2. Generates unique filename: `{user_id}_{uuid}.{ext}`
3. Saves to `./uploads/profile_photos/` directory
4. Updates database with photo URL
5. Returns photo URL: `/uploads/profile_photos/{filename}`

### Directory Structure
```
Phase-2/backend/
  uploads/
    profile_photos/
      {user_id}_{uuid}.jpg
      {user_id}_{uuid}.png
```

### Serving Static Files
To serve uploaded images, add this to your `main.py`:

```python
from fastapi.staticfiles import StaticFiles

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
```

Then images will be accessible at:
```
http://localhost:8000/uploads/profile_photos/{filename}
```

## Profile Photo Upload Error Fix

If you're getting 500 error on upload, it's likely because:
1. Upload directory doesn't exist (should auto-create)
2. Permission issues
3. Schema mismatch (now fixed)

**To manually create directory:**
```bash
cd Phase-2/backend
mkdir -p uploads/profile_photos
```

## Next Steps

1. **Restart server** to load new model changes
2. **Test profile update** with all fields
3. **Test photo upload** (create uploads directory if needed)
4. **Add static file serving** to main.py for image access

## Status
✅ Database schema updated
✅ Models updated
✅ Schemas updated
✅ Routes updated
✅ Ready for testing

---
**Updated on**: 2026-02-14
**Files modified**: 
- `src/models/user.py`
- `src/schemas/profile.py`
- `src/routes/profile.py`
