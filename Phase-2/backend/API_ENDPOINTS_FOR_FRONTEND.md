# Complete API Endpoints List for Frontend Integration

Base URL: `http://localhost:8000`

---

## 🔐 Authentication APIs

### 1. Sign Up
```
POST /api/auth/signup
Content-Type: application/json

Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response (201):
{
  "token": "eyJhbGc...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2026-02-14T10:30:00Z"
  }
}
```

### 2. Sign In
```
POST /api/auth/signin
Content-Type: application/json

Body:
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response (200):
{
  "token": "eyJhbGc...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2026-02-14T10:30:00Z"
  }
}
```

### 3. Logout
```
POST /api/auth/logout
Authorization: Bearer <token>

Response (200):
{
  "message": "Successfully logged out",
  "user_id": "uuid",
  "timestamp": "2026-02-14T10:30:00Z"
}
```

### 4. Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>

Response (200):
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2026-02-14T10:30:00Z"
}
```

---

## ✅ Tasks APIs

### 5. List All Tasks
```
GET /api/tasks?status=all&limit=50&offset=0&include_deleted=false
Authorization: Bearer <token>

Query Parameters:
- status: "all" | "pending" | "completed" | "deleted"
- date_from: ISO date (optional)
- date_to: ISO date (optional)
- include_deleted: boolean (default: false)

Response (200):
[
  {
    "id": 1,
    "user_id": "uuid",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "is_deleted": false,
    "deleted_at": null,
    "created_at": "2026-02-14T10:30:00Z",
    "updated_at": "2026-02-14T10:30:00Z"
  }
]
```

### 6. Get Single Task
```
GET /api/tasks/{task_id}
Authorization: Bearer <token>

Response (200):
{
  "id": 1,
  "user_id": "uuid",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "is_deleted": false,
  "deleted_at": null,
  "created_at": "2026-02-14T10:30:00Z",
  "updated_at": "2026-02-14T10:30:00Z"
}
```

### 7. Create Task
```
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"  // optional
}

Response (201):
{
  "id": 1,
  "user_id": "uuid",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "is_deleted": false,
  "deleted_at": null,
  "created_at": "2026-02-14T10:30:00Z",
  "updated_at": "2026-02-14T10:30:00Z"
}
```

### 8. Update Task (Full)
```
PUT /api/tasks/{task_id}
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "title": "Buy groceries updated",
  "description": "Milk, eggs, bread, butter",
  "completed": false
}

Response (200):
{
  "id": 1,
  "user_id": "uuid",
  "title": "Buy groceries updated",
  "description": "Milk, eggs, bread, butter",
  "completed": false,
  "is_deleted": false,
  "deleted_at": null,
  "created_at": "2026-02-14T10:30:00Z",
  "updated_at": "2026-02-14T11:00:00Z"
}
```

### 9. Update Task (Partial)
```
PATCH /api/tasks/{task_id}
Authorization: Bearer <token>
Content-Type: application/json

Body (send only fields to update):
{
  "title": "New title"
}

Response (200):
{
  "id": 1,
  "user_id": "uuid",
  "title": "New title",
  "description": "Milk, eggs, bread",
  "completed": false,
  "is_deleted": false,
  "deleted_at": null,
  "created_at": "2026-02-14T10:30:00Z",
  "updated_at": "2026-02-14T11:00:00Z"
}
```

### 10. Toggle Task Complete
```
PATCH /api/tasks/{task_id}/complete
Authorization: Bearer <token>

Response (200):
{
  "id": 1,
  "user_id": "uuid",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": true,  // toggled
  "is_deleted": false,
  "deleted_at": null,
  "created_at": "2026-02-14T10:30:00Z",
  "updated_at": "2026-02-14T11:00:00Z"
}
```

### 11. Delete Task (Soft Delete)
```
DELETE /api/tasks/{task_id}
Authorization: Bearer <token>

Response (204): No Content
```

### 12. Restore Deleted Task
```
POST /api/tasks/{task_id}/restore
Authorization: Bearer <token>

Response (200):
{
  "id": 1,
  "user_id": "uuid",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "is_deleted": false,  // restored
  "deleted_at": null,
  "created_at": "2026-02-14T10:30:00Z",
  "updated_at": "2026-02-14T11:00:00Z"
}
```

---

## 🔔 Notifications APIs

### 13. List Notifications
```
GET /api/notifications?limit=50&offset=0&unread_only=false&sort=desc
Authorization: Bearer <token>

Query Parameters:
- limit: number (default: 50)
- offset: number (default: 0)
- unread_only: boolean (default: false)
- sort: "asc" | "desc" (default: "desc")

Response (200):
[
  {
    "id": 1,
    "user_id": "uuid",
    "type": "TASK_CREATED",
    "title": "Task Created",
    "message": "New task 'Buy groceries' created",
    "is_read": false,
    "created_at": "2026-02-14T10:30:00Z",
    "task_id": 1
  }
]
```

### 14. Get Single Notification
```
GET /api/notifications/{notification_id}
Authorization: Bearer <token>

Response (200):
{
  "id": 1,
  "user_id": "uuid",
  "type": "TASK_CREATED",
  "title": "Task Created",
  "message": "New task 'Buy groceries' created",
  "is_read": false,
  "created_at": "2026-02-14T10:30:00Z",
  "task_id": 1
}
```

### 15. Mark Notification as Read
```
PUT /api/notifications/{notification_id}
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "is_read": true
}

