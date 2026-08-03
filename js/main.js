import { getPhotoCollection, distributePhotosToWorlds } from './photos.js';
import { UNIVERSES, buildGallery } from './gallery.js';
import { ParallaxEngine } from './parallax.js';
import { VideoManager } from './videoManager.js';
import { ModalManager } from './modal.js';

document.addEventListener('DOMContentLoaded', () => {
    const trackContainer = document.getElementById('world-track');
    const viewportContainer = document.getElementById('cinematic-viewport');
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

    // Создаем ParallaxEngine (автоскролл временно заблокирован)
    engine = new ParallaxEngine(viewportContainer, trackContainer, onWorldChange, onJourneyEnd);
    engine.updateMaxScroll();

    // =============================================================
    // УМНОЕ ОЖИДАНИЕ ЗАГРУЗКИ ПЕРВОГО ЧАПТЕРА
    // =============================================================
    if (videoElements.length > 0) {
        const firstVideo = videoElements[0];
        firstVideo.preload = 'auto'; // Принудительно запрашиваем 1-е видео с сервера

        let isStarted = false;
        const startJourneyWhenReady = () => {
            if (!isStarted) {
                isStarted = true;
                onWorldChange(0);
                engine.startInitialAutoScroll();
            }
        };

        // Если видео уже успело закешироваться и готово
        if (firstVideo.readyState >= 3) {
            startJourneyWhenReady();
        } else {
            firstVideo.addEventListener('canplay', startJourneyWhenReady, { once: true });
            firstVideo.addEventListener('playing', startJourneyWhenReady, { once: true });

            // Защитный таймаут: запускаем максимум через 3 секунды в любом случае
            setTimeout(startJourneyWhenReady, 3000);
        }
    } else {
        engine.startInitialAutoScroll();
    }

    // Кнопка "Посмотреть еще раз"
    restartBtn.addEventListener('click', () => {
        endOverlay.classList.add('hidden');
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