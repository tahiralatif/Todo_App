# 🚀 Advanced Features Implementation Plan

## Overview
Ye document Phase-2 backend mein advanced features add karne ka complete roadmap hai.

---

## 📋 Features List

### ✅ 1. Smart Task Creation
### ⏰ 2. Smart Reminders (Email + Push)
### 🔁 3. Recurring Tasks
### 🧠 4. AI Priority Suggestion
### 📊 5. Productivity Analytics
### 📅 6. Calendar View
### 🏷 7. Tags & Categories
### 📍 8. Location-based Reminders
### 👥 9. Team Collaboration

---

## Implementation Priority

### Phase 1 (Immediate - 1-2 weeks)
1. Tags & Categories
2. Recurring Tasks
3. Calendar View

### Phase 2 (Short-term - 2-4 weeks)
4. Smart Reminders (Email + Push)
5. Productivity Analytics
6. Smart Task Creation

### Phase 3 (Medium-term - 1-2 months)
7. AI Priority Suggestion
8. Team Collaboration

### Phase 4 (Future)
9. Location-based Reminders

---


## 🏷 Feature 1: Tags & Categories

### Database Changes

**New Table: `tags`**
```sql
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7),  -- Hex color code
    user_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(name, user_id)
);
```

**New Table: `task_tags`** (Many-to-Many)
```sql
CREATE TABLE task_tags (
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, tag_id)
);
```

**New Table: `categories`**
```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7),
    icon VARCHAR(50),
    user_id VARCHAR(36) NOT NULL,
    parent_id INTEGER REFERENCES categories(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(name, user_id)
);
```

**Update `tasks` table:**
```sql
ALTER TABLE tasks ADD COLUMN category_id INTEGER REFERENCES categories(id);
```

### New Models (src/models/tag.py)
```python
from sqlmodel import Field, Relationship, SQLModel
from typing import List, Optional

class Tag(SQLModel, table=True):
    __tablename__ = "tags"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=50)
    color: Optional[str] = Field(default="#3B82F6", max_length=7)
    user_id: str = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    user: Optional["User"] = Relationship(back_populates="tags")
    tasks: List["Task"] = Relationship(back_populates="tags", link_model=TaskTag)

class TaskTag(SQLModel, table=True):
    __tablename__ = "task_tags"
    
    task_id: int = Field(foreign_key="tasks.id", primary_key=True)
    tag_id: int = Field(foreign_key="tags.id", primary_key=True)

class Category(SQLModel, table=True):
    __tablename__ = "categories"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100)
    description: Optional[str] = None
    color: Optional[str] = Field(default="#10B981", max_length=7)
    icon: Optional[str] = Field(default="📁", max_length=50)
    user_id: str = Field(foreign_key="users.id", index=True)
    parent_id: Optional[int] = Field(default=None, foreign_key="categories.id")
    created_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    user: Optional["User"] = Relationship(back_populates="categories")
    tasks: List["Task"] = Relationship(back_populates="category")
    subcategories: List["Category"] = Relationship(back_populates="parent")
    parent: Optional["Category"] = Relationship(back_populates="subcategories")
```

### New APIs

**Tags APIs:**
- `POST /api/tags` - Create tag
- `GET /api/tags` - List user's tags
- `PUT /api/tags/{tag_id}` - Update tag
- `DELETE /api/tags/{tag_id}` - Delete tag
- `POST /api/tasks/{task_id}/tags` - Add tags to task
- `DELETE /api/tasks/{task_id}/tags/{tag_id}` - Remove tag from task

**Categories APIs:**
- `POST /api/categories` - Create category
- `GET /api/categories` - List categories (tree structure)
- `PUT /api/categories/{category_id}` - Update category
- `DELETE /api/categories/{category_id}` - Delete category
- `GET /api/categories/{category_id}/tasks` - Get tasks by category

---


## 🔁 Feature 2: Recurring Tasks

### Database Changes

**Update `tasks` table:**
```sql
ALTER TABLE tasks ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN recurrence_pattern JSONB;
ALTER TABLE tasks ADD COLUMN parent_task_id INTEGER REFERENCES tasks(id);
ALTER TABLE tasks ADD COLUMN next_occurrence TIMESTAMP;
```

