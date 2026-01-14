document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    const state = {
        userName: 'Student',
        currentQuestionIndex: 0,
        quizScore: 0,
        bonusScore: 0,
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
        if (targetId === 'final') updateFinalSlide();
    };

    // --- Gamification System ---
    const badges = {
        8: {
            tier: "Bronze",
            title: "Web Foundations Explorer",
            desc: "You have demonstrated a solid understanding of fundamental web development concepts, including basic HTML structure, CSS styling principles, and introductory web logic.",
            color: "from-[#CD7F32] via-[#A0522D] to-[#8B4513]",
            glow: "shadow-[#CD7F32]/40",
            icon: "fa-compass",
            quote: "Small steps today lead to big achievements tomorrow."
        },
        9: {
            tier: "Silver",
            title: "Frontend Essentials Specialist",
            desc: "You have shown strong proficiency in core web development fundamentals and are capable of building structured, styled, and user-friendly web pages.",
            color: "from-[#C0C0C0] via-[#A9A9A9] to-[#808080]",
            glow: "shadow-gray-400/40",
            icon: "fa-layer-group",
            quote: "Learning to code is learning to create."
        },
        10: {
            tier: "Gold",
            title: "Web Development Fundamentals Master",
            desc: "You have achieved perfect mastery of fundamental web development concepts. Your understanding of HTML, CSS, and foundational web logic reflects excellent learning outcomes.",
            color: "from-[#FFD700] via-[#DAA520] to-[#B8860B]",
            glow: "shadow-yellow-500/50",
            icon: "fa-trophy",
            quote: "Every expert was once a beginner."
        },
        "mastery": {
            tier: "Legendary",
            title: "Ultimate Web Development Legend",
            desc: "Beyond Perfection! You have achieved the absolute peak of performance, answering every single core and bonus challenge correctly. Your technical precision and conceptual clarity are truly legendary.",
            color: "from-[#00f2fe] via-[#4facfe] to-[#8b5cf6]",
            glow: "shadow-cyan-500/60",
            icon: "fa-gem",
            quote: "The only limit to our realization of tomorrow will be our doubts of today."
        }
    };


    function updateFinalSlide() {
        const isMastery = state.quizScore === 10 && state.bonusScore === 5;
        let badge;
        let scoreDisplay = state.quizScore;

        if (isMastery) {
            badge = badges["mastery"];
            scoreDisplay = "10 + 2";
        } else {
            const score = state.quizScore < 8 ? 8 : state.quizScore;
            badge = badges[score] || badges[8];
        }

        const container = document.getElementById('badge-display-container');
        if (container) {
            container.innerHTML = `
                <div class="relative group cursor-default">
                    <!-- Dynamic Outer Glow Pulse -->
                    <div class="absolute inset-x-0 -inset-y-4 bg-gradient-to-r ${badge.color} blur-[60px] md:blur-[100px] opacity-20 dark:opacity-30 rounded-full animate-pulse transition-opacity duration-1000"></div>
                    
                    <!-- Medal Body -->
                    <div class="relative w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-br ${badge.color} p-1 md:p-1.5 shadow-2xl ${badge.glow} transform transition-all duration-700 group-hover:scale-110 flex items-center justify-center border-[6px] md:border-[8px] border-white/40 dark:border-white/20">
                        <div class="w-full h-full bg-white/10 backdrop-blur-xl rounded-full flex flex-col items-center justify-center text-white border border-white/30 shadow-inner p-4">
                            <i class="fa-solid ${badge.icon} text-5xl md:text-7xl mb-1 md:mb-3 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"></i>
                            <div class="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] mb-1 md:mb-2 opacity-80">${isMastery ? 'Mastery Tier' : badge.tier + ' Tier'} Achievement</div>
                            <div class="text-xs md:text-lg font-black text-center px-4 leading-tight uppercase tracking-wide drop-shadow-md">${badge.title}</div>
                            
                            <!-- Floating Score Tag -->
                            <div class="absolute -bottom-4 md:-bottom-6 bg-white dark:bg-dark-card text-brand-600 dark:text-brand-400 font-black text-xl md:text-3xl px-6 md:px-8 py-2 rounded-[1.5rem] shadow-xl border border-gray-100 dark:border-dark-border transform hover:translate-y-[-4px] transition-transform flex items-center gap-2">
                                <span>${state.quizScore}/10</span>
                                ${state.bonusScore > 0 ? `<span class="text-xs md:text-sm text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-800">+${state.bonusScore} Bonus</span>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        const desc = document.getElementById('badge-description');
        if (desc) desc.textContent = badge.desc;

        const quote = document.getElementById('motivational-quote');
        if (quote) quote.textContent = `"${badge.quote}"`;
    }

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
            // Basic alert, could be better UI
            const inp = document.getElementById('username');
            inp.classList.add('ring-2', 'ring-red-500');
            setTimeout(() => inp.classList.remove('ring-2', 'ring-red-500'), 1000);
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
        { q: "Which property controls the text size?", options: ["font-size", "text-style", "font-style"], a: 0 },
        {
            q: "Bonus Challenge 1: Fix the HTML Code",
            type: "fix-code",
            initialCode: "<h1>Welcome\n<p>This is my first website</p>",
            instruction: "Fix the HTML code so the heading and paragraph display correctly.",
            hint: "Hint: <h1> should be properly closed with a </h1> tag.",
            bonus: true
        },
        {
            q: "Bonus Challenge 2: Guess the Output",
            type: "guess-output",
            snippet: "<p style=\"color: red;\">Hello Web</p>",
            question: "What will be displayed in the browser?",
            options: ["A) Black text saying 'Hello Web'", "B) Red text saying 'Hello Web'", "C) Blue text saying 'Hello Web'", "D) Nothing will be displayed"],
            a: 1,
            bonus: true
        },
        {
            q: "Bonus Challenge 3: Spot the Error",
            type: "guess-output", // Reuse guess-output layout
            snippet: '<img src="image.jpg">',
            question: "Why might this image not be displayed in the browser?",
            options: ["A) The <img> tag must have a closing tag", "B) The alt attribute is missing", "C) The image file path may be incorrect", "D) The img tag cannot be used in HTML"],
            a: 2,
            bonus: true
        },
        {
            q: "Bonus Challenge 4: Match the Concept",
            type: "match-concept",
            pairs: [
                { left: "HTML", right: "Structure" },
                { left: "CSS", right: "Styling" },
                { left: "JavaScript", right: "Behavior" }
            ],
            bonus: true
        },
        {
            q: "Bonus Challenge 5: Predict the Layout",
            type: "guess-output", // Reuse guess-output layout
            snippet: '<style>\np {\n  color: blue;\n}\n</style>\n<p>Hello World</p>',
            question: "What will happen to the paragraph text?",
            options: ["A) The text turns blue", "B) The font size increases", "C) The text disappears", "D) Nothing changes"],
            a: 0,
            bonus: true
        }
    ];

    window.loadQuestion = function () {
        const qData = quizData[state.currentQuestionIndex];
        const qText = document.getElementById('question-text');
        const opts = document.getElementById('options-container');
        const feedback = document.getElementById('quiz-feedback');
        const nextBtn = document.getElementById('next-q-btn');
        const contentArea = document.getElementById('quiz-content-area');
        const resultsArea = document.getElementById('quiz-results-area');

        // Reset visibility
        contentArea.classList.remove('hidden');
        resultsArea.classList.add('hidden');
        feedback.className = 'hidden p-5 md:p-6 rounded-[1.5rem] border-2 text-sm md:text-base font-bold mb-10 animate-fade-in transition-all';
        nextBtn.classList.add('hidden');

        document.getElementById('q-current').textContent = state.currentQuestionIndex + 1;
        document.getElementById('q-total').textContent = quizData.length;
        document.getElementById('q-score').textContent = state.quizScore + (state.bonusScore > 0 ? ` (+${state.bonusScore})` : '');

        opts.className = "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-10"; // Default

        if (qData.type === 'fix-code') {
            opts.className = "block w-full mb-10";
            qText.innerHTML = `
                <div class="flex flex-col items-center">
                    <span class="text-orange-500 text-xs md:text-sm mb-2 flex items-center gap-2 font-bold uppercase tracking-widest"><i class="fa-solid fa-star"></i> Bonus Challenge (Optional)</span>
                    <span class="text-xl md:text-3xl">${qData.q}</span>
                </div>
            `;
            opts.innerHTML = `
                <div class="space-y-6">
                    <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 text-left">
                        <p class="text-sm md:text-base text-blue-800 dark:text-blue-300 font-bold mb-1">Instruction:</p>
                        <p class="text-xs md:text-sm text-blue-700 dark:text-blue-400 font-medium">${qData.instruction}</p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 h-[250px] md:h-[300px]">
                        <div class="flex flex-col border-2 border-gray-100 dark:border-dark-border rounded-2xl overflow-hidden shadow-sm h-full">
                            <div class="bg-gray-50 dark:bg-gray-800 px-4 py-2 text-[10px] font-black text-gray-400 border-b border-gray-100 dark:border-dark-border uppercase flex justify-between items-center">
                                <span>HTML Editor</span>
                                <i class="fa-solid fa-code"></i>
                            </div>
                            <textarea id="bonus-code-input" spellcheck="false" class="flex-1 bg-slate-900 text-brand-100 p-4 font-mono text-xs md:text-sm resize-none focus:outline-none">${qData.initialCode}</textarea>
                        </div>
                        <div class="flex flex-col border-2 border-gray-100 dark:border-dark-border rounded-2xl overflow-hidden shadow-sm h-full bg-white relative">
                            <div class="bg-gray-50 dark:bg-gray-800 px-4 py-2 text-[10px] font-black text-gray-400 border-b border-gray-100 dark:border-dark-border uppercase flex justify-between items-center">
                                <span class="text-gray-400">Preview Area</span>
                                <div class="flex gap-1">
                                    <div class="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                                    <div class="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                                    <div class="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                                </div>
                            </div>
                            <div id="bonus-preview" class="flex-1 p-4 bg-white text-left overflow-auto text-gray-800"></div>
                        </div>
                    </div>
                    <button id="run-bonus-btn" class="w-full bg-brand-600 hover:bg-brand-700 text-white font-black py-4 rounded-2xl transition-all active:scale-95 shadow-xl shadow-brand-500/20 flex items-center justify-center gap-3">
                        <i class="fa-solid fa-play"></i>
                        <span>Run Code & Check Answer</span>
                    </button>
                </div>
            `;

            const btn = document.getElementById('run-bonus-btn');
            const input = document.getElementById('bonus-code-input');
            const preview = document.getElementById('bonus-preview');

            btn.onclick = () => {
                const code = input.value;
                preview.innerHTML = code;

                // Logic: <h1> properly closed and <p> rendered
                const hasH1Closed = /<h1>.*<\/h1>/is.test(code);
                const hasP = /<p>.*<\/p>/is.test(code);

                checkBonusAnswer(hasH1Closed && hasP);
            };
        } else if (qData.type === 'match-concept') {
            qText.innerHTML = `
                <div class="flex flex-col items-center">
                    <span class="text-orange-500 text-xs md:text-sm mb-2 flex items-center gap-2 font-bold uppercase tracking-widest"><i class="fa-solid fa-star"></i> Bonus Challenge (Optional)</span>
                    <span class="text-xl md:text-3xl">${qData.q}</span>
                </div>
            `;
            opts.className = "block w-full mb-10";
            opts.innerHTML = `
                <div class="max-w-2xl mx-auto">
                    <p class="text-sm md:text-base text-gray-500 dark:text-gray-400 font-bold mb-8 text-center">Match each technology with its correct role:</p>
                    <div class="grid grid-cols-2 gap-8 md:gap-16">
                        <div id="left-column" class="space-y-4"></div>
                        <div id="right-column" class="space-y-4"></div>
                    </div>
                </div>
            `;

            const leftCol = document.getElementById('left-column');
            const rightCol = document.getElementById('right-column');

            let selectedLeft = null;
            let selectedRight = null;
            let completed = 0;

            const leftItems = qData.pairs.map(p => p.left);
            const rightItems = [...qData.pairs.map(p => p.right)].sort(() => Math.random() - 0.5);

            leftItems.forEach(item => {
                const btn = document.createElement('button');
                btn.className = 'w-full p-4 rounded-xl border-2 border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card font-black text-gray-700 dark:text-gray-300 transition-all active:scale-95 shadow-sm text-sm md:text-base';
                btn.textContent = item;
                btn.onclick = () => {
                    if (btn.disabled) return;
                    leftCol.querySelectorAll('button').forEach(b => b.classList.remove('border-brand-500', 'bg-brand-50', 'dark:bg-brand-900/20'));
                    btn.classList.add('border-brand-500', 'bg-brand-50', 'dark:bg-brand-900/20');
                    selectedLeft = { text: item, btn: btn };
                    checkPair();
                };
                leftCol.appendChild(btn);
            });

            rightItems.forEach(item => {
                const btn = document.createElement('button');
                btn.className = 'w-full p-4 rounded-xl border-2 border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card font-black text-gray-700 dark:text-gray-300 transition-all active:scale-95 shadow-sm text-sm md:text-base';
                btn.textContent = item;
                btn.onclick = () => {
                    if (btn.disabled) return;
                    rightCol.querySelectorAll('button').forEach(b => b.classList.remove('border-brand-500', 'bg-brand-50', 'dark:bg-brand-900/20'));
                    btn.classList.add('border-brand-500', 'bg-brand-50', 'dark:bg-brand-900/20');
                    selectedRight = { text: item, btn: btn };
                    checkPair();
                };
                rightCol.appendChild(btn);
            });

            function checkPair() {
                if (selectedLeft && selectedRight) {
                    const pair = qData.pairs.find(p => p.left === selectedLeft.text);
                    if (pair.right === selectedRight.text) {
                        // Correct
                        [selectedLeft.btn, selectedRight.btn].forEach(b => {
                            b.disabled = true;
                            b.className = 'w-full p-4 rounded-xl border-2 border-green-500 bg-green-50 dark:bg-green-900/20 font-black text-green-700 dark:text-green-400 shadow-sm opacity-60 flex justify-between items-center';
                            b.innerHTML += '<i class="fa-solid fa-check"></i>';
                        });
                        completed++;
                        selectedLeft = null;
                        selectedRight = null;

                        if (completed === qData.pairs.length) {
                            state.bonusScore++;
                            document.getElementById('q-score').textContent = state.quizScore + (state.bonusScore > 0 ? ` (+${state.bonusScore})` : '');
                            feedback.innerHTML = `<i class="fa-solid fa-circle-check mr-2"></i> Perfect Match! You've masterfully connected the concepts. ⭐`;
                            feedback.className = 'p-5 md:p-6 rounded-[1.5rem] border-2 text-sm md:text-base font-bold mb-10 animate-fade-in transition-all bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
                            feedback.classList.remove('hidden');
                            nextBtn.classList.remove('hidden');
                        }
                    } else {
                        // Incorrect
                        const lBtn = selectedLeft.btn;
                        const rBtn = selectedRight.btn;
                        [lBtn, rBtn].forEach(b => b.classList.add('border-red-500', 'bg-red-50', 'dark:bg-red-900/20'));

                        setTimeout(() => {
                            [lBtn, rBtn].forEach(b => {
                                b.classList.remove('border-red-500', 'bg-red-50', 'dark:bg-red-900/20', 'border-brand-500', 'bg-brand-50', 'dark:bg-brand-900/20');
                            });
                            selectedLeft = null;
                            selectedRight = null;
                        }, 500);
                    }
                }
            }
        } else if (qData.type === 'guess-output') {
            qText.innerHTML = `
                <div class="flex flex-col items-center">
                    <span class="text-orange-500 text-xs md:text-sm mb-2 flex items-center gap-2 font-bold uppercase tracking-widest"><i class="fa-solid fa-star"></i> Bonus Challenge (Optional)</span>
                    <span class="text-xl md:text-3xl">${qData.q}</span>
                </div>
            `;
            opts.innerHTML = `
                <div class="col-span-full">
                    <div class="bg-slate-900 rounded-2xl p-6 mb-8 font-mono text-brand-100 text-sm md:text-lg border border-slate-700 shadow-2xl w-full max-w-lg mx-auto relative overflow-hidden group">
                        <div class="absolute top-0 right-0 p-3 text-[10px] text-slate-500 font-bold uppercase tracking-widest opacity-50">Browser Snippet</div>
                        <code>${qData.snippet.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>
                    </div>
                    <div class="text-lg md:text-2xl font-black text-gray-800 dark:text-gray-200 mb-8">${qData.question}</div>
                    <div id="bonus-opts-grid" class="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
                </div>
            `;

            const grid = document.getElementById('bonus-opts-grid');
            qData.options.forEach((opt, idx) => {
                const btn = document.createElement('button');
                btn.className = 'w-full text-left p-4 md:p-6 rounded-2xl md:rounded-[1.5rem] border-2 border-gray-50 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-brand-300 dark:hover:border-brand-500 transition-all font-bold text-gray-700 dark:text-gray-300 text-sm md:text-lg option-btn active:scale-95 shadow-sm';
                btn.innerHTML = `
                    <div class="flex items-center gap-4">
                        <span class="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs md:text-sm text-brand-600 dark:text-brand-400 font-black italic shrink-0">${opt.charAt(0)}</span>
                        <span class="flex-1">${opt.substring(2).trim()}</span>
                    </div>
                `;
                btn.onclick = () => checkAnswer(idx, btn);
                grid.appendChild(btn);
            });
        } else {
            qText.textContent = qData.q;
            opts.innerHTML = '';
            qData.options.forEach((opt, idx) => {
                const btn = document.createElement('button');
                btn.className = 'w-full text-left p-4 md:p-6 rounded-2xl md:rounded-[1.5rem] border-2 border-gray-50 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-brand-300 dark:hover:border-brand-500 transition-all font-bold text-gray-700 dark:text-gray-300 text-sm md:text-lg option-btn active:scale-95 shadow-sm';

                btn.innerHTML = `
                    <div class="flex items-center gap-4">
                        <span class="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs md:text-sm text-brand-600 dark:text-brand-400 font-black italic shrink-0">${String.fromCharCode(65 + idx)}</span>
                        <span class="flex-1 cursor-pointer font-mono text-sm md:text-base break-all option-text-content"></span>
                    </div>
                `;
                btn.querySelector('.option-text-content').textContent = opt;
                btn.onclick = () => checkAnswer(idx, btn);
                opts.appendChild(btn);
            });
        }
    }

    window.checkBonusAnswer = function (isCorrect) {
        const qData = quizData[state.currentQuestionIndex];
        const feedback = document.getElementById('quiz-feedback');
        const nextBtn = document.getElementById('next-q-btn');
        const runBtn = document.getElementById('run-bonus-btn');

        if (isCorrect) {
            state.bonusScore++;
            document.getElementById('q-score').textContent = state.quizScore + (state.bonusScore > 0 ? ` (+${state.bonusScore})` : '');
            feedback.innerHTML = `<i class="fa-solid fa-circle-check mr-2"></i> Correct! You've fixed the code and earned a bonus point! ⭐`;
            feedback.className = 'p-5 md:p-6 rounded-[1.5rem] border-2 text-sm md:text-base font-bold mb-10 animate-fade-in transition-all bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
            if (runBtn) runBtn.disabled = true;
            nextBtn.classList.remove('hidden');
        } else {
            feedback.innerHTML = `<i class="fa-solid fa-circle-info mr-2"></i> ${qData.hint || "Keep trying! Ensure all tags are correctly closed."}`;
            feedback.className = 'p-5 md:p-6 rounded-[1.5rem] border-2 text-sm md:text-base font-bold mb-10 animate-fade-in transition-all bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800';
            feedback.classList.remove('hidden');
            // Allow retry by not hiding/disabling for fix-code until correct or they give up (or just leave it)
            // But we need a way to progress even if they fail? 
            // The prompt says "If incorrect -> no bonus point". So maybe "Next Challenge" should appear anyway?
            nextBtn.classList.remove('hidden');
            nextBtn.querySelector('span').textContent = "Skip & Continue";
        }
        feedback.classList.remove('hidden');
    }

    function checkAnswer(selectedIdx, btn) {
        const qData = quizData[state.currentQuestionIndex];
        const feedback = document.getElementById('quiz-feedback');
        const nextBtn = document.getElementById('next-q-btn');
        const allBtns = document.querySelectorAll('.option-btn');

        allBtns.forEach(b => b.disabled = true);

        const isCorrect = selectedIdx === qData.a;
        if (isCorrect) {
            if (qData.bonus) {
                state.bonusScore++;
            } else {
                state.quizScore++;
            }
            document.getElementById('q-score').textContent = state.quizScore + (state.bonusScore > 0 ? ` (+${state.bonusScore})` : '');
            btn.classList.add('bg-green-100', 'border-green-500', 'text-green-700', 'dark:bg-green-900/30', 'dark:text-green-400');
            feedback.innerHTML = `<i class="fa-solid fa-circle-check mr-2"></i> ${qData.bonus ? "Excellent! Bonus point awarded! ⭐" : "Correct!"}`;
            feedback.classList.remove('hidden');
            feedback.className = 'p-5 md:p-6 rounded-[1.5rem] border-2 text-sm md:text-base font-bold mb-10 animate-fade-in transition-all bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
        } else {
            btn.classList.add('bg-red-100', 'border-red-500', 'text-red-700', 'dark:bg-red-900/30', 'dark:text-red-400');
            feedback.innerHTML = `<i class="fa-solid fa-circle-xmark mr-2"></i> ${qData.bonus ? "Incorrect. No bonus point awarded." : "Incorrect."}`;
            feedback.classList.remove('hidden');
            feedback.className = 'p-5 md:p-6 rounded-[1.5rem] border-2 text-sm md:text-base font-bold mb-10 animate-fade-in transition-all bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
            allBtns[qData.a].classList.add('bg-green-50', 'border-green-500', 'dark:bg-green-900/20', 'dark:border-green-800');
        }

        nextBtn.classList.remove('hidden');
        nextBtn.querySelector('span').textContent = "Next Challenge";
    }

    window.nextQuestion = function () {
        const currentIdx = state.currentQuestionIndex;
        const total = quizData.length;

        // Trace
        console.log(`Advancing from Q${currentIdx + 1}/${total}`);

        if (currentIdx < total - 1) {
            state.currentQuestionIndex++;
            loadQuestion();
        } else {
            finishQuiz();
        }
    }

    window.finishQuiz = function () {
        // Final sanity check: are there remaining bonus questions?
        if (state.currentQuestionIndex < quizData.length - 1) {
            console.warn("finishQuiz called prematurely, forcing next question.");
            nextQuestion();
            return;
        }

        const contentArea = document.getElementById('quiz-content-area');
        const resultsArea = document.getElementById('quiz-results-area');
        const standardPassed = state.quizScore >= 8;
        const isMastery = state.quizScore === 10 && state.bonusScore === 5;

        contentArea.classList.add('hidden');
        resultsArea.classList.remove('hidden');

        resultsArea.innerHTML = `
            <div class="text-center py-10 md:py-16">
                <div class="relative inline-block mb-8">
                    <div class="absolute inset-0 bg-${standardPassed ? (isMastery ? 'cyan' : 'green') : 'red'}-500 blur-2xl opacity-25 rounded-full animate-pulse"></div>
                    <i class="fa-solid ${standardPassed ? (isMastery ? 'fa-gem text-cyan-500 animate-bounce' : 'fa-medal text-brand-600') : 'fa-circle-exclamation text-red-500'} text-7xl md:text-9xl relative drop-shadow-2xl"></i>
                    ${isMastery ? `<div class="absolute -top-4 -right-4 bg-yellow-400 text-black text-[10px] font-black px-2 py-1 rounded-lg shadow-lg rotate-12">LEGENDARY</div>` : ''}
                </div>
                <h3 class="text-3xl md:text-5xl font-black mb-4 ${standardPassed ? (isMastery ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-600' : 'text-gray-900 dark:text-white') : 'text-red-600'}">
                    ${isMastery ? 'Ultimate Legend Unlocked!' : (standardPassed ? 'Mission Complete!' : 'Challenge Failed')}
                </h3>
                <div class="max-w-md mx-auto">
                    <p class="text-gray-500 dark:text-gray-400 mb-2 text-lg md:text-xl font-medium">
                        Score: <span class="text-brand-600 font-black italic underline">${state.quizScore}</span>/10 
                        + <span class="text-orange-500 font-black italic underline">${state.bonusScore}</span> Bonus Points
                    </p>
                    <p class="text-gray-400 dark:text-gray-500 mb-10 text-sm md:text-base italic">
                        ${isMastery ? 'You have reached the 100th percentile! A flawless victory.' : (standardPassed ? 'Your digital assets are now ready.' : 'Refine your skills and try again to unlock certification.')}
                    </p>
                </div>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <button onclick="navigateTo('menu')" class="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-black py-4 px-10 rounded-2xl transition-all active:scale-95 text-lg">Return Home</button>
                    ${!standardPassed ? `<button id="retry-btn" class="bg-brand-600 hover:bg-brand-700 text-white font-black py-4 px-10 rounded-2xl transition-all active:scale-95 text-lg shadow-xl shadow-brand-500/20">Retry Assessment</button>` : ''}
                </div>
            </div>
        `;

        if (!standardPassed) {
            const retryBtn = document.getElementById('retry-btn');
            if (retryBtn) {
                retryBtn.onclick = () => {
                    state.currentQuestionIndex = 0;
                    state.quizScore = 0;
                    state.bonusScore = 0;
                    loadQuestion();
                };
            }
        }

        if (standardPassed) {
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

    // --- Certificate Generation (jsPDF) ---
    window.downloadCertificate = function () {
        if (typeof jspdf === 'undefined') {
            console.error("jsPDF library not loaded");
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        const isMastery = state.quizScore === 10 && state.bonusScore === 5;
        const score = state.quizScore < 8 ? 8 : state.quizScore;
        const badge = isMastery ? badges["mastery"] : (badges[score] || badges[8]);

        // Tier Colors (RGB)
        const tierColors = {
            "Bronze": [205, 127, 50],
            "Silver": [192, 192, 192],
            "Gold": [255, 215, 0],
            "Legendary": [34, 211, 238] // Cyan-400
        };
        const mainColor = tierColors[isMastery ? "Legendary" : badge.tier] || [37, 99, 235];

        const today = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // --- Design Constants ---
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Background
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');

        // Tier-Based Elegant Border
        doc.setDrawColor(mainColor[0], mainColor[1], mainColor[2]);
        doc.setLineWidth(4);
        doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

        doc.setDrawColor(241, 245, 249); // Subtle inner offset
        doc.setLineWidth(1);
        doc.rect(13, 13, pageWidth - 26, pageHeight - 26);

        // --- Top Right Medal Injection ---
        const medalX = pageWidth - 45;
        const medalY = 35;

        // Medal Outer Circle
        doc.setFillColor(mainColor[0], mainColor[1], mainColor[2]);
        doc.circle(medalX, medalY, 15, 'F');
        // Medal Inner Polish
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.5);
        doc.circle(medalX, medalY, 13, 'S');

        // Medal Text
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(isMastery ? "LEGEND" : badge.tier.toUpperCase(), medalX, medalY - 2, { align: 'center' });
        doc.setFontSize(14);
        doc.text(isMastery ? "15/15" : score.toString(), medalX, medalY + 4, { align: 'center' });

        // --- Main Content ---

        // Title
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(42);
        doc.text('CERTIFICATE', pageWidth / 2, 45, { align: 'center' });

        doc.setFontSize(22);
        doc.setFont('helvetica', 'normal');
        doc.text(isMastery ? 'ULTIMATE CERTIFICATE – LEGENDARY STATUS' : 'OF COMPLETION', pageWidth / 2, 55, { align: 'center' });

        // Presentation Text
        doc.setFontSize(14);
        doc.setTextColor(100, 116, 139);
        doc.text('This certificate is proudly presented to', pageWidth / 2, 75, { align: 'center' });

        // Name
        doc.setTextColor(mainColor[0], mainColor[1], mainColor[2]);
        doc.setFontSize(36);
        doc.setFont('helvetica', 'bold');
        doc.text(state.userName, pageWidth / 2, 92, { align: 'center' });

        // Divider
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.line(pageWidth / 2 - 60, 98, pageWidth / 2 + 60, 98);

        // Description
        doc.setTextColor(71, 85, 105);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const descriptionText = isMastery
            ? "This certificate is proudly presented to certify that the learner has achieved Mastery Level in the 'Fundamentals of Web Development' course. The learner displayed absolute proficiency, achieving a perfect score of 10/10 and successfully completing all advanced technical bonus challenges."
            : "This certificate is proudly presented to certify that the learner has successfully completed the course 'Fundamentals of Web Development'. Through this course, the learner has gained essential knowledge of HTML structure, CSS styling fundamentals, and the basic concepts required to build modern, responsive web pages.";
        const splitDescription = doc.splitTextToSize(descriptionText, 190);
        doc.text(splitDescription, pageWidth / 2, 112, { align: 'center' });

        // Congratulations Message
        doc.setFont('helvetica', 'italic');
        const congratsMsg = isMastery
            ? "Congratulations, Legend! You have achieved a flawless 15/15 score, demonstrating unmatched technical mastery and analytical precision in Web Development. This rare distinction is awarded only to the most dedicated learners who leave no stone unturned."
            : "Congratulations on completing this course! Your dedication and effort have resulted in a strong foundation in web development. This achievement marks an important step in your journey as a future web developer.";
        const splitCongrats = doc.splitTextToSize(congratsMsg, 160);
        doc.text(splitCongrats, pageWidth / 2, 135, { align: 'center' });

        // Award Details - Left Aligned Bottom
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(10);
        doc.text('COURSE:', 40, 160);
        doc.setFont('helvetica', 'normal');
        doc.text('Fundamentals of Web Development', 80, 160);

        doc.setFont('helvetica', 'bold');
        doc.text('BADGE:', 40, 166);
        doc.setFont('helvetica', 'normal');
        doc.text(badge.title, 80, 166);

        doc.setFont('helvetica', 'bold');
        doc.text('STATUS:', 40, 172);
        doc.setFont('helvetica', 'normal');
        doc.text(isMastery ? 'Ultimate Legendary Mastery (15/15)' : 'Successfully Completed', 80, 172);

        doc.setFont('helvetica', 'bold');
        doc.text('DATE:', 40, 178);
        doc.setFont('helvetica', 'normal');
        doc.text(today, 80, 178);

        // Motivational Quote
        doc.setFont('helvetica', 'bolditalic');
        doc.setTextColor(mainColor[0], mainColor[1], mainColor[2]);
        doc.setFontSize(15);
        doc.text(`"${badge.quote}"`, pageWidth / 2, 195, { align: 'center' });

        // handwritten Signature "AKafiq"
        doc.setTextColor(30, 41, 59);
        doc.setFont('times', 'italic'); // Mimics handwriting
        doc.setFontSize(24);
        doc.text('AKafiq', 215, 168, { align: 'center' });

        // Signature Line
        doc.setDrawColor(148, 163, 184);
        doc.setLineWidth(0.5);
        doc.line(185, 172, 245, 172);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text('IN-SYSTEM VERIFICATION', 215, 178, { align: 'center' });

        // Save
        doc.save(`${isMastery ? 'Mastery' : 'Certificate'}_WebDev_${state.userName.replace(/\s+/g, '_')}.pdf`);
    };
});
