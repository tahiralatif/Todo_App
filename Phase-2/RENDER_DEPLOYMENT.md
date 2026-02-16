# 🚀 Render.com Deployment Guide (FREE)

## Why Render?
- ✅ **Completely FREE** - 750 hours/month
- ✅ **Auto-deploy** from GitHub
- ✅ **HTTPS included**
- ✅ **PostgreSQL support**
- ✅ **Easy setup** - 5 minutes!

---

## 📋 Step-by-Step Deployment

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Add Render deployment config"
git push origin main
```

### Step 2: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Step 3: Deploy Backend

#### Option A: Using render.yaml (Recommended)
1. Click **"New +"** → **"Blueprint"**
2. Connect your GitHub repository
3. Select branch: `main`
4. Render will auto-detect `render.yaml`
5. Click **"Apply"**

#### Option B: Manual Setup
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name:** `execute-todo-backend`
   - **Region:** Oregon (US West)
   - **Branch:** `main`
   - **Root Directory:** `Phase-2/backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn src.main:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Free

### Step 4: Add Environment Variables

Go to **Environment** tab and add:

```env
DATABASE_URL=postgresql+asyncpg://neondb_owner:npg_FoQjSYP1n7yb@ep-jolly-art-ah5nqqki-pooler.c-3.us-east-1.aws.neon.tech/neondb

BETTER_AUTH_SECRET=Hx7f8Kp2mN9qR4sV6tY1uE5wZ3aB8cD0eF6gI7hJ9kL2mN4oP5qR8sT0uV3wX6yZ9A2bC4

DEBUG=false

ALLOWED_ORIGINS=https://your-frontend-url.vercel.app,http://localhost:3000

SUPABASE_URL=https://mtsxttzevkrmusvwddnt.supabase.co

SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10c3h0dHpldmtybXVzdndkZG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwODEzNDcsImV4cCI6MjA4NDY1NzM0N30.YUYdsKJpJvkgwr00sAvPB2VXNGXkHU8-nrlbY43DiyM

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10c3h0dHpldmtybXVzdndkZG50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTA4MTM0NywiZXhwIjoyMDg0NjU3MzQ3fQ.uhS5Q9PqX2ULHmXWNJodo1M1t1iO_XjGGyrp8wAXAqk

SUPABASE_STORAGE_BUCKET=profile-photos

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tara378581@gmail.com
SMTP_PASSWORD=akdsdvjemsirwtmv

FROM_EMAIL=noreply@execute.com
SUPPORT_EMAIL=tara378581@gmail.com
```

### Step 5: Deploy!
1. Click **"Create Web Service"**
2. Wait 2-3 minutes for deployment
3. Your backend will be live at: `https://execute-todo-backend.onrender.com`

---

## 🔧 Post-Deployment

### Update Frontend
Update `Phase-2/frontend/.env.production`:
```env
NEXT_PUBLIC_API_URL=https://execute-todo-backend.onrender.com
```

### Test Backend
```bash
curl https://execute-todo-backend.onrender.com/health
# Should return: {"status":"healthy"}
```

### Check Logs
- Go to Render dashboard
- Click on your service
- View **"Logs"** tab

---

## ⚠️ Important Notes

### Free Tier Limitations
- **Sleeps after 15 min** of inactivity
- **Wakes up in ~30 seconds** on first request
- **750 hours/month** (enough for 24/7 if only one service)

### Keep Backend Awake (Optional)
Use a service like [UptimeRobot](https://uptimerobot.com) to ping your backend every 5 minutes:
- URL: `https://execute-todo-backend.onrender.com/health`
- Interval: 5 minutes

### Auto-Deploy
- Every push to `main` branch will auto-deploy
- Check deployment status in Render dashboard

---

## 🐛 Troubleshooting

### Build Failed
```bash
# Check requirements.txt is correct
# Ensure Python version is 3.11
```

### Database Connection Error
```bash
# Verify DATABASE_URL is correct
# Check Neon database is active
```

### CORS Error
```bash
# Add your frontend URL to ALLOWED_ORIGINS
ALLOWED_ORIGINS=https://your-app.vercel.app
```

---

## 📊 Monitoring

### Health Check
```bash
curl https://execute-todo-backend.onrender.com/health
```

### API Docs
- Swagger: `https://execute-todo-backend.onrender.com/docs`
- ReDoc: `https://execute-todo-backend.onrender.com/redoc`

---

## 💰 Cost
**$0/month** - Completely FREE! 🎉

---

## 🚀 Alternative: Railway.app

If you want **no sleep time**, use Railway:

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub"**
4. Select your repo
5. Add environment variables
6. Deploy!

**Cost:** $5 free credit/month (enough for small apps)

---

## ✅ Deployment Complete!

Your backend is now live and ready to use! 🎉

**Next Steps:**
1. Deploy frontend to Vercel
2. Update frontend API URL
3. Test email notifications
4. Monitor logs

Need help? Check the logs in Render dashboard!
