/* RetroBot Todo Tool */

class TodoTool {
    constructor(retroBot) {
        this.retroBot = retroBot;
        this.todos = [];
        this.idCounter = 1;
        this.completedToday = 0;
        
        // Load saved todos
        this.loadTodos();
        
        // Initialize todo system
        this.init();
    }
    
    init() {
        console.log('✅ Todo tool initialized');
        this.renderTodos();
        this.updateStats();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        const todoInput = document.getElementById('todo-input');
        if (todoInput) {
            todoInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.add();
                }
            });
        }
    }
    
    add() {
        const input = document.getElementById('todo-input');
        const text = input.value.trim();
        
        if (!text) {
            this.retroBot.speak("Can't add an empty task! Give me something to work with! 🤔", 'annoyed');
            return;
        }
        
        // Check for priority indicators
        let priority = 'normal';
        let cleanText = text;
        
        if (text.includes('!!!') || text.toLowerCase().includes('urgent')) {
            priority = 'high';
            cleanText = text.replace(/!+/g, '').replace(/urgent/i, '').trim();
        } else if (text.includes('!')) {
            priority = 'medium';
            cleanText = text.replace(/!+/g, '').trim();
        }
        
        const todo = {
            id: this.idCounter++,
            text: cleanText,
            completed: false,
            priority: priority,
            createdAt: new Date().toISOString(),
            completedAt: null
        };
        
        this.todos.push(todo);
        input.value = '';
        
        this.saveTodos();
        this.renderTodos();
        this.updateStats();
        
        const priorityText = priority === 'high' ? ' (HIGH PRIORITY!)' : 
                           priority === 'medium' ? ' (Medium priority)' : '';
        
        this.retroBot.speak(`Task added: "${cleanText}"${priorityText}! Let's get it done! 💪`, 'happy');
        this.retroBot.playSound('beep');
        
        // Animation for new todo
        setTimeout(() => {
            const newTodo = document.querySelector('.todo-item:last-child');
            if (newTodo) {
                newTodo.classList.add('new');
            }
        }, 100);
    }
    
    toggle(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;
        
        todo.completed = !todo.completed;
        todo.completedAt = todo.completed ? new Date().toISOString() : null;
        
        if (todo.completed) {
            this.completedToday++;
            this.retroBot.speak(`Great job! "${todo.text}" is done! 🎉`, 'happy');
            this.retroBot.animations.trigger('celebration');
            
            // Check for achievement
            this.checkAchievements();
        } else {
            this.completedToday = Math.max(0, this.completedToday - 1);
            this.retroBot.speak(`Unchecked "${todo.text}". No worries, we all change our minds! 🔄`);
        }
        
        this.saveTodos();
        this.renderTodos();
        this.updateStats();
        this.retroBot.playSound('beep');
    }
    
    remove(id) {
        const todoIndex = this.todos.findIndex(t => t.id === id);
        if (todoIndex === -1) return;
        
        const todo = this.todos[todoIndex];
        this.todos.splice(todoIndex, 1);
        
        this.saveTodos();
        this.renderTodos();
        this.updateStats();
        
        this.retroBot.speak(`Deleted "${todo.text}". Gone but not forgotten! 🗑️`);
        this.retroBot.playSound('beep');
    }
    
    renderTodos() {
        const list = document.getElementById('todo-list');
        if (!list) return;
        
        list.innerHTML = '';
        
        if (this.todos.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'todo-empty';
            emptyMessage.innerHTML = `
                <div style="
                    text-align: center; 
                    padding: 20px; 
                    color: var(--text-dim); 
                    font-size: 12px;
                    font-style: italic;
                ">
                    📝 No tasks yet!<br>
                    Add one above to get started!
                </div>
            `;
            list.appendChild(emptyMessage);
            return;
        }
        
        // Sort todos: incomplete first, then by priority, then by creation date
        const sortedTodos = [...this.todos].sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            
            const priorityOrder = { high: 0, medium: 1, normal: 2 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            
            return new Date(a.createdAt) - new Date(b.createdAt);
        });
        
        sortedTodos.forEach(todo => {
            const item = document.createElement('div');
            item.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            
            // Priority styling
            let priorityStyle = '';
            if (todo.priority === 'high' && !todo.completed) {
                priorityStyle = 'border-left: 3px solid var(--warning-red);';
            } else if (todo.priority === 'medium' && !todo.completed) {
                priorityStyle = 'border-left: 3px solid var(--accent-yellow);';
            }
            
            item.style.cssText += priorityStyle;
            
            item.innerHTML = `
                <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" 
                     onclick="retroBot.todo.toggle(${todo.id})"></div>
                <div class="todo-text">${todo.text}</div>
                <div class="todo-priority" style="
                    font-size: 8px; 
                    color: var(--text-dim);
                    margin-right: 8px;
                    ${todo.priority === 'high' ? 'color: var(--warning-red);' : ''}
                    ${todo.priority === 'medium' ? 'color: var(--accent-yellow);' : ''}
                ">
                    ${todo.priority === 'high' ? '🔥' : todo.priority === 'medium' ? '⚡' : ''}
                </div>
                <button class="todo-delete" onclick="retroBot.todo.remove(${todo.id})">×</button>
            `;
            
            list.appendChild(item);
        });
    }
    
    updateStats() {
        const stats = document.getElementById('todo-stats');
        if (!stats) return;
        
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const pending = total - completed;
        
        let statsText = '';
        if (total === 0) {
            statsText = 'Ready for your first task! 🚀';
        } else if (pending === 0) {
            statsText = `All ${total} tasks complete! You're amazing! 🌟`;
        } else {
            statsText = `${completed}/${total} complete (${pending} pending)`;
        }
        
        stats.textContent = statsText;
        
        // Update mood based on productivity
        const completionRate = total > 0 ? completed / total : 0;
        if (completionRate === 1 && total > 0) {
            this.retroBot.adjustMood(15);
        } else if (completionRate > 0.7) {
            this.retroBot.adjustMood(5);
        }
    }
    
    checkAchievements() {
        const completed = this.todos.filter(t => t.completed).length;
        
        // Achievement milestones
        const achievements = [
            { count: 1, message: "First task complete! You're on fire! 🔥" },
            { count: 5, message: "5 tasks done! Productivity champion! 🏆" },
            { count: 10, message: "10 tasks complete! You're unstoppable! 🚀" },
            { count: 25, message: "25 tasks crushed! Master of productivity! 👑" },
            { count: 50, message: "50 tasks conquered! Legendary status! ⭐" }
        ];
        
        const achievement = achievements.find(a => a.count === completed);
        if (achievement) {
            this.retroBot.showNotification(`🎉 ${achievement.message}`);
            this.retroBot.unlockTheme('purple'); // Unlock theme as reward
        }
        
        // Daily streak achievement
        if (this.completedToday >= 5) {
            this.retroBot.showNotification('🔥 5 tasks in one day! You\'re on fire!');
        }
    }
    
    getTodos() {
        return this.todos;
    }
    
    saveTodos() {
        try {
            const data = {
                todos: this.todos,
                idCounter: this.idCounter,
                completedToday: this.completedToday,
                lastActive: new Date().toDateString()
            };
            localStorage.setItem('retrobot-todos', JSON.stringify(data));
        } catch (e) {
            console.log('Failed to save todos:', e);
        }
    }
    
    loadTodos() {
        try {
            const saved = localStorage.getItem('retrobot-todos');
            if (saved) {
                const data = JSON.parse(saved);
                this.todos = data.todos || [];
                this.idCounter = data.idCounter || 1;
                
                // Reset daily counter if it's a new day
                const today = new Date().toDateString();
                if (data.lastActive !== today) {
                    this.completedToday = 0;
                } else {
                    this.completedToday = data.completedToday || 0;
                }
            }
        } catch (e) {
            console.log('Failed to load todos:', e);
            this.todos = [];
        }
    }
    
    // Utility methods
    getPendingTodos() {
        return this.todos.filter(t => !t.completed);
    }
    
    getCompletedTodos() {
        return this.todos.filter(t => t.completed);
    }
    
    getHighPriorityTodos() {
        return this.todos.filter(t => !t.completed && t.priority === 'high');
    }
    
    clearCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;
        this.todos = this.todos.filter(t => !t.completed);
        
        this.saveTodos();
        this.renderTodos();
        this.updateStats();
        
        if (completedCount > 0) {
            this.retroBot.speak(`Cleared ${completedCount} completed tasks! Fresh start! ✨`, 'happy');
        } else {
            this.retroBot.speak("No completed tasks to clear! Keep working! 💪");
        }
    }
    
    addQuickTodo(text, priority = 'normal') {
        const todo = {
            id: this.idCounter++,
            text: text,
            completed: false,
            priority: priority,
            createdAt: new Date().toISOString(),
            completedAt: null
        };
        
        this.todos.push(todo);
        this.saveTodos();
        this.renderTodos();
        this.updateStats();
        
        return todo;
    }
    
    // Smart todo parsing from natural language
    parseSmartTodo(text) {
        const urgentKeywords = ['urgent', 'asap', 'important', 'critical', 'emergency'];
        const mediumKeywords = ['soon', 'priority', 'focus'];
        
        let priority = 'normal';
        let cleanText = text.toLowerCase();
        
        if (urgentKeywords.some(keyword => cleanText.includes(keyword))) {
            priority = 'high';
        } else if (mediumKeywords.some(keyword => cleanText.includes(keyword))) {
            priority = 'medium';
        }
        
        // Clean up the text
        const cleanupWords = [...urgentKeywords, ...mediumKeywords];
        cleanupWords.forEach(word => {
            cleanText = cleanText.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
        });
        
        cleanText = cleanText.replace(/[!]+/g, '').trim();
        cleanText = cleanText.charAt(0).toUpperCase() + cleanText.slice(1);
        
        return { text: cleanText, priority };
    }
    
    // Export todos
    exportTodos() {
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            todos: this.todos,
            stats: {
                total: this.todos.length,
                completed: this.todos.filter(t => t.completed).length,
                pending: this.todos.filter(t => !t.completed).length
            }
        };
        
        return JSON.stringify(exportData, null, 2);
    }
    
    // Import todos
    importTodos(data) {
        try {
            const importData = JSON.parse(data);
            if (importData.todos && Array.isArray(importData.todos)) {
                // Merge with existing todos, updating ID counter
                const maxId = Math.max(...this.todos.map(t => t.id), 0);
                
                importData.todos.forEach(todo => {
                    todo.id = ++maxId;
                    this.todos.push(todo);
                });
                
                this.idCounter = maxId + 1;
                this.saveTodos();
                this.renderTodos();
                this.updateStats();
                
                this.retroBot.speak(`Imported ${importData.todos.length} todos! Your list just got supercharged! 📋⚡`, 'happy');
                return true;
            }
        } catch (e) {
            this.retroBot.speak("Import failed! That doesn't look like valid todo data! 😵", 'annoyed');
        }
        return false;
    }
}