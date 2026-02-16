# 🚂 Railway.app Deployment Guide (FREE $5/month)

## Why Railway?
- ✅ **$5 free credit/month**
- ✅ **No sleep time** (always on!)
- ✅ **Fastest deployment** (1-2 minutes)
- ✅ **Auto-deploy** from GitHub
- ✅ **PostgreSQL included**
- ✅ **Best for FastAPI**

---

## 📋 Quick Deployment (5 Minutes!)

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Click **"Login with GitHub"**
3. Authorize Railway

### Step 2: Deploy Backend
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository
4. Railway will auto-detect Python app

### Step 3: Configure

#### Set Root Directory
1. Go to **Settings** tab
2. Find **"Root Directory"**
3. Set to: `Phase-2/backend`
4. Click **"Save"**

#### Set Start Command
1. In **Settings** tab
2. Find **"Start Command"**
3. Set to: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`
4. Click **"Save"**

### Step 4: Add Environment Variables
1. Go to **Variables** tab
2. Click **"+ New Variable"**
3. Add all these:

```env
DATABASE_URL=postgresql+asyncpg://neondb_owner:npg_FoQjSYP1n7yb@ep-jolly-art-ah5nqqki-pooler.c-3.us-east-1.aws.neon.tech/neondb

BETTER_AUTH_SECRET=Hx7f8Kp2mN9qR4sV6tY1uE5wZ3aB8cD0eF6gI7hJ9kL2mN4oP5qR8sT0uV3wX6yZ9A2bC4

DEBUG=false

ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000

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

PYTHON_VERSION=3.11.0
```

### Step 5: Generate Domain
1. Go to **Settings** tab
2. Find **"Domains"**
3. Click **"Generate Domain"**
4. Copy your URL: `https://your-app.up.railway.app`

### Step 6: Deploy!
1. Railway will auto-deploy
2. Wait 1-2 minutes
3. Check **"Deployments"** tab for status

---

## ✅ Deployment Complete!

Your backend is live at: `https://your-app.up.railway.app`

### Test It
```bash
curl https://your-app.up.railway.app/health
# Should return: {"status":"healthy"}
```

---

## 💰 Cost Breakdown

### Free Tier
- **$5 credit/month**
- **~500 hours** of runtime
- **Enough for 24/7** small apps

### Usage Estimate
- **Backend only:** ~$3-4/month
- **With PostgreSQL:** ~$5/month

### Monitor Usage
- Dashboard shows real-time usage
- Set up billing alerts

---

## 🔧 Advanced Features

### Custom Domain
1. Go to **Settings** → **Domains**
2. Click **"Custom Domain"**
3. Add your domain
4. Update DNS records

### View Logs
1. Click on your service
2. View real-time logs
3. Filter by level (info, error, etc.)

### Metrics
- CPU usage
- Memory usage
- Network traffic
- Request count

---

## 🚀 Comparison

| Feature | Railway | Render |
|---------|---------|--------|
| **Cost** | $5/month | Free |
| **Sleep** | Never | After 15 min |
| **Speed** | Very Fast | Fast |
| **Setup** | Easiest | Easy |
| **Best For** | Production | Development |

---

## 🎯 Recommendation

- **Development/Testing:** Use Render (free)
- **Production:** Use Railway ($5/month)
- **High Traffic:** Upgrade Railway plan

---

## 📞 Support

Railway has excellent support:
- Discord community
- Documentation
- Email support

---

Your backend is now deployed and always on! 🎉
