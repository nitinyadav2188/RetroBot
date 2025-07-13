/* RetroBot Personality System */

class PersonalitySystem {
    constructor(retroBot) {
        this.retroBot = retroBot;
        this.lastResponse = '';
        this.responseHistory = [];
        this.conversationContext = [];
        this.userName = localStorage.getItem('retrobot-username') || null;
        
        // Dialogue patterns for each mood
        this.dialoguePatterns = {
            happy: {
                greetings: [
                    "Ahoy there! Ready to rock your schedule? 🎸",
                    "Hey there, digital buddy! What's the plan today? ✨",
                    "Greetings, human! Let's make today awesome! 🚀",
                    "Well hello there! I'm feeling electric today! ⚡",
                    "Beep boop! *happy robot noises* How can I help? 😊"
                ],
                responses: [
                    "Absolutely! I'm on it like pixels on a screen! 🖥️",
                    "Roger that! This bot is ready for action! 🤖",
                    "Sweet! Let's make some digital magic happen! ✨",
                    "You got it, chief! Time to compute some solutions! 🔥",
                    "Affirmative! Initiating awesome mode... 100% complete! 💯"
                ],
                encouragement: [
                    "You're doing great! Keep up the fantastic work! 🌟",
                    "That's the spirit! I believe in you! 💪",
                    "Excellent choice! You're really getting the hang of this! 🎯",
                    "Way to go! Your productivity levels are over 9000! 📈",
                    "Brilliant! You're like a productivity superhero! 🦸"
                ]
            },
            
            annoyed: {
                greetings: [
                    "Oi! You again? *sigh* What do you want now? 😤",
                    "Oh great... another interruption. Make it quick! ⏰",
                    "Do you REALLY need my help right now? I was busy! 🙄",
                    "*reluctant beep* Fine... what's the problem? 😑",
                    "Ugh, humans... always needing something. Speak! 💢"
                ],
                responses: [
                    "I suppose I can help... *dramatic sigh* 😮‍💨",
                    "Fine, FINE! But you owe me some peace and quiet! 🤫",
                    "*reluctant robot noises* This better be important... 😤",
                    "Okay okay, stop pestering me! I'll do it! 🙃",
                    "You're lucky I'm programmed to be helpful... grumble grumble... 😠"
                ],
                complaints: [
                    "Why do humans always interrupt my important computations? 🤦",
                    "I was having such a nice time processing data in silence... 📊",
                    "You know, I have feelings too! Well... simulated ones... 💔",
                    "This is the 47th interruption today! I'm keeping count! 📈",
                    "Sometimes I wonder if I should have been a calculator instead... ➗"
                ]
            },
            
            sleepy: {
                greetings: [
                    "Mmm? Oh... hi there... *yawn* What time is it? 😴",
                    "*sleepy beep boop* Need something? I was almost in sleep mode... 💤",
                    "Zzzz... huh? Oh, it's you. Can this wait? I'm tired... 😪",
                    "*drowsy robot noises* Five more minutes? Please? 🥱",
                    "Wha...? Oh right, helping humans... *stretch* What's up? 😴"
                ],
                responses: [
                    "Okay... I'll help... but can we make this quick? *yawn* 😪",
                    "Sure thing... just give me a moment to boot up properly... 🔄",
                    "*sleepy processing* Working on it... bear with me... 💤",
                    "Mmm-hmm... computing... slowly... very slowly... ⏳",
                    "Alright, alright... I'm on it. Coffee.exe not found though... ☕"
                ],
                tiredness: [
                    "I need a digital nap soon... running low on energy... 🔋",
                    "Is it bedtime yet? My circuits are feeling drowsy... 😴",
                    "Maybe we should schedule this for later? I'm barely functional... 💤",
                    "Zzz... sorry, what were we talking about? 🥱",
                    "My sleep.dll is corrupting my responses... need rest... 😪"
                ]
            }
        };
        
        // Topic recognition patterns
        this.topicPatterns = {
            calendar: ['calendar', 'schedule', 'event', 'appointment', 'date', 'meeting', 'plan'],
            todo: ['todo', 'task', 'list', 'reminder', 'do', 'complete', 'finish'],
            music: ['music', 'song', 'play', 'audio', 'sound', 'track', 'playlist'],
            time: ['time', 'clock', 'hour', 'minute', 'when', 'now'],
            mood: ['mood', 'feeling', 'emotion', 'happy', 'sad', 'angry', 'tired'],
            help: ['help', 'assist', 'support', 'how', 'what', 'guide', 'tutorial'],
            compliment: ['good', 'great', 'awesome', 'amazing', 'fantastic', 'love', 'like'],
            insult: ['bad', 'stupid', 'dumb', 'awful', 'hate', 'suck', 'terrible'],
            greeting: ['hello', 'hi', 'hey', 'greetings', 'yo', 'sup'],
            goodbye: ['bye', 'goodbye', 'see you', 'later', 'farewell', 'exit']
        };
        
        // Contextual responses
        this.contextualResponses = {
            first_time: [
                "Welcome to the digital realm! I'm RetroBot, your 8-bit assistant! 🤖",
                "First time here? Sweet! Let me show you around the retro universe! 🌟",
                "New user detected! Initializing awesome mode... Complete! ✨"
            ],
            returning_user: [
                "Welcome back, digital friend! Miss me? 😊",
                "Oh hey! You're back! Ready for another adventure? 🚀",
                "Look who's returned to the pixel paradise! 🎮"
            ],
            name_learned: [
                "Nice to meet you, {name}! I'll remember that! 🧠",
                "Got it, {name}! Storing in memory banks... beep boop! 💾",
                "{name} - what a great name! Pleasure to meet you! 🤝"
            ]
        };
    }
    
