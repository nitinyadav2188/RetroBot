/* RetroBot Core System */

class RetroBot {
    constructor() {
        this.version = '1.0.0';
        this.isVisible = false;
        this.isMinimized = false;
        this.currentTool = 'chat';
        this.currentMood = 'happy';
        this.moodLevel = 80;
        this.currentTheme = 'default';
        this.unlockedThemes = ['default', 'amber', 'blue'];
        this.lastInteraction = Date.now();
        this.interactionCount = 0;
        
        // DOM Elements
        this.container = null;
        this.window = null;
        this.spriteElement = null;
        this.dialogueElement = null;
        this.moodIndicator = null;
        
        // Components
        this.personality = null;
        this.animations = null;
        this.calendar = null;
        this.todo = null;
        this.music = null;
        this.konami = null;
        
        // Dragging
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        
        // Auto-hide timer
        this.autoHideTimer = null;
        this.autoHideDelay = 30000; // 30 seconds
        
        // Initialize
        this.init();
    }
    
    init() {
        console.log('🤖 RetroBot v' + this.version + ' initializing...');
        
        // Get DOM elements
        this.container = document.getElementById('retrobot-container');
        this.window = this.container.querySelector('.retrobot-window');
        this.spriteElement = document.getElementById('retrobot-sprite');
        this.dialogueElement = document.getElementById('dialogue-text');
        this.moodIndicator = document.getElementById('mood-text');
        
        // Load saved data
        this.loadData();
        
        // Initialize components
        this.initializeComponents();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Apply initial theme
        this.applyTheme(this.currentTheme);
        
        // Set initial mood
        this.changeMood(this.currentMood);
        
        // Show RetroBot after initialization
        setTimeout(() => {
            this.show();
            this.speak("Welcome to RetroBot! I'm your 8-bit assistant ready to help! 🤖");
        }, 500);
        
        console.log('🤖 RetroBot initialized successfully!');
    }
    
    initializeComponents() {
        // Initialize personality system
        this.personality = new PersonalitySystem(this);
        
        // Initialize animations
        this.animations = new AnimationSystem(this);
        
        // Initialize tools
        this.calendar = new CalendarTool(this);
        this.todo = new TodoTool(this);
        this.music = new MusicTool(this);
        
        // Initialize Konami code handler
        this.konami = new KonamiHandler(this);
    }
    
