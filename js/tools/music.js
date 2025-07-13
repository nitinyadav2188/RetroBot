/* RetroBot Music Tool */

class MusicTool {
    constructor(retroBot) {
        this.retroBot = retroBot;
        this.isPlaying = false;
        this.currentTrack = null;
        this.volume = 50;
        this.playlist = [];
        this.currentIndex = -1;
        
        // Mock audio context for demo
        this.audioContext = null;
        this.audio = null;
        
        // Initialize music system
        this.init();
        this.setupPlaylist();
    }
    
    init() {
        console.log('🎵 Music tool initialized');
        this.setupEventListeners();
        this.loadSettings();
    }
    
    setupEventListeners() {
        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                this.setVolume(e.target.value);
            });
        }
    }
    
    setupPlaylist() {
        // Mock playlist for demo
        this.playlist = [
            {
                id: 'retro1',
                title: 'Neon Dreams',
                artist: 'Synthwave Studios',
                duration: '3:24',
                url: null // Would be actual audio URL in real implementation
            },
            {
                id: 'retro2',
                title: 'Pixel Paradise',
                artist: 'Chiptune Masters',
                duration: '2:47',
                url: null
            },
            {
                id: 'retro3',
                title: 'Synthwave Sunset',
                artist: 'Retro Vibes',
                duration: '4:12',
                url: null
            },
            {
                id: 'retro4',
                title: '8-bit Adventure',
                artist: 'Game Audio Co.',
                duration: '3:55',
                url: null
            }
        ];
        
        this.updateTrackSelect();
    }
    
    updateTrackSelect() {
        const select = document.getElementById('track-select');
        if (!select) return;
        
        // Clear existing options (except first)
        const firstOption = select.firstElementChild;
        select.innerHTML = '';
        select.appendChild(firstOption);
        
        // Add playlist tracks
        this.playlist.forEach((track, index) => {
            const option = document.createElement('option');
            option.value = track.id;
            option.textContent = `${track.title} - ${track.artist}`;
            select.appendChild(option);
        });
    }
    
    selectTrack() {
        const select = document.getElementById('track-select');
        const trackId = select.value;
        
        if (!trackId) {
            this.currentTrack = null;
            this.currentIndex = -1;
            this.updateTrackInfo('No track selected', 'Select a track to play');
            return;
        }
        
        const track = this.playlist.find(t => t.id === trackId);
        if (track) {
            this.currentTrack = track;
            this.currentIndex = this.playlist.indexOf(track);
            this.updateTrackInfo(track.title, track.artist);
            
            this.retroBot.speak(`Selected "${track.title}" by ${track.artist}! Let's rock! 🎸`, 'happy');
            this.retroBot.playSound('beep');
        }
    }
    
    play() {
        if (!this.currentTrack) {
            this.retroBot.speak("Select a track first! I can't play silence... well, I could, but that's boring! 😅", 'annoyed');
            return;
        }
        
        if (this.isPlaying) {
            this.pause();
            return;
        }
        
        this.isPlaying = true;
        this.updatePlayButton();
        
        // Simulate audio playback
        this.simulatePlayback();
        
        this.retroBot.speak(`🎵 Now playing: "${this.currentTrack.title}"! Turn up the volume! 🔊`, 'happy');
        this.retroBot.playSound('beep');
        
        // Add playing animation
        const container = document.querySelector('.music-player');
        if (container) {
            container.classList.add('music-playing');
        }
    }
    
    pause() {
        this.isPlaying = false;
        this.updatePlayButton();
        
        // Stop simulation
        if (this.playbackTimer) {
            clearTimeout(this.playbackTimer);
        }
        
        this.retroBot.speak(`Paused! The beat stops for no one... except you! ⏸️`);
        
        // Remove playing animation
        const container = document.querySelector('.music-player');
        if (container) {
            container.classList.remove('music-playing');
        }
    }
    
    next() {
        if (this.playlist.length === 0) return;
        
        this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
        this.currentTrack = this.playlist[this.currentIndex];
        
        this.updateTrackInfo(this.currentTrack.title, this.currentTrack.artist);
        this.updateTrackSelect();
        
        const select = document.getElementById('track-select');
        if (select) {
            select.value = this.currentTrack.id;
        }
        
        if (this.isPlaying) {
            this.simulatePlayback();
        }
        
        this.retroBot.speak(`⏭️ Next track: "${this.currentTrack.title}"! The beat goes on! 🎵`);
        this.retroBot.playSound('beep');
    }
    
    prev() {
        if (this.playlist.length === 0) return;
        
        this.currentIndex = this.currentIndex <= 0 ? this.playlist.length - 1 : this.currentIndex - 1;
        this.currentTrack = this.playlist[this.currentIndex];
        
        this.updateTrackInfo(this.currentTrack.title, this.currentTrack.artist);
        this.updateTrackSelect();
        
        const select = document.getElementById('track-select');
        if (select) {
            select.value = this.currentTrack.id;
        }
        
        if (this.isPlaying) {
            this.simulatePlayback();
        }
        
        this.retroBot.speak(`⏮️ Previous track: "${this.currentTrack.title}"! Going retro! 📼`);
        this.retroBot.playSound('beep');
    }
    
    setVolume(value) {
        this.volume = parseInt(value);
        
        if (this.audio) {
            this.audio.volume = this.volume / 100;
        }
        
        // Volume feedback
        let volumeEmoji = '🔇';
        if (this.volume > 66) volumeEmoji = '🔊';
        else if (this.volume > 33) volumeEmoji = '🔉';
        else if (this.volume > 0) volumeEmoji = '🔈';
        
        // Update visual feedback occasionally
        if (Math.random() > 0.8) {
            this.retroBot.speak(`${volumeEmoji} Volume: ${this.volume}%`);
        }
        
        this.saveSettings();
    }
    
    updatePlayButton() {
        const button = document.getElementById('play-btn');
        if (button) {
            button.textContent = this.isPlaying ? '⏸' : '▶';
            button.title = this.isPlaying ? 'Pause' : 'Play';
        }
    }
    
    updateTrackInfo(title, artist) {
        const titleElement = document.getElementById('track-title');
        const artistElement = document.getElementById('track-artist');
        
        if (titleElement) titleElement.textContent = title;
        if (artistElement) artistElement.textContent = artist;
    }
    
    simulatePlayback() {
        if (!this.currentTrack || !this.isPlaying) return;
        
        // Clear existing timer
        if (this.playbackTimer) {
            clearTimeout(this.playbackTimer);
        }
        
        // Simulate track duration (shorter for demo)
        const duration = 10000; // 10 seconds for demo
        
        this.playbackTimer = setTimeout(() => {
            if (this.isPlaying) {
                this.retroBot.speak(`🎵 "${this.currentTrack.title}" finished! That was a banger! 🎤`);
                this.next(); // Auto-play next track
            }
        }, duration);
    }
    
    // Visualization effects
    createVisualizer() {
        const container = document.querySelector('.music-player');
        if (!container || container.querySelector('.visualizer')) return;
        
        const visualizer = document.createElement('div');
        visualizer.className = 'visualizer';
        visualizer.style.cssText = `
            display: flex;
            justify-content: center;
            align-items: end;
            height: 20px;
            margin: 8px 0;
            gap: 2px;
        `;
        
        // Create bars
        for (let i = 0; i < 12; i++) {
            const bar = document.createElement('div');
            bar.style.cssText = `
                width: 3px;
                background: var(--primary-green);
                height: ${2 + Math.random() * 16}px;
                animation: visualizer-bar ${0.5 + Math.random() * 0.5}s ease-in-out infinite alternate;
                animation-delay: ${i * 0.1}s;
            `;
            visualizer.appendChild(bar);
        }
        
        container.insertBefore(visualizer, container.querySelector('.player-controls'));
        
        // Add visualizer animation CSS
        if (!document.querySelector('#visualizer-style')) {
            const style = document.createElement('style');
            style.id = 'visualizer-style';
            style.textContent = `
                @keyframes visualizer-bar {
                    0% { height: 2px; opacity: 0.5; }
                    100% { height: 18px; opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    removeVisualizer() {
        const visualizer = document.querySelector('.visualizer');
        if (visualizer) {
            visualizer.remove();
        }
    }
    
    // Playlist management
    addToPlaylist(track) {
        this.playlist.push({
            id: 'custom_' + Date.now(),
            title: track.title || 'Unknown Track',
            artist: track.artist || 'Unknown Artist',
            duration: track.duration || '0:00',
            url: track.url
        });
        
        this.updateTrackSelect();
        this.retroBot.speak(`Added "${track.title}" to playlist! Collection growing! 📀`);
    }
    
    removeFromPlaylist(trackId) {
        const index = this.playlist.findIndex(t => t.id === trackId);
        if (index !== -1) {
            const track = this.playlist[index];
            this.playlist.splice(index, 1);
            
            // Update current index if needed
            if (this.currentIndex >= index) {
                this.currentIndex = Math.max(0, this.currentIndex - 1);
            }
            
            this.updateTrackSelect();
            this.retroBot.speak(`Removed "${track.title}" from playlist! 🗑️`);
        }
    }
    
    shufflePlaylist() {
        for (let i = this.playlist.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.playlist[i], this.playlist[j]] = [this.playlist[j], this.playlist[i]];
        }
        
        this.updateTrackSelect();
        this.retroBot.speak("Playlist shuffled! Time for some musical surprises! 🎲🎵", 'happy');
    }
    
    // Settings persistence
    saveSettings() {
        try {
            const settings = {
                volume: this.volume,
                currentTrackId: this.currentTrack ? this.currentTrack.id : null,
                playlist: this.playlist
            };
            localStorage.setItem('retrobot-music-settings', JSON.stringify(settings));
        } catch (e) {
            console.log('Failed to save music settings:', e);
        }
    }
    
    loadSettings() {
        try {
            const saved = localStorage.getItem('retrobot-music-settings');
            if (saved) {
                const settings = JSON.parse(saved);
                
                this.volume = settings.volume || 50;
                
                // Update volume slider
                const volumeSlider = document.getElementById('volume-slider');
                if (volumeSlider) {
                    volumeSlider.value = this.volume;
                }
                
                // Restore playlist if saved
                if (settings.playlist && settings.playlist.length > 0) {
                    this.playlist = settings.playlist;
                    this.updateTrackSelect();
                }
                
                // Restore current track
                if (settings.currentTrackId) {
                    const track = this.playlist.find(t => t.id === settings.currentTrackId);
                    if (track) {
                        this.currentTrack = track;
                        this.currentIndex = this.playlist.indexOf(track);
                        this.updateTrackInfo(track.title, track.artist);
                        
                        const select = document.getElementById('track-select');
                        if (select) {
                            select.value = track.id;
                        }
                    }
                }
            }
        } catch (e) {
            console.log('Failed to load music settings:', e);
        }
    }
    
    // Music mood integration
    getMoodBasedRecommendation() {
        const moodPlaylists = {
            happy: ['Neon Dreams', 'Pixel Paradise'],
            annoyed: ['8-bit Adventure'],
            sleepy: ['Synthwave Sunset']
        };
        
        const currentMood = this.retroBot.currentMood;
        const recommendations = moodPlaylists[currentMood] || moodPlaylists.happy;
        const recommendation = recommendations[Math.floor(Math.random() * recommendations.length)];
        
        this.retroBot.speak(`Feeling ${currentMood}? Try "${recommendation}"! Perfect vibes! 🎵✨`);
        
        // Auto-select if available
        const track = this.playlist.find(t => t.title === recommendation);
        if (track) {
            this.currentTrack = track;
            this.currentIndex = this.playlist.indexOf(track);
            this.updateTrackInfo(track.title, track.artist);
            
            const select = document.getElementById('track-select');
            if (select) {
                select.value = track.id;
            }
        }
    }
    
    // Export/Import functionality
    exportPlaylist() {
        const exportData = {
            version: '1.0',
            name: 'RetroBot Playlist',
            exportDate: new Date().toISOString(),
            tracks: this.playlist
        };
        
        return JSON.stringify(exportData, null, 2);
    }
    
    importPlaylist(data) {
        try {
            const importData = JSON.parse(data);
            if (importData.tracks && Array.isArray(importData.tracks)) {
                this.playlist = [...this.playlist, ...importData.tracks];
                this.updateTrackSelect();
                
                this.retroBot.speak(`Imported playlist with ${importData.tracks.length} tracks! Music library expanded! 🎵📚`, 'happy');
                return true;
            }
        } catch (e) {
            this.retroBot.speak("Import failed! That doesn't look like a valid playlist! 😵", 'annoyed');
        }
        return false;
    }
    
    // Cleanup
    cleanup() {
        if (this.playbackTimer) {
            clearTimeout(this.playbackTimer);
        }
        
        if (this.audio) {
            this.audio.pause();
            this.audio = null;
        }
        
        this.removeVisualizer();
    }
}