**Recurrence Pattern JSON Structure:**
```json
{
  "type": "daily|weekly|monthly|yearly|custom",
  "interval": 1,
  "days_of_week": [0, 1, 2, 3, 4],  // 0=Sunday, 6=Saturday
  "day_of_month": 15,
  "month": 3,
  "end_date": "2024-12-31",
  "occurrences": 10,
  "time": "09:00:00"
}
```

### Update Task Model
```python
class Task(SQLModel, table=True):
    # ... existing fields ...
    is_recurring: bool = Field(default=False)
    recurrence_pattern: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    parent_task_id: Optional[int] = Field(default=None, foreign_key="tasks.id")
    next_occurrence: Optional[datetime] = None
    
    # Relationships
    parent_task: Optional["Task"] = Relationship(back_populates="child_tasks")
    child_tasks: List["Task"] = Relationship(back_populates="parent_task")
```

### New Service (src/services/recurring_task_service.py)
```python
class RecurringTaskService:
    @staticmethod
    async def create_recurring_task(
        session: AsyncSession,
        task: Task,
        recurrence_pattern: dict
    ) -> Task:
        """Create a recurring task with pattern"""
        pass
    
    @staticmethod
    async def generate_next_occurrence(
        session: AsyncSession,
        parent_task: Task
    ) -> Optional[Task]:
        """Generate next occurrence of recurring task"""
        pass
    
    @staticmethod
    async def update_recurrence_pattern(
        session: AsyncSession,
        task_id: int,
        pattern: dict
    ) -> Task:
        """Update recurrence pattern"""
        pass
```

### Background Job (Celery/APScheduler)
```python
# src/jobs/recurring_tasks.py
from apscheduler.schedulers.asyncio import AsyncIOScheduler

scheduler = AsyncIOScheduler()

@scheduler.scheduled_job('interval', minutes=5)
async def check_recurring_tasks():
    """Check and create next occurrences"""
    # Find tasks where next_occurrence <= now
    # Create new task instances
    # Update next_occurrence
    pass
```

### New APIs
- `POST /api/tasks/recurring` - Create recurring task
- `PUT /api/tasks/{task_id}/recurrence` - Update recurrence pattern
- `DELETE /api/tasks/{task_id}/recurrence` - Stop recurrence
- `GET /api/tasks/recurring` - List all recurring tasks
- `POST /api/tasks/{task_id}/skip-occurrence` - Skip next occurrence

---


## ⏰ Feature 3: Smart Reminders (Email + Push)

### Database Changes

**New Table: `reminders`**
```sql
CREATE TABLE reminders (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    user_id VARCHAR(36) REFERENCES users(id),
    reminder_time TIMESTAMP NOT NULL,
    reminder_type VARCHAR(20) NOT NULL,  -- email, push, both
    status VARCHAR(20) DEFAULT 'pending',  -- pending, sent, failed
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**New Table: `push_subscriptions`**
```sql
CREATE TABLE push_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id),
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    device_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, endpoint)
);
```

### New Models
```python
class Reminder(SQLModel, table=True):
    __tablename__ = "reminders"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    task_id: int = Field(foreign_key="tasks.id")
    user_id: str = Field(foreign_key="users.id")
    reminder_time: datetime
    reminder_type: str = Field(max_length=20)  # email, push, both
    status: str = Field(default="pending", max_length=20)
    sent_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    task: Optional["Task"] = Relationship(back_populates="reminders")
    user: Optional["User"] = Relationship(back_populates="reminders")

class PushSubscription(SQLModel, table=True):
    __tablename__ = "push_subscriptions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id")
    endpoint: str
    p256dh: str
    auth: str
    device_name: Optional[str] = Field(max_length=100)
    created_at: datetime = Field(default_factory=datetime.now)
```

### Email Service (src/services/email_service.py)
```python
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
import os

class EmailService:
    conf = ConnectionConfig(
        MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
        MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
        MAIL_FROM=os.getenv("MAIL_FROM"),
        MAIL_PORT=587,
        MAIL_SERVER="smtp.gmail.com",
        MAIL_STARTTLS=True,
        MAIL_SSL_TLS=False,
        USE_CREDENTIALS=True
    )
    
    @staticmethod
    async def send_task_reminder(
        email: str,
        task_title: str,
        reminder_time: datetime
    ):
        """Send task reminder email"""
        message = MessageSchema(
            subject=f"Reminder: {task_title}",
            recipients=[email],
            body=f"""
            <h2>Task Reminder</h2>
            <p>This is a reminder for your task: <strong>{task_title}</strong></p>
            <p>Scheduled for: {reminder_time}</p>
            """,
            subtype="html"
        )
        
        fm = FastMail(EmailService.conf)
        await fm.send_message(message)
