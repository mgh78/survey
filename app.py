from flask import Flask, render_template, request, jsonify
import csv
import os
from datetime import datetime
import uuid

app = Flask(__name__)

# Ensure data directory exists
DATA_DIR = 'data'
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

def user_exists(user_id):
    """Check if user_id already exists in the CSV file"""
    csv_file = os.path.join(DATA_DIR, 'all_users_data.csv')
    if not os.path.isfile(csv_file):
        return False
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get('user_id') == user_id:
                return True
    return False

def save_to_csv(user_id, name, responses):
    """Save user responses to a single CSV file - one row per user with all answers"""
    csv_file = os.path.join(DATA_DIR, 'all_users_data.csv')
    file_exists = os.path.isfile(csv_file)
    
    # Check if user already exists
    if user_exists(user_id):
        raise ValueError('این کاربر قبلاً پاسخ داده است')
    
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
    
    # Create a dictionary for this user's row
    user_row = {
        'user_id': user_id,
        'name': name,
        'date': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    
    # Map each response to its column
    for response in responses:
        question = response.get('question', '')
        answer = response.get('answer', '')
        column_name = question_mapping.get(question, question.replace('؟', '').replace(' ', '_').lower()[:30])
        user_row[column_name] = answer
    
    # Define fieldnames - user_id, name, and date first, then all possible question columns
    fieldnames = ['user_id', 'name', 'date', 'feeling_today', 'not_good_reason', 'physical_issue', 
                  'want_to_talk', 'positive_action', 'medication', 'physical_days', 
                  'mental_days', 'open_ended']
    
    with open(csv_file, 'a', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        
        if not file_exists:
            writer.writeheader()
        
        # Write the user row (only columns that exist in fieldnames)
        row_to_write = {k: user_row.get(k, '') for k in fieldnames}
        writer.writerow(row_to_write)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/download-csv')
def download_csv():
    """Download the CSV file directly"""
    csv_file = os.path.join(DATA_DIR, 'all_users_data.csv')
    
    if not os.path.isfile(csv_file):
        return "CSV file not found. No data has been collected yet.", 404
    
    from flask import send_file
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
        
        # Save to CSV
        save_to_csv(user_id, name, responses)
        
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

