// Data structure
let state = {
    habits: [],
    categories: [],
    settings: {
        theme: 'light'
    }
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    setupEventListeners();
    renderCategories();
    renderDashboard();
    populateCategoryDropdown();
});

function setupEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Navigation - combine all navigation handlers
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.dataset.page;
            
            // Handle page-specific initialization
            switch(page) {
                case 'habits':
                    renderHabitsList();
                    break;
                case 'analytics':
                    setupAnalytics();
                    break;
                case 'categories':
                    renderCategories();
                    break;
            }
            
            showPage(page);
        });
    });

    // Forms
    const habitForm = document.getElementById('habitForm');
    if (habitForm) {
        habitForm.addEventListener('submit', handleHabitSubmit);
    }

    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', handleCategorySubmit);
    }

    // Touch events
    setupTouchInteractions();
}

// Add these new functions
function setupTouchInteractions() {
    // Handle button touches
    const allButtons = document.querySelectorAll('button');
    allButtons.forEach(button => {
        button.addEventListener('touchstart', handleTouchStart);
        button.addEventListener('touchend', handleTouchEnd);
    });

    // Handle checkbox touches
    const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    allCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('touchstart', handleTouchStart);
        checkbox.addEventListener('touchend', handleTouchEnd);
    });

    // Handle select touches
    const allSelects = document.querySelectorAll('select');
    allSelects.forEach(select => {
        select.addEventListener('touchstart', handleTouchStart);
    });

    // Handle navigation touches
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('touchstart', handleTouchStart);
        link.addEventListener('touchend', handleTouchEnd);
    });
}

function handleTouchStart(e) {
    // Only prevent default for specific elements
    if (this.tagName === 'BUTTON' || this.tagName === 'A' || this.type === 'checkbox') {
        e.preventDefault();
    }
    this.classList.add('touch-active');
}

function handleTouchEnd(e) {
    // Only prevent default for specific elements
    if (this.tagName === 'BUTTON' || this.tagName === 'A' || this.type === 'checkbox') {
        e.preventDefault();
    }
    this.classList.remove('touch-active');
    
    if (this.type === 'checkbox') {
        this.checked = !this.checked;
        const event = new Event('change', { bubbles: true });
        this.dispatchEvent(event);
    }
}

let currentDate = new Date();

function setupAnalytics() {
    const habitSelect = document.getElementById('habitSelect');
    if (!habitSelect) return;

    // Populate habit selector
    habitSelect.innerHTML = '<option value="">Select a habit</option>' +
        state.habits.map(habit => `
            <option value="${habit.id}">${habit.name}</option>
        `).join('');

    // Add event listeners
    habitSelect.addEventListener('change', updateCalendar);
    document.getElementById('prevMonth').addEventListener('click', () => changeMonth(-1));
    document.getElementById('nextMonth').addEventListener('click', () => changeMonth(1));

    updateCalendar();
}

function changeMonth(delta) {
    currentDate.setMonth(currentDate.getMonth() + delta);
    updateCalendar();
}

function updateCalendar() {
    const habitId = document.getElementById('habitSelect').value;
    const habit = state.habits.find(h => h.id.toString() === habitId);
    
    updateMonthDisplay();
    renderCalendarDates(habit);
    updateMonthlyStats(habit);
}

