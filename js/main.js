import { getPhotoCollection, distributePhotosToWorlds } from './photos.js';
import { UNIVERSES, buildGallery } from './gallery.js';
import { ParallaxEngine } from './parallax.js';
import { VideoManager } from './videoManager.js';
import { ModalManager } from './modal.js';

document.addEventListener('DOMContentLoaded', () => {
    const trackContainer = document.getElementById('world-track');
    const viewportContainer = document.getElementById('cinematic-viewport');
    const startOverlay = document.getElementById('start-screen-overlay');
    const startBtn = document.getElementById('start-journey-btn');
    const endOverlay = document.getElementById('end-screen-overlay');
    const restartBtn = document.getElementById('restart-btn');
    
    const videoManager = new VideoManager();
    let engine;

    const modalManager = new ModalManager(
        () => { if (engine) engine.openModalPause(); },
        () => { if (engine) engine.closeModalResume(); }
    );

    const allPhotos = getPhotoCollection();
    const photoBuckets = distributePhotosToWorlds(allPhotos, UNIVERSES.length);

    const videoElements = buildGallery(trackContainer, photoBuckets, modalManager);
    videoManager.registerVideos(videoElements);

    const titleOverlay = document.getElementById('world-title-overlay');
    const titleText = document.getElementById('world-title-text');
    const subtitleText = document.getElementById('world-subtitle-text');
    let titleTimeout = null;

    const onWorldChange = (universeIndex) => {
        const universe = UNIVERSES[universeIndex];
        if (!universe) return;

        videoManager.setActiveUniverse(universeIndex);

        titleText.innerText = universe.title;
        subtitleText.innerText = universe.chapter;

        titleOverlay.classList.remove('active');
        void titleOverlay.offsetWidth;
        titleOverlay.classList.add('active');

        if (titleTimeout) clearTimeout(titleTimeout);
        titleTimeout = setTimeout(() => {
            titleOverlay.classList.remove('active');
        }, 1200);
    };

    const onJourneyEnd = () => {
        videoManager.stopAllVideos();
        endOverlay.classList.remove('hidden');
    };

    engine = new ParallaxEngine(viewportContainer, trackContainer, onWorldChange, onJourneyEnd);
    engine.updateMaxScroll();

    // =============================================================
    // КНОПКА "НАЧАТЬ ПУТЕШЕСТВИЕ" — МГНОВЕННЫЙ ЗАПУСК С КЛИКА
    // =============================================================
    startBtn.addEventListener('click', () => {
        // 1. Скрываем стартовое окно
        startOverlay.classList.add('hidden');

        // 2. Разблокируем аудио и видео в контексте прямого клика
        videoManager.unlockAndStart();

        // 3. Запускаем первый мир и его заставку
        onWorldChange(0);

        // 4. Включаем автоскролл
        engine.startInitialAutoScroll();
    });

    // Кнопка "Посмотреть еще раз"
    restartBtn.addEventListener('click', () => {
        endOverlay.classList.add('hidden');
        videoManager.unlockAndStart();
        engine.restartJourney();
        onWorldChange(0);
    });

    initGrainCanvas();

    function animate() {
        engine.render();
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
});

function initGrainCanvas() {
    const canvas = document.getElementById('grain-canvas');
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth / 2;
        canvas.height = window.innerHeight / 2;
    }
    resize();
    window.addEventListener('resize', resize);

    function generateNoise() {
        const w = canvas.width;
        const h = canvas.height;
        const imgData = ctx.createImageData(w, h);
        const buffer32 = new Uint32Array(imgData.data.buffer);

        for (let i = 0; i < buffer32.length; i++) {
            if (Math.random() < 0.12) {
                buffer32[i] = 0xffffffff;
            }
        }
        ctx.putImageData(imgData, 0, 0);
        setTimeout(() => requestAnimationFrame(generateNoise), 90);
    }
    generateNoise();
}