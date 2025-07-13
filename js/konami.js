/* RetroBot Konami Code Handler */

class KonamiHandler {
    constructor(retroBot) {
        this.retroBot = retroBot;
        this.sequence = [
            'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
            'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
            'KeyB', 'KeyA'
        ];
        this.userInput = [];
        this.isActive = false;
        this.cooldown = false;
        
        // Easter egg sequences
        this.easterEggs = {
            'konami': this.sequence,
            'matrix': ['KeyM', 'KeyA', 'KeyT', 'KeyR', 'KeyI', 'KeyX'],
            'retro': ['KeyR', 'KeyE', 'KeyT', 'KeyR', 'KeyO'],
            'dance': ['ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'],
            'glitch': ['KeyG', 'KeyL', 'KeyI', 'KeyT', 'KeyC', 'KeyH']
        };
        
        this.currentSequences = {};
        
        this.init();
    }
    
    init() {
        console.log('🎮 Konami code handler initialized');
        this.setupEventListeners();
        this.initializeSequenceTracking();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
        
        // Also listen for touch sequences on mobile
        if (RetrobotUtils.isTouch()) {
            this.setupTouchSequences();
        }
    }
    
    initializeSequenceTracking() {
        // Initialize tracking for all easter egg sequences
        Object.keys(this.easterEggs).forEach(name => {
            this.currentSequences[name] = [];
        });
    }
    
    handleKeyPress(e) {
        // Ignore if user is typing in an input field
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        const key = e.code;
        
        // Check all sequences
        Object.keys(this.easterEggs).forEach(sequenceName => {
            this.checkSequence(sequenceName, key);
        });
        
        // Prevent default for arrow keys to avoid page scrolling
        if (key.startsWith('Arrow')) {
            e.preventDefault();
        }
    }
    
    checkSequence(sequenceName, key) {
        const sequence = this.easterEggs[sequenceName];
        const userSequence = this.currentSequences[sequenceName];
        
        // Check if the key matches the next expected key
        if (key === sequence[userSequence.length]) {
            userSequence.push(key);
            
            // Visual feedback for progress
            this.showSequenceProgress(sequenceName, userSequence.length, sequence.length);
            
            // Check if sequence is complete
            if (userSequence.length === sequence.length) {
                this.triggerEasterEgg(sequenceName);
                this.resetSequence(sequenceName);
            }
        } else {
            // Reset if wrong key
            this.resetSequence(sequenceName);
        }
    }
    
    resetSequence(sequenceName) {
        this.currentSequences[sequenceName] = [];
    }
    
    resetAllSequences() {
        Object.keys(this.currentSequences).forEach(name => {
            this.resetSequence(name);
        });
    }
    
    showSequenceProgress(sequenceName, current, total) {
        if (current > 3) { // Only show progress after a few keys
            const progress = Math.round((current / total) * 100);
            
            // Show subtle progress indicator
            if (current === total - 1) {
                this.retroBot.showNotification(`🎮 ${sequenceName.toUpperCase()} sequence almost complete...`);
            }
        }
    }
    
    triggerEasterEgg(sequenceName) {
        if (this.cooldown) return;
        
        this.cooldown = true;
        setTimeout(() => { this.cooldown = false; }, 5000);
        
        console.log(`🎉 Easter egg triggered: ${sequenceName}`);
        
        switch (sequenceName) {
            case 'konami':
                this.activateKonamiCode();
                break;
            case 'matrix':
                this.activateMatrixMode();
                break;
            case 'retro':
                this.activateRetroMode();
                break;
            case 'dance':
                this.activateDanceMode();
                break;
            case 'glitch':
                this.activateGlitchMode();
                break;
        }
        
        // Play special sound
        RetrobotUtils.generateBeep(800, 100);
        setTimeout(() => RetrobotUtils.generateBeep(1000, 100), 150);
        setTimeout(() => RetrobotUtils.generateBeep(1200, 200), 300);
    }
    