function updateMonthDisplay() {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    
    document.getElementById('currentMonth').textContent = 
        `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
}

function renderCalendarDates(habit) {
    const calendarDates = document.getElementById('calendarDates');
    calendarDates.innerHTML = '';

    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startPadding = firstDay.getDay();
    
    // Add padding for start of month
    for (let i = 0; i < startPadding; i++) {
        calendarDates.appendChild(createDateElement(''));
    }

    // Add dates
    for (let date = 1; date <= lastDay.getDate(); date++) {
        const dateString = new Date(currentDate.getFullYear(), 
            currentDate.getMonth(), date).toDateString();
        
        let status = '';
        if (habit) {
            if (habit.completedDates.includes(dateString)) {
                status = 'completed';
            } else if (shouldHaveCompleted(habit, dateString)) {
                status = 'failed';
            }
        }
        
        calendarDates.appendChild(createDateElement(date, status));
    }
}

function createDateElement(date, status = '') {
    const div = document.createElement('div');
    div.className = `calendar-date ${status}`;
    div.textContent = date;
    return div;
}

function shouldHaveCompleted(habit, dateString) {
    const date = new Date(dateString);
    const now = new Date();
    if (date > now) return false;

    switch(habit.frequency) {
        case 'daily':
            return true;
        case 'weekly':
            return date.getDay() === 0 && getWeeklyCompletions(habit, date) < habit.goal;
        case 'monthly':
            return date.getDate() === lastDayOfMonth(date) && 
                   getMonthlyCompletions(habit, date) < habit.goal;
        default:
            return false;
    }
}

function getWeeklyCompletions(habit, date) {
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return habit.completedDates.filter(d => {
        const completed = new Date(d);
        return completed >= weekStart && completed <= weekEnd;
    }).length;
}

function getMonthlyCompletions(habit, date) {
    return habit.completedDates.filter(d => {
        const completed = new Date(d);
        return completed.getMonth() === date.getMonth() &&
               completed.getFullYear() === date.getFullYear();
    }).length;
}

function lastDayOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function updateMonthlyStats(habit) {
    const statsContainer = document.getElementById('monthlyStats');
    if (!habit) {
        statsContainer.innerHTML = '<p>Select a habit to view statistics</p>';
        return;
    }

    const totalDays = new Date(currentDate.getFullYear(), 
        currentDate.getMonth() + 1, 0).getDate();
    const completions = getMonthlyCompletions(habit, currentDate);
    const goal = habit.frequency === 'monthly' ? habit.goal : 
                habit.frequency === 'weekly' ? habit.goal * 4 : totalDays;

    statsContainer.innerHTML = `
        <div class="stat-item">
            <span>Monthly Goal:</span>
            <span>${completions}/${goal} completions</span>
        </div>
        <div class="stat-item">
            <span>Success Rate:</span>
            <span>${Math.round((completions/goal) * 100)}%</span>
        </div>
    `;
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // Update navigation active state
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageId) {
            link.classList.add('active');
        }
    });
}

function handleCategorySubmit(e) {
    e.preventDefault();
    const category = {
        id: Date.now(),
        name: document.getElementById('categoryName').value,
        icon: document.getElementById('categoryIcon').value,
        color: document.getElementById('categoryColor').value
    };

    state.categories.push(category);
    saveToLocalStorage();
    renderCategories();
    populateCategoryDropdown();
    e.target.reset();
}

function handleHabitSubmit(e) {
    e.preventDefault();
    const frequency = document.getElementById('habitFrequency').value;
    const habit = {
        id: Date.now(),
        name: document.getElementById('habitName').value,
        description: document.getElementById('habitDescription').value,
        category: document.getElementById('habitCategory').value,
        frequency: frequency,
        goal: frequency === 'daily' ? 1 : parseInt(document.getElementById('habitGoal').value),
        completedDates: [],
        createdAt: new Date().toISOString()
    };

    state.habits.push(habit);
    saveToLocalStorage();
    renderDashboard();
    e.target.reset();
    showPage('dashboard');
}

function renderCategories() {
    const categoriesList = document.getElementById('categoriesList');
    if (!categoriesList) return;

    categoriesList.innerHTML = '';
    state.categories.forEach(category => {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'category-item';
        categoryElement.innerHTML = `
            <div class="category-info">
                <span>${category.icon}</span>
                <span>${category.name}</span>
                <div class="category-color-preview" style="background-color: ${category.color}"></div>
            </div>
            <button class="delete-btn" data-category-id="${category.id}">Delete</button>
        `;

        const deleteBtn = categoryElement.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteCategory(category.id));

        categoriesList.appendChild(categoryElement);
    });
}

function deleteCategory(categoryId) {
    if (!confirm('Are you sure you want to delete this category? All associated habits will also be deleted.')) {
        return;
    }

    state.habits = state.habits.filter(habit => habit.category !== categoryId.toString());
    state.categories = state.categories.filter(category => category.id !== categoryId);
    
    saveToLocalStorage();
    renderCategories();
    renderDashboard();
    populateCategoryDropdown();
}

function renderDashboard() {
    const grid = document.getElementById('categoriesGrid');
    const progress = document.getElementById('dailyProgress');
    if (!grid || !progress) return;

    grid.innerHTML = '';
    
    const today = new Date().toDateString();
    let totalHabits = 0;
    let completedHabits = 0;

    state.categories.forEach(category => {
        const categoryHabits = state.habits.filter(h => h.category === category.id.toString());
        if (categoryHabits.length > 0) {
            const card = createCategoryCard(category, categoryHabits);
            grid.appendChild(card);
            
            totalHabits += categoryHabits.length;
            completedHabits += categoryHabits.filter(habit => 
                habit.completedDates.includes(today)
            ).length;
        }
    });

    // Update progress
    progress.innerHTML = `
        <h3>Today's Progress: ${completedHabits}/${totalHabits} habits completed</h3>
        <div class="progress-bar">
            <div class="progress" style="width: ${(completedHabits/totalHabits) * 100}%"></div>
        </div>
    `;
}

function createCategoryCard(category, habits) {
    const div = document.createElement('div');
    div.className = 'category-card';
    div.style.borderColor = category.color;
    
    const today = new Date().toDateString();
    const currentMonth = new Date().getMonth();
    const currentWeek = getWeekNumber(new Date());
    
    div.innerHTML = `
        <h3>${category.icon} ${category.name}</h3>
        <ul class="habits-list">
            ${habits.map(habit => {
                const progress = getHabitProgress(habit);
                return `
                    <li>
                        <div class="habit-item">
                            <div class="habit-check">
                                <input type="checkbox" 
                                    id="habit-${habit.id}" 
                                    ${habit.completedDates.includes(today) ? 'checked' : ''}>
                                <label for="habit-${habit.id}">${habit.name}</label>
                            </div>
                            <div class="habit-progress">
                                ${progress.current}/${habit.goal} ${habit.frequency}
                            </div>
                        </div>
                    </li>
                `;
            }).join('')}
        </ul>
    `;

    // Add event listeners for checkboxes
    div.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const habitId = parseInt(e.target.id.split('-')[1]);
            toggleHabitCompletion(habitId);
        });
    });
    
    return div;
}

function toggleHabitCompletion(habitId) {
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;

    const today = new Date().toDateString();
    const completionIndex = habit.completedDates.indexOf(today);
    
    if (completionIndex === -1) {
        habit.completedDates.push(today);
    } else {
        habit.completedDates.splice(completionIndex, 1);
    }
    
    saveToLocalStorage();
    
    // Use requestAnimationFrame for smoother updates
    requestAnimationFrame(() => {
        debouncedRenderDashboard();
        if (document.getElementById('analytics')?.classList.contains('active')) {
            debouncedRenderCalendar();
        }
    });
}

// Remove duplicate debounce function and declarations
// Keep only one instance at the top of the file

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Create debounced versions of functions
const debouncedRenderDashboard = debounce(renderDashboard, 150);
const debouncedRenderCalendar = debounce(updateCalendar, 150);
const debouncedHandleOrientationChange = debounce(() => {
    renderDashboard();
    if (document.getElementById('analytics')?.classList.contains('active')) {
        updateCalendar();
    }
}, 250);

// Add a debounced version of renderDashboard for better performance
// (Declaration moved to the bottom for a single definition.)

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function populateCategoryDropdown() {
    const categorySelect = document.getElementById('habitCategory');
    if (!categorySelect) return;

    categorySelect.innerHTML = '<option value="">Select a category</option>';
    state.categories.forEach(category => {
        categorySelect.innerHTML += `
            <option value="${category.id}">${category.name}</option>
        `;
    });
}

function toggleTheme() {
    state.settings.theme = state.settings.theme === 'light' ? 'dark' : 'light';
    document.body.dataset.theme = state.settings.theme;
    document.getElementById('themeToggle').textContent = 
        state.settings.theme === 'light' ? '🌞' : '🌙';
    saveToLocalStorage();
}

// Add this new function
function toggleGoalInput() {
    const frequency = document.getElementById('habitFrequency').value;
    const goalContainer = document.getElementById('goalInputContainer');
    goalContainer.style.display = frequency === 'daily' ? 'none' : 'block';
}

// Add these helper functions
function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function getHabitProgress(habit) {
    const now = new Date();
    const completedDates = habit.completedDates.map(date => new Date(date));
    
    switch(habit.frequency) {
        case 'weekly':
            const currentWeek = getWeekNumber(now);
            const thisWeekCompletions = completedDates.filter(date => 
                getWeekNumber(date) === currentWeek && 
                date.getFullYear() === now.getFullYear()
            ).length;
            return { current: thisWeekCompletions };
            
        case 'monthly':
            const thisMonthCompletions = completedDates.filter(date => 
                date.getMonth() === now.getMonth() && 
                date.getFullYear() === now.getFullYear()
            ).length;
            return { current: thisMonthCompletions };
            
        default: // daily
            return { current: habit.completedDates.includes(now.toDateString()) ? 1 : 0 };
    }
}

function saveToLocalStorage() {
    try {
        const dataToSave = JSON.stringify(state);
        localStorage.setItem('habitHiveData', dataToSave);
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
        // Optionally show user feedback
        alert('Failed to save your data. Please make sure you have enough storage space.');
    }
}

function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('habitHiveData');
        if (saved) {
            state = JSON.parse(saved);
            document.body.dataset.theme = state.settings.theme;
            document.getElementById('themeToggle').textContent = 
                state.settings.theme === 'light' ? '🌞' : '🌙';
        }
    } catch (error) {
        console.error('Failed to load from localStorage:', error);
        // Initialize with default state
        state = {
            habits: [],
            categories: [],
            settings: { theme: 'light' }
        };
    }
}

// Optimize rendering functions
// (Removed duplicate debouncedRenderDashboard and debouncedRenderCalendar declarations)

// Touch-friendly event listeners
function setupTouchEvents() {
    document.querySelectorAll('.calendar-date').forEach(date => {
        date.addEventListener('touchstart', function(e) {
            e.preventDefault();
            this.style.opacity = '0.7';
        });

        date.addEventListener('touchend', function() {
            this.style.opacity = '1';
        });
    });
}

// Handle orientation changes
window.addEventListener('orientationchange', debouncedHandleOrientationChange);

function renderHabitsList() {
    const habitsContainer = document.querySelector('.habits-container');
    if (!habitsContainer) return;

    habitsContainer.innerHTML = '';
    
    state.habits.forEach(habit => {
        const habitCard = createHabitCard(habit);
        habitsContainer.appendChild(habitCard);
    });
}

function createHabitCard(habit) {
    const card = document.createElement('div');
    card.className = 'habit-card';
    
    const category = state.categories.find(c => c.id.toString() === habit.category);
    
    card.innerHTML = `
        <div class="habit-header">
            <span class="habit-title">${habit.name}</span>
            <div class="habit-actions">
                <button class="edit-btn" onclick="toggleEditForm(${habit.id})">Edit</button>
                <button class="delete-habit-btn" onclick="deleteHabit(${habit.id})">Delete</button>
            </div>
        </div>
        <div class="habit-details">
            <div class="habit-detail-item">
                <div class="habit-detail-label">Category</div>
                <div>${category ? `${category.icon} ${category.name}` : 'No Category'}</div>
            </div>
            <div class="habit-detail-item">
                <div class="habit-detail-label">Frequency</div>
                <div>${habit.frequency} (${habit.goal} times)</div>
            </div>
            <div class="habit-detail-item">
                <div class="habit-detail-label">Description</div>
                <div>${habit.description || 'No description'}</div>
            </div>
        </div>
        <form id="edit-form-${habit.id}" class="edit-form">
            <div class="form-group">
                <label>Name</label>
                <input type="text" name="name" value="${habit.name}" required>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea name="description">${habit.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Category</label>
                <select name="category" required>
                    ${state.categories.map(c => `
                        <option value="${c.id}" ${c.id.toString() === habit.category ? 'selected' : ''}>
                            ${c.name}
                        </option>
                    `).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Frequency</label>
                <select name="frequency">
                    <option value="daily" ${habit.frequency === 'daily' ? 'selected' : ''}>Daily</option>
                    <option value="weekly" ${habit.frequency === 'weekly' ? 'selected' : ''}>Weekly</option>
                    <option value="monthly" ${habit.frequency === 'monthly' ? 'selected' : ''}>Monthly</option>
                </select>
            </div>
            <div class="form-group">
                <label>Goal</label>
                <input type="number" name="goal" value="${habit.goal}" min="1">
            </div>
            <button type="submit">Save Changes</button>
            <button type="button" onclick="toggleEditForm(${habit.id})">Cancel</button>
        </form>
    `;

    // Add form submit handler
    const editForm = card.querySelector(`#edit-form-${habit.id}`);
    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        updateHabit(habit.id, editForm);
    });

    return card;
}

function toggleEditForm(habitId) {
    const form = document.querySelector(`#edit-form-${habitId}`);
    form.classList.toggle('active');
}

function updateHabit(habitId, form) {
    const habitIndex = state.habits.findIndex(h => h.id === habitId);
    if (habitIndex === -1) return;

    state.habits[habitIndex] = {
        ...state.habits[habitIndex],
        name: form.name.value,
        description: form.description.value,
        category: form.category.value,
        frequency: form.frequency.value,
        goal: parseInt(form.goal.value)
    };

    saveToLocalStorage();
    renderHabitsList();
    renderDashboard();
}

function deleteHabit(habitId) {
    if (!confirm('Are you sure you want to delete this habit?')) return;
    
    state.habits = state.habits.filter(h => h.id !== habitId);
    saveToLocalStorage();
    renderHabitsList();
    renderDashboard();
}
