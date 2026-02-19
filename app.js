// ============================================
// Health Intelligence Dashboard
// ============================================

(function () {
    'use strict';

    // ---- State ----
    const STORAGE_KEY = 'health-intelligence';

    const defaults = {
        user: {
            name: 'Luis Alvarado',
            height: 70, // inches
            age: 30,
            activity: 'moderate'
        },
        goals: {
            weight: 175,
            bodyFat: 15,
            calories: 2400,
            protein: 180,
            carbs: 280,
            fat: 70,
            sleep: 8,
            steps: 10000,
            water: 128
        },
        body: {
            currentWeight: 185,
            bodyFat: 18.5,
            muscleMass: 152,
            restingHR: 58
        },
        meals: [],
        streak: 7,
        todayNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 }
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
            initChartsForSection(section);
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

    // ---- Streak ----
    document.getElementById('streak-count').textContent = state.streak;

    // ---- Score Rings ----
    function animateRing(card, score, max) {
        const circle = card.querySelector('.score-ring-progress');
        if (!circle) return;
        const circumference = 326.73;
        const pct = Math.min(score / max, 1);
        const offset = circumference - (pct * circumference);
        setTimeout(() => {
            circle.style.transition = 'stroke-dashoffset 1s ease';
            circle.style.strokeDashoffset = offset;
        }, 100);
    }

    function updateScoreCards() {
        // Recovery
        const recovery = generateRecovery();
        document.getElementById('recovery-score').textContent = recovery;
        document.getElementById('recovery-label').textContent = recovery >= 67 ? 'Green' : recovery >= 34 ? 'Yellow' : 'Red';
        animateRing(document.querySelector('.recovery-card'), recovery, 100);

        // Strain
        const strain = generateStrain();
        document.getElementById('strain-score').textContent = strain.toFixed(1);
        document.getElementById('strain-label').textContent = strain >= 14 ? 'Overreaching' : strain >= 10 ? 'High' : 'Moderate';
        animateRing(document.querySelector('.strain-card'), strain, 21);

        // Sleep
        const sleepScore = generateSleepScore();
        document.getElementById('sleep-score').textContent = sleepScore;
        document.getElementById('sleep-label').textContent = sleepScore >= 85 ? 'Optimal' : sleepScore >= 70 ? 'Adequate' : 'Poor';
        animateRing(document.querySelector('.sleep-card'), sleepScore, 100);

        // Calories
        const totalCal = state.todayNutrition.calories;
        document.getElementById('calories-score').textContent = totalCal.toLocaleString();
        const calPct = Math.round((totalCal / state.goals.calories) * 100);
        document.getElementById('calories-label').textContent = calPct + '% of goal';
        animateRing(document.querySelector('.calories-card'), totalCal, state.goals.calories);
    }

    function generateRecovery() {
        // Simulated — in production would come from wearable
        const base = 65;
        const variance = Math.sin(Date.now() / 86400000) * 20;
        return Math.round(Math.max(20, Math.min(99, base + variance)));
    }

    function generateStrain() {
        const base = 10;
        const variance = Math.cos(Date.now() / 86400000) * 5;
        return Math.round((base + variance) * 10) / 10;
    }

    function generateSleepScore() {
        const base = 78;
        const variance = Math.sin(Date.now() / 43200000) * 12;
        return Math.round(Math.max(40, Math.min(99, base + variance)));
    }

    // ---- Body Stats ----
    function updateBodyStats() {
        const bmi = calculateBMI(state.body.currentWeight, state.user.height);

        document.getElementById('current-weight').textContent = state.body.currentWeight + ' lbs';
        document.getElementById('goal-weight').textContent = state.goals.weight + ' lbs';
        document.getElementById('body-fat').textContent = state.body.bodyFat + '%';
        document.getElementById('muscle-mass').textContent = state.body.muscleMass + ' lbs';
        document.getElementById('bmi').textContent = bmi.toFixed(1);
        document.getElementById('resting-hr').textContent = state.body.restingHR + ' bpm';

        // Body section
        const bodyCurrentEl = document.getElementById('body-current-weight');
        const bodyGoalEl = document.getElementById('body-goal-weight');
        const bodyDiffEl = document.getElementById('body-diff-weight');
        const bodyBmiEl = document.getElementById('body-bmi');
        if (bodyCurrentEl) bodyCurrentEl.textContent = state.body.currentWeight + ' lbs';
        if (bodyGoalEl) bodyGoalEl.textContent = state.goals.weight + ' lbs';
        if (bodyDiffEl) {
            const diff = state.body.currentWeight - state.goals.weight;
            bodyDiffEl.textContent = (diff > 0 ? '-' : '+') + Math.abs(diff) + ' lbs';
        }
        if (bodyBmiEl) bodyBmiEl.textContent = bmi.toFixed(1);
    }

    function calculateBMI(weightLbs, heightInches) {
        return (weightLbs / (heightInches * heightInches)) * 703;
    }

    // ---- Nutrition ----
    function updateNutrition() {
        // Recalculate from meals
        state.todayNutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        state.meals.forEach(m => {
            state.todayNutrition.calories += m.calories || 0;
            state.todayNutrition.protein += m.protein || 0;
            state.todayNutrition.carbs += m.carbs || 0;
            state.todayNutrition.fat += m.fat || 0;
        });

        const n = state.todayNutrition;
        const g = state.goals;

        document.getElementById('cal-current').textContent = n.calories.toLocaleString();
        document.getElementById('cal-goal').textContent = g.calories.toLocaleString();
        document.getElementById('cal-bar').style.width = Math.min((n.calories / g.calories) * 100, 100) + '%';

        document.getElementById('protein-current').textContent = n.protein;
        document.getElementById('protein-goal').textContent = g.protein;
        document.getElementById('protein-bar').style.width = Math.min((n.protein / g.protein) * 100, 100) + '%';

        document.getElementById('carbs-current').textContent = n.carbs;
        document.getElementById('carbs-goal').textContent = g.carbs;
        document.getElementById('carbs-bar').style.width = Math.min((n.carbs / g.carbs) * 100, 100) + '%';

        document.getElementById('fat-current').textContent = n.fat;
        document.getElementById('fat-goal').textContent = g.fat;
        document.getElementById('fat-bar').style.width = Math.min((n.fat / g.fat) * 100, 100) + '%';
    }

    // ---- Meals ----
    function renderMeals() {
        const list = document.getElementById('meals-list');
        if (!list) return;

        if (state.meals.length === 0) {
            list.innerHTML = '<div class="empty-state"><p>No meals logged today</p></div>';
            return;
        }

        list.innerHTML = state.meals.map((meal, i) => `
            <div class="meal-entry">
                <div class="meal-info">
                    <h4>${escapeHtml(meal.name)}</h4>
                    <div class="meal-macros">
                        <span>P: ${meal.protein}g</span>
                        <span>C: ${meal.carbs}g</span>
                        <span>F: ${meal.fat}g</span>
                    </div>
                </div>
                <div style="display:flex;align-items:center;gap:12px;">
                    <span class="meal-calories">${meal.calories}</span>
                    <button class="meal-delete" data-index="${i}">&times;</button>
                </div>
            </div>
        `).join('');

        list.querySelectorAll('.meal-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.index);
                state.meals.splice(idx, 1);
                saveState();
                renderMeals();
                updateNutrition();
                updateScoreCards();
            });
        });
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Meal modal
    const mealModal = document.getElementById('meal-modal');
    const addMealBtn = document.getElementById('add-meal-btn');
    const closeMealBtn = document.getElementById('close-meal-modal');
    const cancelMealBtn = document.getElementById('cancel-meal');
    const saveMealBtn = document.getElementById('save-meal');

    if (addMealBtn) {
        addMealBtn.addEventListener('click', () => mealModal.classList.remove('hidden'));
    }
    if (closeMealBtn) {
        closeMealBtn.addEventListener('click', () => mealModal.classList.add('hidden'));
    }
    if (cancelMealBtn) {
        cancelMealBtn.addEventListener('click', () => mealModal.classList.add('hidden'));
    }
    if (saveMealBtn) {
        saveMealBtn.addEventListener('click', () => {
            const name = document.getElementById('meal-name').value.trim();
            const calories = parseInt(document.getElementById('meal-calories').value) || 0;
            const protein = parseInt(document.getElementById('meal-protein').value) || 0;
            const carbs = parseInt(document.getElementById('meal-carbs').value) || 0;
            const fat = parseInt(document.getElementById('meal-fat').value) || 0;

            if (!name) return;

            state.meals.push({ name, calories, protein, carbs, fat, time: Date.now() });
            saveState();
            renderMeals();
            updateNutrition();
            updateScoreCards();

            // Clear fields
            document.getElementById('meal-name').value = '';
            document.getElementById('meal-calories').value = '';
            document.getElementById('meal-protein').value = '';
            document.getElementById('meal-carbs').value = '';
            document.getElementById('meal-fat').value = '';
            mealModal.classList.add('hidden');
        });
    }

    // ---- Goals Sliders ----
    const sliderConfigs = [
        { slider: 'weight-goal-slider', display: 'goal-weight-display', key: 'weight', format: v => v.toLocaleString() },
        { slider: 'bodyfat-goal-slider', display: 'goal-bodyfat-display', key: 'bodyFat', format: v => v },
        { slider: 'calories-goal-slider', display: 'goal-calories-display', key: 'calories', format: v => v.toLocaleString() },
        { slider: 'protein-goal-slider', display: 'goal-protein-display', key: 'protein', format: v => v },
        { slider: 'carbs-goal-slider', display: 'goal-carbs-display', key: 'carbs', format: v => v },
        { slider: 'fat-goal-slider', display: 'goal-fat-display', key: 'fat', format: v => v },
        { slider: 'sleep-goal-slider', display: 'goal-sleep-display', key: 'sleep', format: v => v.toFixed(1) },
        { slider: 'steps-goal-slider', display: 'goal-steps-display', key: 'steps', format: v => v.toLocaleString() },
        { slider: 'water-goal-slider', display: 'goal-water-display', key: 'water', format: v => v }
    ];

    sliderConfigs.forEach(cfg => {
        const slider = document.getElementById(cfg.slider);
        const display = document.getElementById(cfg.display);
        if (!slider || !display) return;

        // Set initial value from state
        slider.value = state.goals[cfg.key];
        display.textContent = cfg.format(state.goals[cfg.key]);

        slider.addEventListener('input', () => {
            const val = parseFloat(slider.value);
            display.textContent = cfg.format(val);
        });
    });

    // Save goals
    const saveGoalsBtn = document.getElementById('save-goals');
    if (saveGoalsBtn) {
        saveGoalsBtn.addEventListener('click', () => {
            sliderConfigs.forEach(cfg => {
                const slider = document.getElementById(cfg.slider);
                if (slider) {
                    state.goals[cfg.key] = parseFloat(slider.value);
                }
            });
            saveState();
            updateNutrition();
            updateBodyStats();
            updateScoreCards();
            showToast('Goals saved successfully');
        });
    }

    // Reset goals
    const resetGoalsBtn = document.getElementById('reset-goals');
    if (resetGoalsBtn) {
        resetGoalsBtn.addEventListener('click', () => {
            state.goals = JSON.parse(JSON.stringify(defaults.goals));
            sliderConfigs.forEach(cfg => {
                const slider = document.getElementById(cfg.slider);
                const display = document.getElementById(cfg.display);
                if (slider && display) {
                    slider.value = state.goals[cfg.key];
                    display.textContent = cfg.format(state.goals[cfg.key]);
                }
            });
            saveState();
            updateNutrition();
            updateBodyStats();
            updateScoreCards();
            showToast('Goals reset to defaults');
        });
    }

    // ---- Settings ----
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsBtn = document.getElementById('close-settings-modal');
    const cancelSettingsBtn = document.getElementById('cancel-settings');
    const saveSettingsBtn = document.getElementById('save-settings');

    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            document.getElementById('settings-name').value = state.user.name;
            document.getElementById('settings-height').value = state.user.height;
            document.getElementById('settings-age').value = state.user.age;
            document.getElementById('settings-activity').value = state.user.activity;
            settingsModal.classList.remove('hidden');
        });
    }
    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));
    }
    if (cancelSettingsBtn) {
        cancelSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));
    }
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            state.user.name = document.getElementById('settings-name').value.trim();
            state.user.height = parseInt(document.getElementById('settings-height').value) || 70;
            state.user.age = parseInt(document.getElementById('settings-age').value) || 30;
            state.user.activity = document.getElementById('settings-activity').value;

            // Update display
            document.querySelector('.user-name').textContent = state.user.name;
            const initials = state.user.name.split(' ').map(n => n[0]).join('').toUpperCase();
            document.querySelector('.avatar').textContent = initials;

            saveState();
            updateBodyStats();
            settingsModal.classList.add('hidden');
            showToast('Settings saved');
        });
    }

    // ---- Toast ----
    function showToast(message) {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: #1db954;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            z-index: 300;
            animation: toastIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
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

    function getDayLabels(count) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const result = [];
        for (let i = count - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            result.push(days[d.getDay()]);
        }
        return result;
    }

    function generateData(count, min, max, smooth) {
        const data = [];
        let prev = (min + max) / 2;
        for (let i = 0; i < count; i++) {
            const change = (Math.random() - 0.5) * (max - min) * (smooth ? 0.15 : 0.3);
            prev = Math.max(min, Math.min(max, prev + change));
            data.push(Math.round(prev * 10) / 10);
        }
        return data;
    }

    function createGradient(ctx, color, height) {
        const gradient = ctx.createLinearGradient(0, 0, 0, height || 200);
        gradient.addColorStop(0, color.replace(')', ', 0.3)').replace('rgb', 'rgba'));
        gradient.addColorStop(1, color.replace(')', ', 0.0)').replace('rgb', 'rgba'));
        return gradient;
    }

    function initChartsForSection(section) {
        switch (section) {
            case 'overview':
                initOverviewCharts();
                break;
            case 'body':
                initBodyCharts();
                break;
            case 'nutrition':
                initNutritionCharts();
                break;
            case 'recovery':
                initRecoveryCharts();
                break;
            case 'sleep':
                initSleepCharts();
                break;
            case 'strain':
                initStrainCharts();
                break;
        }
    }

    function destroyChart(key) {
        if (chartInstances[key]) {
            chartInstances[key].destroy();
            chartInstances[key] = null;
        }
    }

    function initOverviewCharts() {
        // Strain chart
        const strainCtx = document.getElementById('strain-chart');
        if (strainCtx) {
            destroyChart('strain');
            const ctx = strainCtx.getContext('2d');
            chartInstances['strain'] = new Chart(strainCtx, {
                type: 'bar',
                data: {
                    labels: getDayLabels(7),
                    datasets: [{
                        data: generateData(7, 4, 18),
                        backgroundColor: 'rgba(74, 158, 255, 0.6)',
                        borderRadius: 6,
                        borderSkipped: false,
                        barPercentage: 0.6
                    }]
                },
                options: {
                    ...chartDefaults,
                    scales: {
                        ...chartDefaults.scales,
                        y: { ...chartDefaults.scales.y, min: 0, max: 21, ticks: { ...chartDefaults.scales.y.ticks, stepSize: 7 } }
                    }
                }
            });
        }

        // HRV chart
        const hrvCtx = document.getElementById('hrv-chart');
        if (hrvCtx) {
            destroyChart('hrv');
            chartInstances['hrv'] = new Chart(hrvCtx, {
                type: 'line',
                data: {
                    labels: getDayLabels(7),
                    datasets: [{
                        data: generateData(7, 35, 85, true),
                        borderColor: '#1db954',
                        backgroundColor: createGradient(hrvCtx.getContext('2d'), 'rgb(29, 185, 84)'),
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 3,
                        pointBackgroundColor: '#1db954'
                    }]
                },
                options: {
                    ...chartDefaults,
                    scales: {
                        ...chartDefaults.scales,
                        y: { ...chartDefaults.scales.y, min: 20, max: 100 }
                    }
                }
            });
        }
    }

    function initBodyCharts() {
        // Weight trend
        const weightCtx = document.getElementById('weight-chart');
        if (weightCtx) {
            destroyChart('weight');
            const baseWeight = state.body.currentWeight;
            const weightData = [];
            for (let i = 29; i >= 0; i--) {
                weightData.push(Math.round((baseWeight + 5 - (i * 0.15) + (Math.random() - 0.5) * 1.5) * 10) / 10);
            }
            const labels = [];
            for (let i = 29; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                labels.push(d.getDate() + '/' + (d.getMonth() + 1));
            }

            chartInstances['weight'] = new Chart(weightCtx, {
                type: 'line',
                data: {
                    labels,
                    datasets: [{
                        data: weightData,
                        borderColor: '#4a9eff',
                        backgroundColor: createGradient(weightCtx.getContext('2d'), 'rgb(74, 158, 255)'),
                        fill: true,
                        tension: 0.3,
                        borderWidth: 2,
                        pointRadius: 0,
                        pointHitRadius: 10
                    }, {
                        data: Array(30).fill(state.goals.weight),
                        borderColor: 'rgba(29, 185, 84, 0.5)',
                        borderDash: [5, 5],
                        borderWidth: 1.5,
                        pointRadius: 0,
                        fill: false
                    }]
                },
                options: chartDefaults
            });
        }

        // Composition chart
        const compCtx = document.getElementById('composition-chart');
        if (compCtx) {
            destroyChart('composition');
            chartInstances['composition'] = new Chart(compCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Muscle', 'Fat', 'Other'],
                    datasets: [{
                        data: [state.body.muscleMass, Math.round(state.body.currentWeight * state.body.bodyFat / 100), Math.round(state.body.currentWeight - state.body.muscleMass - (state.body.currentWeight * state.body.bodyFat / 100))],
                        backgroundColor: ['#4a9eff', '#ff6b35', 'rgba(255,255,255,0.1)'],
                        borderWidth: 0,
                        cutout: '70%'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: 'rgba(255,255,255,0.6)', font: { size: 11 }, padding: 16, usePointStyle: true, pointStyleWidth: 8 }
                        },
                        tooltip: chartDefaults.plugins.tooltip
                    }
                }
            });
        }
    }

    function initNutritionCharts() {
        // Macro chart
        const macroCtx = document.getElementById('macro-chart');
        if (macroCtx) {
            destroyChart('macro');
            const n = state.todayNutrition;
            chartInstances['macro'] = new Chart(macroCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Protein', 'Carbs', 'Fat'],
                    datasets: [{
                        data: [n.protein * 4, n.carbs * 4, n.fat * 9],
                        backgroundColor: ['#4a9eff', '#ffd60a', '#bf5af2'],
                        borderWidth: 0,
                        cutout: '70%'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: 'rgba(255,255,255,0.6)', font: { size: 11 }, padding: 16, usePointStyle: true, pointStyleWidth: 8 }
                        },
                        tooltip: chartDefaults.plugins.tooltip
                    }
                }
            });
        }

        // Calorie trend
        const calTrendCtx = document.getElementById('calorie-trend-chart');
        if (calTrendCtx) {
            destroyChart('calorie-trend');
            chartInstances['calorie-trend'] = new Chart(calTrendCtx, {
                type: 'bar',
                data: {
                    labels: getDayLabels(7),
                    datasets: [{
                        data: generateData(7, 1800, 2800),
                        backgroundColor: 'rgba(255, 107, 53, 0.6)',
                        borderRadius: 6,
                        borderSkipped: false,
                        barPercentage: 0.6
                    }]
                },
                options: {
                    ...chartDefaults,
                    scales: {
                        ...chartDefaults.scales,
                        y: { ...chartDefaults.scales.y, min: 0 }
                    }
                }
            });
        }
    }

    function initRecoveryCharts() {
        // Recovery trend
        const recCtx = document.getElementById('recovery-chart');
        if (recCtx) {
            destroyChart('recovery-trend');
            chartInstances['recovery-trend'] = new Chart(recCtx, {
                type: 'line',
                data: {
                    labels: getDayLabels(14),
                    datasets: [{
                        data: generateData(14, 30, 95, true),
                        borderColor: '#1db954',
                        backgroundColor: createGradient(recCtx.getContext('2d'), 'rgb(29, 185, 84)'),
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 3,
                        pointBackgroundColor: '#1db954'
                    }]
                },
                options: chartDefaults
            });
        }

        // HRV detail
        const hrvDetailCtx = document.getElementById('hrv-detail-chart');
        if (hrvDetailCtx) {
            destroyChart('hrv-detail');
            chartInstances['hrv-detail'] = new Chart(hrvDetailCtx, {
                type: 'line',
                data: {
                    labels: getDayLabels(14),
                    datasets: [{
                        data: generateData(14, 35, 90, true),
                        borderColor: '#64d2ff',
                        backgroundColor: createGradient(hrvDetailCtx.getContext('2d'), 'rgb(100, 210, 255)'),
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 3,
                        pointBackgroundColor: '#64d2ff'
                    }]
                },
                options: chartDefaults
            });
        }

        // Recovery metrics
        document.getElementById('recovery-hrv').textContent = Math.round(50 + Math.random() * 30) + ' ms';
        document.getElementById('recovery-rhr').textContent = state.body.restingHR + ' bpm';
        document.getElementById('recovery-spo2').textContent = (96 + Math.round(Math.random() * 3)) + '%';
        document.getElementById('recovery-temp').textContent = (97.5 + Math.round(Math.random() * 15) / 10).toFixed(1) + '\u00B0F';
    }

    function initSleepCharts() {
        // Sleep trend
        const sleepTrendCtx = document.getElementById('sleep-trend-chart');
        if (sleepTrendCtx) {
            destroyChart('sleep-trend');
            chartInstances['sleep-trend'] = new Chart(sleepTrendCtx, {
                type: 'bar',
                data: {
                    labels: getDayLabels(7),
                    datasets: [{
                        data: generateData(7, 5.5, 9),
                        backgroundColor: 'rgba(191, 90, 242, 0.6)',
                        borderRadius: 6,
                        borderSkipped: false,
                        barPercentage: 0.6
                    }]
                },
                options: {
                    ...chartDefaults,
                    scales: {
                        ...chartDefaults.scales,
                        y: { ...chartDefaults.scales.y, min: 0, max: 12, ticks: { ...chartDefaults.scales.y.ticks, callback: v => v + 'h' } }
                    }
                }
            });
        }

        // Sleep stages stacked
        const stagesCtx = document.getElementById('sleep-stages-chart');
        if (stagesCtx) {
            destroyChart('sleep-stages');
            chartInstances['sleep-stages'] = new Chart(stagesCtx, {
                type: 'bar',
                data: {
                    labels: getDayLabels(7),
                    datasets: [
                        { label: 'Deep', data: generateData(7, 0.8, 1.8), backgroundColor: '#4a9eff', borderRadius: 2, borderSkipped: false },
                        { label: 'REM', data: generateData(7, 1, 2), backgroundColor: '#bf5af2', borderRadius: 2, borderSkipped: false },
                        { label: 'Light', data: generateData(7, 2.5, 4), backgroundColor: '#64d2ff', borderRadius: 2, borderSkipped: false },
                        { label: 'Awake', data: generateData(7, 0.1, 0.5), backgroundColor: 'rgba(255, 69, 58, 0.6)', borderRadius: 2, borderSkipped: false }
                    ]
                },
                options: {
                    ...chartDefaults,
                    plugins: {
                        ...chartDefaults.plugins,
                        legend: {
                            position: 'bottom',
                            labels: { color: 'rgba(255,255,255,0.6)', font: { size: 10 }, padding: 12, usePointStyle: true, pointStyleWidth: 8 }
                        }
                    },
                    scales: {
                        ...chartDefaults.scales,
                        x: { ...chartDefaults.scales.x, stacked: true },
                        y: { ...chartDefaults.scales.y, stacked: true, ticks: { ...chartDefaults.scales.y.ticks, callback: v => v + 'h' } }
                    }
                }
            });
        }

        // Sleep metrics
        document.getElementById('sleep-time-bed').textContent = '8h 15m';
        document.getElementById('sleep-time-asleep').textContent = '7h 32m';
        document.getElementById('sleep-efficiency').textContent = '91%';
        document.getElementById('sleep-consistency').textContent = '85%';

        // Overview sleep stages
        document.getElementById('awake-time').textContent = '22m';
        document.getElementById('light-time').textContent = '3h 20m';
        document.getElementById('deep-time').textContent = '1h 45m';
        document.getElementById('rem-time').textContent = '2h 05m';
    }

    function initStrainCharts() {
        // Strain history
        const strainHistCtx = document.getElementById('strain-history-chart');
        if (strainHistCtx) {
            destroyChart('strain-history');
            chartInstances['strain-history'] = new Chart(strainHistCtx, {
                type: 'line',
                data: {
                    labels: getDayLabels(14),
                    datasets: [{
                        data: generateData(14, 4, 18, true),
                        borderColor: '#4a9eff',
                        backgroundColor: createGradient(strainHistCtx.getContext('2d'), 'rgb(74, 158, 255)'),
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 3,
                        pointBackgroundColor: '#4a9eff'
                    }]
                },
                options: {
                    ...chartDefaults,
                    scales: {
                        ...chartDefaults.scales,
                        y: { ...chartDefaults.scales.y, min: 0, max: 21 }
                    }
                }
            });
        }

        // Strain metrics
        const strain = generateStrain();
        document.getElementById('strain-day').textContent = strain.toFixed(1);
        document.getElementById('strain-avg-hr').textContent = Math.round(70 + Math.random() * 30) + ' bpm';
        document.getElementById('strain-max-hr').textContent = Math.round(140 + Math.random() * 40) + ' bpm';
        document.getElementById('strain-calories').textContent = Math.round(1800 + Math.random() * 800);
    }

    // ---- Initialize ----
    function init() {
        updateScoreCards();
        updateBodyStats();
        updateNutrition();
        renderMeals();
        initOverviewCharts();

        // Populate sleep stage times on overview
        document.getElementById('awake-time').textContent = '22m';
        document.getElementById('light-time').textContent = '3h 20m';
        document.getElementById('deep-time').textContent = '1h 45m';
        document.getElementById('rem-time').textContent = '2h 05m';
    }

    // Wait for Chart.js
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
