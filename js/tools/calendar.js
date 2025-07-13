/* RetroBot Calendar Tool */

class CalendarTool {
    constructor(retroBot) {
        this.retroBot = retroBot;
        this.currentDate = new Date();
        this.events = {};
        this.selectedDate = null;
        
        // Load saved events
        this.loadEvents();
        
        // Initialize calendar
        this.init();
    }
    
    init() {
        console.log('📅 Calendar tool initialized');
        this.renderCalendar();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        const eventInput = document.getElementById('event-input');
        if (eventInput) {
            eventInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addEvent();
                }
            });
        }
    }
    
    renderCalendar() {
        const grid = document.getElementById('calendar-grid');
        const monthSpan = document.getElementById('calendar-month');
        
        if (!grid || !monthSpan) return;
        
        // Update month display
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        monthSpan.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        
        // Clear previous calendar
        grid.innerHTML = '';
        
        // Get first day of month and number of days
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        // Create day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            const header = document.createElement('div');
            header.textContent = day;
            header.className = 'calendar-header-day';
            header.style.cssText = `
                font-weight: bold;
                text-align: center;
                padding: 4px;
                background: var(--bg-medium);
                border: 1px solid var(--border-color);
                color: var(--text-bright);
                font-size: 10px;
            `;
            grid.appendChild(header);
        });
        
        // Create calendar days
        for (let i = 0; i < 42; i++) { // 6 weeks max
            const cellDate = new Date(startDate);
            cellDate.setDate(startDate.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = cellDate.getDate();
            
            // Style current month days
            if (cellDate.getMonth() !== this.currentDate.getMonth()) {
                dayElement.style.opacity = '0.3';
                dayElement.style.cursor = 'default';
            } else {
                dayElement.addEventListener('click', () => {
                    this.selectDate(cellDate);
                });
            }
            
            // Highlight today
            const today = new Date();
            if (this.isSameDay(cellDate, today)) {
                dayElement.classList.add('today');
            }
            
            // Show events
            const dateKey = this.getDateKey(cellDate);
            if (this.events[dateKey] && this.events[dateKey].length > 0) {
                dayElement.classList.add('has-event');
                dayElement.title = this.events[dateKey].join(', ');
            }
            
            // Highlight selected date
            if (this.selectedDate && this.isSameDay(cellDate, this.selectedDate)) {
                dayElement.style.background = 'var(--secondary-cyan)';
                dayElement.style.color = 'var(--bg-dark)';
            }
            
            grid.appendChild(dayElement);
        }
    }
    
    selectDate(date) {
        this.selectedDate = new Date(date);
        this.renderCalendar();
        
        const dateStr = date.toLocaleDateString();
        const dateKey = this.getDateKey(date);
        const events = this.events[dateKey] || [];
        
        if (events.length > 0) {
            this.retroBot.speak(`Selected ${dateStr}. Events: ${events.join(', ')}! 📅`);
        } else {
            this.retroBot.speak(`Selected ${dateStr}. No events scheduled! Perfect day to plan something! ✨`);
        }
        
        this.retroBot.playSound('beep');
    }
    
    addEvent() {
        const input = document.getElementById('event-input');
        const eventText = input.value.trim();
        
        if (!eventText) {
            this.retroBot.speak("Type an event first! I can't schedule nothing! 😅", 'annoyed');
            return;
        }
        
        if (!this.selectedDate) {
            // Use today if no date selected
            this.selectedDate = new Date();
        }
        
        const dateKey = this.getDateKey(this.selectedDate);
        
        if (!this.events[dateKey]) {
            this.events[dateKey] = [];
        }
        
        this.events[dateKey].push(eventText);
        input.value = '';
        
        this.saveEvents();
        this.renderCalendar();
        
        const dateStr = this.selectedDate.toLocaleDateString();
        this.retroBot.speak(`Event "${eventText}" added to ${dateStr}! Your schedule is looking great! 📅✨`, 'happy');
        this.retroBot.playSound('beep');
        
        // Animation
        this.retroBot.animations.trigger('celebration');
    }
    
    prevMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
        this.retroBot.speak("Going back in time! Well, just one month... ⏰");
        this.retroBot.playSound('beep');
    }
    
    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
        this.retroBot.speak("Fast forward to the future! Next month loading... 🚀");
        this.retroBot.playSound('beep');
    }
    
    getDateKey(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
    
    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }
    
    getEvents() {
        return this.events;
    }
    
    saveEvents() {
        try {
            localStorage.setItem('retrobot-calendar-events', JSON.stringify(this.events));
        } catch (e) {
            console.log('Failed to save calendar events:', e);
        }
    }
    
    loadEvents() {
        try {
            const saved = localStorage.getItem('retrobot-calendar-events');
            if (saved) {
                this.events = JSON.parse(saved);
            }
        } catch (e) {
            console.log('Failed to load calendar events:', e);
            this.events = {};
        }
    }
    
    // Utility methods for external use
    getEventsForDate(date) {
        const dateKey = this.getDateKey(date);
        return this.events[dateKey] || [];
    }
    
    hasEventsToday() {
        const today = new Date();
        return this.getEventsForDate(today).length > 0;
    }
    
    getUpcomingEvents(days = 7) {
        const upcoming = [];
        const today = new Date();
        
        for (let i = 0; i <= days; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() + i);
            
            const events = this.getEventsForDate(checkDate);
            if (events.length > 0) {
                upcoming.push({
                    date: new Date(checkDate),
                    events: events
                });
            }
        }
        
        return upcoming;
    }
    
    removeEvent(date, eventIndex) {
        const dateKey = this.getDateKey(date);
        if (this.events[dateKey] && this.events[dateKey][eventIndex]) {
            const removedEvent = this.events[dateKey].splice(eventIndex, 1)[0];
            
            if (this.events[dateKey].length === 0) {
                delete this.events[dateKey];
            }
            
            this.saveEvents();
            this.renderCalendar();
            
            this.retroBot.speak(`Event "${removedEvent}" removed! Calendar updated! 🗑️`);
            return true;
        }
        return false;
    }
    
    // Quick add for natural language dates
    quickAdd(text) {
        const patterns = [
            { regex: /today (.+)/i, offset: 0 },
            { regex: /tomorrow (.+)/i, offset: 1 },
            { regex: /next week (.+)/i, offset: 7 },
            { regex: /(\d{1,2})\/(\d{1,2}) (.+)/i, date: true }
        ];
        
        for (const pattern of patterns) {
            const match = text.match(pattern.regex);
            if (match) {
                let targetDate;
                
                if (pattern.date) {
                    // Handle MM/DD format
                    const month = parseInt(match[1]) - 1;
                    const day = parseInt(match[2]);
                    const year = new Date().getFullYear();
                    targetDate = new Date(year, month, day);
                    
                    if (targetDate < new Date()) {
                        targetDate.setFullYear(year + 1);
                    }
                } else {
                    // Handle relative dates
                    targetDate = new Date();
                    targetDate.setDate(targetDate.getDate() + pattern.offset);
                }
                
                const eventText = match[pattern.date ? 3 : 1];
                const dateKey = this.getDateKey(targetDate);
                
                if (!this.events[dateKey]) {
                    this.events[dateKey] = [];
                }
                
                this.events[dateKey].push(eventText);
                this.saveEvents();
                this.renderCalendar();
                
                const dateStr = targetDate.toLocaleDateString();
                this.retroBot.speak(`Smart scheduling! Added "${eventText}" to ${dateStr}! 🧠✨`, 'happy');
                return true;
            }
        }
        
        return false;
    }
    
    // Export calendar data
    exportCalendar() {
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            events: this.events
        };
        
        return JSON.stringify(exportData, null, 2);
    }
    
    // Import calendar data
    importCalendar(data) {
        try {
            const importData = JSON.parse(data);
            if (importData.events) {
                // Merge with existing events
                Object.keys(importData.events).forEach(dateKey => {
                    if (!this.events[dateKey]) {
                        this.events[dateKey] = [];
                    }
                    this.events[dateKey] = [
                        ...this.events[dateKey],
                        ...importData.events[dateKey]
                    ];
                });
                
                this.saveEvents();
                this.renderCalendar();
                this.retroBot.speak("Calendar imported successfully! Your schedule is now super powered! 📅⚡", 'happy');
                return true;
            }
        } catch (e) {
            this.retroBot.speak("Import failed! That doesn't look like valid calendar data! 😵", 'annoyed');
        }
        return false;
    }
}