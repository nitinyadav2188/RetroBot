/* RetroBot Animation System */

class AnimationSystem {
    constructor(retroBot) {
        this.retroBot = retroBot;
        this.currentAnimations = new Map();
        this.animationQueue = [];
        this.isProcessingQueue = false;
        
        // Animation configurations
        this.animations = {
            'speak': {
                duration: 500,
                elements: ['.character-sprite'],
                classes: ['speaking'],
                callback: null
            },
            'mood-change': {
                duration: 1000,
                elements: ['.character-sprite', '.mood-fill'],
                classes: ['mood-transitioning'],
                callback: this.onMoodChangeComplete.bind(this)
            },
            'button-press': {
                duration: 200,
                elements: ['button:active', '.tab-btn:active'],
                classes: ['pressed'],
                callback: null
            },
            'notification': {
                duration: 2000,
                elements: ['.notification'],
                classes: ['bouncing'],
                callback: null
            },
            'tool-switch': {
                duration: 300,
                elements: ['.tool-content'],
                classes: ['switching'],
                callback: null
            },
            'idle': {
                duration: 3000,
                elements: ['.character-sprite .sprite-container'],
                classes: ['idle-animation'],
                callback: this.scheduleNextIdle.bind(this)
            },
            'celebration': {
                duration: 2000,
                elements: ['.retrobot-window'],
                classes: ['celebrating'],
                callback: null
            },
            'error': {
                duration: 500,
                elements: ['.retrobot-window'],
                classes: ['error-shake'],
                callback: null
            }
        };
        
        // Start idle animations
        this.startIdleAnimations();
    }
    
    trigger(animationName, data = null) {
        const animation = this.animations[animationName];
        if (!animation) {
            console.warn(`Animation ${animationName} not found`);
            return;
        }
        
        // Add to queue if needed
        if (this.isProcessingQueue && animationName !== 'idle') {
            this.animationQueue.push({ name: animationName, data });
            return;
        }
        
        this.executeAnimation(animationName, animation, data);
    }
    
