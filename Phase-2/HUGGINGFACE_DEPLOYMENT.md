# 🤗 Hugging Face Spaces Deployment Guide

## Step-by-Step Deployment

### Step 1: Create Hugging Face Account
1. Go to [huggingface.co](https://huggingface.co)
2. Sign up (free account)
3. Verify your email

### Step 2: Create New Space
1. Click your profile → **"New Space"**
2. Fill in details:
   - **Space name:** `execute-todo-backend`
   - **License:** MIT
   - **Select SDK:** Docker
   - **Space hardware:** CPU basic (free)
   - **Visibility:** Public (or Private if you have Pro)

3. Click **"Create Space"**

### Step 3: Upload Files

You need to upload these files from `Phase-2/backend/`:

**Required Files:**
1. `Dockerfile` ✅ (already created)
2. `README_HF.md` → rename to `README.md` when uploading
3. `requirements.txt`
4. Entire `src/` folder with all subfolders
5. `vapid_keys.pem` (for push notifications)

**How to Upload:**
- Click **"Files"** tab in your Space
- Click **"Add file"** → **"Upload files"**
- Drag and drop all files
- Make sure folder structure is maintained:
  ```
  /
  ├── Dockerfile
  ├── README.md (renamed from README_HF.md)
  ├── requirements.txt
  ├── vapid_keys.pem
  └── src/
      ├── main.py
      ├── config.py
      ├── db.py
      ├── models/
      ├── routes/
      ├── schemas/
      ├── services/
      ├── middleware/
      └── ui/
  ```

### Step 4: Add Environment Variables (SECRETS)

1. Go to **"Settings"** tab in your Space
2. Scroll to **"Repository secrets"**
3. Click **"New secret"** for each variable:

```
DATABASE_URL=postgresql+asyncpg://neondb_owner:npg_FoQjSYP1n7yb@ep-jolly-art-ah5nqqki-pooler.c-3.us-east-1.aws.neon.tech/neondb

BETTER_AUTH_SECRET=Hx7f8Kp2mN9qR4sV6tY1uE5wZ3aB8cD0eF6gI7hJ9kL2mN4oP5qR8sT0uV3wX6yZ9A2bC4

DEBUG=false

ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend-url.vercel.app

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

1. After uploading all files, Space will automatically build
2. Wait 3-5 minutes for Docker build
3. Check **"Logs"** tab to see build progress
4. Once running, your backend will be at: `https://your-username-execute-todo-backend.hf.space`

### Step 6: Test Backend

```bash
curl https://your-username-execute-todo-backend.hf.space/health
```

Should return: `{"status":"healthy"}`

### Step 7: Update Frontend

Update `Phase-2/frontend/.env.production`:
```env
NEXT_PUBLIC_API_URL=https://your-username-execute-todo-backend.hf.space
```

---

## ⚠️ Important Notes

### Limitations of Hugging Face Spaces (Free Tier):
1. **Sleeps after 48 hours** of inactivity
2. **Cold start** takes 30-60 seconds
3. **Limited to 16GB RAM**
4. **CPU only** (no GPU needed for your app)
5. **Background tasks may be limited** - notification scheduler might not work reliably

### Notification Scheduler Issue:
⚠️ **WARNING:** Hugging Face Spaces may not reliably run background schedulers. Your email notification system might not work as expected because:
- Spaces can sleep unexpectedly
- Background tasks may be killed
- Not designed for long-running background processes

**Alternative Solution:**
If notifications don't work, you can:
1. Use a separate cron service (like cron-job.org) to ping an endpoint every minute
2. Create a `/trigger-notifications` endpoint that checks and sends notifications
3. Have the cron service call this endpoint

### Keep Space Awake:
Use [UptimeRobot](https://uptimerobot.com) to ping every 5 minutes:
- URL: `https://your-username-execute-todo-backend.hf.space/health`
- Interval: 5 minutes

---

## 🐛 Troubleshooting

### Build Failed
- Check Dockerfile syntax
- Verify requirements.txt has all dependencies
- Check logs in "Logs" tab

### Space Not Starting
- Verify port 7860 is used (required by HF)
- Check environment variables are set
- Review build logs

### Database Connection Error
- Verify DATABASE_URL is correct
- Check Neon database allows external connections
- Ensure SSL is configured in db.py

### CORS Error
- Add your frontend URL to ALLOWED_ORIGINS secret
- Include both http://localhost:3000 and production URL

---

## 📊 Monitoring

### Check Logs
- Go to your Space
- Click **"Logs"** tab
- Monitor real-time logs

### API Documentation
- Swagger: `https://your-space.hf.space/docs`
- ReDoc: `https://your-space.hf.space/redoc`

---

## 💰 Cost
**$0/month** - Completely FREE! 🎉

---

## ✅ Quick Checklist

- [ ] Create Hugging Face account
- [ ] Create new Space (Docker SDK)
- [ ] Upload Dockerfile
- [ ] Upload README_HF.md as README.md
- [ ] Upload requirements.txt
- [ ] Upload entire src/ folder
- [ ] Upload vapid_keys.pem
- [ ] Add all environment variables as secrets
- [ ] Wait for build to complete
- [ ] Test /health endpoint
- [ ] Update frontend .env.production
- [ ] Deploy frontend
- [ ] Test full application

---

## 🚀 Alternative Recommendation

If notification scheduler doesn't work reliably on Hugging Face, consider:
1. **Koyeb** - Better for FastAPI, truly free
2. **Fly.io** - More reliable for background tasks
3. **Vercel** - Serverless functions (requires code changes)

But if you want to stick with Hugging Face, follow the guide above! 👍
