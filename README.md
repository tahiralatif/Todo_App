# 🚀 Execute - Premium Todo Application

A modern, feature-rich todo application with email notifications, analytics, and a beautiful UI.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Python](https://img.shields.io/badge/Python-3.11-yellow)

## ✨ Features

### 🎯 Core Features
- ✅ User Authentication (Signup/Login with JWT)
- ✅ Task Management (Create, Read, Update, Delete)
- ✅ Priority Levels (LOW, MEDIUM, HIGH)
- ✅ Due Date & Time Management
- ✅ Task Filtering & Search
- ✅ Soft Delete with Restore

### 📧 Notifications
- ✅ Email Notifications (Beautiful HTML templates)
- ✅ In-App Notifications
- ✅ Automatic Reminders (15 minutes before due)
- ✅ Background Scheduler

### 👤 User Features
- ✅ Profile Management
- ✅ Profile Photo Upload (Supabase Storage)
- ✅ Image Cropping & Rotation
- ✅ Bio & Personal Info

### 📊 Analytics
- ✅ Task Statistics Dashboard
- ✅ Completion Rate Tracking
- ✅ Activity Overview Charts
- ✅ Weekly/Monthly Views
- ✅ Priority Distribution

### 🎨 UI/UX
- ✅ Premium Silicon Valley Style Design
- ✅ Glassmorphism Effects
- ✅ Smooth Animations (Framer Motion)
- ✅ Responsive Design
- ✅ Dark Mode
- ✅ Real-time Updates

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **HTTP Client:** Axios

### Backend
- **Framework:** FastAPI (Python)
- **Database:** PostgreSQL (Neon)
- **ORM:** SQLModel
- **Authentication:** JWT
- **Email:** SMTP (Gmail)
- **Storage:** Supabase
- **Scheduler:** AsyncIO

## 📁 Project Structure

```
Todo_App/
├── Phase-1/                    # Initial prototype
└── Phase-2/                    # Production version
    ├── frontend/               # Next.js frontend
    │   ├── src/
    │   │   ├── app/           # App router pages
    │   │   ├── components/    # React components
    │   │   ├── contexts/      # React contexts
    │   │   ├── lib/           # Utilities
    │   │   └── types/         # TypeScript types
    │   └── public/            # Static assets
    │
    └── backend/               # FastAPI backend
        ├── src/
        │   ├── models/        # Database models
        │   ├── routes/        # API endpoints
        │   ├── services/      # Business logic
        │   ├── schemas/       # Pydantic schemas
        │   └── middleware/    # Custom middleware
        └── tests/             # Unit tests
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Python 3.11+
- PostgreSQL (or Neon account)
- Gmail account (for SMTP)

### Installation

#### 1. Clone Repository
```bash
git clone <your-repo-url>
cd Todo_App/Phase-2
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Update .env.local with your values
npm run dev
```

#### 3. Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Update .env with your values
uvicorn src.main:app --reload
```

### Environment Variables

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
```

#### Backend (.env)
```env
DATABASE_URL=postgresql+asyncpg://user:pass@host/db
BETTER_AUTH_SECRET=your_secret_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

## 📧 Email Notifications

The app sends beautiful HTML email notifications when tasks are due:

- **Trigger:** 15 minutes before task due time
- **Frequency:** Checked every 60 seconds
- **Template:** Professional gradient design
- **Content:** Task details, priority, due date, action button

## 🎨 UI Screenshots

### Dashboard
- Premium glassmorphism cards
- Real-time statistics
- Quick actions
- Recent activity

### Tasks Page
- Silicon Valley style design
- Priority badges with icons
- Due date indicators
- Smooth animations

### Analytics
- Interactive charts
- Weekly/Monthly toggle
- Activity overview
- Completion trends

## 🔐 Security

- ✅ JWT Authentication
- ✅ Password hashing
- ✅ CORS protection
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ Environment variables for secrets
- ✅ HTTPS ready

## 📦 Deployment

See [DEPLOYMENT_GUIDE.md](Phase-2/DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### Quick Deploy

**Frontend (Vercel):**
```bash
cd Phase-2/frontend
vercel --prod
```

**Backend (Railway/Render):**
```bash
cd Phase-2/backend
# Follow platform-specific instructions
```

## 🧪 Testing

### Backend Tests
```bash
cd Phase-2/backend
pytest
```

### Frontend Tests
```bash
cd Phase-2/frontend
npm test
```

## 📝 API Documentation

Once backend is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **Shahab Uddin** - Initial work

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- FastAPI for the blazing fast backend
- Neon for serverless PostgreSQL
- Supabase for storage solution
- Tailwind CSS for styling utilities

## 📞 Support

For support, email tara378581@gmail.com

---

Made with ❤️ using Next.js and FastAPI
