/**
 * Survey Application - Main JavaScript File
 * Handles all survey logic and user interactions
 */

// Application State
const SurveyApp = {
    userName: '',
    userId: '',
    responses: [],
    currentQuestion: null,
    surveyState: {
        step: 0,
        feelingToday: null,
        notGoodReason: null,
        physicalFollowUp: null,
        mentalFollowUp: null,
        medication: null,
        physicalDays: null,
        mentalDays: null,
        openEnded: null
    },

    /**
     * Initialize the application
     */
    init() {
        this.setupEventListeners();
    },

    /**
     * Setup event listeners for user interactions
     */
    setupEventListeners() {
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startSurvey());
        }

        const userNameInput = document.getElementById('userName');
        if (userNameInput) {
            userNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.startSurvey();
                }
            });
        }
    },

    /**
     * Start the survey
     */
    startSurvey() {
        this.userName = document.getElementById('userName').value.trim();
        if (!this.userName) {
            alert('لطفاً نام خود را وارد کنید');
            return;
        }
        
        // Check if user has already completed the survey
        const storedUserId = localStorage.getItem('survey_user_id');
        const hasCompleted = localStorage.getItem('survey_completed') === 'true';
        
        if (hasCompleted && storedUserId) {
            alert('شما قبلاً این نظرسنجی را تکمیل کرده‌اید. هر کاربر فقط یک بار می‌تواند پاسخ دهد.');
            return;
        }
        
        // Use existing user_id or create new one
        if (storedUserId && !hasCompleted) {
            this.userId = storedUserId;
        } else {
            this.userId = 'user_' + Date.now();
            localStorage.setItem('survey_user_id', this.userId);
        }
        
        document.getElementById('nameSection').classList.add('hidden');
        document.getElementById('chatSection').classList.remove('hidden');
        
        this.addBotMessage(`سلام ${this.userName}! 🌸\nخوش اومدی\nبیا چند تا سؤال کوتاه باهم بپرسیم تا بدونم این روزا حالت چطوره 💬`);
        
        setTimeout(() => {
            this.askQuestion1();
        }, 1000);
    },

    /**
     * Add a bot message to the chat
     */
    addBotMessage(text) {
        const container = document.getElementById('chatContainer');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot';
        messageDiv.innerHTML = `<div class="message-content">${text.replace(/\n/g, '<br>')}</div>`;
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
    },

    /**
     * Add a user message to the chat
     */
    addUserMessage(text) {
        const container = document.getElementById('chatContainer');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user';
        messageDiv.innerHTML = `<div class="message-content">${text}</div>`;
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
    },

    /**
     * Add option buttons to the chat
     */
    addOptions(options, callback) {
        const container = document.getElementById('chatContainer');
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'options';
        
        options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = option.text;
            btn.addEventListener('click', () => {
                this.addUserMessage(option.text);
                optionsDiv.remove();
                callback(option.value);
            });
            optionsDiv.appendChild(btn);
        });
        
        container.appendChild(optionsDiv);
        container.scrollTop = container.scrollHeight;
    },

    /**
     * Question 1: How are you feeling today?
     */
    askQuestion1() {
        this.currentQuestion = 'feelingToday';
        this.addBotMessage('🩵 ۱. امروز حالت چطوره؟');
        this.addOptions([
            { text: '▫️ خوبم', value: 'good' },
            { text: '▫️ معمولی‌ام', value: 'normal' },
            { text: '▫️ حالم خوب نیست', value: 'not_good' }
        ], (value) => this.handleFeelingToday(value));
    },

    /**
     * Handle response to question 1
     */
    handleFeelingToday(value) {
        this.surveyState.feelingToday = value;
        this.responses.push({ question: 'امروز حالت چطوره؟', answer: value });
        
        if (value === 'not_good') {
            this.addBotMessage('متأسفم که حالت خوب نیست 🫶\nمی‌تونی بگی از چه نظر منظوریه؟');
            this.addOptions([
                { text: '▫️ از نظر جسمی', value: 'physical' },
                { text: '▫️ از نظر روحی', value: 'mental' },
                { text: '▫️ از هر دو نظر', value: 'both' }
            ], (value) => this.handleNotGoodReason(value));
        } else {
            this.handleGoodOrNormal();
        }
    },

    /**
     * Handle not good reason response
     */
    handleNotGoodReason(value) {
        this.surveyState.notGoodReason = value;
        this.responses.push({ question: 'از چه نظر؟', answer: value });
        
        if (value === 'physical') {
            this.addBotMessage('می‌فهمم، امیدوارم زودتر بهتر شی 🌿\nمی‌تونی بگی توی این چند روز:');
            this.addOptions([
                { text: '▫️ درد یا خستگی خاصی داشتی؟', value: 'pain' },
                { text: '▫️ علائم جدیدی حس کردی؟', value: 'symptoms' },
                { text: '▫️ داروهاتو طبق برنامه خوردی؟', value: 'medication' }
            ], (value) => this.handlePhysicalFollowUp(value));
        } else if (value === 'mental') {
            this.addBotMessage('متوجه‌م 💛\nگاهی حرف زدن کمک می‌کنه سبک‌تر بشیم.\nمی‌خوای در موردش با کسی صحبت کنی؟');
            this.addOptions([
                { text: '▫️ آره، با مددکارم صحبت کنم', value: 'social_worker' },
                { text: '▫️ آره، از روانشناس وقت بگیرم', value: 'psychologist' },
                { text: '▫️ فعلاً نه، فقط خواستم بگم حالم خوب نیست', value: 'no' }
            ], (value) => this.handleMentalFollowUp(value));
        } else if (value === 'both') {
            this.addBotMessage('مرسی که گفتی ❤️\nبه نظر میاد هم جسمت خسته‌ست هم دلت.\nمی‌خوای باهم قدم‌به‌قدم ببینیم از کجا شروع کنیم؟');
            this.addOptions([
                { text: '▫️ از حال جسمیم', value: 'physical' },
                { text: '▫️ از حال روحیم', value: 'mental' }
            ], (val) => {
                if (val === 'physical') {
                    this.handleNotGoodReason('physical');
                } else {
                    this.handleNotGoodReason('mental');
                }
            });
        }
    },

    /**
     * Handle physical follow-up
     */
    handlePhysicalFollowUp(value) {
        this.surveyState.physicalFollowUp = value;
        this.responses.push({ question: 'توی این چند روز چه مشکلی داشتی؟', answer: value });
        
        if (value === 'medication' || value === 'pain' || value === 'symptoms') {
            this.addBotMessage('💬 شاید بد نباشه یه آلارم توی گوشیت بذاری تا یادت نره داروهاتو به‌موقع بخوری ⏰');
        }
        
        setTimeout(() => this.askQuestion2(), 1500);
    },

    /**
     * Handle mental follow-up
     */
    handleMentalFollowUp(value) {
        this.surveyState.mentalFollowUp = value;
        this.responses.push({ question: 'می‌خوای با کسی صحبت کنی؟', answer: value });
        
        if (value === 'social_worker' || value === 'psychologist') {
            this.addBotMessage('💬 خیلی خوب 🌼\nمی‌تونی با شماره‌ی موسسه [شماره‌ی تماس] تماس بگیری تا هماهنگ کنیم صحبت کنی.');
        }
        
        setTimeout(() => this.askQuestion2(), 1500);
    },

    /**
     * Handle good or normal response
     */
    handleGoodOrNormal() {
        this.addBotMessage('خوبه 😌 خوشحالم که حالت بد نیست.\nفقط یه سؤال کوچیک —\nامروز یه قدم کوچیک برای حال خوبت برداشتی؟ 🌿\nمثلاً استراحت کردی، با کسی حرف زدی، پیاده‌روی رفتی یا کاری که دوست داری انجام دادی؟');
        this.addOptions([
            { text: '▫️ آره، یه کار کوچیک کردم', value: 'yes' },
            { text: '▫️ هنوز نه ولی می‌خوام انجام بدم', value: 'want_to' },
            { text: '▫️ نه، حالش رو نداشتم', value: 'no' }
        ], (value) => this.handlePositiveAction(value));
    },

    /**
     * Handle positive action response
     */
    handlePositiveAction(value) {
        this.responses.push({ question: 'امروز یه قدم کوچیک برای حال خوبت برداشتی؟', answer: value });
        
        if (value === 'want_to' || value === 'no') {
            this.addBotMessage('می‌خوای من یه قدم کوچیک برات پیشنهاد بدم؟ 🌱\nگاهی یه کار ساده می‌تونه حال دل و بدنتو بهتر کنه.\nیکی از اینا رو انتخاب کن و همین امروز امتحانش کن 💚');
            
            const suggestions = [
                '🎵 یه آهنگ گوش بده که دوستش داری',
                '💃 همون‌جا که هستی دو دقیقه برقص',
                '🤸‍♀️ با دست‌هات یا گردنت یه نرمش سبک انجام بده',
                '💌 به یه دوست صمیمی یه پیام کوتاه بده و حالش رو بپرس',
                '📖 یه شعر یا جمله‌ی قشنگ از اینترنت پیدا کن و بخون',
                '🎨 یه صفحه از کتاب رنگ‌آمیزی بزرگسالان رنگ کن (یا یه طرح ساده بکش)',
                '🎤 یه کم آواز بخون، حتی اگه فقط برای خودت باشه',
                '🎧 یه پادکست حال‌خوب‌کن یا آرامش‌بخش گوش بده',
                '💇‍♀️ موهات رو شونه کن یا یه مدل جدید ببند',
                '🧺 یه گوشه از اتاقت رو مرتب کن',
                '😊 به یکی از اطرافیانت لبخند بزن',
                '🌿 گلدونات رو آب بده',
                '🕊️ به پرنده‌ها غذا بده',
                '📱 چند تا عکس یا فایل اضافی از گوشیت پاک کن',
                '☀️ چند دقیقه کنار پنجره وایسا و نفس عمیق بکش'
            ];
            
            const container = document.getElementById('chatContainer');
            const suggestionsDiv = document.createElement('div');
            suggestionsDiv.className = 'suggestions';
            suggestionsDiv.innerHTML = '<h4>پیشنهادهای کوچیک برای حال خوب:</h4>';
            
            suggestions.forEach(suggestion => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.textContent = suggestion;
                suggestionsDiv.appendChild(item);
            });
            
            container.appendChild(suggestionsDiv);
            container.scrollTop = container.scrollHeight;
            
            setTimeout(() => {
                this.addBotMessage('💬 عالیه 💚 همین یه کار کوچیک می‌تونه شروع یه حال خوب باشه.\nبعداً بیا بگو انجامش دادی یا نه 😄');
                setTimeout(() => this.askQuestion2(), 1500);
            }, 2000);
        } else {
            setTimeout(() => this.askQuestion2(), 1500);
        }
    },

    /**
     * Question 2: Medication
     */
    askQuestion2() {
        this.currentQuestion = 'medication';
        this.addBotMessage('🕒 ۲. داروهاتو طبق برنامه مصرف کردی؟');
        this.addOptions([
            { text: '▫️ آره، منظم می‌خورم', value: 'regular' },
            { text: '▫️ بعضی وقتا یادم می‌ره', value: 'sometimes' },
            { text: '▫️ چند روزه نخوردم', value: 'missed' }
        ], (value) => this.handleMedication(value));
    },

    /**
     * Handle medication response
     */
    handleMedication(value) {
        this.surveyState.medication = value;
        this.responses.push({ question: 'داروهاتو طبق برنامه مصرف کردی؟', answer: value });
        
        if (value === 'sometimes' || value === 'missed') {
            this.addBotMessage('💬 ممنون که گفتی 💊 شاید یه آلارم توی گوشیت بذاری تا یادت نره داروهاتو به‌موقع بخوری ⏰');
        }
        
        setTimeout(() => this.askQuestion3(), 1500);
    },

    /**
     * Question 3: Physical condition
     */
    askQuestion3() {
        this.currentQuestion = 'physicalDays';
        this.addBotMessage('🌦️ ۳. از نظر جسمی این چند روز چطور بودی؟');
        this.addOptions([
            { text: '▫️ سرحال و پرانرژی', value: 'energetic' },
            { text: '▫️ معمولی', value: 'normal' },
            { text: '▫️ خسته یا درد داشتم', value: 'tired' }
        ], (value) => this.handlePhysicalDays(value));
    },

    /**
     * Handle physical days response
     */
    handlePhysicalDays(value) {
        this.surveyState.physicalDays = value;
        this.responses.push({ question: 'از نظر جسمی این چند روز چطور بودی؟', answer: value });
        setTimeout(() => this.askQuestion4(), 1500);
    },

    /**
     * Question 4: Mental condition
     */
    askQuestion4() {
        this.currentQuestion = 'mentalDays';
        this.addBotMessage('💭 ۴. از نظر روحی این چند روز چطور بودی؟');
        this.addOptions([
            { text: '▫️ آرام و خوبم', value: 'good' },
            { text: '▫️ معمولی‌ام', value: 'normal' },
            { text: '▫️ ناراحتم یا بی‌حوصله‌م', value: 'sad' }
        ], (value) => this.handleMentalDays(value));
    },

    /**
     * Handle mental days response
     */
    handleMentalDays(value) {
        this.surveyState.mentalDays = value;
        this.responses.push({ question: 'از نظر روحی این چند روز چطور بودی؟', answer: value });
        
        if (value === 'sad') {
            this.addBotMessage('💬 می‌خوای با کسی صحبت کنی تا سبک‌تر بشی؟');
            this.addOptions([
                { text: '▫️ آره، با مددکارم', value: 'social_worker' },
                { text: '▫️ آره، از روانشناس وقت بگیرم', value: 'psychologist' },
                { text: '▫️ فعلاً نه', value: 'no' }
            ], (val) => {
                if (val === 'social_worker' || val === 'psychologist') {
                    this.addBotMessage('💬 می‌تونی با شماره‌ی موسسه [شماره‌ی تماس] تماس بگیری تا هماهنگ کنیم صحبت کنی.');
                }
                setTimeout(() => this.askQuestion5(), 1500);
            });
        } else {
            setTimeout(() => this.askQuestion5(), 1500);
        }
    },

    /**
     * Question 5: Open-ended question
     */
    askQuestion5() {
        this.currentQuestion = 'openEnded';
        this.addBotMessage('✏️ ۵. چیزی هست بخوای برام بنویسی یا کمکی بخوای؟');
        
        const container = document.getElementById('chatContainer');
        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group';
        inputGroup.innerHTML = `
            <input type="text" id="openEndedInput" class="text-input" placeholder="پاسخ خود را بنویسید...">
            <button class="send-btn" id="submitOpenEndedBtn">ارسال</button>
        `;
        container.appendChild(inputGroup);
        container.scrollTop = container.scrollHeight;
        
        // Setup event listeners for the new input
        const input = document.getElementById('openEndedInput');
        const submitBtn = document.getElementById('submitOpenEndedBtn');
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitOpenEnded();
            }
        });
        
        submitBtn.addEventListener('click', () => this.submitOpenEnded());
    },

    /**
     * Submit open-ended answer
     */
    submitOpenEnded() {
        const input = document.getElementById('openEndedInput');
        const answer = input.value.trim();
        
        if (answer) {
            this.addUserMessage(answer);
            this.surveyState.openEnded = answer;
            this.responses.push({ question: 'چیزی هست بخوای برام بنویسی یا کمکی بخوای؟', answer: answer });
            input.parentElement.remove();
            
            setTimeout(() => {
                this.finishSurvey();
            }, 1000);
        }
    },

    /**
     * Finish the survey and save data
     */
    finishSurvey() {
        this.addBotMessage(`🌷 پایان گفتگو:\nمرسی که وقت گذاشتی و جواب دادی ${this.userName} 💛\nهر وقت خواستی می‌تونی دوباره بیای و حالت رو باهام در میون بذاری 💬\nیادت نره — حتی یه قدم کوچیک برای حال خوبت مهمه 🌿`);
        
        // Save to backend
        fetch('/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: this.userId,
                name: this.userName,
                responses: this.responses
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Data saved successfully');
                // Mark survey as completed in localStorage
                localStorage.setItem('survey_completed', 'true');
            } else {
                // Show error message if user already submitted
                if (data.error || data.message) {
                    this.addBotMessage(`⚠️ ${data.error || data.message}`);
                    // Mark as completed even if error (to prevent retries)
                    localStorage.setItem('survey_completed', 'true');
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
            this.addBotMessage('⚠️ خطایی در ذخیره‌سازی داده‌ها رخ داد. لطفاً دوباره تلاش کنید.');
        });
    }
};

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    SurveyApp.init();
});

