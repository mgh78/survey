# Deployment Guide

## Deploying to Render (Free Hosting)

### Step 1: Prepare Your Code
1. Make sure all files are committed to a Git repository (GitHub, GitLab, or Bitbucket)

### Step 2: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub (recommended) or email

### Step 3: Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your repository
3. Select your repository and branch

### Step 4: Configure Settings
- **Name**: survey-app (or any name you like)
- **Environment**: Python 3
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn app:app`
- **Plan**: Free

### Step 5: Deploy
1. Click "Create Web Service"
2. Render will automatically build and deploy your app
3. Wait for deployment to complete (usually 2-3 minutes)

### Step 6: Access Your App
- Your app will be available at: `https://your-app-name.onrender.com`

## Important Notes

### File Storage
- CSV files will be stored in the `data/` directory
- On Render, this persists between deployments
- For production, consider using a database (PostgreSQL) instead of CSV

### Environment Variables (Optional)
You can set environment variables in Render dashboard:
- `PORT` - Automatically set by Render
- Add any other config you need

### Updating Your App
- Just push to your Git repository
- Render will automatically redeploy

## Alternative: PythonAnywhere

1. Go to https://www.pythonanywhere.com
2. Sign up for free account
3. Upload your files via Files tab
4. Go to Web tab → Add a new web app
5. Choose Flask and Python 3.10
6. Point to your app.py file
7. Reload the web app

## Alternative: Railway

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway auto-detects Flask and deploys
6. Your app will be live!

## Troubleshooting

### If CSV files don't persist:
- Consider using a database (SQLite for free, PostgreSQL for production)
- Or use cloud storage (AWS S3, Google Cloud Storage)

### If app doesn't start:
- Check logs in Render dashboard
- Make sure `gunicorn` is in requirements.txt
- Verify `Procfile` exists

### Performance Tips:
- For better performance, upgrade to paid tier
- Consider using a database instead of CSV
- Add caching if needed

