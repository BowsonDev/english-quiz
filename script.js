document.addEventListener('DOMContentLoaded', () => {
    // 變數初始化
    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let isAnswering = false; // 防止重複點擊

    // DOM 元素
    const loadingMsg = document.getElementById('loading-message');
    const quizContainer = document.getElementById('quiz-container');
    const resultContainer = document.getElementById('result-container');
    
    const questionCountEl = document.getElementById('question-count');
    const scoreDisplayEl = document.getElementById('score-display');
    const progressFill = document.getElementById('progress-fill');
    
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    
    const explanationContainer = document.getElementById('explanation-container');
    const explanationText = document.getElementById('explanation-text');
    const nextBtn = document.getElementById('next-btn');
    const restartBtn = document.getElementById('restart-btn');

    const finalScoreEl = document.getElementById('final-score');
    const resultCommentEl = document.getElementById('result-comment');

    // 1. 讀取題庫
    async function fetchQuestions() {
        try {
            const response = await fetch('questions.json');
            if (!response.ok) throw new Error('無法讀取題庫');
            const data = await response.json();
            questions = shuffleArray(data); // 題目洗牌
            startQuiz();
        } catch (error) {
            loadingMsg.textContent = '載入失敗，請檢查網路連線。';
            console.error(error);
        }
    }

    // 2. 洗牌演算法 (Fisher-Yates)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // 3. 開始測驗
    function startQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        loadingMsg.classList.add('hidden');
        resultContainer.classList.add('hidden');
        quizContainer.classList.remove('hidden');
        updateProgress();
        showQuestion();
    }

    // 4. 顯示題目
    function showQuestion() {
        resetState();
        const currentQuestion = questions[currentQuestionIndex];
        
        questionText.textContent = `${currentQuestionIndex + 1}. ${currentQuestion.question}`;

        currentQuestion.options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option;
            button.classList.add('option-btn');
            // 將按鈕與正確答案做關聯
            if (option === currentQuestion.answer) {
                button.dataset.correct = "true";
            }
            button.addEventListener('click', selectAnswer);
            optionsContainer.appendChild(button);
        });
    }

    function resetState() {
        isAnswering = true;
        explanationContainer.classList.add('hidden');
        while (optionsContainer.firstChild) {
            optionsContainer.removeChild(optionsContainer.firstChild);
        }
    }

    // 5. 選擇答案互動
    function selectAnswer(e) {
        if (!isAnswering) return; // 鎖定防止連點
        isAnswering = false;

        const selectedBtn = e.target;
        const isCorrect = selectedBtn.dataset.correct === "true";

        // 判斷對錯樣式
        if (isCorrect) {
            selectedBtn.classList.add('correct');
            score += 10; // 每題 10 分 (可自訂)
        } else {
            selectedBtn.classList.add('wrong');
        }

        // 標示出正確答案 (無論對錯都要顯示)
        Array.from(optionsContainer.children).forEach(button => {
            if (button.dataset.correct === "true") {
                button.classList.add('correct');
            }
            button.disabled = true; // 鎖定所有按鈕
        });

        // 顯示詳解與下一題按鈕
        explanationText.textContent = questions[currentQuestionIndex].explanation;
        explanationContainer.classList.remove('hidden');
        updateProgress();
    }

    // 6. 更新進度與分數
    function updateProgress() {
        scoreDisplayEl.textContent = `得分: ${score}`;
        questionCountEl.textContent = `題目: ${currentQuestionIndex + 1}/${questions.length}`;
        const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;
        progressFill.style.width = `${progressPercent}%`;
    }

    // 7. 下一題或結算
    nextBtn.addEventListener('click', () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            showQuestion();
        } else {
            showResults();
        }
    });

    function showResults() {
        quizContainer.classList.add('hidden');
        resultContainer.classList.remove('hidden');
        finalScoreEl.textContent = score;
        
        // 簡單評語邏輯
        const totalScore = questions.length * 10;
        const percentage = score / totalScore;
        if (percentage === 1) resultCommentEl.textContent = "太強了！全對！🎉";
        else if (percentage >= 0.8) resultCommentEl.textContent = "很棒！繼續保持！👍";
        else if (percentage >= 0.6) resultCommentEl.textContent = "及格了，再接再厲！💪";
        else resultCommentEl.textContent = "別氣餒，多練習幾次！📚";
    }

    restartBtn.addEventListener('click', () => {
        // 重新洗牌並開始
        questions = shuffleArray(questions);
        startQuiz();
    });

    // 啟動程式
    fetchQuestions();
});