/**
 * Optimized Video & Audio Manager with Explicit Start Button Unlocking
 */
export class VideoManager {
    constructor() {
        this.isAudioEnabled = true;
        this.hasUserInteracted = false;
        this.activeUniverseIndex = -1;
        this.videoElements = [];
    }

    registerVideos(videos) {
        this.videoElements = videos;
        this.videoElements.forEach(video => {
            video.muted = true;
            video.pause();
            try {
                video.currentTime = 0;
            } catch (e) {}
        });
    }

    /**
     * Вызывается при нажатии на кнопку "НАЧАТЬ ПУТЕШЕСТВИЕ"
     */
    unlockAndStart() {
        this.hasUserInteracted = true;
        this.updateAudioStates();
    }

    setActiveUniverse(activeIndex) {
        if (this.activeUniverseIndex === activeIndex) return;
        this.activeUniverseIndex = activeIndex;

        this.videoElements.forEach((video, idx) => {
            if (idx === activeIndex) {
                try {
                    video.currentTime = 0;
                } catch (e) {}

                video.muted = !this.hasUserInteracted;

                video.play().then(() => {
                    this.updateAudioStates();
                }).catch(() => {
                    video.muted = true;
                    video.play().catch(() => {});
                    this.updateAudioStates();
                });

            } else {
                if (!video.paused) {
                    video.pause();
                }
                try {
                    video.currentTime = 0;
                } catch (e) {}
            }
        });

        this.updateAudioStates();
    }

    stopAllVideos() {
        this.activeUniverseIndex = -1;
        this.videoElements.forEach(video => {
            video.pause();
            video.muted = true;
            try {
                video.currentTime = 0;
            } catch (e) {}
        });
    }

    updateAudioStates() {
        this.videoElements.forEach((video, idx) => {
            const targetMaxVolume = parseFloat(video.dataset.volume || '0.32');

            if (idx === this.activeUniverseIndex) {
                if (this.hasUserInteracted && this.isAudioEnabled) {
                    video.muted = false;
                    this.fadeVideoVolume(video, targetMaxVolume);
                } else {
                    video.muted = true;
                    video.volume = 0;
                }
            } else {
                this.fadeVideoVolume(video, 0, () => {
                    video.muted = true;
                });
            }
        });
    }

    fadeVideoVolume(video, targetVolume, onComplete) {
        if (video.volumeInterval) clearInterval(video.volumeInterval);

        video.volumeInterval = setInterval(() => {
            const step = 0.08;
            if (Math.abs(video.volume - targetVolume) <= step) {
                video.volume = targetVolume;
                clearInterval(video.volumeInterval);
                if (onComplete) onComplete();
            } else if (video.volume < targetVolume) {
                video.volume = Math.min(targetVolume, video.volume + step);
            } else {
                video.volume = Math.max(0, video.volume - step);
            }
        }, 40);
    }
}