// ============================================
// Freedom Dashboard
// ============================================

(function () {
    'use strict';

    // ---- State ----
    const STORAGE_KEY = 'freedom-dashboard';

    const defaults = {
        user: {
            name: 'Luis Alvarado'
        },
        freedom: {
            monthlyExpenses: 0,
            idealLifestyle: 0,
            onlineIncome: 0,
            passiveIncome: 0,
            liquidAssets: 0,
            mentalScore: 0,
            inspiredScore: 0
        },
        freedomHistory: []
    };

    let state = loadState();

    function loadState() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return deepMerge(JSON.parse(JSON.stringify(defaults)), parsed);
            }
        } catch (e) {
            console.warn('Failed to load state:', e);
        }
        return JSON.parse(JSON.stringify(defaults));
    }

    function saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn('Failed to save state:', e);
        }
    }

    function deepMerge(target, source) {
        for (const key of Object.keys(source)) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!target[key]) target[key] = {};
                deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
        return target;
    }

    // ---- Navigation ----
    const navItems = document.querySelectorAll('.nav-item[data-section]');
    const sections = document.querySelectorAll('.section');
    const pageTitle = document.querySelector('.page-title');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            sections.forEach(s => s.classList.add('hidden'));
            const target = document.getElementById('section-' + section);
            if (target) target.classList.remove('hidden');
            pageTitle.textContent = item.querySelector('span').textContent;
            initSection(section);
        });
    });

    // ---- Date ----
    const dateEl = document.getElementById('current-date');
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    // ---- Settings ----
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsBtn = document.getElementById('close-settings-modal');
    const cancelSettingsBtn = document.getElementById('cancel-settings');
    const saveSettingsBtn = document.getElementById('save-settings');

    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            document.getElementById('settings-name').value = state.user.name;
            settingsModal.classList.remove('hidden');
        });
    }
    if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));
    if (cancelSettingsBtn) cancelSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            state.user.name = document.getElementById('settings-name').value.trim() || 'User';
            document.querySelector('.user-name').textContent = state.user.name;
            const initials = state.user.name.split(' ').map(n => n[0]).join('').toUpperCase();
            document.querySelector('.avatar').textContent = initials;
            saveState();
            settingsModal.classList.add('hidden');
            showToast('Settings saved');
        });
    }

    // ---- Freedom Levels ----
    const freedomLevels = [
        { min: 100, name: 'Modern Freedom', desc: 'Total alignment. You run your life. Nothing owns you. Calm, clear, sovereign.' },
        { min: 90, name: 'Self-Actualised', desc: 'You live with power & inspiration. Minimal friction. Most days feel like yours.' },
        { min: 80, name: 'Self-Governed', desc: 'You lead. You create. You choose. There\'s structure, but it serves you.' },
        { min: 70, name: 'Semi-Free', desc: 'You\'ve taken ground. Still some internal or external pressure pulling at you.' },
        { min: 60, name: 'Controlled Comfort', desc: 'Life\'s okay. But you\'re negotiating too much. Energy leaks everywhere.' },
        { min: 50, name: 'The Plateau', desc: 'Stuck. You\'re doing things that "work" but don\'t feel right. No real momentum.' },
        { min: 40, name: 'Quiet Constraint', desc: 'You feel the tension daily. Choices feel limited. You\'re reacting more than leading.' },
        { min: 30, name: 'System-Owned', desc: 'You have little control. Your time, mind, and energy are claimed by others.' },
        { min: 20, name: 'Life on Rails', desc: 'Wake up, obey, repeat. You\'re living by scripts that aren\'t yours.' },
        { min: 10, name: 'Identity Erosion', desc: 'You barely recognise yourself. No clarity, no power, no voice.' },
        { min: 0, name: 'Modern Slavery', desc: 'Everything you do is for someone else. You are outsourced. Numb. Lost.' }
    ];

    function getFreedomLevel(pct) {
        for (const level of freedomLevels) {
            if (pct >= level.min) return level;
        }
        return freedomLevels[freedomLevels.length - 1];
    }

    // ---- Score Calculations ----
    function calculateFreedomScores() {
        const f = state.freedom;
        const work = f.monthlyExpenses > 0 ? Math.min((f.onlineIncome / f.monthlyExpenses) * 100, 100) : 0;
        const financial = f.idealLifestyle > 0 ? Math.min((f.passiveIncome / f.idealLifestyle) * 100, 100) : 0;
        const mental = ((f.mentalScore + f.inspiredScore) / 20) * 100;
        const time = f.monthlyExpenses > 0 ? Math.min((f.liquidAssets / (f.monthlyExpenses * 12)) * 100, 100) : 0;
        const modern = (work + financial + mental + time) / 4;

        return {
            work: Math.round(work * 10) / 10,
            financial: Math.round(financial * 10) / 10,
            mental: Math.round(mental * 10) / 10,
            time: Math.round(time * 10) / 10,
            modern: Math.round(modern * 10) / 10
        };
    }

    function getBarColor(pct) {
        if (pct >= 67) return '#1db954';
        if (pct >= 34) return '#ffd60a';
        return '#ff453a';
    }

    // ---- Ring Animation ----
    function animateRing(el, pct, circumference) {
        if (!el) return;
        const offset = circumference - (Math.min(pct / 100, 1) * circumference);
        setTimeout(() => {
            el.style.transition = 'stroke-dashoffset 1s ease, stroke 0.5s ease';
            el.style.strokeDashoffset = offset;
        }, 100);
    }

    // ---- Update Display ----
    function updateFreedomDisplay() {
        const scores = calculateFreedomScores();
        const level = getFreedomLevel(scores.modern);

        // Hero ring
        const heroRing = document.getElementById('freedom-hero-ring');
        if (heroRing) {
            animateRing(heroRing, scores.modern, 490.09);
            heroRing.style.stroke = getBarColor(scores.modern);
        }
        const heroNumber = document.getElementById('freedom-hero-score');
        if (heroNumber) heroNumber.textContent = scores.modern.toFixed(1);
        const heroNum = document.querySelector('.freedom-hero-number');
        if (heroNum) heroNum.style.color = getBarColor(scores.modern);

        // Level info
        const levelName = document.getElementById('freedom-level-name');
        const levelDesc = document.getElementById('freedom-level-desc');
        if (levelName) {
            levelName.textContent = level.name;
            levelName.style.color = getBarColor(scores.modern);
        }
        if (levelDesc) levelDesc.textContent = level.desc;

        // Level badge in header
        const badge = document.getElementById('level-badge-text');
        if (badge) badge.textContent = level.name;

        // Sub-score rings
        const ringConfigs = [
            { id: 'work-freedom-ring', scoreId: 'work-freedom-score', score: scores.work },
            { id: 'financial-freedom-ring', scoreId: 'financial-freedom-score', score: scores.financial },
            { id: 'mental-freedom-ring', scoreId: 'mental-freedom-score', score: scores.mental },
            { id: 'time-freedom-ring', scoreId: 'time-freedom-score', score: scores.time }
        ];

        ringConfigs.forEach(cfg => {
            const ring = document.getElementById(cfg.id);
            const scoreEl = document.getElementById(cfg.scoreId);
            animateRing(ring, cfg.score, 326.73);
            if (scoreEl) scoreEl.textContent = cfg.score.toFixed(1);
        });

        // Summary bars
        const bars = [
            { pctId: 'summary-work-pct', barId: 'summary-work-bar', score: scores.work },
            { pctId: 'summary-financial-pct', barId: 'summary-financial-bar', score: scores.financial },
            { pctId: 'summary-mental-pct', barId: 'summary-mental-bar', score: scores.mental },
            { pctId: 'summary-time-pct', barId: 'summary-time-bar', score: scores.time },
            { pctId: 'summary-modern-pct', barId: 'summary-modern-bar', score: scores.modern }
        ];

        bars.forEach(b => {
            const pctEl = document.getElementById(b.pctId);
            const barEl = document.getElementById(b.barId);
            if (pctEl) pctEl.textContent = b.score.toFixed(1) + '%';
            if (barEl) barEl.style.width = Math.min(b.score, 100) + '%';
        });

        // Highlight active scale item
        document.querySelectorAll('.scale-item').forEach(item => item.classList.remove('scale-active'));
        const scaleItems = document.querySelectorAll('.scale-item');
        for (const item of scaleItems) {
            const name = item.querySelector('.scale-name');
            if (name && name.textContent === level.name) {
                item.classList.add('scale-active');
                break;
            }
        }

        // Breakdown metrics
        const f = state.freedom;
        const setText = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
        setText('breakdown-expenses', '$' + f.monthlyExpenses.toLocaleString());
        setText('breakdown-ideal', '$' + f.idealLifestyle.toLocaleString());
        setText('breakdown-online', '$' + f.onlineIncome.toLocaleString());
        setText('breakdown-passive', '$' + f.passiveIncome.toLocaleString());
        setText('breakdown-liquid', '$' + f.liquidAssets.toLocaleString());
        setText('breakdown-mental', f.mentalScore.toFixed(1) + ' / 10');
        setText('breakdown-inspired', f.inspiredScore.toFixed(1) + ' / 10');
        const runway = f.monthlyExpenses > 0 ? (f.liquidAssets / f.monthlyExpenses).toFixed(1) : '0.0';
        setText('breakdown-runway', runway + ' months');
    }

    // ---- Inputs ----
    function loadFreedomInputs() {
        const f = state.freedom;
        const fields = {
            'freedom-monthly-expenses': f.monthlyExpenses,
            'freedom-ideal-lifestyle': f.idealLifestyle,
            'freedom-online-income': f.onlineIncome,
            'freedom-passive-income': f.passiveIncome,
            'freedom-liquid-assets': f.liquidAssets,
            'freedom-mental-score': f.mentalScore,
            'freedom-inspired-score': f.inspiredScore
        };

        Object.entries(fields).forEach(([id, val]) => {
            const el = document.getElementById(id);
            if (el) el.value = val || '';
        });
    }

    function readFreedomInputs() {
        state.freedom.monthlyExpenses = parseFloat(document.getElementById('freedom-monthly-expenses').value) || 0;
        state.freedom.idealLifestyle = parseFloat(document.getElementById('freedom-ideal-lifestyle').value) || 0;
        state.freedom.onlineIncome = parseFloat(document.getElementById('freedom-online-income').value) || 0;
        state.freedom.passiveIncome = parseFloat(document.getElementById('freedom-passive-income').value) || 0;
        state.freedom.liquidAssets = parseFloat(document.getElementById('freedom-liquid-assets').value) || 0;
        state.freedom.mentalScore = parseFloat(document.getElementById('freedom-mental-score').value) || 0;
        state.freedom.inspiredScore = parseFloat(document.getElementById('freedom-inspired-score').value) || 0;
    }

    // ---- Snapshots / History ----
    function saveFreedomSnapshot() {
        const scores = calculateFreedomScores();
        const snapshot = {
            date: new Date().toISOString(),
            work: scores.work,
            financial: scores.financial,
            mental: scores.mental,
            time: scores.time,
            modern: scores.modern
        };
        if (!state.freedomHistory) state.freedomHistory = [];
        state.freedomHistory.push(snapshot);
        saveState();
        renderFreedomHistory();
        initFreedomChart();
        showToast('Snapshot saved');
    }

    function renderFreedomHistory() {
        const tbody = document.getElementById('freedom-history-body');
        if (!tbody) return;

        if (!state.freedomHistory || state.freedomHistory.length === 0) {
            tbody.innerHTML = '<tr class="empty-row"><td colspan="7">No snapshots yet. Save your first snapshot above.</td></tr>';
            return;
        }

        tbody.innerHTML = state.freedomHistory.map((entry, i) => {
            const d = new Date(entry.date);
            const dateStr = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
            return `<tr>
                <td>${dateStr}</td>
                <td>${entry.work.toFixed(1)}%</td>
                <td>${entry.financial.toFixed(1)}%</td>
                <td>${entry.mental.toFixed(1)}%</td>
                <td>${entry.time.toFixed(1)}%</td>
                <td class="modern-freedom-cell">${entry.modern.toFixed(1)}%</td>
                <td><button class="history-delete-btn" data-index="${i}">&times;</button></td>
            </tr>`;
        }).reverse().join('');

        tbody.querySelectorAll('.history-delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.index);
                state.freedomHistory.splice(idx, 1);
                saveState();
                renderFreedomHistory();
                initFreedomChart();
            });
        });
    }

    // ---- Charts ----
    const chartInstances = {};

    const chartDefaults = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1e1e2a',
                titleColor: '#fff',
                bodyColor: 'rgba(255,255,255,0.7)',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                cornerRadius: 8,
                padding: 12,
                titleFont: { weight: '600', size: 13 },
                bodyFont: { size: 12 }
            }
        },
        scales: {
            x: {
                grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
                ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 11 } }
            },
            y: {
                grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
                ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 11 } }
            }
        }
    };

    function destroyChart(key) {
        if (chartInstances[key]) {
            chartInstances[key].destroy();
            chartInstances[key] = null;
        }
    }

    function initFreedomChart() {
        const canvas = document.getElementById('freedom-progress-chart');
        if (!canvas) return;

        destroyChart('freedom-progress');

        const history = state.freedomHistory || [];
        if (history.length === 0) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        const labels = history.map(h => {
            const d = new Date(h.date);
            return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
        });

        chartInstances['freedom-progress'] = new Chart(canvas, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Modern Freedom',
                        data: history.map(h => h.modern),
                        borderColor: '#ffd60a',
                        backgroundColor: 'rgba(255, 214, 10, 0.1)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 3,
                        pointRadius: 5,
                        pointBackgroundColor: '#ffd60a',
                        pointBorderColor: '#0a0a0f',
                        pointBorderWidth: 2
                    },
                    {
                        label: 'Work Freedom',
                        data: history.map(h => h.work),
                        borderColor: '#4a9eff',
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 3,
                        pointBackgroundColor: '#4a9eff',
                        fill: false
                    },
                    {
                        label: 'Financial Freedom',
                        data: history.map(h => h.financial),
                        borderColor: '#1db954',
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 3,
                        pointBackgroundColor: '#1db954',
                        fill: false
                    },
                    {
                        label: 'Mental Freedom',
                        data: history.map(h => h.mental),
                        borderColor: '#bf5af2',
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 3,
                        pointBackgroundColor: '#bf5af2',
                        fill: false
                    },
                    {
                        label: 'Time Freedom',
                        data: history.map(h => h.time),
                        borderColor: '#64d2ff',
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 3,
                        pointBackgroundColor: '#64d2ff',
                        fill: false
                    }
                ]
            },
            options: {
                ...chartDefaults,
                plugins: {
                    ...chartDefaults.plugins,
                    legend: {
                        position: 'top',
                        labels: {
                            color: 'rgba(255,255,255,0.6)',
                            font: { size: 11, weight: '500' },
                            padding: 16,
                            usePointStyle: true,
                            pointStyleWidth: 8
                        }
                    }
                },
                scales: {
                    ...chartDefaults.scales,
                    y: {
                        ...chartDefaults.scales.y,
                        min: 0,
                        max: 100,
                        ticks: {
                            ...chartDefaults.scales.y.ticks,
                            callback: v => v + '%',
                            stepSize: 20
                        }
                    }
                }
            }
        });
    }

    function initSubScoreCharts() {
        // Work Freedom trend
        initSubChart('work-trend-chart', 'work-trend', '#4a9eff', 'work');
        // Financial Freedom trend
        initSubChart('financial-trend-chart', 'financial-trend', '#1db954', 'financial');
        // Mental Freedom trend
        initSubChart('mental-trend-chart', 'mental-trend', '#bf5af2', 'mental');
        // Time Freedom trend
        initSubChart('time-trend-chart', 'time-trend', '#64d2ff', 'time');
    }

    function initSubChart(canvasId, chartKey, color, field) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        destroyChart(chartKey);

        const history = state.freedomHistory || [];
        if (history.length === 0) return;

        const labels = history.map(h => {
            const d = new Date(h.date);
            return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
        });

        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, color + '4D');
        gradient.addColorStop(1, color + '00');

        chartInstances[chartKey] = new Chart(canvas, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    data: history.map(h => h[field]),
                    borderColor: color,
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: color
                }]
            },
            options: {
                ...chartDefaults,
                scales: {
                    ...chartDefaults.scales,
                    y: {
                        ...chartDefaults.scales.y,
                        min: 0,
                        max: 100,
                        ticks: { ...chartDefaults.scales.y.ticks, callback: v => v + '%' }
                    }
                }
            }
        });
    }

    // ---- Section Init ----
    function initSection(section) {
        switch (section) {
            case 'overview':
                updateFreedomDisplay();
                break;
            case 'measure':
                loadFreedomInputs();
                updateFreedomDisplay();
                break;
            case 'track':
                renderFreedomHistory();
                initFreedomChart();
                break;
            case 'breakdown':
                updateFreedomDisplay();
                initSubScoreCharts();
                break;
        }
    }

    // ---- Event Listeners ----
    const freedomCalcBtn = document.getElementById('freedom-calculate');
    if (freedomCalcBtn) {
        freedomCalcBtn.addEventListener('click', () => {
            readFreedomInputs();
            saveState();
            updateFreedomDisplay();
            showToast('Freedom scores calculated');
        });
    }

    // Live calculation on input change
    document.querySelectorAll('.freedom-inputs input').forEach(input => {
        input.addEventListener('input', () => {
            readFreedomInputs();
            updateFreedomDisplay();
        });
    });

    const freedomSnapshotBtn = document.getElementById('freedom-snapshot-btn');
    if (freedomSnapshotBtn) {
        freedomSnapshotBtn.addEventListener('click', () => {
            readFreedomInputs();
            saveState();
            updateFreedomDisplay();
            saveFreedomSnapshot();
        });
    }

    const freedomClearHistoryBtn = document.getElementById('freedom-clear-history');
    if (freedomClearHistoryBtn) {
        freedomClearHistoryBtn.addEventListener('click', () => {
            if (state.freedomHistory && state.freedomHistory.length > 0) {
                state.freedomHistory = [];
                saveState();
                renderFreedomHistory();
                initFreedomChart();
                showToast('History cleared');
            }
        });
    }

    // ---- Toast ----
    function showToast(message) {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    // ---- Initialize ----
    function init() {
        updateFreedomDisplay();
        loadFreedomInputs();
        renderFreedomHistory();
    }

    if (typeof Chart !== 'undefined') {
        Chart.defaults.font.family = "'Inter', -apple-system, sans-serif";
        init();
    } else {
        window.addEventListener('load', () => {
            if (typeof Chart !== 'undefined') {
                Chart.defaults.font.family = "'Inter', -apple-system, sans-serif";
            }
            init();
        });
    }
})();
