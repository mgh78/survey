# PostgreSQL Database Setup Guide

## Why Use PostgreSQL Instead of CSV?

✅ **Better Reliability** - Data is stored in a proper database
✅ **No Data Loss** - Survives redeployments and server restarts
✅ **Better Performance** - Faster queries and data access
✅ **Scalability** - Can handle thousands of users
✅ **Data Integrity** - Built-in validation and constraints
✅ **Easy Access** - Query data directly, export anytime

## Step 1: Create PostgreSQL Database on Render

1. Go to your Render Dashboard: https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `survey-db` (or any name)
   - **Database**: `survey_db`
   - **User**: `survey_user` (auto-generated)
   - **Region**: Choose closest to you
   - **Plan**: **Free** (or Starter for production)
4. Click **"Create Database"**
5. Wait 2-3 minutes for database to be created

## Step 2: Get Database Connection String

1. After database is created, click on it
2. Go to **"Connections"** tab
3. Copy the **"Internal Database URL"** (for Render services)
4. Also copy the **"External Database URL"** (for local testing)

It looks like:
```
postgresql://user:password@hostname:5432/database_name
```

## Step 3: Add Database URL to Render Web Service

1. Go to your Web Service (survey app)
2. Click on **"Environment"** tab
3. Click **"Add Environment Variable"**
4. Add:
   - **Key**: `DATABASE_URL`
   - **Value**: Paste the **Internal Database URL** from Step 2
5. Click **"Save Changes"**
6. Render will automatically redeploy

## Step 4: Update Code (Already Done)

The code has been updated to use PostgreSQL. Just push to GitHub!

## Step 5: Test

1. Complete a survey on your live site
2. Data will be saved to PostgreSQL database
3. You can query it anytime through Render dashboard or download as CSV

## Accessing Your Data

### Option 1: Download CSV via App
Visit: `https://survey-9x0a.onrender.com/download-csv`

### Option 2: Use Render Shell (if available)
```bash
psql $DATABASE_URL
SELECT * FROM survey_responses;
```

### Option 3: Use pgAdmin or DBeaver
Connect using the External Database URL for local access

## Benefits

- ✅ Data persists forever (even if you delete and recreate the app)
- ✅ Can handle concurrent users
- ✅ Easy to query and analyze data
- ✅ Can export to CSV anytime
- ✅ Professional and scalable solution