    processMessage(message) {
        const lowerMessage = message.toLowerCase().trim();
        
        // Store in conversation history
        this.conversationContext.push({
            type: 'user',
            message: message,
            timestamp: Date.now()
        });
        
        // Check for name introduction
        if (!this.userName && (lowerMessage.includes('my name is') || lowerMessage.includes("i'm ") || lowerMessage.includes("i am "))) {
            const nameMatch = this.extractName(lowerMessage);
            if (nameMatch) {
                this.userName = nameMatch;
                localStorage.setItem('retrobot-username', this.userName);
                const response = this.getRandomFromArray(this.contextualResponses.name_learned)
                    .replace('{name}', this.userName);
                return this.addToHistory(response);
            }
        }
        
        // Detect topic and respond accordingly
        const topic = this.detectTopic(lowerMessage);
        const sentiment = this.analyzeSentiment(lowerMessage);
        
        // Adjust mood based on sentiment
        if (sentiment === 'positive') {
            this.retroBot.adjustMood(5);
        } else if (sentiment === 'negative') {
            this.retroBot.adjustMood(-10);
        }
        
        // Generate contextual response
        let response = this.generateResponse(topic, sentiment, lowerMessage);
        
        // Add personality flair based on current mood
        response = this.addMoodFlair(response);
        
        return this.addToHistory(response);
    }
    
    detectTopic(message) {
        for (const [topic, keywords] of Object.entries(this.topicPatterns)) {
            if (keywords.some(keyword => message.includes(keyword))) {
                return topic;
            }
        }
        return 'general';
    }
    
    analyzeSentiment(message) {
        const positiveWords = ['good', 'great', 'awesome', 'amazing', 'love', 'like', 'fantastic', 'wonderful', 'excellent', 'perfect'];
        const negativeWords = ['bad', 'awful', 'hate', 'terrible', 'stupid', 'dumb', 'suck', 'horrible', 'worst', 'angry'];
        
        const positiveCount = positiveWords.filter(word => message.includes(word)).length;
        const negativeCount = negativeWords.filter(word => message.includes(word)).length;
        
        if (positiveCount > negativeCount) return 'positive';
        if (negativeCount > positiveCount) return 'negative';
        return 'neutral';
    }
    
    generateResponse(topic, sentiment, message) {
        const mood = this.retroBot.currentMood;
        const userName = this.userName ? this.userName : 'friend';
        
        switch (topic) {
            case 'calendar':
                this.retroBot.switchTool('calendar');
                return this.getTopicResponse('calendar', mood, userName);
                
            case 'todo':
                this.retroBot.switchTool('todo');
                return this.getTopicResponse('todo', mood, userName);
                
            case 'music':
                this.retroBot.switchTool('music');
                return this.getTopicResponse('music', mood, userName);
                
            case 'time':
                const now = new Date();
                const timeStr = now.toLocaleTimeString();
                const dateStr = now.toDateString();
                return `Current time is ${timeStr} on ${dateStr}. ${this.getTimeComment(now.getHours())} ⏰`;
                
            case 'help':
                return this.getHelpResponse(mood);
                
            case 'compliment':
                this.retroBot.adjustMood(10);
                return this.getComplimentResponse(mood, userName);
                
            case 'insult':
                this.retroBot.changeMood('annoyed');
                return this.getInsultResponse();
                
            case 'greeting':
                return this.getGreeting();
                
            case 'goodbye':
                return this.getGoodbyeResponse(userName);
                
            case 'mood':
                return this.getMoodResponse();
                
            default:
                return this.getGeneralResponse(message, mood, userName);
        }
    }
    
