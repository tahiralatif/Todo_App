---
title: Execute Todo Backend
emoji: ✅
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
app_port: 7860
---

# Execute Todo Backend

FastAPI backend for Execute Todo application with email notifications and task management.

## Features
- User authentication
- Task management (CRUD)
- Email notifications for due tasks
- Profile management with photo upload
- Contact form

## Environment Variables
Set these in Hugging Face Space settings:

- `DATABASE_URL`: PostgreSQL connection string
- `BETTER_AUTH_SECRET`: Authentication secret key
- `SMTP_USER`: Email address for sending notifications
- `SMTP_PASSWORD`: Email password/app password
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins

## API Documentation
Once deployed, visit:
- Swagger UI: `https://your-space-name.hf.space/docs`
- ReDoc: `https://your-space-name.hf.space/redoc`
