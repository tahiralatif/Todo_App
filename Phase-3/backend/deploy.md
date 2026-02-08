# Deployment Configuration for AI Todo Chatbot Backend

## Docker Configuration (Optional)

If deploying with Docker, use the following Dockerfile:

```Dockerfile
FROM python:3.13-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Run the application
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

And docker-compose.yml:

```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - DEBUG=${DEBUG}
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=ai_todo_chatbot
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

## Environment Configuration for Production

### Required Environment Variables

```
DATABASE_URL=postgresql://username:password@hostname:port/database_name
BETTER_AUTH_SECRET=your_secure_jwt_secret
GEMINI_API_KEY=your_google_gemini_api_key
DEBUG=false
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### Recommended Production Settings

```
# Database
DATABASE_URL=postgresql://username:password@aws-rds-endpoint:5432/prod_database

# Security
BETTER_AUTH_SECRET=a_very_long_random_string_at_least_32_characters
DEBUG=false

# API
GEMINI_API_KEY=your_production_gemini_api_key

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## Deployment to Cloud Platforms

### Deploy to Render

Create a `render.yaml` file:

```yaml
services:
  - type: web
    name: ai-todo-chatbot-backend
    runtime: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn src.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: prod-db
          property: connectionString
      - key: BETTER_AUTH_SECRET
        sync: false
      - key: GEMINI_API_KEY
        sync: false
      - key: DEBUG
        value: false
databases:
  - name: prod-db
    region: oregon
    plan: free
```

### Deploy to Railway

Railway automatically detects Python applications. Just connect your GitHub repo and set the environment variables in the Railway dashboard.

### Deploy to Heroku

Procfile:
```
web: uvicorn src.main:app --host 0.0.0.0 --port $PORT
```

Set config vars in Heroku dashboard:
- DATABASE_URL
- BETTER_AUTH_SECRET
- GEMINI_API_KEY
- DEBUG

## Health Checks

The application provides a health check endpoint at `/health` that returns:
```json
{
  "status": "healthy"
}
```

## Scaling Recommendations

- Use a managed PostgreSQL service (AWS RDS, Google Cloud SQL, etc.)
- Implement connection pooling
- Use a CDN for static assets
- Monitor API usage for Google Gemini to stay within quotas
- Set up proper logging and monitoring

## Security Best Practices

- Never commit API keys to version control
- Use HTTPS in production
- Implement rate limiting
- Regularly rotate API keys
- Keep dependencies updated
- Use strong, randomly generated JWT secrets
- Validate and sanitize all user inputs
```

## Task 41: Final integration testing

Let me run a final test to verify the complete system works together:

```bash
cd F:\Documents\projects\quarter_04\hackathon\Todo_App\Phase-3\backend
pytest tests/test_integration.py -v
```

This would run the integration tests to verify that all components work together properly:
- Authentication system
- AI agent processing
- MCP tools execution
- Database operations
- Conversation management
- User isolation