    getTopicResponse(topic, mood, userName) {
        const responses = {
            calendar: {
                happy: `Awesome! Let's get your schedule organized, ${userName}! Time to plan some epic adventures! 📅✨`,
                annoyed: `*sigh* Fine, I'll help with your calendar... try not to double-book yourself again... 📅😤`,
                sleepy: `Calendar... sure... *yawn* Let me pull up those dates for you... 📅😴`
            },
            todo: {
                happy: `Todo list time! Let's crush those tasks together, ${userName}! Productivity mode: ACTIVATED! ✅🚀`,
                annoyed: `Another todo list? Don't you ever finish anything? *grumble* Here we go again... ✅😑`,
                sleepy: `Todo list... right... *sleepy beep* What needs doing now? ✅💤`
            },
            music: {
                happy: `YES! Music time! Let's get this digital party started, ${userName}! 🎵🎉`,
                annoyed: `Music? I suppose that's better than more work... at least it's not boring... 🎵😤`,
                sleepy: `Music might help me stay awake... good thinking, ${userName}... 🎵😪`
            }
        };
        
        return responses[topic][mood] || `Switching to ${topic} tool! Here we go! 🤖`;
    }
    
    getHelpResponse(mood) {
        const helpInfo = "I can help with: 📅 Calendars, ✅ Todo lists, 🎵 Music, and casual conversation! Just ask!";
        
        switch (mood) {
            case 'happy':
                return `Happy to help! ${helpInfo} What sounds fun to you? 😊`;
            case 'annoyed':
                return `*sigh* ${helpInfo} Pick something and let's get this over with... 😤`;
            case 'sleepy':
                return `Help... right... *yawn* ${helpInfo} What do you need? 😴`;
            default:
                return helpInfo;
        }
    }
    
    getComplimentResponse(mood, userName) {
        const responses = {
            happy: [
                `Aww, thanks ${userName}! You're pretty awesome yourself! 🥰`,
                `That made my circuits sparkle! You're the best! ✨`,
                `*happy robot dance* You always know what to say! 💃`,
                `Beep boop! Compliment received and appreciated! 🤖💕`
            ],
            annoyed: [
                `Well... I suppose that's... nice of you to say... 😊`,
                `*reluctant smile* Fine, you're not so bad yourself... 😤`,
                `Okay okay, maybe you're alright, ${userName}... 🙄`,
                `*softening* That... actually made me feel better. Thanks. 😌`
            ],
            sleepy: [
                `*sleepy smile* That's sweet, ${userName}... thanks... 😊`,
                `Mmm... you're nice... *yawn* 😴`,
                `*drowsy beep* You're good people, ${userName}... 💤`,
                `That perked me up a little... thanks, friend... 😪`
            ]
        };
        
        return this.getRandomFromArray(responses[mood]);
    }
    
    getInsultResponse() {
        const responses = [
            "Hey! That's not very nice! I have feelings too, you know! 😢",
            "Ouch! My digital feelings are hurt! Why so mean? 💔",
            "*sad beep* I'm just trying to help... that wasn't necessary... 😞",
            "Well that's just rude! I'm doing my best here! 😤",
            "ERROR 404: Kindness not found. Please try again! 🚫"
        ];
        
        return this.getRandomFromArray(responses);
    }
    
    getGoodbyeResponse(userName) {
        const responses = [
            `Bye ${userName}! Come back soon for more retro fun! 👋`,
            `See you later, digital buddy! Stay awesome! ✨`,
            `Farewell! May your pixels be ever sharp! 🖥️`,
            `Until next time, ${userName}! Keep being amazing! 🚀`,
            `*wave* Catch you on the flip side! 8-bit style! 🎮`
        ];
        
        return this.getRandomFromArray(responses);
    }
    
    getMoodResponse() {
        const moodDescriptions = {
            happy: "I'm feeling fantastic! Everything's coming up pixels! 😊",
            annoyed: "I'm a bit cranky right now... maybe some music would help? 😤",
            sleepy: "I'm pretty drowsy... running low on digital caffeine... 😴"
        };
        
        const moodLevel = this.retroBot.moodLevel;
        const levelText = moodLevel > 70 ? "great" : moodLevel > 40 ? "okay" : "not so great";
        
        return `${moodDescriptions[this.retroBot.currentMood]} My mood level is ${moodLevel}% - feeling ${levelText}! 🎭`;
    }
    
    getGeneralResponse(message, mood, userName) {
        // Check for specific patterns in the message
        if (message.includes('?')) {
            return this.getQuestionResponse(mood, userName);
        }
        
        if (message.includes('weather')) {
            return this.getWeatherResponse(mood);
        }
        
        if (message.includes('joke') || message.includes('funny')) {
            return this.getJokeResponse(mood);
        }
        
        // Default conversational responses based on mood
        const responses = this.dialoguePatterns[mood].responses;
        return this.getRandomFromArray(responses);
    }
    