```

### Push Notification Service (src/services/push_service.py)
```python
from pywebpush import webpush, WebPushException
import json

class PushNotificationService:
    VAPID_PRIVATE_KEY = os.getenv("VAPID_PRIVATE_KEY")
    VAPID_PUBLIC_KEY = os.getenv("VAPID_PUBLIC_KEY")
    VAPID_CLAIMS = {"sub": "mailto:your-email@example.com"}
    
    @staticmethod
    async def send_push_notification(
        subscription: PushSubscription,
        title: str,
        body: str,
        data: dict = None
    ):
        """Send web push notification"""
        try:
            webpush(
                subscription_info={
                    "endpoint": subscription.endpoint,
                    "keys": {
                        "p256dh": subscription.p256dh,
                        "auth": subscription.auth
                    }
                },
                data=json.dumps({
                    "title": title,
                    "body": body,
                    "data": data or {}
                }),
                vapid_private_key=PushNotificationService.VAPID_PRIVATE_KEY,
                vapid_claims=PushNotificationService.VAPID_CLAIMS
            )
            return True
        except WebPushException as e:
            print(f"Push failed: {e}")
            return False
```

### Background Job
```python
@scheduler.scheduled_job('interval', minutes=1)
async def check_reminders():
    """Check and send due reminders"""
    now = datetime.now()
    # Find reminders where reminder_time <= now AND status = 'pending'
    # Send email/push based on reminder_type
    # Update status to 'sent'
    pass
```

### New APIs
- `POST /api/reminders` - Create reminder for task
- `GET /api/reminders` - List user's reminders
- `PUT /api/reminders/{reminder_id}` - Update reminder
- `DELETE /api/reminders/{reminder_id}` - Delete reminder
- `POST /api/push/subscribe` - Subscribe to push notifications
- `DELETE /api/push/unsubscribe` - Unsubscribe from push
- `GET /api/push/vapid-public-key` - Get VAPID public key

### Environment Variables Needed
```bash
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@yourdomain.com
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_PUBLIC_KEY=your-vapid-public-key
```

---


## 📅 Feature 4: Calendar View

### Database Changes

**Update `tasks` table:**
```sql
ALTER TABLE tasks ADD COLUMN due_date TIMESTAMP;
ALTER TABLE tasks ADD COLUMN start_date TIMESTAMP;
ALTER TABLE tasks ADD COLUMN all_day BOOLEAN DEFAULT FALSE;
```

### Update Task Model
```python
class Task(SQLModel, table=True):
    # ... existing fields ...
    due_date: Optional[datetime] = None
    start_date: Optional[datetime] = None
    all_day: bool = Field(default=False)
```

### New Service Methods
```python
class CalendarService:
    @staticmethod
    async def get_tasks_by_date_range(
        session: AsyncSession,
        user_id: str,
        start_date: datetime,
        end_date: datetime
    ) -> List[Task]:
        """Get tasks within date range"""
        pass
    
    @staticmethod
    async def get_tasks_by_month(
        session: AsyncSession,
        user_id: str,
        year: int,
        month: int
    ) -> Dict[str, List[Task]]:
        """Get tasks grouped by day for a month"""
        pass
    
    @staticmethod
    async def get_tasks_by_week(
        session: AsyncSession,
        user_id: str,
        year: int,
        week: int
    ) -> Dict[str, List[Task]]:
        """Get tasks for a specific week"""
        pass
