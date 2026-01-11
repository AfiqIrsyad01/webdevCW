document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    const state = {
        userName: 'Student',
        currentQuestionIndex: 0,
        quizScore: 0,
        audioEnabled: false,
    };

    // --- References ---
    const nameDisplays = document.querySelectorAll('.name-display');
    const nameInput = document.getElementById('username');
    const audioToggle = document.getElementById('audio-toggle');
    const audioElement = document.getElementById('bg-audio');
    const themeToggle = document.getElementById('theme-toggle');

    // --- Theme Logic ---
    function initTheme() {
        // Check system or saved preference
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            updateThemeIcon(true);
        } else {
            document.documentElement.classList.remove('dark');
            updateThemeIcon(false);
        }
    }

    function updateThemeIcon(isDark) {
        const icon = themeToggle.querySelector('i');
        if (isDark) {
            icon.className = 'fa-solid fa-sun text-yellow-500';
        } else {
            icon.className = 'fa-solid fa-moon';
        }
    }

    themeToggle.addEventListener('click', () => {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
            updateThemeIcon(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
            updateThemeIcon(true);
        }
    });

    initTheme();

    // --- Navigation System ---
    // Instead of linear slide order, we now have explicit navigation
    // But we still need to hide/show sections

    window.navigateTo = function (targetId) {
        // Validation for final slide
        if (targetId === 'final') {
            const btn = document.getElementById('menu-final-btn');
            if (btn && btn.disabled) return;
        }

        // Hide all slides
        document.querySelectorAll('.slide').forEach(s => {
            s.classList.add('hidden');
            s.classList.remove('active');
        });

        // Show target
        const target = document.getElementById(targetId);
        if (target) {
            target.classList.remove('hidden');
            target.classList.add('active');
        }

        // Init specific logic
        if (targetId === 'playground') initPlayground();
        if (targetId === 'quiz' && state.currentQuestionIndex === 0) loadQuestion();
    };

    // --- Welcome Logic ---
    window.submitName = function () {
        const val = nameInput.value.trim();
        if (val) {
            state.userName = val;
            nameDisplays.forEach(el => el.textContent = state.userName);

            // Update playground defaults early
            const pi = document.getElementById('code-input');
            if (pi && pi.value.includes('Student')) {
                pi.value = pi.value.replace('Student', state.userName);
            }

            navigateTo('path-selection');
        } else {
            alert("Please enter a name to continue.");
        }
    }

    window.startLinearCourse = function () {
        // Already have name from submitName step
        navigateTo('module1');
    }

    window.goToMenu = function () {
        navigateTo('menu');
    }

    // --- Multimedia: Audio ---
    audioToggle.addEventListener('click', () => {
        state.audioEnabled = !state.audioEnabled;
        const icon = audioToggle.querySelector('i');

        if (state.audioEnabled) {
            audioElement.volume = 0.2;
            audioElement.play().catch(e => console.log("Audio play failed interaction required"));
            icon.className = 'fa-solid fa-volume-high text-brand-600';
        } else {
            audioElement.pause();
            icon.className = 'fa-solid fa-volume-xmark';
        }
    });

    // --- Playground ---
    function initPlayground() {
        const input = document.getElementById('code-input');
        const preview = document.getElementById('code-preview');

        const update = () => {
            const doc = preview.contentDocument || preview.contentWindow.document;
            doc.open();
            doc.write(input.value);
            doc.close();
        };

        input.addEventListener('input', update);
        update(); // initial run
    }

    // --- Quiz Logic ---
    const quizData = [
        { q: "What does HTML stand for?", options: ["Hyper Text Markup Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language"], a: 0 },
        { q: "Which HTML tag is used for the largest heading?", options: ["<h6>", "<head>", "<h1>"], a: 2 },
        { q: "Which character is used to indicate an end tag?", options: ["/", "<", "^"], a: 0 },
        { q: "What does CSS stand for?", options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Sheets"], a: 1 },
        { q: "Which HTML attribute is used to define inline styles?", options: ["class", "font", "style"], a: 2 },
        { q: "How do you select an element with id 'demo' in CSS?", options: [".demo", "#demo", "demo"], a: 1 },
        { q: "Which property is used to change the background color?", options: ["color", "bgcolor", "background-color"], a: 2 },
        { q: "Which HTML tag is used to display an image?", options: ["<figure>", "<img>", "<image>"], a: 1 },
        { q: "What is the correct file extension for a CSS file?", options: [".html", ".xml", ".css"], a: 2 },
        { q: "Which property controls the text size?", options: ["font-size", "text-style", "font-style"], a: 0 }
    ];

    function loadQuestion() {
        const qData = quizData[state.currentQuestionIndex];
        const qText = document.getElementById('question-text');
        const opts = document.getElementById('options-container');
        const feedback = document.getElementById('quiz-feedback');
        const nextBtn = document.getElementById('next-q-btn');

        qText.textContent = qData.q;
        opts.innerHTML = '';
        feedback.className = 'hidden p-4 rounded-lg bg-gray-50 border border-gray-200 text-sm font-bold mb-6';
        nextBtn.classList.add('hidden');
        document.getElementById('q-current').textContent = state.currentQuestionIndex + 1;

        qData.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'w-full text-left p-4 rounded-xl border border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-brand-300 dark:hover:border-brand-600 transition-all font-medium text-gray-700 dark:text-gray-300 text-sm option-btn';
            btn.textContent = opt;
            btn.onclick = () => checkAnswer(idx, btn);
            opts.appendChild(btn);
        });
    }

    function checkAnswer(selectedIdx, btn) {
        const qData = quizData[state.currentQuestionIndex];
        const feedback = document.getElementById('quiz-feedback');
        const nextBtn = document.getElementById('next-q-btn');
        const allBtns = document.querySelectorAll('.option-btn');

        allBtns.forEach(b => b.disabled = true); // disable all

        if (selectedIdx === qData.a) {
            state.quizScore++;
            document.getElementById('q-score').textContent = state.quizScore;
            btn.classList.add('bg-green-100', 'border-green-500', 'text-green-700');
            feedback.textContent = "Correct!";
            feedback.classList.remove('hidden');
            feedback.classList.add('bg-green-50', 'text-green-700', 'border-green-200');
        } else {
            btn.classList.add('bg-red-100', 'border-red-500', 'text-red-700');
            feedback.textContent = "Incorrect.";
            feedback.classList.remove('hidden');
            feedback.classList.add('bg-red-50', 'text-red-700', 'border-red-200');
            // Show correct
            allBtns[qData.a].classList.add('bg-green-50', 'border-green-500');
        }

        nextBtn.classList.remove('hidden');
    }

    window.nextQuestion = function () {
        state.currentQuestionIndex++;
        if (state.currentQuestionIndex < quizData.length) {
            loadQuestion();
        } else {
            finishQuiz();
        }
    }

    function finishQuiz() {
        const container = document.getElementById('quiz').querySelector('.bg-white');
        const passed = state.quizScore >= 8;

        container.innerHTML = `
            <div class="text-center py-8">
                <i class="fa-solid ${passed ? 'fa-trophy text-yellow-500' : 'fa-circle-exclamation text-red-500'} text-6xl mb-4"></i>
                <h3 class="text-2xl font-bold mb-2">${passed ? 'Congratulations!' : 'Keep Trying'}</h3>
                <p class="text-gray-600 mb-6">You scored ${state.quizScore} out of 10.</p>
                <button onclick="navigateTo('menu')" class="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg">Return to Menu</button>
            </div>
        `;

        if (passed) {
            startConfetti();
            unlockFinal();
        }
    }

    function unlockFinal() {
        const btn = document.getElementById('menu-final-btn');
        if (btn) {
            btn.disabled = false;
            btn.classList.remove('opacity-60', 'cursor-not-allowed', 'bg-gray-50');
            btn.classList.add('bg-brand-50', 'border-brand-200', 'hover:border-brand-500', 'cursor-pointer', 'shadow-sm');

            // Icon swap
            const iconBox = btn.querySelector('.w-12');
            iconBox.classList.remove('bg-gray-200', 'text-gray-500');
            iconBox.classList.add('bg-yellow-100', 'text-yellow-600');
            iconBox.innerHTML = '<i class="fa-solid fa-lock-open"></i>';
        }
    }

    // --- Helpers ---
    window.toggleHelp = function () {
        const m = document.getElementById('help-modal');
        if (m.classList.contains('hidden')) {
            m.classList.remove('hidden');
            m.classList.add('flex'); // use flex to center
            setTimeout(() => {
                m.classList.remove('opacity-0');
                m.querySelector('div').classList.remove('scale-95');
                m.querySelector('div').classList.add('scale-100');
            }, 10);
        } else {
            m.classList.add('opacity-0');
            m.querySelector('div').classList.remove('scale-100');
            m.querySelector('div').classList.add('scale-95');
            setTimeout(() => {
                m.classList.remove('flex');
                m.classList.add('hidden');
            }, 300);
        }
    }

    window.toggleAbout = function () {
        const m = document.getElementById('about-modal');
        if (m.classList.contains('hidden')) {
            m.classList.remove('hidden');
            m.classList.add('flex');
            setTimeout(() => {
                m.classList.remove('opacity-0');
                m.querySelector('div').classList.remove('scale-95');
                m.querySelector('div').classList.add('scale-100');
            }, 10);
        } else {
            m.classList.add('opacity-0');
            m.querySelector('div').classList.remove('scale-100');
            m.querySelector('div').classList.add('scale-95');
            setTimeout(() => {
                m.classList.remove('flex');
                m.classList.add('hidden');
            }, 300);
        }
    }

    // Confetti (Simplified)
    function startConfetti() {
        const canvas = document.getElementById('confetti-canvas');
        canvas.classList.remove('hidden');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const pieces = Array.from({ length: 100 }).map(() => ({
            x: Math.random() * canvas.width,
            y: -20,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            v: Math.random() * 3 + 2
        }));

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            pieces.forEach(p => {
                p.y += p.v;
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, 6, 6);
            });
            requestAnimationFrame(draw);
        }
        draw();
        setTimeout(() => canvas.classList.add('hidden'), 5000);
    }
});
