from flask import Flask, render_template, request, jsonify, send_file
import os
from datetime import datetime
import uuid
import csv
import io

app = Flask(__name__)

# Database configuration
DATABASE_URL = os.environ.get('DATABASE_URL')

# Use PostgreSQL if DATABASE_URL is set, otherwise use CSV
USE_DATABASE = DATABASE_URL is not None

if USE_DATABASE:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    
    def get_db_connection():
        """Get PostgreSQL database connection"""
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    
    def init_database():
        """Initialize database tables"""
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('''
            CREATE TABLE IF NOT EXISTS survey_responses (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                name VARCHAR(255),
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                feeling_today VARCHAR(255),
                not_good_reason VARCHAR(255),
                physical_issue VARCHAR(255),
                want_to_talk VARCHAR(255),
                positive_action VARCHAR(255),
                medication VARCHAR(255),
                physical_days VARCHAR(255),
                mental_days VARCHAR(255),
                open_ended TEXT
            );
            CREATE INDEX IF NOT EXISTS idx_user_id ON survey_responses(user_id);
            CREATE INDEX IF NOT EXISTS idx_date ON survey_responses(date);
        ''')
        conn.commit()
        cur.close()
        conn.close()
    
    # Initialize database on startup
    try:
        init_database()
        print("✅ Database initialized successfully")
    except Exception as e:
        print(f"⚠️ Database initialization error: {e}")

# CSV fallback
DATA_DIR = 'data'
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

def can_user_submit(user_id):
    """Check if user can submit - allow weekly submissions (7 days)"""
    if USE_DATABASE:
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute('''
                SELECT MAX(date) as last_date 
                FROM survey_responses 
                WHERE user_id = %s
            ''', (user_id,))
            result = cur.fetchone()
            cur.close()
            conn.close()
            
            if result and result[0]:
                last_submission_date = result[0]
                days_since_last = (datetime.now() - last_submission_date).days
                if days_since_last >= 7:
                    return True, None
                days_remaining = 7 - days_since_last
                return False, days_remaining
            return True, None
        except Exception as e:
            print(f"Database error: {e}")
            return True, None
    else:
        # CSV fallback
        csv_file = os.path.join(DATA_DIR, 'all_users_data.csv')
        if not os.path.isfile(csv_file):
            return True, None
        
        last_submission_date = None
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row.get('user_id') == user_id and row.get('date'):
                    try:
                        row_date = datetime.strptime(row.get('date'), '%Y-%m-%d %H:%M:%S')
                        if last_submission_date is None or row_date > last_submission_date:
                            last_submission_date = row_date
                    except:
                        continue
        
        if last_submission_date is None:
            return True, None
        
        days_since_last = (datetime.now() - last_submission_date).days
        if days_since_last >= 7:
            return True, None
        
        days_remaining = 7 - days_since_last
        return False, days_remaining