```

### New APIs
- `GET /api/calendar/month/{year}/{month}` - Get month view
- `GET /api/calendar/week/{year}/{week}` - Get week view
- `GET /api/calendar/day/{date}` - Get day view
- `GET /api/calendar/range?start={date}&end={date}` - Get custom range
- `GET /api/calendar/upcoming` - Get upcoming tasks (next 7 days)
- `GET /api/calendar/overdue` - Get overdue tasks

### Response Format
```json
{
  "month": 2,
  "year": 2024,
  "days": {
    "2024-02-01": [
      {
        "id": 1,
        "title": "Task 1",
        "start_date": "2024-02-01T09:00:00",
        "due_date": "2024-02-01T17:00:00",
        "all_day": false,
        "completed": false
      }
    ],
    "2024-02-02": []
  }
}
```

---


## 🧠 Feature 5: AI Priority Suggestion

### Database Changes

**Update `tasks` table:**
```sql
ALTER TABLE tasks ADD COLUMN priority VARCHAR(20) DEFAULT 'medium';
ALTER TABLE tasks ADD COLUMN ai_priority_score FLOAT;
ALTER TABLE tasks ADD COLUMN urgency_score FLOAT;
ALTER TABLE tasks ADD COLUMN importance_score FLOAT;
```

### Update Task Model
```python
class Task(SQLModel, table=True):
    # ... existing fields ...
    priority: str = Field(default="medium", max_length=20)  # low, medium, high, urgent
    ai_priority_score: Optional[float] = None  # 0-100
    urgency_score: Optional[float] = None
    importance_score: Optional[float] = None
```

### AI Service (src/services/ai_service.py)
```python
from openai import AsyncOpenAI
import os

class AIService:
    client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    @staticmethod
    async def calculate_priority_score(
        task_title: str,
        task_description: str,
        due_date: Optional[datetime],
        tags: List[str] = []
    ) -> dict:
        """
        Calculate AI-based priority score
        Returns: {
            "priority": "high",
            "score": 85.5,
            "urgency": 90.0,
            "importance": 80.0,
            "reasoning": "..."
        }
        """
        
        # Calculate urgency based on due date
        urgency = AIService._calculate_urgency(due_date)
        
        # Use AI to analyze importance
        prompt = f"""
        Analyze this task and rate its importance (0-100):
        Title: {task_title}
        Description: {task_description}
        Tags: {', '.join(tags)}
        
        Consider:
        - Impact on goals
        - Consequences of not doing it
        - Value it provides
        
        Return JSON: {{"importance": score, "reasoning": "brief explanation"}}
        """
        
        response = await AIService.client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        ai_result = json.loads(response.choices[0].message.content)
        importance = ai_result["importance"]
        
        # Calculate overall priority score (Eisenhower Matrix)
        priority_score = (urgency * 0.4) + (importance * 0.6)
        
        # Determine priority level
        if priority_score >= 80:
            priority = "urgent"
        elif priority_score >= 60:
            priority = "high"
        elif priority_score >= 40:
            priority = "medium"
        else:
            priority = "low"
        
        return {
            "priority": priority,
            "score": priority_score,
            "urgency": urgency,
            "importance": importance,
            "reasoning": ai_result["reasoning"]
        }
    
    @staticmethod
    def _calculate_urgency(due_date: Optional[datetime]) -> float:
        """Calculate urgency based on due date"""
        if not due_date:
            return 30.0  # Low urgency if no due date
        
        now = datetime.now()
        time_left = (due_date - now).total_seconds()
        
        if time_left < 0:
            return 100.0  # Overdue = max urgency
        
        hours_left = time_left / 3600
        
        if hours_left < 24:
            return 95.0
        elif hours_left < 72:
            return 80.0
        elif hours_left < 168:  # 1 week
            return 60.0
        elif hours_left < 720:  # 1 month
            return 40.0
        else:
            return 20.0
    
    @staticmethod
    async def suggest_task_breakdown(task_title: str, task_description: str) -> List[dict]:
        """AI suggests breaking down complex tasks into subtasks"""
        prompt = f"""
        Break down this task into 3-5 actionable subtasks:
        Title: {task_title}
        Description: {task_description}
        
        Return JSON array: [{{"title": "subtask", "estimated_time": "30 min"}}]
        """
        
        response = await AIService.client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        return json.loads(response.choices[0].message.content)["subtasks"]
    
    @staticmethod
    async def suggest_optimal_time(
        task_title: str,
        user_productivity_data: dict
    ) -> dict:
        """Suggest best time to do task based on user's productivity patterns"""
        # Analyze user's completion patterns
        # Suggest optimal time slot
        pass
