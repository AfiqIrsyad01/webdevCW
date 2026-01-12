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
        }
    };

    function updateFinalSlide() {
        const score = state.quizScore < 8 ? 8 : state.quizScore;
        const badge = badges[score] || badges[8];

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
                            <div class="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] mb-1 md:mb-2 opacity-80">${badge.tier} Tier Achievement</div>
                            <div class="text-xs md:text-lg font-black text-center px-4 leading-tight uppercase tracking-wide drop-shadow-md">${badge.title}</div>
                            
                            <!-- Floating Score Tag -->
                            <div class="absolute -bottom-4 md:-bottom-6 bg-white dark:bg-dark-card text-brand-600 dark:text-brand-400 font-black text-xl md:text-3xl px-6 md:px-8 py-2 rounded-[1.5rem] shadow-xl border border-gray-100 dark:border-dark-border transform hover:translate-y-[-4px] transition-transform">
                                ${score}/10
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
            btn.className = 'w-full text-left p-4 md:p-6 rounded-2xl md:rounded-[1.5rem] border-2 border-gray-50 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-brand-300 dark:hover:border-brand-500 transition-all font-bold text-gray-700 dark:text-gray-300 text-sm md:text-lg option-btn active:scale-95 shadow-sm';

            // Outer structure for layout
            btn.innerHTML = `
                <div class="flex items-center gap-4">
                    <span class="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs md:text-sm text-brand-600 dark:text-brand-400 font-black italic shrink-0">${String.fromCharCode(65 + idx)}</span>
                    <span class="flex-1 cursor-pointer font-mono text-sm md:text-base break-all option-text-content"></span>
                </div>
            `;

            // Set textContent separately to escape HTML tags (like <h1> or <img>)
            btn.querySelector('.option-text-content').textContent = opt;

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
            btn.classList.add('bg-green-100', 'border-green-500', 'text-green-700', 'dark:bg-green-900/30', 'dark:text-green-400');
            feedback.textContent = "Correct!";
            feedback.classList.remove('hidden');
            feedback.classList.add('bg-green-50', 'text-green-700', 'border-green-200', 'dark:bg-green-900/20', 'dark:text-green-400', 'dark:border-green-800');
        } else {
            btn.classList.add('bg-red-100', 'border-red-500', 'text-red-700', 'dark:bg-red-900/30', 'dark:text-red-400');
            feedback.textContent = "Incorrect.";
            feedback.classList.remove('hidden');
            feedback.classList.add('bg-red-50', 'text-red-700', 'border-red-200', 'dark:bg-red-900/20', 'dark:text-red-400', 'dark:border-red-800');
            // Show correct
            allBtns[qData.a].classList.add('bg-green-50', 'border-green-500', 'dark:bg-green-900/20', 'dark:border-green-800');
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
            <div class="text-center py-10 md:py-16">
                <div class="relative inline-block mb-8">
                    <div class="absolute inset-0 bg-${passed ? 'green' : 'red'}-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
                    <i class="fa-solid ${passed ? 'fa-medal text-brand-600' : 'fa-circle-exclamation text-red-500'} text-7xl md:text-9xl relative drop-shadow-xl"></i>
                </div>
                <h3 class="text-3xl md:text-5xl font-black mb-4 ${passed ? 'text-gray-900 dark:text-white' : 'text-red-600'}">${passed ? 'Mission Complete!' : 'Challenge Failed'}</h3>
                <p class="text-gray-500 dark:text-gray-400 mb-10 text-lg md:text-xl font-medium max-w-md mx-auto">You scored <span class="text-brand-600 font-black italic underline">${state.quizScore}</span> out of 10. ${passed ? 'Your digital assets are now ready.' : 'Refine your skills and try again to unlock certification.'}</p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <button onclick="navigateTo('menu')" class="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-black py-4 px-10 rounded-2xl transition-all active:scale-95 text-lg">Return Home</button>
                    ${!passed ? `<button onclick="state.currentQuestionIndex=0;state.quizScore=0;loadQuestion();" class="bg-brand-600 hover:bg-brand-700 text-white font-black py-4 px-10 rounded-2xl transition-all active:scale-95 text-lg shadow-xl shadow-brand-500/20">Retry Assessment</button>` : ''}
                </div>
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

        const score = state.quizScore < 8 ? 8 : state.quizScore;
        const badge = badges[score] || badges[8];

        // Tier Colors (RGB)
        const tierColors = {
            "Bronze": [205, 127, 50],
            "Silver": [192, 192, 192],
            "Gold": [255, 215, 0]
        };
        const mainColor = tierColors[badge.tier] || [37, 99, 235];

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
        doc.text(badge.tier.toUpperCase(), medalX, medalY - 2, { align: 'center' });
        doc.setFontSize(14);
        doc.text(score.toString(), medalX, medalY + 4, { align: 'center' });

        // --- Main Content ---

        // Title
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(42);
        doc.text('CERTIFICATE', pageWidth / 2, 45, { align: 'center' });

        doc.setFontSize(22);
        doc.setFont('helvetica', 'normal');
        doc.text('OF COMPLETION', pageWidth / 2, 55, { align: 'center' });

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
        const descriptionText = "This certificate is proudly presented to certify that the learner has successfully completed the course 'Fundamentals of Web Development'. Through this course, the learner has gained essential knowledge of HTML structure, CSS styling fundamentals, and the basic concepts required to build modern, responsive web pages.";
        const splitDescription = doc.splitTextToSize(descriptionText, 190);
        doc.text(splitDescription, pageWidth / 2, 112, { align: 'center' });

        // Congratulations Message
        doc.setFont('helvetica', 'italic');
        const congratsMsg = "Congratulations on completing this course! Your dedication and effort have resulted in a strong foundation in web development. This achievement marks an important step in your journey as a future web developer.";
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
        doc.text('Successfully Completed', 80, 172);

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
        doc.save(`Fundamentals_WebDev_Certificate_${state.userName.replace(/\s+/g, '_')}.pdf`);
    };
});
