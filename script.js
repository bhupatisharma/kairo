// Update state structure
let state = {
    habits: [],
    categories: [],
    settings: {
        theme: 'dark'
    }
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    setupEventListeners();
    setupMobileEvents();
    renderCategories();
    renderDashboard();
    populateCategoryDropdown();
});

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.dataset.page;
            if (page === 'habits') {
                renderHabitsList();
            } else if (page === 'analytics') {
                setupAnalytics();
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

    // Add touch events for mobile
    setupMobileEvents();
}

function setupMobileEvents() {
    document.querySelectorAll('button, .action-btn').forEach(btn => {
        // Remove any existing event listeners
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        // Add new event listeners
        newBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            newBtn.style.transform = 'scale(0.98)';
        }, { passive: false });

        newBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            newBtn.style.transform = 'scale(1)';
            // Trigger click event
            newBtn.click();
        }, { passive: false });

        // Ensure click events still work on desktop
        newBtn.addEventListener('click', (e) => {
            const action = newBtn.dataset.action;
            if (action === 'delete') {
                const id = newBtn.dataset.id;
                deleteHabit(id);
            } else if (action === 'edit') {
                const id = newBtn.dataset.id;
                toggleEditForm(id);
            }
        });
    });

    // Form submit handling
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (form.id === 'habitForm') {
                handleHabitSubmit(e);
            } else if (form.id === 'categoryForm') {
                handleCategorySubmit(e);
            }
        });
    });
}

function populateCategoryDropdown() {
    const categorySelect = document.getElementById('habitCategory');
    if (!categorySelect) return;

    categorySelect.innerHTML = '<option value="">Select a category</option>' +
        state.categories.map(category => `
            <option value="${category.id}">${category.name}</option>
        `).join('');
}

function renderCategories() {
    const categoriesList = document.getElementById('categoriesList');
    if (!categoriesList) return;

    categoriesList.innerHTML = state.categories.map(category => `
        <div class="category-item">
            <div class="category-info">
                <span class="category-color-preview" style="background-color: ${category.color}"></span>
                <span>${category.icon} ${category.name}</span>
            </div>
            <button class="delete-btn" data-action="delete" data-id="${category.id}">Delete</button>
        </div>
    `).join('');

    // Reattach event listeners
    setupMobileEvents();
}

// Update state structure and add localStorage functionality
// (Removed duplicate declaration of state to avoid redeclaration error)

// Add localStorage functions
function saveToLocalStorage() {
    try {
        localStorage.setItem('kairoData', JSON.stringify(state));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        alert('Failed to save data. Please ensure local storage is enabled.');
    }
}

function loadFromLocalStorage() {
    try {
        const savedData = localStorage.getItem('kairoData');
        if (savedData) {
            state = JSON.parse(savedData);
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
    }
}

// Data structure
let currentDate = new Date();

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    setupEventListeners();
    setupMobileEvents();
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

    // Navigation
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showPage(e.target.dataset.page);
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

    // Add this to update habits list when switching to the habits page
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            const page = e.target.dataset.page;
            if (page === 'habits') {
                renderHabitsList();
            }
            showPage(page);
        });
    });
    
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            const page = e.target.dataset.page;
            if (page === 'analytics') {
                setupAnalytics();
            }
            showPage(page);
        });
    });
}

// Add these new functions

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
    e.stopPropagation(); // Prevent event bubbling

    const form = e.target;
    const nameInput = form.querySelector('#categoryName');
    const iconInput = form.querySelector('#categoryIcon');
    const colorInput = form.querySelector('#categoryColor');

    if (!nameInput || !iconInput || !colorInput) {
        alert('Form elements not found. Please try again.');
        return;
    }

    // Validate inputs
    if (!nameInput.value.trim() || !iconInput.value.trim() || !colorInput.value) {
        alert('Please fill in all fields');
        return;
    }

    try {
        const category = {
            id: Date.now(),
            name: nameInput.value.trim(),
            icon: iconInput.value.trim(),
            color: colorInput.value
        };

        state.categories.push(category);
        saveToLocalStorage();
        renderCategories();
        populateCategoryDropdown();
        
        // Reset form and show success
        form.reset();
        alert('Category created successfully!');
        
        // Update UI immediately
        showPage('categories');
    } catch (error) {
        console.error('Error creating category:', error);
        alert('Failed to create category. Please try again.');
    }
}

function handleHabitSubmit(e) {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling

    const form = e.target;
    const nameInput = form.querySelector('#habitName');
    const descInput = form.querySelector('#habitDescription');
    const categoryInput = form.querySelector('#habitCategory');
    const frequencyInput = form.querySelector('#habitFrequency');
    const goalInput = form.querySelector('#habitGoal');

    if (!nameInput || !categoryInput || !frequencyInput) {
        alert('Form elements not found. Please try again.');
        return;
    }

    // Validate required fields
    if (!nameInput.value.trim() || !categoryInput.value || !frequencyInput.value) {
        alert('Please fill in all required fields');
        return;
    }

    try {
        const habit = {
            id: Date.now(),
            name: nameInput.value.trim(),
            description: descInput ? descInput.value.trim() : '',
            category: categoryInput.value,
            frequency: frequencyInput.value,
            goal: frequencyInput.value === 'daily' ? 1 : parseInt(goalInput.value || 1),
            completedDates: [],
            createdAt: new Date().toISOString()
        };

        state.habits.push(habit);
        saveToLocalStorage();
        renderDashboard();
        
        // Reset form and show success
        form.reset();
        alert('Habit created successfully!');
        
        // Update UI immediately
        showPage('dashboard');
    } catch (error) {
        console.error('Error creating habit:', error);
        alert('Failed to create habit. Please try again.');
    }
}

// Add touch event handling for mobile
function setupMobileEvents() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        // Prevent double-tap zoom on mobile
        form.addEventListener('touchend', (e) => {
            e.preventDefault();
        }, { passive: false });

        // Handle form inputs
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            // Prevent zoom on focus
            input.addEventListener('focus', (e) => {
                e.target.setAttribute('autocomplete', 'off');
                e.target.setAttribute('autocorrect', 'off');
                e.target.setAttribute('autocapitalize', 'off');
            });

            // Handle touch events
            input.addEventListener('touchstart', (e) => {
                e.target.focus();
            }, { passive: true });
        });

        // Handle submit buttons
        const submitBtns = form.querySelectorAll('button[type="submit"]');
        submitBtns.forEach(btn => {
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.target.click();
            }, { passive: false });
        });
    });
}

// Update the main event listener to include mobile setup
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    setupEventListeners();
    setupMobileEvents();
    renderCategories();
    renderDashboard();
    populateCategoryDropdown();

    // Add specific touch handling for mobile buttons
    const actionButtons = document.querySelectorAll('.submit-btn, .action-btn');
    actionButtons.forEach(btn => {
        btn.addEventListener('touchstart', (e) => {
            e.target.style.opacity = '0.7';
        }, { passive: true });

        btn.addEventListener('touchend', (e) => {
            e.target.style.opacity = '1';
        }, { passive: true });
    });
});

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
