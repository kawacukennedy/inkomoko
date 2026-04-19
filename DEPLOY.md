# Deployment Guide: Inkomoko - The Living Archive

This guide provides step-by-step instructions to deploy Inkomoko using Supabase (database), Render (backend API), and Vercel (frontend).

---

## Prerequisites

Before you begin, ensure you have:

- [ ] GitHub account with access to https://github.com/kawacukennedy/inkomoko
- [ ] Supabase account (free tier works)
- [ ] Render account (free tier works)
- [ ] Vercel account (free tier works)

---

## Part 1: Supabase (Database)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in with GitHub
2. Click **"New project"**
3. Fill in the form:
   - **Organization**: Select your GitHub organization or create new
   - **Name**: `inkomoko`
   - **Database Password**: Create a strong password (SAVE IT - you'll need it!)
   - **Region**: Select `N. Virginia (us-east-1)` or closest to your users
4. Click **"Create new project"**
5. **Wait 2-3 minutes** for setup to complete

### Step 2: Run Database Schema

1. In Supabase dashboard, click **"SQL Editor"** in left sidebar
2. Click **"New query"**
3. Copy all contents from `/database/001_schema.sql`
4. Paste into the SQL editor
5. Click **"Run"**
6. Wait for success message

### Step 3: Run Seed Data (Optional - for demo)

1. In SQL Editor, click **"New query"**
2. Copy contents from `/database/002_seed.sql`
3. Paste and click **"Run"**

### Step 4: Get Database Connection String

1. Click **"Settings"** (gear icon ⚙️) in left sidebar
2. Click **"Database"**
3. Find **"Connection String"** section
4. Copy the PostgreSQL URL (it looks like):
   ```
   postgresql://postgres:[YOUR_PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
5. Replace `[YOUR_PASSWORD]` with your actual password from Step 1

**SAVE THIS CONNECTION STRING - You'll need it for Render!**

---

## Part 2: Render (Backend API)

### Step 1: Connect to GitHub

1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click **"New +"** → **"Web Service"**

### Step 2: Configure Web Service

1. Search for `inkomoko` repository
2. Select `inkomoko` and click **"Connect"**

### Step 3: Fill in Settings

| Setting | Value |
|---------|-------|
| **Name** | `inkomoko-api` |
| **Environment** | `Node` |
| **Build Command** | (leave empty) |
| **Start Command** | `node backend/server.js` |
| **Instance Type** | `Free` |

### Step 4: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variables"**:

| Key | Value |
|-----|-------|
| `PORT` | `10000` |
| `DATABASE_URL` | **PASTE YOUR SUPABASE CONNECTION STRING** |
| `JWT_SECRET` | **GENERATE A RANDOM STRING** (see below) |
| `JWT_EXPIRES_IN` | `30d` |

**To generate JWT_SECRET**, open terminal and run:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste as JWT_SECRET value.

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Wait 3-5 minutes for deployment
3. You'll see a green "Live" indicator
4. Your API is now live at: `https://inkomoko-api.onrender.com`

**SAVE YOUR API URL!**

---

## Part 3: Vercel (Frontend)

### Step 1: Import Project

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Search for `inkomoko`
4. Click **"Import"** on the inkomoko repository

### Step 2: Configure Project

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Other` |
| **Build Command** | (leave empty) |
| **Output Directory** | (leave empty) |

### Step 3: Add Environment Variable

Click **"Environment Variables"** and add:

| Key | Value |
|-----|-------|
| `API_URL` | `https://inkomoko-api.onrender.com` |

*(Replace with your actual Render URL)*

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait 1-2 minutes
3. Your frontend is live!

**SAVE YOUR FRONTEND URL!**

---

## Part 4: Connect Frontend to Backend

### Option A: Using Environment Variable (Recommended)

The frontend reads API URL from environment. If you added `API_URL` in Vercel, you're done!

### Option B: Hardcode API URL

1. Edit `/frontend/js/api.js`
2. Find this line:
   ```javascript
   baseUrl: `${window.location.protocol}//${window.location.host}/api`
   ```
3. Change to:
   ```javascript
   baseUrl: 'https://your-render-app.onrender.com/api'
   ```
4. Commit and push changes:
   ```bash
   git add frontend/js/api.js
   git commit -m "Update API URL for production"
   git push origin main
   ```
5. Vercel will auto-deploy

---

## Part 5: Verify Your Deployment

### Test the API

```bash
# Replace with your Render URL
curl https://inkomoko-api.onrender.com/api/health
```

Should return: `{"status":"ok","timestamp":"..."}`

### Test the Frontend

1. Open your Vercel URL in browser
2. Click **"Sign In"** → **"Create Account"**
3. Register as Elder or Youth
4. Test:
   - [ ] Browse library
   - [ ] View story details
   - [ ] Create a story (if elder)
   - [ ] Bookmark a story
   - [ ] Join a family

---

## URLs Summary

After deployment, you'll have:

| Service | URL |
|---------|-----|
| **Frontend (Vercel)** | `https://inkomoko.vercel.app` |
| **Backend API (Render)** | `https://inkomoko-api.onrender.com` |
| **Database (Supabase)** | Internal |

---

## Troubleshooting

### Database Connection Failed
- [ ] Check DATABASE_URL is correct (password included)
- [ ] Verify Supabase project is "Active" (not paused)
- [ ] Ensure IP is not blocked in Supabase settings

### API Returns 404
- [ ] Check Start Command is `node backend/server.js`
- [ ] Verify Render logs for errors

### Frontend Can't Reach API
- [ ] Confirm API_URL environment variable in Vercel
- [ ] Check browser console for CORS errors
- [ ] Verify backend has CORS enabled

### Static Assets Not Loading
- [ ] Ensure frontend uses absolute paths like `/css/styles.css`

---

## Managing Your Live App

### Update Frontend
1. Make changes locally
2. Commit and push to GitHub
3. Vercel auto-deploys

### Update Backend
1. Make changes locally
2. Commit and push to GitHub
3. Render auto-deploys

### Access Database
1. Go to Supabase Dashboard
2. Click "SQL Editor" for queries
3. Click "Table Editor" for visual data

---

## Cost Estimation

| Service | Free Tier Limits | Monthly Cost |
|---------|------------------|--------------|
| Supabase | 500MB DB, 2GB bandwidth | $0 |
| Render | 750 hours, sleep after 15min | $0 |
| Vercel | 100GB bandwidth, 100hrs function | $0 |

**Total: $0/month**

---

## Need Help?

- Open an issue: https://github.com/kawacukennedy/inkomoko/issues
- Check backend logs in Render dashboard
- Check browser console for errors