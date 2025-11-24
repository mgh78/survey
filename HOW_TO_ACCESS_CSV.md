# How to Access CSV File on Render

## The CSV file is stored on Render's server, NOT in GitHub

When you deploy to Render, the CSV file is created and stored on Render's server in the `data/` directory. Here's how to access it:

## Method 1: Admin Page (Easiest) ✅

1. Go to your deployed app URL: `https://your-app-name.onrender.com/admin`
2. You'll see:
   - All survey responses in a table
   - Total count of responses
   - A download button to download the CSV file

**Example URL:**
```
https://your-app-name.onrender.com/admin
```

## Method 2: Direct Download Link

You can directly download the CSV file from:
```
https://your-app-name.onrender.com/data/all_users_data.csv
```

## Method 3: Render Shell (Advanced)

If you want to see the file directly on the server:

1. Go to your Render dashboard
2. Click on your web service
3. Go to "Shell" tab
4. Run these commands:
   ```bash
   ls -la data/
   cat data/all_users_data.csv
   ```

## Important Notes:

⚠️ **File Persistence on Render:**
- On Render's **free tier**, files in the `data/` directory DO persist between deployments
- However, if you delete the service, the files will be lost
- For production, consider using a database (PostgreSQL) instead

💡 **Best Practice:**
- Use the admin page (`/admin`) to view and download the CSV
- Regularly download backups of your CSV file
- Consider upgrading to a database for better data management

## Troubleshooting:

**If admin page shows "No data":**
- Make sure someone has completed the survey
- Check Render logs for any errors
- Verify the `data/` directory exists on the server

**If download doesn't work:**
- Check that the file exists: `https://your-app-name.onrender.com/data/all_users_data.csv`
- Check Render logs for errors
- Make sure the route is properly configured