    executeAnimation(name, animation, data) {
        // Mark as processing if it's a major animation
        if (['mood-change', 'celebration', 'tool-switch'].includes(name)) {
            this.isProcessingQueue = true;
        }
        
        // Apply animation classes to elements
        animation.elements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                animation.classes.forEach(className => {
                    element.classList.add(className);
                });
            });
        });
        
        // Store animation for cleanup
        this.currentAnimations.set(name, {
            animation,
            startTime: Date.now(),
            data
        });
        
        // Schedule cleanup
        setTimeout(() => {
            this.cleanupAnimation(name, animation, data);
        }, animation.duration);
    }
    
    cleanupAnimation(name, animation, data) {
        // Remove animation classes
        animation.elements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                animation.classes.forEach(className => {
                    element.classList.remove(className);
                });
            });
        });
        
        // Execute callback if provided
        if (animation.callback) {
            animation.callback(data);
        }
        
        // Remove from active animations
        this.currentAnimations.delete(name);
        
        // Process next animation in queue
        if (['mood-change', 'celebration', 'tool-switch'].includes(name)) {
            this.isProcessingQueue = false;
            this.processQueue();
        }
    }
    
    processQueue() {
        if (this.animationQueue.length > 0 && !this.isProcessingQueue) {
            const nextAnimation = this.animationQueue.shift();
            this.trigger(nextAnimation.name, nextAnimation.data);
        }
    }
    
    onMoodChangeComplete(mood) {
        // Trigger mood-specific animations
        switch (mood) {
            case 'happy':
                this.triggerHappyEffects();
                break;
            case 'annoyed':
                this.triggerAnnoyedEffects();
                break;
            case 'sleepy':
                this.triggerSleepyEffects();
                break;
        }
    }
    
    triggerHappyEffects() {
        // Happy particle effect simulation
        this.createParticleEffect('✨', 5);
        
        // Bounce animation for character
        const sprite = document.querySelector('.character-sprite .sprite-container');
        if (sprite) {
            sprite.style.animation = 'happy-bounce 1s ease-in-out infinite';
        }
        
        // Color pulse for mood bar
        const moodFill = document.querySelector('.mood-fill');
        if (moodFill) {
            moodFill.style.animation = 'mood-glow 2s ease-in-out infinite';
        }
    }
    
    triggerAnnoyedEffects() {
        // Shake effect for window
        const window = document.querySelector('.retrobot-window');
        if (window) {
            window.classList.add('shake');
            setTimeout(() => {
                window.classList.remove('shake');
            }, 500);
        }
        
        // Red tint for character
        const sprite = document.querySelector('.character-sprite .sprite-container');
        if (sprite) {
            sprite.style.animation = 'annoyed-shake 0.5s ease-in-out infinite';
        }
    }
    
    triggerSleepyEffects() {
        // Slow fade in/out
        const container = document.querySelector('#retrobot-container');
        if (container) {
            container.style.animation = 'sleepy-fade 3s ease-in-out infinite';
        }
        
        // Slow sway for character
        const sprite = document.querySelector('.character-sprite .sprite-container');
        if (sprite) {
            sprite.style.animation = 'sleepy-sway 3s ease-in-out infinite';
        }
    }
    
    createParticleEffect(emoji, count) {
        const container = document.querySelector('#retrobot-container');
        if (!container) return;
        
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.textContent = emoji;
                particle.className = 'particle-effect';
                particle.style.cssText = `
                    position: absolute;
                    font-size: 16px;
                    pointer-events: none;
                    z-index: 1001;
                    animation: particle-float 2s ease-out forwards;
                    left: ${Math.random() * 100}%;
                    top: 50%;
                `;
                
                container.appendChild(particle);
                
                setTimeout(() => {
                    particle.remove();
                }, 2000);
            }, i * 200);
        }
    }
    
    startIdleAnimations() {
        this.scheduleNextIdle();
    }
    
    scheduleNextIdle() {
        // Random idle animations every 5-10 seconds
        const delay = 5000 + Math.random() * 5000;
        
        setTimeout(() => {
            if (this.retroBot.isVisible && !this.isProcessingQueue) {
                this.performIdleAnimation();
            }
            this.scheduleNextIdle();
        }, delay);
    }
    
    performIdleAnimation() {
        const idleAnimations = [
            'blink',
            'look-around',
            'stretch',
            'yawn',
            'bounce'
        ];
        
        const randomAnimation = idleAnimations[Math.floor(Math.random() * idleAnimations.length)];
        this.performSpecificIdle(randomAnimation);
    }
    
    performSpecificIdle(type) {
        const sprite = document.querySelector('.character-sprite');
        const eyes = document.querySelector('.eyes');
        const mouth = document.querySelector('.mouth');
        
        if (!sprite) return;
        
        switch (type) {
            case 'blink':
                if (eyes) {
                    eyes.style.animation = 'blink 0.3s ease-in-out';
                    setTimeout(() => {
                        eyes.style.animation = '';
                    }, 300);
                }
                break;
                
            case 'look-around':
                if (eyes) {
                    eyes.style.transform = 'translateX(-2px)';
                    setTimeout(() => {
                        eyes.style.transform = 'translateX(2px)';
                    }, 500);
                    setTimeout(() => {
                        eyes.style.transform = '';
                    }, 1000);
                }
                break;
                
            case 'stretch':
                sprite.style.animation = 'idle-stretch 1s ease-in-out';
                setTimeout(() => {
                    sprite.style.animation = '';
                }, 1000);
                break;
                
            case 'yawn':
                if (mouth && this.retroBot.currentMood === 'sleepy') {
                    mouth.style.animation = 'yawn-animation 1s ease-in-out';
                    setTimeout(() => {
                        mouth.style.animation = '';
                    }, 1000);
                }
                break;
                
            case 'bounce':
                sprite.style.animation = 'idle-bounce 0.5s ease-in-out';
                setTimeout(() => {
                    sprite.style.animation = '';
                }, 500);
                break;
        }
    }
    
    // Special effect animations
    triggerSpecialEffect(effectName) {
        switch (effectName) {
            case 'rainbow':
                this.rainbowEffect();
                break;
            case 'glitch':
                this.glitchEffect();
                break;
            case 'matrix':
                this.matrixEffect();
                break;
            case 'fire':
                this.fireEffect();
                break;
        }
    }
    
    rainbowEffect() {
        const window = document.querySelector('.retrobot-window');
        if (window) {
            window.classList.add('rainbow-effect');
            setTimeout(() => {
                window.classList.remove('rainbow-effect');
            }, 3000);
        }
    }
    
    glitchEffect() {
        const window = document.querySelector('.retrobot-window');
        if (window) {
            window.classList.add('glitch');
            setTimeout(() => {
                window.classList.remove('glitch');
            }, 2000);
        }
    }
    
    matrixEffect() {
        // Create falling characters effect
        this.createMatrixRain();
    }
    
    createMatrixRain() {
        const container = document.querySelector('#retrobot-container');
        if (!container) return;
        
        const characters = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
        
        for (let i = 0; i < 20; i++) {
            const drop = document.createElement('div');
            drop.textContent = characters[Math.floor(Math.random() * characters.length)];
            drop.className = 'matrix-drop';
            drop.style.cssText = `
                position: absolute;
                color: var(--primary-green);
                font-family: monospace;
                font-size: 12px;
                pointer-events: none;
                z-index: 999;
                animation: matrix-fall 2s linear forwards;
                left: ${Math.random() * 100}%;
                top: -20px;
                opacity: 0.8;
            `;
            
            container.appendChild(drop);
            
            setTimeout(() => {
                drop.remove();
            }, 2000);
        }
    }
    
    fireEffect() {
        // Create fire particles
        this.createFireParticles();
    }
    
    createFireParticles() {
        const container = document.querySelector('#retrobot-container');
        if (!container) return;
        
        const fireEmojis = ['🔥', '💥', '⚡', '✨'];
        
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.textContent = fireEmojis[Math.floor(Math.random() * fireEmojis.length)];
                particle.className = 'fire-particle';
                particle.style.cssText = `
                    position: absolute;
                    font-size: 14px;
                    pointer-events: none;
                    z-index: 1001;
                    animation: fire-rise 1.5s ease-out forwards;
                    left: ${45 + Math.random() * 10}%;
                    bottom: 0;
                `;
                
                container.appendChild(particle);
                
                setTimeout(() => {
                    particle.remove();
                }, 1500);
            }, i * 100);
        }
    }
    
    // Utility method to stop all animations
    stopAllAnimations() {
        this.currentAnimations.forEach((data, name) => {
            this.cleanupAnimation(name, data.animation, data.data);
        });
        this.animationQueue = [];
        this.isProcessingQueue = false;
    }
    
    // Method to check if specific animation is running
    isAnimationRunning(name) {
        return this.currentAnimations.has(name);
    }
    
    // Method to get current mood animation state
    getCurrentMoodAnimation() {
        const sprite = document.querySelector('.character-sprite');
        if (sprite) {
            return sprite.className.includes('happy') ? 'happy' :
                   sprite.className.includes('annoyed') ? 'annoyed' :
                   sprite.className.includes('sleepy') ? 'sleepy' : 'neutral';
        }
        return 'neutral';
    }
}

