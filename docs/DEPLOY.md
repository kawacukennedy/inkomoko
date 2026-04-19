# Inkomoko - Full Deployment Guide

This guide covers the deployment of the Inkomoko application across three platforms: Supabase (Database), Render (Backend), and Vercel (Frontend).

## Part 1: Supabase (PostgreSQL Database)

1. Go to [Supabase](https://supabase.com/) and create a new project.
2. Provide a name (e.g., `inkomoko`) and a strong database password. **Save this password**.
3. Once the database is provisioned, go to the **SQL Editor** and run your schema SQL queries (from `database/001_schema.sql` and `database/002_seed.sql`).
4. Go to **Project Settings > Database** and locate the **Connection String** (URI format).
5. It will look like this: `postgresql://postgres:[YOUR-PASSWORD]@db...supabase.co:5432/postgres`. Replace `[YOUR-PASSWORD]` with your actual password. This is your `DATABASE_URL`.

## Part 2: Render (Backend API)

1. Go to [Render](https://render.com/) and create a new **Web Service**.
2. Connect your GitHub repository (`inkomoko`).
3. Apply the following configuration:
   - **Name**: `inkomoko-backend` (or any name you prefer)
   - **Root Directory**: `backend` (This is critical to tell Render where your Node.js code lives)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` (or `node server.js`)
4. Go to the **Advanced** section and add the following **Environment Variables**:
   - `PORT`: `10000`
   - `DATABASE_URL`: Paste the Supabase connection string from Part 1 here.
   - `JWT_SECRET`: Generate a random string. (You can generate one by running `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` in your terminal).
   - `JWT_EXPIRES_IN`: `30d`
5. Click **Deploy Web Service**.
6. Once deployed, note down the URL of your deployed backend service (e.g., `https://inkomoko-backend.onrender.com`).

## Part 3: Vercel (Frontend PWA)

1. Go to [Vercel](https://vercel.com/) and click **Add New... > Project**.
2. Import the `inkomoko` repository.
3. Configure the following project settings:
   - **Framework Preset**: `Other`
   - **Root Directory**: (Leave blank or set to `frontend` if your frontend code is entirely isolated there)
   - **Build Command**: (Leave empty, as this is vanilla HTML/JS/CSS)
   - **Output Directory**: (Leave empty)
4. Add an **Environment Variable** so the frontend knows where the backend is:
   - Name: `API_URL`
   - Value: The URL from your Render backend (e.g., `https://inkomoko-backend.onrender.com/api`)
5. Unfurl the configuration and hit **Deploy**.
6. When the deployment finishes, you will receive your live frontend URL!

## Review & Testing

- Access your frontend URL via Vercel.
- The web app should automatically connect to your Render backend, which in turn interacts with your Supabase PostgreSQL database.
- You can create an account and ensure stories post properly to confirm the database tables map correctly.