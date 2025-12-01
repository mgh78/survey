# MS Patient Wellness Chatbot Survey

A beautiful web application for interactive chatbot-style conversations with MS patients that asks questions and stores responses in CSV files or PostgreSQL database.

## Features

- 🎨 Beautiful and modern user interface
- 💬 Interactive chatbot-style conversation
- 📊 Store responses in CSV file or PostgreSQL database
- 📱 Responsive design
- 🌸 Persian/Farsi user interface with full RTL support
- 🔄 Weekly submission limit (users can submit once per week)
- 📥 CSV download functionality

## Installation & Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the application:
```bash
python app.py
```

3. Open your browser and navigate to:
```
http://localhost:5002
```

## Project Structure

```
survey/
├── app.py                 # Main Flask application (CSV version)
├── app_db.py             # Flask application with PostgreSQL support
├── requirements.txt       # Project dependencies
├── Procfile              # Deployment configuration for Render
├── templates/
│   └── index.html        # User interface
├── static/
│   └── js/
│       └── app.js        # JavaScript application logic
└── data/                 # CSV files storage directory (auto-created)
```

## How It Works

- Each user receives a unique identifier
- User responses are stored in a single CSV file (`all_users_data.csv`) or PostgreSQL database
- Weekly submission limit: Users can submit once every 7 days
- CSV files include: user_id, name, date, and all answer columns

## Data Storage

### CSV Format
Data is stored in the `data/` directory. The CSV file includes:
- **user_id**: Unique identifier for each user
- **name**: User's name
- **date**: Submission date and time
- **feeling_today**: How they're feeling today
- **medication**: Medication adherence
- **physical_days**: Physical condition over past days
- **mental_days**: Mental condition over past days
- **open_ended**: Open-ended response
- And other question responses

### PostgreSQL Database (Production)
For production deployment, the application supports PostgreSQL:
- Automatically creates tables on first run
- Better reliability and data persistence
- Can handle concurrent users
- Easy to query and export data

## Deployment

### Deploy to Render (Free)

1. Push code to GitHub
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `gunicorn app:app` (or `gunicorn app_db:app` for database version)
6. Deploy!

For detailed deployment instructions, see `DEPLOY.md`

### Using PostgreSQL

1. Create a PostgreSQL database on Render
2. Add `DATABASE_URL` environment variable to your web service
3. Update `Procfile` to use `app_db:app`
4. Deploy!

See `SWITCH_TO_DATABASE.md` for complete setup guide.

## Accessing Data

### Download CSV
Visit: `https://your-app.onrender.com/download-csv`

### View Data (if admin page is enabled)
Visit: `https://your-app.onrender.com/view-data`

## Configuration

- **Port**: Default is 5002 (configurable via PORT environment variable)
- **Weekly Limit**: Users can submit once every 7 days
- **Storage**: CSV files (local) or PostgreSQL (production)

## Technologies Used

- **Backend**: Flask (Python)
- **Frontend**: HTML, CSS, JavaScript
- **Database**: PostgreSQL (optional, for production)
- **Deployment**: Render, Gunicorn

## License

This project is for MS patient wellness tracking.