    activateKonamiCode() {
        this.retroBot.triggerEasterEgg('konami');
        
        // Show special notification
        const notification = document.createElement('div');
        notification.className = 'theme-unlock-notification';
        notification.innerHTML = `
            🎮 KONAMI CODE ACTIVATED! 🎮<br>
            <span style="font-size: 14px;">Rainbow Theme Unlocked!</span>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
        
        // Unlock all themes
        ['purple', 'red', 'rainbow', 'c64', 'apple2', 'atari'].forEach(theme => {
            this.retroBot.unlockTheme(theme);
        });
        
        // Trigger special effects
        this.retroBot.animations.triggerSpecialEffect('rainbow');
        
        // Special achievement
        this.retroBot.showNotification('🏆 ACHIEVEMENT: Konami Master!');
    }
    
    activateMatrixMode() {
        this.retroBot.speak("Welcome to the Matrix... I mean, RetroBot! 🕶️", 'happy');
        
        // Matrix rain effect
        this.retroBot.animations.triggerSpecialEffect('matrix');
        
        // Temporarily change theme
        const originalTheme = this.retroBot.currentTheme;
        this.retroBot.applyTheme('default');
        
        // Add matrix-style text effect
        const dialogue = document.getElementById('dialogue-text');
        if (dialogue) {
            dialogue.style.fontFamily = 'monospace';
            dialogue.style.color = '#00FF41';
            dialogue.style.textShadow = '0 0 5px #00FF41';
            
            setTimeout(() => {
                dialogue.style.fontFamily = '';
                dialogue.style.color = '';
                dialogue.style.textShadow = '';
                this.retroBot.applyTheme(originalTheme);
            }, 10000);
        }
        
        this.retroBot.showNotification('🕶️ Matrix Mode Activated!');
    }
    
    activateRetroMode() {
        this.retroBot.speak("RETRO POWER ACTIVATED! Going full 8-bit! 🕹️", 'happy');
        
        // Cycle through retro themes
        const retroThemes = ['c64', 'apple2', 'atari'];
        let currentIndex = 0;
        
        const cycleThemes = () => {
            if (currentIndex < retroThemes.length) {
                this.retroBot.applyTheme(retroThemes[currentIndex]);
                currentIndex++;
                setTimeout(cycleThemes, 1000);
            } else {
                this.retroBot.applyTheme('default');
            }
        };
        
        cycleThemes();
        
        // Unlock retro achievements
        this.retroBot.showNotification('🕹️ Retro Master Achievement Unlocked!');
    }
    
    activateDanceMode() {
        this.retroBot.speak("Time to dance! Let's get groovy! 💃🕺", 'happy');
        
        // Make the character dance
        const sprite = document.querySelector('.character-sprite');
        if (sprite) {
            sprite.style.animation = 'dance-move 0.5s ease-in-out infinite';
            
            setTimeout(() => {
                sprite.style.animation = '';
            }, 5000);
        }
        
        // Add dance CSS if not exists
        if (!document.querySelector('#dance-style')) {
            const style = document.createElement('style');
            style.id = 'dance-style';
            style.textContent = `
                @keyframes dance-move {
                    0%, 100% { transform: translateX(0) rotate(0deg); }
                    25% { transform: translateX(-5px) rotate(-5deg); }
                    75% { transform: translateX(5px) rotate(5deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Switch to music tool
        this.retroBot.switchTool('music');
        
        this.retroBot.showNotification('💃 Dance Mode Activated!');
    }
    
    activateGlitchMode() {
        this.retroBot.speak("01000111 01101100 01101001 01110100 01100011 01101000! ERROR ERROR! 🤖", 'annoyed');
        
        // Trigger glitch effects
        this.retroBot.animations.triggerSpecialEffect('glitch');
        
        // Glitch the window
        const window = this.retroBot.window;
        window.classList.add('glitch');
        
        // Random theme switching
        const themes = ['default', 'amber', 'blue', 'purple', 'red'];
        let glitchCount = 0;
        const maxGlitches = 10;
        
        const glitchInterval = setInterval(() => {
            const randomTheme = RetrobotUtils.getRandomChoice(themes);
            this.retroBot.applyTheme(randomTheme);
            
            glitchCount++;
            if (glitchCount >= maxGlitches) {
                clearInterval(glitchInterval);
                this.retroBot.applyTheme('default');
                window.classList.remove('glitch');
                this.retroBot.speak("System restored! That was... intense! 😅", 'happy');
            }
        }, 200);
        
        this.retroBot.showNotification('⚡ GLITCH MODE ACTIVATED!');
    }
    
    setupTouchSequences() {
        let touchSequence = [];
        let touchStartTime = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            
            // Convert touch position to direction
            const touch = e.touches[0];
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            
            const deltaX = touch.clientX - centerX;
            const deltaY = touch.clientY - centerY;
            
            let direction;
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                direction = deltaX > 0 ? 'RIGHT' : 'LEFT';
            } else {
                direction = deltaY > 0 ? 'DOWN' : 'UP';
            }
            
            touchSequence.push(direction);
            
            // Check for touch Konami code: UP, UP, DOWN, DOWN, LEFT, RIGHT, LEFT, RIGHT
            const touchKonami = ['UP', 'UP', 'DOWN', 'DOWN', 'LEFT', 'RIGHT', 'LEFT', 'RIGHT'];
            
            if (touchSequence.length > touchKonami.length) {
                touchSequence = touchSequence.slice(-touchKonami.length);
            }
            
            if (touchSequence.length === touchKonami.length && 
                touchSequence.every((dir, i) => dir === touchKonami[i])) {
                this.activateKonamiCode();
                touchSequence = [];
            }
            
            // Reset if no touch for 3 seconds
            setTimeout(() => {
                if (Date.now() - touchStartTime > 3000) {
                    touchSequence = [];
                }
            }, 3000);
        });
    }
    