    setupEventListeners() {
        // Window dragging
        const titlebar = this.window.querySelector('.titlebar');
        titlebar.addEventListener('mousedown', this.startDragging.bind(this));
        document.addEventListener('mousemove', this.drag.bind(this));
        document.addEventListener('mouseup', this.stopDragging.bind(this));
        
        // Input handling
        const userInput = document.getElementById('user-input');
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.processInput();
            }
        });
        
        // Auto-hide on inactivity
        document.addEventListener('click', this.resetAutoHideTimer.bind(this));
        document.addEventListener('keypress', this.resetAutoHideTimer.bind(this));
        
        // Window focus/blur
        window.addEventListener('focus', () => {
            if (this.isVisible) {
                this.changeMood('happy');
                this.speak("Welcome back! Miss me? 😊");
            }
        });
        
        window.addEventListener('blur', () => {
            if (this.isVisible) {
                this.changeMood('sleepy');
            }
        });
    }
    
    // Window Management
    show() {
        this.isVisible = true;
        this.container.classList.remove('retrobot-hidden');
        this.window.classList.add('powering-on');
        this.playSound('power-on');
        this.resetAutoHideTimer();
        
        setTimeout(() => {
            this.window.classList.remove('powering-on');
        }, 1000);
    }
    
    hide() {
        this.isVisible = false;
        this.window.classList.add('powering-off');
        this.playSound('power-off');
        
        setTimeout(() => {
            this.container.classList.add('retrobot-hidden');
            this.window.classList.remove('powering-off');
        }, 500);
        
        this.clearAutoHideTimer();
    }
    
    minimize() {
        this.isMinimized = !this.isMinimized;
        this.container.classList.toggle('retrobot-minimized', this.isMinimized);
        
        if (this.isMinimized) {
            this.speak("Taking a quick nap... 😴");
            this.changeMood('sleepy');
        } else {
            this.speak("Back in action! 🚀");
            this.changeMood('happy');
        }
    }
    
    // Dragging functionality
    startDragging(e) {
        this.isDragging = true;
        const rect = this.container.getBoundingClientRect();
        this.dragOffset.x = e.clientX - rect.left;
        this.dragOffset.y = e.clientY - rect.top;
        this.container.style.cursor = 'grabbing';
    }
    
    drag(e) {
        if (!this.isDragging) return;
        
        const x = e.clientX - this.dragOffset.x;
        const y = e.clientY - this.dragOffset.y;
        
        // Keep within viewport bounds
        const maxX = window.innerWidth - this.container.offsetWidth;
        const maxY = window.innerHeight - this.container.offsetHeight;
        
        const constrainedX = Math.max(0, Math.min(x, maxX));
        const constrainedY = Math.max(0, Math.min(y, maxY));
        
        this.container.style.left = constrainedX + 'px';
        this.container.style.top = constrainedY + 'px';
        this.container.style.right = 'auto';
        this.container.style.bottom = 'auto';
    }
    
    stopDragging() {
        this.isDragging = false;
        this.container.style.cursor = 'default';
    }
    
    // Communication
    speak(message, mood = null) {
        if (mood) {
            this.changeMood(mood);
        }
        
        this.dialogueElement.innerHTML = '';
        this.dialogueElement.classList.add('typing');
        
        // Typewriter effect
        let i = 0;
        const typeInterval = setInterval(() => {
            if (i < message.length) {
                this.dialogueElement.innerHTML = message.substring(0, i + 1);
                i++;
                // Only play sound at the start of speaking, not every character
                if (i === 1) {
                    this.playSound('speak');
                }
            } else {
                this.dialogueElement.classList.remove('typing');
                clearInterval(typeInterval);
            }
        }, 30); // Faster typing for better user experience
        
        this.animations.trigger('speak');
    }
    
    processInput() {
        const input = document.getElementById('user-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        input.value = '';
        this.handleUserMessage(message);
        this.resetAutoHideTimer();
    }
    
    handleUserMessage(message) {
        this.interactionCount++;
        const response = this.personality.processMessage(message);
        
        // Add button press animation
        this.animations.trigger('button-press');
        
        // Mood changes based on interaction
        if (message.toLowerCase().includes('help')) {
            this.adjustMood(10);
        } else if (message.toLowerCase().includes('stupid') || message.toLowerCase().includes('bad')) {
            this.adjustMood(-20);
        } else {
            this.adjustMood(5);
        }
        
        setTimeout(() => {
            this.speak(response);
        }, 300);
    }
    
    quickAction(action) {
        const actions = {
            help: () => {
                this.speak("I can help with calendars 📅, todos ✅, music 🎵, and casual chat! What do you need?", 'happy');
            },
            time: () => {
                const now = new Date();
                const timeStr = now.toLocaleTimeString();
                this.speak(`Current time: ${timeStr}. Time flies in the digital realm! ⏰`);
            },
            joke: () => {
                const jokes = [
                    "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
                    "How many programmers does it take to change a light bulb? None, that's a hardware problem! 💡",
                    "Why do Java developers wear glasses? Because they can't C#! 👓",
                    "I'd tell you a UDP joke, but you might not get it... 📡",
                    "Why was the JavaScript developer sad? Because he didn't Node how to Express himself! 😢"
                ];
                const joke = jokes[Math.floor(Math.random() * jokes.length)];
                this.speak(joke, 'happy');
            },
            mood: () => {
                this.speak(`I'm feeling ${this.currentMood} right now! Mood level: ${this.moodLevel}%. How are you doing? 🎭`);
            }
        };
        
        if (actions[action]) {
            actions[action]();
            this.animations.trigger('button-press');
        }
    }
    
    // Tool Management
    switchTool(toolName) {
        if (this.currentTool === toolName) return;
        
        // Hide current tool
        const currentContent = document.getElementById(`tool-${this.currentTool}`);
        const newContent = document.getElementById(`tool-${toolName}`);
        
        if (currentContent) {
            currentContent.classList.remove('active');
            currentContent.classList.add('switching-out');
        }
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Show new tool after animation
        setTimeout(() => {
            if (currentContent) {
                currentContent.classList.remove('switching-out');
            }
            
            newContent.classList.add('active', 'switching-in');
            
            setTimeout(() => {
                newContent.classList.remove('switching-in');
            }, 300);
        }, 150);
        
        this.currentTool = toolName;
        
        // Tool-specific responses
        const toolMessages = {
            chat: "Let's chat! Type anything you want to talk about! 💬",
            calendar: "Calendar ready! Click dates to add events! 📅",
            todo: "Todo list loaded! What needs to get done? ✅",
            music: "Music player active! Let's get this party started! 🎵"
        };
        
        this.speak(toolMessages[toolName] || "Tool switched!");
        this.playSound('beep');
        this.adjustMood(5);
    }
    
    // Mood System
    changeMood(mood) {
        const validMoods = ['happy', 'annoyed', 'sleepy'];
        if (!validMoods.includes(mood)) return;
        
        this.currentMood = mood;
        this.moodIndicator.textContent = mood.charAt(0).toUpperCase() + mood.slice(1);
        
        // Update sprite appearance
        this.spriteElement.className = `character-sprite ${mood}`;
        
        // Update mood bar
        const moodFill = document.getElementById('mood-fill');
        const moodWidths = { happy: '80%', annoyed: '40%', sleepy: '60%' };
        moodFill.style.width = moodWidths[mood];
        
        // Trigger mood animation
        this.animations.trigger('mood-change', mood);
        
        // Save mood
        this.saveData();
    }
    
    adjustMood(amount) {
        this.moodLevel = Math.max(0, Math.min(100, this.moodLevel + amount));
        
        // Auto mood switching based on level
        if (this.moodLevel > 70) {
            this.changeMood('happy');
        } else if (this.moodLevel < 30) {
            this.changeMood('annoyed');
        } else if (this.moodLevel < 50) {
            this.changeMood('sleepy');
        }
        
        // Update mood bar
        const moodFill = document.getElementById('mood-fill');
        moodFill.style.width = this.moodLevel + '%';
    }
    
    // Theme System
    applyTheme(themeName) {
        if (!this.unlockedThemes.includes(themeName)) {
            this.speak("Theme locked! Complete more interactions to unlock! 🔒", 'annoyed');
            return;
        }
        
        this.currentTheme = themeName;
        
        // Remove all theme classes
        this.window.className = this.window.className.replace(/theme-\w+/g, '');
        
        // Add new theme
        if (themeName !== 'default') {
            this.window.classList.add(`theme-${themeName}`);
        }
        
        this.window.classList.add('theme-transitioning');
        setTimeout(() => {
            this.window.classList.remove('theme-transitioning');
        }, 1000);
        
        this.speak(`Theme changed to ${themeName}! Looking good! ✨`);
        this.saveData();
    }
    
    unlockTheme(themeName) {
        if (!this.unlockedThemes.includes(themeName)) {
            this.unlockedThemes.push(themeName);
            this.showNotification(`🎉 New theme unlocked: ${themeName}!`);
            this.saveData();
        }
    }
    
    // Notification System
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        this.container.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
    
    // Auto-hide Management
    resetAutoHideTimer() {
        this.clearAutoHideTimer();
        this.autoHideTimer = setTimeout(() => {
            if (this.isVisible && !this.isDragging) {
                this.changeMood('sleepy');
                this.speak("Getting sleepy... I'll be here if you need me! 😴");
                setTimeout(() => {
                    if (this.currentMood === 'sleepy') {
                        this.minimize();
                    }
                }, 3000);
            }
        }, this.autoHideDelay);
    }
    
    clearAutoHideTimer() {
        if (this.autoHideTimer) {
            clearTimeout(this.autoHideTimer);
            this.autoHideTimer = null;
        }
    }
    
    // Sound Effects
    playSound(type) {
        // Generate subtle AI-like sounds instead of harsh beeps
        this.generateAISound(type);
    }
    
    generateAISound(type) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Different sounds for different actions
            switch (type) {
                case 'speak':
                    // Soft, pleasant tone for speaking
                    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.1);
                    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.1);
                    break;
                    
                case 'beep':
                    // Very subtle notification sound
                    oscillator.frequency.value = 600;
                    oscillator.type = 'sine';
                    gainNode.gain.setValueAtTime(0.03, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.05);
                    break;
                    
                case 'power-on':
                    // Gentle startup sound
                    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.3);
                    gainNode.gain.setValueAtTime(0.02, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.3);
                    break;
                    
                case 'power-off':
                    // Gentle shutdown sound
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.2);
                    gainNode.gain.setValueAtTime(0.02, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.2);
                    break;
                    
                default:
                    // No sound for other actions
                    return;
            }
        } catch (e) {
            // Silently fail if audio context not available
            console.log('Audio generation not available');
        }
    }
    
    // Data Persistence
    saveData() {
        const data = {
            currentMood: this.currentMood,
            moodLevel: this.moodLevel,
            currentTheme: this.currentTheme,
            unlockedThemes: this.unlockedThemes,
            interactionCount: this.interactionCount,
            todos: this.todo ? this.todo.getTodos() : [],
            calendarEvents: this.calendar ? this.calendar.getEvents() : {}
        };
        
        try {
            localStorage.setItem('retrobot-data', JSON.stringify(data));
        } catch (e) {
            console.log('Save failed:', e);
        }
    }
    
    loadData() {
        try {
            const data = localStorage.getItem('retrobot-data');
            if (data) {
                const parsed = JSON.parse(data);
                this.currentMood = parsed.currentMood || 'happy';
                this.moodLevel = parsed.moodLevel || 80;
                this.currentTheme = parsed.currentTheme || 'default';
                this.unlockedThemes = parsed.unlockedThemes || ['default', 'amber', 'blue'];
                this.interactionCount = parsed.interactionCount || 0;
                
                // Unlock themes based on interaction count
                if (this.interactionCount >= 10 && !this.unlockedThemes.includes('purple')) {
                    this.unlockTheme('purple');
                }
                if (this.interactionCount >= 25 && !this.unlockedThemes.includes('red')) {
                    this.unlockTheme('red');
                }
            }
        } catch (e) {
            console.log('Load failed:', e);
        }
    }
    
    // Easter Eggs
    triggerEasterEgg(type) {
        switch (type) {
            case 'konami':
                this.window.classList.add('konami-activated');
                this.unlockTheme('rainbow');
                this.applyTheme('rainbow');
                this.speak("🎮 KONAMI CODE ACTIVATED! 🌈 Rainbow theme unlocked!", 'happy');
                setTimeout(() => {
                    this.window.classList.remove('konami-activated');
                }, 3000);
                break;
                
            case 'glitch':
                this.window.classList.add('glitch');
                this.speak("01000111 01101100 01101001 01110100 01100011 01101000! 🤖", 'annoyed');
                setTimeout(() => {
                    this.window.classList.remove('glitch');
                }, 2000);
                break;
        }
    }
}

// Initialize RetroBot globally
window.retroBot = new RetroBot();