def save_response(user_id, name, responses):
    """Save user responses to database or CSV"""
    # Check if user can submit (weekly limit)
    can_submit, info = can_user_submit(user_id)
    if not can_submit:
        days_remaining = info
        raise ValueError(f'شما قبلاً این هفته پاسخ داده‌اید. می‌توانید {days_remaining} روز دیگر دوباره پاسخ دهید.')
    
    # Map questions to column names
    question_mapping = {
        'امروز حالت چطوره؟': 'feeling_today',
        'از چه نظر؟': 'not_good_reason',
        'توی این چند روز چه مشکلی داشتی؟': 'physical_issue',
        'می‌خوای با کسی صحبت کنی؟': 'want_to_talk',
        'امروز یه قدم کوچیک برای حال خوبت برداشتی؟': 'positive_action',
        'داروهاتو طبق برنامه مصرف کردی؟': 'medication',
        'از نظر جسمی این چند روز چطور بودی؟': 'physical_days',
        'از نظر روحی این چند روز چطور بودی؟': 'mental_days',
        'چیزی هست بخوای برام بنویسی یا کمکی بخوای؟': 'open_ended'
    }
    
    # Create data dictionary
    data = {
        'user_id': user_id,
        'name': name,
        'date': datetime.now()
    }
    
    # Map responses
    for response in responses:
        question = response.get('question', '')
        answer = response.get('answer', '')
        column_name = question_mapping.get(question, question.replace('؟', '').replace(' ', '_').lower()[:30])
        data[column_name] = answer
    
    if USE_DATABASE:
        # Save to PostgreSQL
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute('''
                INSERT INTO survey_responses 
                (user_id, name, date, feeling_today, not_good_reason, physical_issue,
                 want_to_talk, positive_action, medication, physical_days, mental_days, open_ended)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ''', (
                data.get('user_id'),
                data.get('name'),
                data.get('date'),
                data.get('feeling_today'),
                data.get('not_good_reason'),
                data.get('physical_issue'),
                data.get('want_to_talk'),
                data.get('positive_action'),
                data.get('medication'),
                data.get('physical_days'),
                data.get('mental_days'),
                data.get('open_ended')
            ))
            conn.commit()
            cur.close()
            conn.close()
        except Exception as e:
            raise Exception(f"Database error: {str(e)}")
    else:
        # Save to CSV (fallback)
        csv_file = os.path.join(DATA_DIR, 'all_users_data.csv')
        file_exists = os.path.isfile(csv_file)
        
        fieldnames = ['user_id', 'name', 'date', 'feeling_today', 'not_good_reason', 'physical_issue', 
                      'want_to_talk', 'positive_action', 'medication', 'physical_days', 
                      'mental_days', 'open_ended']
        
        with open(csv_file, 'a', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            if not file_exists:
                writer.writeheader()
            
            row_to_write = {
                'user_id': data.get('user_id'),
                'name': data.get('name'),
                'date': data.get('date').strftime('%Y-%m-%d %H:%M:%S'),
                'feeling_today': data.get('feeling_today', ''),
                'not_good_reason': data.get('not_good_reason', ''),
                'physical_issue': data.get('physical_issue', ''),
                'want_to_talk': data.get('want_to_talk', ''),
                'positive_action': data.get('positive_action', ''),
                'medication': data.get('medication', ''),
                'physical_days': data.get('physical_days', ''),
                'mental_days': data.get('mental_days', ''),
                'open_ended': data.get('open_ended', '')
            }
            writer.writerow(row_to_write)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/download-csv')
def download_csv():
    """Download CSV file from database or file system"""
    if USE_DATABASE:
        try:
            conn = get_db_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute('''
                SELECT user_id, name, date, feeling_today, not_good_reason, physical_issue,
                       want_to_talk, positive_action, medication, physical_days, mental_days, open_ended
                FROM survey_responses
                ORDER BY date DESC
            ''')
            rows = cur.fetchall()
            cur.close()
            conn.close()
            
            if not rows:
                return "No data found. No survey responses have been submitted yet.", 404
            
            # Create CSV in memory
            output = io.StringIO()
            fieldnames = ['user_id', 'name', 'date', 'feeling_today', 'not_good_reason', 'physical_issue',
                         'want_to_talk', 'positive_action', 'medication', 'physical_days', 'mental_days', 'open_ended']
            writer = csv.DictWriter(output, fieldnames=fieldnames)
            writer.writeheader()
            
            for row in rows:
                row_dict = dict(row)
                if row_dict.get('date'):
                    row_dict['date'] = row_dict['date'].strftime('%Y-%m-%d %H:%M:%S')
                writer.writerow(row_dict)
            
            output.seek(0)
            return send_file(
                io.BytesIO(output.getvalue().encode('utf-8')),
                as_attachment=True,
                download_name='survey_data.csv',
                mimetype='text/csv'
            )
        except Exception as e:
            return f"Error generating CSV: {str(e)}", 500
    else:
        # CSV file fallback
        csv_file = os.path.join(DATA_DIR, 'all_users_data.csv')
        if not os.path.isfile(csv_file):
            return "CSV file not found. No data has been collected yet.", 404
        
        try:
            with open(csv_file, 'r', encoding='utf-8') as f:
                content = f.read().strip()
                if not content:
                    return "CSV file is empty. No survey responses have been submitted yet.", 404
        except:
            return "Error reading CSV file.", 500
        
        return send_file(
            csv_file,
            as_attachment=True,
            download_name='survey_data.csv',
            mimetype='text/csv'
        )

@app.route('/submit', methods=['POST'])
def submit():
    try:
        data = request.json
        user_id = data.get('user_id')
        name = data.get('name', '')
        responses = data.get('responses', [])
        
        if not user_id:
            user_id = str(uuid.uuid4())
        
        # Save to database or CSV
        save_response(user_id, name, responses)
        
        return jsonify({
            'success': True,
            'user_id': user_id,
            'message': 'پاسخ‌های شما با موفقیت ذخیره شد'
        })
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5002))
    app.run(debug=False, host='0.0.0.0', port=port)