// Add dynamic CSS for particle effects
const style = document.createElement('style');
style.textContent = `
    @keyframes particle-float {
        0% { transform: translateY(0) scale(1); opacity: 1; }
        100% { transform: translateY(-50px) scale(0.5); opacity: 0; }
    }
    
    @keyframes matrix-fall {
        0% { transform: translateY(-20px); opacity: 0.8; }
        100% { transform: translateY(200px); opacity: 0; }
    }
    
    @keyframes fire-rise {
        0% { transform: translateY(0) scale(1); opacity: 1; }
        100% { transform: translateY(-40px) scale(0.3); opacity: 0; }
    }
    
    @keyframes sleepy-fade {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }
    
    @keyframes idle-stretch {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05, 0.95); }
    }
    
    @keyframes yawn-animation {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.3, 0.7); }
    }
    
    @keyframes rainbow-effect {
        0% { filter: hue-rotate(0deg) saturate(1); }
        25% { filter: hue-rotate(90deg) saturate(1.5); }
        50% { filter: hue-rotate(180deg) saturate(2); }
        75% { filter: hue-rotate(270deg) saturate(1.5); }
        100% { filter: hue-rotate(360deg) saturate(1); }
    }
    
    @keyframes error-shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
        20%, 40%, 60%, 80% { transform: translateX(3px); }
    }
    
    .celebrating {
        animation: celebration-bounce 2s ease-in-out infinite;
    }
    
    @keyframes celebration-bounce {
        0%, 100% { transform: scale(1) rotate(0deg); }
        25% { transform: scale(1.05) rotate(2deg); }
        75% { transform: scale(1.05) rotate(-2deg); }
    }
`;
document.head.appendChild(style);