    // Special holiday/seasonal easter eggs
    checkSpecialDates() {
        const now = new Date();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        
        // Christmas Easter Egg (December 25)
        if (month === 12 && day === 25) {
            this.activateHolidayMode('christmas');
        }
        
        // Halloween Easter Egg (October 31)
        if (month === 10 && day === 31) {
            this.activateHolidayMode('halloween');
        }
        
        // New Year Easter Egg (January 1)
        if (month === 1 && day === 1) {
            this.activateHolidayMode('newyear');
        }
    }
    
    activateHolidayMode(holiday) {
        switch (holiday) {
            case 'christmas':
                this.retroBot.applyTheme('christmas');
                this.retroBot.speak("🎄 Merry Christmas! Ho ho ho! 🎅", 'happy');
                break;
            case 'halloween':
                this.retroBot.applyTheme('halloween');
                this.retroBot.speak("👻 Happy Halloween! Boo-tiful day! 🎃", 'happy');
                break;
            case 'newyear':
                this.retroBot.speak("🎊 Happy New Year! New year, new code! 🎆", 'happy');
                this.retroBot.animations.triggerSpecialEffect('fire');
                break;
        }
    }
    
    // Debug mode for testing
    enableDebugMode() {
        console.log('🔧 Konami Debug Mode Enabled');
        
        // Log all key presses
        document.addEventListener('keydown', (e) => {
            console.log(`Key pressed: ${e.code}`);
        });
        
        // Show current sequence progress
        window.showKonamiProgress = () => {
            console.log('Current sequences:', this.currentSequences);
        };
        
        // Manually trigger easter eggs
        window.triggerEasterEgg = (name) => {
            this.triggerEasterEgg(name);
        };
        
        this.retroBot.speak("Debug mode activated! Check console for details! 🔧");
    }
}