```

### New APIs
- `POST /api/ai/analyze-priority` - Get AI priority suggestion
- `POST /api/ai/suggest-breakdown` - Get subtask suggestions
- `POST /api/ai/suggest-time` - Get optimal time suggestion
- `POST /api/tasks/{task_id}/apply-ai-priority` - Apply AI priority to task
- `GET /api/tasks/by-priority` - Get tasks sorted by AI priority

### Environment Variables
```bash
OPENAI_API_KEY=your-openai-api-key
```

---


## 📊 Feature 6: Productivity Analytics

### Database Changes

**New Table: `productivity_stats`**
```sql
CREATE TABLE productivity_stats (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id),
    date DATE NOT NULL,
    tasks_completed INTEGER DEFAULT 0,
    tasks_created INTEGER DEFAULT 0,
    total_tasks INTEGER DEFAULT 0,
    completion_rate FLOAT DEFAULT 0,
    focus_time_minutes INTEGER DEFAULT 0,
    most_productive_hour INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, date)
);
```

**New Table: `task_time_logs`**
```sql
CREATE TABLE task_time_logs (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    user_id VARCHAR(36) REFERENCES users(id),
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP,
    duration_minutes INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### New Models
```python
class ProductivityStats(SQLModel, table=True):
    __tablename__ = "productivity_stats"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id")
    date: date
    tasks_completed: int = Field(default=0)
    tasks_created: int = Field(default=0)
    total_tasks: int = Field(default=0)
    completion_rate: float = Field(default=0.0)
    focus_time_minutes: int = Field(default=0)
    most_productive_hour: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.now)

class TaskTimeLog(SQLModel, table=True):
    __tablename__ = "task_time_logs"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    task_id: int = Field(foreign_key="tasks.id")
    user_id: str = Field(foreign_key="users.id")
    started_at: datetime
    ended_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.now)
```

### Analytics Service (src/services/analytics_service.py)
```python
class AnalyticsService:
    @staticmethod
    async def get_daily_stats(
        session: AsyncSession,
        user_id: str,
        date: date
    ) -> dict:
        """Get productivity stats for a specific day"""
        pass
    
    @staticmethod
    async def get_weekly_stats(
        session: AsyncSession,
        user_id: str,
        year: int,
        week: int
    ) -> dict:
        """Get weekly productivity summary"""
        pass
    
    @staticmethod
    async def get_monthly_stats(
        session: AsyncSession,
        user_id: str,
        year: int,
        month: int
    ) -> dict:
        """Get monthly productivity summary"""
        pass
    
    @staticmethod
    async def get_productivity_trends(
        session: AsyncSession,
        user_id: str,
        days: int = 30
    ) -> dict:
        """Get productivity trends over time"""
        pass
    
    @staticmethod
    async def get_category_breakdown(
        session: AsyncSession,
        user_id: str,
        start_date: date,
        end_date: date
    ) -> dict:
        """Get task completion by category"""
        pass
    
    @staticmethod
    async def get_time_distribution(
        session: AsyncSession,
        user_id: str
    ) -> dict:
        """Get hourly productivity distribution"""
        pass
    
    @staticmethod
    async def calculate_completion_rate(
        session: AsyncSession,
        user_id: str,
        period: str = "week"  # day, week, month, year
    ) -> float:
        """Calculate task completion rate"""
        pass
    
    @staticmethod
    async def get_streak_data(
        session: AsyncSession,
        user_id: str
    ) -> dict:
        """Get current streak and longest streak"""
        pass
```

### New APIs
- `GET /api/analytics/dashboard` - Overall dashboard stats
- `GET /api/analytics/daily/{date}` - Daily stats
- `GET /api/analytics/weekly/{year}/{week}` - Weekly stats
- `GET /api/analytics/monthly/{year}/{month}` - Monthly stats
- `GET /api/analytics/trends?days=30` - Productivity trends
- `GET /api/analytics/categories` - Category breakdown
- `GET /api/analytics/time-distribution` - Hourly distribution
- `GET /api/analytics/streaks` - Streak information
- `POST /api/analytics/time-log/start` - Start time tracking
- `POST /api/analytics/time-log/stop` - Stop time tracking
- `GET /api/analytics/export?format=csv` - Export analytics data

### Response Example
```json
{
  "dashboard": {
    "today": {
      "completed": 5,
      "created": 3,
      "completion_rate": 71.4,
      "focus_time": 180
    },
    "week": {
      "completed": 28,
      "created": 35,
      "completion_rate": 80.0,
      "total_focus_time": 1200
    },
    "month": {
      "completed": 120,
      "created": 145,
      "completion_rate": 82.8
    },
    "streaks": {
      "current": 7,
      "longest": 15
    },
    "most_productive_hour": 10,
    "top_category": "Work"
  }
}
```

---


## ✅ Feature 7: Smart Task Creation

### AI-Powered Task Creation

**Update Task Creation API to support smart features:**

### Enhanced Task Model
```python
class Task(SQLModel, table=True):
    # ... existing fields ...
    estimated_duration: Optional[int] = None  # minutes
    actual_duration: Optional[int] = None
    difficulty: Optional[str] = None  # easy, medium, hard
    energy_level: Optional[str] = None  # low, medium, high
    context: Optional[str] = None  # work, home, errands, etc.
```

### Smart Creation Service
```python
class SmartTaskService:
    @staticmethod
    async def create_smart_task(
        session: AsyncSession,
        user_id: str,
        natural_language_input: str
    ) -> Task:
        """
        Parse natural language and create task with smart defaults
        
        Examples:
        - "Buy groceries tomorrow at 5pm"
        - "Call mom every Sunday at 10am"
        - "Submit report by Friday high priority"
        """
        
        # Use AI to parse input
        parsed = await AIService.parse_task_input(natural_language_input)
        
        # Extract components
        task_data = {
            "title": parsed["title"],
            "description": parsed.get("description"),
            "due_date": parsed.get("due_date"),
            "priority": parsed.get("priority", "medium"),
            "tags": parsed.get("tags", []),
            "is_recurring": parsed.get("is_recurring", False),
            "recurrence_pattern": parsed.get("recurrence_pattern"),
            "estimated_duration": parsed.get("estimated_duration")
        }
        
        # Create task
        task = await create_task(session, user_id, **task_data)
        
        # Auto-suggest related tasks
        suggestions = await AIService.suggest_related_tasks(task.title)
        
        return task, suggestions
    
    @staticmethod
    async def auto_categorize(
        task_title: str,
        task_description: str,
        existing_categories: List[Category]
    ) -> Optional[Category]:
        """AI suggests best category for task"""
        pass
    
    @staticmethod
    async def auto_tag(
        task_title: str,
        task_description: str,
        existing_tags: List[Tag]
    ) -> List[Tag]:
        """AI suggests relevant tags"""
        pass
    
    @staticmethod
    async def estimate_duration(
        task_title: str,
        task_description: str,
        historical_data: List[Task]
    ) -> int:
        """AI estimates task duration based on similar tasks"""
        pass
```

### Natural Language Processing
```python
class AIService:
    @staticmethod
    async def parse_task_input(text: str) -> dict:
        """Parse natural language task input"""
        
        prompt = f"""
        Parse this task description and extract structured data:
        "{text}"
        
        Extract:
        - title (main task)
        - description (details)
        - due_date (if mentioned, ISO format)
        - priority (low/medium/high/urgent)
        - tags (relevant keywords)
        - is_recurring (true/false)
        - recurrence_pattern (if recurring)
        - estimated_duration (in minutes)
        
        Return JSON with these fields.
        """
        
        response = await AIService.client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        return json.loads(response.choices[0].message.content)
```

### New APIs
- `POST /api/tasks/smart-create` - Create task from natural language
- `POST /api/tasks/parse` - Parse natural language (preview)
- `POST /api/tasks/{task_id}/auto-categorize` - Auto-categorize task
- `POST /api/tasks/{task_id}/auto-tag` - Auto-tag task
- `POST /api/tasks/{task_id}/estimate-duration` - Estimate duration

### Request Example
```json
{
  "input": "Buy groceries tomorrow at 5pm, need milk, eggs, bread"
}
```

### Response Example
```json
{
  "task": {
    "id": 123,
    "title": "Buy groceries",
    "description": "Need milk, eggs, bread",
    "due_date": "2024-02-14T17:00:00",
    "priority": "medium",
    "tags": ["shopping", "groceries"],
    "estimated_duration": 30
  },
  "suggestions": [
    "Create shopping list",
    "Check pantry inventory",
    "Compare prices online"
  ]
}
```

---