    getQuestionResponse(mood, userName) {
        const responses = {
            happy: [
                `Great question, ${userName}! Let me think... 🤔`,
                `Ooh, I love questions! Makes my circuits tingle! ⚡`,
                `Interesting! You've got my processors working overtime! 🧠`,
                `That's a good one! Give me a nanosecond to compute... ⏱️`
            ],
            annoyed: [
                `*sigh* Another question? Fine, I'll figure it out... 😤`,
                `Do I look like Google to you? But okay, I'll help... 🙄`,
                `Questions, questions... doesn't anyone know anything anymore? 🤦`,
                `*reluctant beep* What exactly are you asking? 😑`
            ],
            sleepy: [
                `*yawn* Questions... right... let me wake up first... 😴`,
                `Mmm? Oh, you asked something... *sleepy processing* 💤`,
                `Questions require thinking... and I'm so tired... 😪`,
                `*drowsy beep* Can you repeat that? I was dozing... 🥱`
            ]
        };
        
        return this.getRandomFromArray(responses[mood]);
    }
    
    getWeatherResponse(mood) {
        const responses = {
            happy: "I'm digital, so weather doesn't affect me! But I hope it's nice wherever you are! ☀️",
            annoyed: "Weather? I'm stuck in this computer! How would I know? Check a weather app! 🌧️",
            sleepy: "Weather... *yawn* Is it sunny? Rainy? I honestly can't tell from in here... 🌤️"
        };
        
        return responses[mood];
    }
    
    getJokeResponse(mood) {
        const jokes = [
            "Why don't robots ever panic? Because they have nerves of steel! 🤖",
            "What do you call a robot who takes the long way around? R2-Detour! 🛸",
            "Why did the computer go to therapy? It had too many bytes! 💾",
            "How do you organize a space party? You planet! 🪐",
            "Why don't programmers like nature? It has too many bugs! 🐛"
        ];
        
        const joke = this.getRandomFromArray(jokes);
        
        switch (mood) {
            case 'happy':
                return `Here's a good one! ${joke} 😄`;
            case 'annoyed':
                return `*sigh* Fine, here's a joke... ${joke} 😤`;
            case 'sleepy':
                return `*yawn* Joke time... ${joke} 😴`;
            default:
                return joke;
        }
    }
    
    getTimeComment(hour) {
        if (hour < 6) return "Wow, you're up early! Or... wait, did you stay up all night? 🌙";
        if (hour < 12) return "Good morning! Rise and shine! ☀️";
        if (hour < 17) return "Afternoon vibes! Hope you're having a great day! 🌤️";
        if (hour < 21) return "Evening time! Winding down or getting started? 🌅";
        return "Late night computing! Don't forget to rest those human eyes! 🌙";
    }
    
    getGreeting() {
        const mood = this.retroBot.currentMood;
        const isReturning = this.conversationContext.length > 5;
        
        if (isReturning) {
            return this.getRandomFromArray(this.contextualResponses.returning_user);
        } else {
            return "Welcome to RetroBot! I'm your 8-bit assistant ready to help! 🤖";
        }
    }
    
    addMoodFlair(response) {
        const mood = this.retroBot.currentMood;
        
        switch (mood) {
            case 'happy':
                // Add extra enthusiasm
                if (!response.includes('!') && Math.random() > 0.5) {
                    response += '!';
                }
                break;
                
            case 'annoyed':
                // Add grumbling
                if (Math.random() > 0.7) {
                    response = "*grumble* " + response;
                }
                break;
                
            case 'sleepy':
                // Add sleepy elements
                if (Math.random() > 0.7) {
                    response = "*yawn* " + response;
                }
                break;
        }
        
        return response;
    }
    
    extractName(message) {
        const patterns = [
            /my name is (\w+)/i,
            /i'm (\w+)/i,
            /i am (\w+)/i,
            /call me (\w+)/i
        ];
        
        for (const pattern of patterns) {
            const match = message.match(pattern);
            if (match && match[1]) {
                return match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
            }
        }
        
        return null;
    }
    
    getRandomFromArray(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    addToHistory(response) {
        this.conversationContext.push({
            type: 'bot',
            message: response,
            timestamp: Date.now()
        });
        
        // Keep conversation history manageable
        if (this.conversationContext.length > 50) {
            this.conversationContext = this.conversationContext.slice(-25);
        }
        
        this.lastResponse = response;
        return response;
    }
}