Response (200):
{
  "id": 1,
  "user_id": "uuid",
  "type": "TASK_CREATED",
  "title": "Task Created",
  "message": "New task 'Buy groceries' created",
  "is_read": true,  // updated
  "created_at": "2026-02-14T10:30:00Z",
  "task_id": 1
}
```

### 16. Mark All Notifications as Read
```
PUT /api/notifications/mark-all-read
Authorization: Bearer <token>

Response (200):
{
  "message": "5 notifications marked as read",
  "count": 5
}
```

### 17. Delete Single Notification
```
DELETE /api/notifications/{notification_id}
Authorization: Bearer <token>

Response (204): No Content
```

### 18. Delete All Notifications
```
DELETE /api/notifications
Authorization: Bearer <token>

Response (200):
{
  "message": "All notifications deleted successfully",
  "count": 10,
  "timestamp": "2026-02-14T10:30:00Z"
}
```

### 19. Get Unread Count
```
GET /api/notifications/unread/count
Authorization: Bearer <token>

Response (200):
{
  "count": 5,
  "timestamp": "2026-02-14T10:30:00Z"
}
```

---

## 👤 Profile APIs

### 20. Get Profile
```
GET /api/profile
Authorization: Bearer <token>

Response (200):
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+92 300 1234567",
  "date_of_birth": "2000-01-15",
  "gender": "Male",
  "address": "123 Main Street",
  "city": "Karachi",
  "country": "Pakistan",
  "profile_photo_url": "https://mtsxttzevkrmusvwddnt.supabase.co/storage/v1/object/public/profile-photos/user_id/uuid.jpg",
  "bio": "Software Developer",
  "created_at": "2026-02-14T10:30:00Z",
  "updated_at": "2026-02-14T11:00:00Z"
}
```

### 21. Update Profile
```
PUT /api/profile
Authorization: Bearer <token>
Content-Type: application/json

Body (all fields optional):
{
  "name": "John Doe",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+92 300 1234567",
  "date_of_birth": "2000-01-15",
  "gender": "Male",
  "address": "123 Main Street",
  "city": "Karachi",
  "country": "Pakistan",
  "bio": "Software Developer"
}

Response (200):
{
  "message": "Profile updated successfully",
  "updated_fields": ["name", "phone", "bio"],
  "profile": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+92 300 1234567",
    "date_of_birth": "2000-01-15",
    "gender": "Male",
    "address": "123 Main Street",
    "city": "Karachi",
    "country": "Pakistan",
    "profile_photo_url": "https://...",
    "bio": "Software Developer",
    "created_at": "2026-02-14T10:30:00Z",
    "updated_at": "2026-02-14T11:00:00Z"
  }
}
```

### 22. Upload Profile Photo
```
POST /api/profile/upload-photo
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
file: <image file> (JPG, PNG, WebP, GIF, max 5MB)

Response (200):
{
  "message": "Profile photo uploaded successfully",
  "photo_url": "https://mtsxttzevkrmusvwddnt.supabase.co/storage/v1/object/public/profile-photos/user_id/uuid.jpg",
  "uploaded_at": "2026-02-14T10:30:00Z"
}
```

### 23. Delete Profile Photo
```
DELETE /api/profile/photo
Authorization: Bearer <token>

Response (200):
{
  "message": "Profile photo deleted successfully",
  "timestamp": "2026-02-14T10:30:00Z"
}
```

---

## 🏥 Health Check

### 24. Health Check
```
GET /health

Response (200):
{
  "status": "healthy",
  "timestamp": "2026-02-14T10:30:00Z"
}
```

---

## 📊 WebSocket

### 25. WebSocket Stats
```
GET /ws/stats

Response (200):
{
  "active_connections": 5,
  "total_messages": 150
}
```

---

## 🔑 Authentication Header

For all protected endpoints, include JWT token in header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📝 Notification Types

- `SIGNUP` - User signed up
- `LOGIN` - User logged in
- `LOGOUT` - User logged out
- `TASK_CREATED` - Task created
- `TASK_UPDATED` - Task updated
- `TASK_DELETED` - Task deleted
- `TASK_COMPLETED` - Task marked complete
- `TASK_PENDING` - Task marked pending
- `PROFILE_UPDATED` - Profile updated

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "detail": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "detail": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "detail": "Access denied"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 409 Conflict
```json
{
  "detail": "Email already registered"
}
```

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "Invalid email format",
      "type": "value_error"
    }
  ]
}
```

### 429 Too Many Requests
```json
{
  "detail": "Too many requests. Please try again later."
}
```

### 500 Internal Server Error
```json
{
  "detail": "An unexpected error occurred"
}
```

---

## 🚀 Frontend Integration Tips

### 1. Axios Setup
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to all requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### 2. Example Usage
```javascript
// Sign up
const signup = async (name, email, password) => {
  const response = await api.post('/api/auth/signup', {
    name, email, password
  });
  localStorage.setItem('token', response.data.token);
  return response.data;
};

// Get tasks
const getTasks = async () => {
  const response = await api.get('/api/tasks');
  return response.data;
};

// Upload photo
const uploadPhoto = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/api/profile/upload-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};
```

### 3. Error Handling
```javascript
try {
  const data = await getTasks();
} catch (error) {
  if (error.response?.status === 401) {
    // Redirect to login
  } else {
    console.error(error.response?.data?.detail);
  }
}
```

---

## 📚 API Documentation

Interactive API docs available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

**Total APIs**: 25 (excluding health & websocket stats)
**Base URL**: http://localhost:8000
**Authentication**: JWT Bearer Token
**Last Updated**: 2026-02-14
