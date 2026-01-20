document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. 課表設定 (Syllabus Configuration) ---
    // 這裡定義了你的選單結構，如果要新增題目，先建立 JSON 檔，再把檔名加進這裡
    const curriculum = [
        {
            grade: "國一 (七年級)",
            topics: [
                { name: "Be 動詞與代名詞", file: "questions_g1_be.json" },
                { name: "現在簡單式", file: "questions_g1_simple.json" }, // 需自行建立檔案
                { name: "現在進行式", file: "questions_g1_continuous.json" } // 需自行建立檔案
            ]
        },
        {
            grade: "國二 (八年級)",
            topics: [
                { name: "過去簡單式", file: "questions_g2_past.json" },
                { name: "未來式與比較級", file: "questions_g2_future.json" } // 需自行建立檔案
            ]
        },
        {
            grade: "國三 (九年級)",
            topics: [
                { name: "現在完成式", file: "questions_g3_perfect.json" },
                { name: "被動與關係子句", file: "questions_g3_passive.json" } // 需自行建立檔案
            ]
        }
    ];

    // --- 變數初始化 ---
    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let currentJsonFile = ''; // 紀錄當前正在寫哪個題庫

    // DOM 元素
    const menuView = document.getElementById('menu-view');
    const quizContainer = document.getElementById('quiz-container');
    const resultContainer = document.getElementById('result-container');
    const loadingMsg = document.getElementById('loading-message');
    const syllabusContainer = document.getElementById('syllabus-container');

    // 測驗區元素
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const nextBtn = document.getElementById('next-btn');
    const explanationContainer = document.getElementById('explanation-container');
    const explanationText = document.getElementById('explanation-text');
    
    // 資訊顯示
    const questionCountEl = document.getElementById('question-count');
    const scoreDisplayEl = document.getElementById('score-display');
    const progressFill = document.getElementById('progress-fill');
    
    // --- 2. 初始化選單 ---
    function initMenu() {
        syllabusContainer.innerHTML = ''; // 清空
        
        curriculum.forEach(level => {
            const section = document.createElement('div');
            section.className = 'grade-section';
            
            const title = document.createElement('div');
            title.className = 'grade-title';
            title.textContent = level.grade;
            
            const grid = document.createElement('div');
            grid.className = 'topic-grid';
            
            level.topics.forEach(topic => {
                const btn = document.createElement('button');
                btn.className = 'topic-btn';
                btn.textContent = topic.name;
                btn.onclick = () => loadQuiz(topic.file);
                grid.appendChild(btn);
            });
            
            section.appendChild(title);
            section.appendChild(grid);
            syllabusContainer.appendChild(section);
        });
    }

    // --- 3. 載入特定題庫 ---
    async function loadQuiz(filename) {
        currentJsonFile = filename;
        menuView.classList.add('hidden');
        loadingMsg.classList.remove('hidden');
        
        try {
            const response = await fetch(filename);
            if (!response.ok) throw new Error('找不到題庫檔案');
            const data = await response.json();
            
            questions = shuffleArray(data);
            startQuiz();
        } catch (error) {
            alert('題庫載入失敗：' + error.message + '\n請確認該 JSON 檔案是否存在。');
            showMenu();
        } finally {
            loadingMsg.classList.add('hidden');
        }
    }

    // --- 4. 測驗邏輯 (與之前類似，但加入返回功能) ---
    function startQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        quizContainer.classList.remove('hidden');
        resultContainer.classList.add('hidden');
        updateProgress();
        showQuestion();
    }

    function showQuestion() {
        resetState();
        const q = questions[currentQuestionIndex];
        questionText.textContent = q.question;
        
        q.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.textContent = opt;
            btn.className = 'option-btn';
            if (opt === q.answer) btn.dataset.correct = "true";
            btn.addEventListener('click', selectAnswer);
            optionsContainer.appendChild(btn);
        });
    }

    function resetState() {
        explanationContainer.classList.add('hidden');
        while (optionsContainer.firstChild) {
            optionsContainer.removeChild(optionsContainer.firstChild);
        }
    }

    function selectAnswer(e) {
        const selectedBtn = e.target;
        if (selectedBtn.disabled) return; // 防止重複點擊

        const isCorrect = selectedBtn.dataset.correct === "true";
        if (isCorrect) {
            selectedBtn.classList.add('correct');
            score += 10;
        } else {
            selectedBtn.classList.add('wrong');
        }

        Array.from(optionsContainer.children).forEach(btn => {
            if (btn.dataset.correct === "true") btn.classList.add('correct');
            btn.disabled = true;
        });

        explanationText.textContent = questions[currentQuestionIndex].explanation;
        explanationContainer.classList.remove('hidden');
        updateProgress();
    }

    function updateProgress() {
        scoreDisplayEl.textContent = `得分: ${score}`;
        questionCountEl.textContent = `${currentQuestionIndex + 1}/${questions.length}`;
        progressFill.style.width = `${((currentQuestionIndex + 1) / questions.length) * 100}%`;
    }

    // --- 5. 導航控制 ---
    function showMenu() {
        quizContainer.classList.add('hidden');
        resultContainer.classList.add('hidden');
        menuView.classList.remove('hidden');
    }

    nextBtn.addEventListener('click', () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            showQuestion();
        } else {
            showResult();
        }
    });

    function showResult() {
        quizContainer.classList.add('hidden');
        resultContainer.classList.remove('hidden');
        document.getElementById('final-score').textContent = score;
        
        // 評語邏輯
        const p = score / (questions.length * 10);
        let comment = "加油，再試一次！";
        if (p === 1) comment = "完美！文法大師！";
        else if (p >= 0.8) comment = "很棒！觀念很清楚！";
        else if (p >= 0.6) comment = "及格了，繼續保持！";
        
        document.getElementById('result-comment').textContent = comment;
    }

    // 按鈕事件綁定
    document.getElementById('home-btn').addEventListener('click', showMenu);
    document.getElementById('back-to-menu-btn').addEventListener('click', showMenu);
    document.getElementById('restart-btn').addEventListener('click', () => {
        questions = shuffleArray(questions);
        startQuiz();
    });

    // 工具: 洗牌
    function shuffleArray(array) {
        return array.sort(() => Math.random() - 0.5);
    }

    // 啟動程式
    initMenu();
});