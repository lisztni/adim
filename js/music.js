/**
 * Music & Sound Effects Manager
 * Handles audio crossfading between universes and supports synthesized ambient fallbacks.
 */

export class MusicManager {
    constructor() {
        this.isPlaying = false;
        this.isMuted = false;
        this.currentUniverseId = null;
        this.audioContext = null;
        this.activeSynthGain = null;
        
        // Tracks registry
        this.tracks = {};
        this.currentAudio = null;
        
        this.initAudioHUD();
    }

    initAudioHUD() {
        const toggleBtn = document.getElementById('audio-toggle-btn');
        const eq = document.getElementById('sound-equalizer');
        const statusText = document.getElementById('audio-status-text');

        toggleBtn.addEventListener('click', () => {
            if (!this.audioContext) {
                this.initAudioContext();
            }

            this.isPlaying = !this.isPlaying;
            if (this.isPlaying) {
                eq.classList.remove('paused');
                statusText.innerText = "AUDIO ON";
                this.playUniverseSoundtrack(this.currentUniverseId || 'stranger-things');
            } else {
                eq.classList.add('paused');
                statusText.innerText = "AUDIO OFF";
                this.stopAll();
            }
        });
    }

    initAudioContext() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
    }

    switchUniverseTrack(universeId) {
        if (this.currentUniverseId === universeId) return;
        this.currentUniverseId = universeId;

        if (this.isPlaying) {
            this.playUniverseSoundtrack(universeId);
        }
    }

    playUniverseSoundtrack(universeId) {
        // Crossfade synth background tone (Web Audio API fallback)
        if (!this.audioContext) this.initAudioContext();
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        this.playSynthesizedAmbient(universeId);
    }

    /**
     * Web Audio Synth Fallback for Cinematic Atmosphere
     */
    playSynthesizedAmbient(universeId) {
        if (!this.audioContext) return;

        const now = this.audioContext.currentTime;

        // Fade out previous synth
        if (this.activeSynthGain) {
            this.activeSynthGain.gain.setValueAtTime(this.activeSynthGain.gain.value, now);
            this.activeSynthGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
        }

        // Frequency mapping per universe
        const freqs = {
            'stranger-things': 110.00, // A2 (Retro synth synthwave tone)
            'spider-man': 146.83,      // D3 (Heroic ambient)
            'apothecary-diaries': 164.81,// E3 (Oriental warm synth)
            'gravity-falls': 130.81,   // C3 (Mysterious melody pad)
            'harry-potter': 174.61,    // F3 (Magical soft drone)
            'arcane': 98.00,           // G2 (Hextech bass synth)
            'coraline': 123.47          // B2 (Eerie ambient pad)
        };

        const targetFreq = freqs[universeId] || 110.00;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(targetFreq, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.15, now + 1.5);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start(now);
        this.activeSynthGain = gain;
    }

    playCollectChime() {
        if (!this.audioContext) return;
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.3); // C6

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start(now);
        osc.stop(now + 0.4);
    }

    stopAll() {
        if (this.activeSynthGain && this.audioContext) {
            this.activeSynthGain.gain.setValueAtTime(this.activeSynthGain.gain.value, this.audioContext.currentTime);
            this.activeSynthGain.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + 0.5);
        }
    }
}