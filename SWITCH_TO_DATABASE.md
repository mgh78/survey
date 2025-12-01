# How to Switch from CSV to PostgreSQL

## Quick Setup (5 minutes)

### Step 1: Create PostgreSQL Database on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Settings:
   - **Name**: `survey-db`
   - **Database**: `survey_db` 
   - **Plan**: **Free**
4. Click **"Create Database"**
5. Wait 2-3 minutes

### Step 2: Get Database URL

1. Click on your new database
2. Go to **"Connections"** tab
3. Copy the **"Internal Database URL"**
   - Looks like: `postgresql://user:pass@host:5432/dbname`

### Step 3: Add to Your Web Service

1. Go to your Web Service (survey app)
2. Click **"Environment"** tab
3. Click **"Add Environment Variable"**
4. Add:
   - **Key**: `DATABASE_URL`
   - **Value**: Paste the Internal Database URL
5. Click **"Save Changes"**

### Step 4: Update Procfile

Change `Procfile` to use the database version:

```
web: gunicorn app_db:app
```

### Step 5: Push to GitHub

```bash
git add .
git commit -m "Switch to PostgreSQL database"
git push
```

Render will automatically redeploy with PostgreSQL!

## Benefits

✅ **Data Never Lost** - Even if you delete the app, data stays in database
✅ **Better Performance** - Faster queries
✅ **Scalable** - Can handle thousands of users
✅ **Easy Export** - Download CSV anytime via `/download-csv`
✅ **Professional** - Production-ready solution

## How It Works

- **With DATABASE_URL set**: Uses PostgreSQL (production)
- **Without DATABASE_URL**: Uses CSV files (local development)

The code automatically detects which to use!

## Verify It's Working

1. Complete a survey on your live site
2. Visit: `https://survey-9x0a.onrender.com/download-csv`
3. Data should download from PostgreSQL database

## Access Your Data

### Download CSV
Visit: `https://survey-9x0a.onrender.com/download-csv`

### Query Database (Advanced)
Use Render Shell or connect with pgAdmin using the External Database URL

