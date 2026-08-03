import { lerp, clamp } from './utils.js';

export class ParallaxEngine {
    constructor(container, track, onWorldChangeCallback, onJourneyEndCallback) {
        this.container = container;
        this.track = track;
        this.onWorldChange = onWorldChangeCallback;
        this.onJourneyEnd = onJourneyEndCallback;

        this.currentX = 0;
        this.targetX = 0;
        this.maxScrollX = 0;
        
        this.isDragging = false;
        this.startX = 0;
        this.dragStartX = 0;

        // Синхронизировано с шириной секции 2000px
        this.universeWidth = 2000;
        this.currentUniverseIndex = -1;

        this.isAutoScrolling = false;
        this.isInitialReady = false;
        this.isPausedByModal = false;
        this.isJourneyEnded = false;
        this.autoScrollSpeed = 2.3;
        this.resumeTimeout = null;
        this.resumeDelay = 2500;

        this.initEvents();
    }

    updateMaxScroll() {
        const totalWidth = this.track.scrollWidth;
        this.maxScrollX = Math.max(0, totalWidth - window.innerWidth);
    }

    startInitialAutoScroll() {
        this.isInitialReady = true;
        this.isAutoScrolling = true;
    }

    pauseAutoScroll() {
        this.isAutoScrolling = false;
        if (this.resumeTimeout) {
            clearTimeout(this.resumeTimeout);
        }
    }

    scheduleResumeAutoScroll() {
        if (this.isPausedByModal || this.isJourneyEnded || !this.isInitialReady) return;

        if (this.resumeTimeout) {
            clearTimeout(this.resumeTimeout);
        }
        this.resumeTimeout = setTimeout(() => {
            if (!this.isPausedByModal && !this.isJourneyEnded && this.isInitialReady) {
                this.isAutoScrolling = true;
            }
        }, this.resumeDelay);
    }

    openModalPause() {
        this.isPausedByModal = true;
        this.pauseAutoScroll();
    }

    closeModalResume() {
        this.isPausedByModal = false;
        if (this.resumeTimeout) {
            clearTimeout(this.resumeTimeout);
        }
        if (!this.isJourneyEnded && this.isInitialReady) {
            this.isAutoScrolling = true;
        }
    }

    restartJourney() {
        this.targetX = 0;
        this.currentX = 0;
        this.isJourneyEnded = false;
        this.isAutoScrolling = true;
    }

    initEvents() {
        window.addEventListener('resize', () => this.updateMaxScroll());

        window.addEventListener('wheel', (e) => {
            if (this.isJourneyEnded || !this.isInitialReady) return;
            this.pauseAutoScroll();

            const delta = e.deltaY !== 0 ? e.deltaY : e.deltaX;
            this.targetX += delta * 1.2;
            this.targetX = clamp(this.targetX, 0, this.maxScrollX);

            this.scheduleResumeAutoScroll();
        }, { passive: true });

        this.container.addEventListener('pointerdown', (e) => {
            if (this.isJourneyEnded || !this.isInitialReady) return;
            this.pauseAutoScroll();
            this.isDragging = true;
            this.startX = e.clientX;
            this.dragStartX = this.targetX;
        });

        window.addEventListener('pointermove', (e) => {
            if (!this.isDragging || this.isJourneyEnded || !this.isInitialReady) return;
            this.pauseAutoScroll();
            const diff = this.startX - e.clientX;
            this.targetX = clamp(this.dragStartX + diff * 1.5, 0, this.maxScrollX);
        });

        const stopDrag = () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.scheduleResumeAutoScroll();
            }
        };

        window.addEventListener('pointerup', stopDrag);
        window.addEventListener('pointercancel', stopDrag);
    }

    render() {
        if (this.isAutoScrolling && !this.isPausedByModal && !this.isJourneyEnded && this.isInitialReady) {
            this.targetX += this.autoScrollSpeed;

            if (this.targetX >= this.maxScrollX) {
                this.targetX = this.maxScrollX;
                this.isAutoScrolling = false;
                this.isJourneyEnded = true;

                if (this.onJourneyEnd) {
                    this.onJourneyEnd();
                }
            }
        }

        this.currentX = lerp(this.currentX, this.targetX, 0.08);
        this.track.style.transform = `translate3d(${-this.currentX}px, 0, 0)`;

        const sections = document.querySelectorAll('.universe-section');
        sections.forEach((section) => {
            const bg = section.querySelector('.layer-bg');
            const photos = section.querySelector('.layer-photos');

            const sectionLeft = section.offsetLeft;
            const relativeX = this.currentX - sectionLeft;

            if (bg) bg.style.transform = `translate3d(${relativeX * 0.25}px, 0, 0)`;
            if (photos) photos.style.transform = `translate3d(${relativeX * 0.03}px, 0, 0)`;
        });

        const activeIdx = Math.floor((this.currentX + window.innerWidth / 2) / this.universeWidth);
        if (activeIdx !== this.currentUniverseIndex && activeIdx >= 0) {
            this.currentUniverseIndex = activeIdx;
            if (this.onWorldChange) {
                this.onWorldChange(activeIdx);
            }
        }
    }
}