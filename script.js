document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. 完整課表設定 (Syllabus) ---
    // 檔名部分我先幫你預設好，你之後建立 JSON 時要對應這些名字
    const curriculum = [
        {
            grade: "國一 (七年級) - 基礎句型",
            topics: [
                { name: "Be 動詞 (am, is, are)", file: "g1_be_verb.json" },
                { name: "指示代名詞 (This/That)", file: "g1_demonstratives.json" },
                { name: "Wh- 疑問詞", file: "g1_wh_questions.json" },
                { name: "現在簡單式 & 助動詞", file: "g1_present_simple.json" },
                { name: "第三人稱單數變化", file: "g1_3rd_person.json" },
                { name: "現在進行式", file: "g1_present_continuous.json" },
                { name: "頻率副詞", file: "g1_frequency_adverbs.json" },
                { name: "名詞單複數 & 數量", file: "g1_nouns_quantity.json" },
                { name: "祈使句", file: "g1_imperatives.json" },
                { name: "日期與時間", file: "g1_datetime.json" },
                // 綜合測驗區
                { name: "🏆 國一總複習 (含閱讀)", file: "g1_review_comprehensive.json" }
            ]
        },
        {
            grade: "國二 (八年級) - 時態與形容詞",
            topics: [
                { name: "過去簡單式 (規則/不規則)", file: "g2_past_simple.json" },
                { name: "Was / Were 用法", file: "g2_was_were.json" },
                { name: "未來式 (will / be going to)", file: "g2_future.json" },
                { name: "形容詞比較級 & 最高級", file: "g2_comparison.json" },
                { name: "授與動詞 (Give/Send)", file: "g2_giving_verbs.json" },
                { name: "花費動詞 (Spend/Cost)", file: "g2_spending_verbs.json" },
                { name: "不定代名詞 (one/ones)", file: "g2_indefinite_pronouns.json" },
                { name: "情態助動詞 (must/should)", file: "g2_modals.json" },
                { name: "連接詞 (because/so)", file: "g2_conjunctions.json" },
                // 綜合測驗區
                { name: "🏆 國二總複習 (含閱讀)", file: "g2_review_comprehensive.json" }
            ]
        },
        {
            grade: "國三 (九年級) - 複合句型",
            topics: [
                { name: "現在完成式", file: "g3_present_perfect.json" },
                { name: "被動語態", file: "g3_passive_voice.json" },
                { name: "關係子句 (Who/Which)", file: "g3_relative_clauses.json" },
                { name: "名詞子句", file: "g3_noun_clauses.json" },
                { name: "分詞構句", file: "g3_participles.json" },
                { name: "附加問句", file: "g3_tag_questions.json" },
                { name: "特殊句型 (used to/too..to)", file: "g3_special_patterns.json" },
                // 綜合測驗區
                { name: "🏆 國三總複習 (含閱讀)", file: "g3_review_comprehensive.json" }
            ]
        }
    ];

    // --- 變數初始化 ---
    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;

    // DOM 元素
    const menuView = document.getElementById('menu-view');
    const quizContainer = document.getElementById('quiz-container');
    const resultContainer = document.getElementById('result-container');
    const loadingMsg = document.getElementById('loading-message');
    const syllabusContainer = document.getElementById('syllabus-container');

    // 測驗區元素
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    
    // 新增：閱讀測驗元素
    const articleContainer = document.getElementById('article-container');
    const articleContent = document.getElementById('article-content');

    const nextBtn = document.getElementById('next-btn');
    const explanationContainer = document.getElementById('explanation-container');
    const explanationText = document.getElementById('explanation-text');
    
    const questionCountEl = document.getElementById('question-count');
    const scoreDisplayEl = document.getElementById('score-display');
    const progressFill = document.getElementById('progress-fill');
    
    // --- 2. 初始化選單 ---
    function initMenu() {
        syllabusContainer.innerHTML = ''; 
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
                // 如果是總複習，給予特別的樣式顏色
                if(topic.name.includes("總複習")) {
                    btn.style.border = "2px solid #FFD700"; // 金色邊框
                    btn.style.backgroundColor = "#FFFBE6";
                }
                btn.textContent = topic.name;
                btn.onclick = () => loadQuiz(topic.file);
                grid.appendChild(btn);
            });
            
            section.appendChild(title);
            section.appendChild(grid);
            syllabusContainer.appendChild(section);
        });
    }

    // --- 3. 載入題庫 ---
    async function loadQuiz(filename) {
        menuView.classList.add('hidden');
        loadingMsg.classList.remove('hidden');
        
        try {
            const response = await fetch(filename);
            if (!response.ok) throw new Error('找不到題庫檔案');
            const data = await response.json();
            
            // 這裡不一定要洗牌 (shuffle)，如果是閱讀測驗，通常題目有順序
            // 判斷：如果是總複習 (review) 檔案，我們才洗牌；單元練習則照順序
            if (filename.includes('review')) {
                 questions = shuffleArray(data);
            } else {
                 questions = data;
            }
            
            startQuiz();
        } catch (error) {
            alert('題庫準備中 (File not found)：\n' + filename);
            showMenu();
        } finally {
            loadingMsg.classList.add('hidden');
        }
    }

    // --- 4. 測驗邏輯 ---
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
        
        // --- 核心修改：判斷是否有文章 ---
        if (q.article) {
            articleContainer.classList.remove('hidden');
            articleContent.textContent = q.article;
        } else {
            articleContainer.classList.add('hidden');
        }
        
        // 顯示題目
        questionText.textContent = q.question;

        // 產生選項
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
        // 清空選項
        while (optionsContainer.firstChild) {
            optionsContainer.removeChild(optionsContainer.firstChild);
        }
    }

    function selectAnswer(e) {
        const selectedBtn = e.target;
        if (selectedBtn.disabled) return; 

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

        // 顯示解析 (如果 JSON 有 explanation 欄位就顯示，沒有則顯示預設文字)
        explanationText.textContent = questions[currentQuestionIndex].explanation || "本題無詳細解析。";
        explanationContainer.classList.remove('hidden');
        updateProgress();
    }

    function updateProgress() {
        scoreDisplayEl.textContent = `得分: ${score}`;
        questionCountEl.textContent = `${currentQuestionIndex + 1}/${questions.length}`;
        progressFill.style.width = `${((currentQuestionIndex + 1) / questions.length) * 100}%`;
    }

    // --- 5. 導航與結算 ---
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
        
        const p = score / (questions.length * 10);
        let comment = "加油，再試一次！";
        if (p === 1) comment = "完美！文法大師！";
        else if (p >= 0.8) comment = "很棒！觀念很清楚！";
        else if (p >= 0.6) comment = "及格了，繼續保持！";
        
        document.getElementById('result-comment').textContent = comment;
    }

    // 按鈕事件
    document.getElementById('home-btn').addEventListener('click', showMenu);
    document.getElementById('back-to-menu-btn').addEventListener('click', showMenu);
    document.getElementById('restart-btn').addEventListener('click', () => {
        // 重新開始時，如果是總複習才需要重新洗牌
        if (currentJsonFile.includes('review')) {
             questions = shuffleArray(questions);
        }
        startQuiz();
    });

    function shuffleArray(array) {
        return array.sort(() => Math.random() - 0.5);
    }
    
    // 全域變數紀錄當前檔案 (供 restart 使用)
    let currentJsonFile = '';
    const originalLoadQuiz = loadQuiz;
    loadQuiz = function(filename) {
        currentJsonFile = filename;
        originalLoadQuiz(filename);
    }

    initMenu();
});