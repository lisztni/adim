/**
 * Optimized Video & Audio Manager with Smart Background Preloading
 */
export class VideoManager {
    constructor() {
        this.isAudioEnabled = true;
        this.activeUniverseIndex = -1;
        this.videoElements = [];

        this.initUserGestureUnlock();
    }

    registerVideos(videos) {
        this.videoElements = videos;
        this.videoElements.forEach(video => {
            video.pause();
            try {
                video.currentTime = 0;
            } catch (e) {}
        });
    }

    initUserGestureUnlock() {
        const unlock = () => {
            if (this.videoElements.length > 0 && this.activeUniverseIndex >= 0) {
                const currentVideo = this.videoElements[this.activeUniverseIndex];
                if (currentVideo) {
                    currentVideo.play().then(() => {
                        this.updateAudioStates();
                    }).catch(() => {
                        this.updateAudioStates();
                    });
                }
            }
        };

        window.addEventListener('pointerdown', unlock, { once: true });
        window.addEventListener('click', unlock, { once: true });
        window.addEventListener('wheel', unlock, { once: true });
        window.addEventListener('keydown', unlock, { once: true });
    }

    /**
     * Вызывается при переходе в мир
     */
    setActiveUniverse(activeIndex) {
        if (this.activeUniverseIndex === activeIndex) return;
        this.activeUniverseIndex = activeIndex;

        this.videoElements.forEach((video, idx) => {
            if (idx === activeIndex) {
                // 1. Активное видео — запускаем с 0:00
                video.preload = 'auto';
                try {
                    video.currentTime = 0;
                } catch (e) {}

                video.play().then(() => {
                    this.updateAudioStates();
                }).catch(() => {
                    this.updateAudioStates();
                });

            } else if (idx === activeIndex + 1) {
                // 2. УМНАЯ ПРЕДЗАГРУЗКА: Готовим видео СЛЕДУЮЩЕГО мира в фоне без лагов!
                video.preload = 'auto';
                if (!video.paused) video.pause();

            } else {
                // 3. Далекие миры — ставим на паузу и не расходуем сеть/память
                video.preload = 'none';
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
                video.muted = false;
                this.fadeVideoVolume(video, targetMaxVolume);
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