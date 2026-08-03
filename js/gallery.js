import { randomRange, randomInt, BASE_ASSETS_URL } from './utils.js';

export const UNIVERSES = [
    { id: 'misto', title: 'С ДНЁМ РОЖДЕНИЯЯЯЯ!!', chapter: '', video: 'backgrounds/misto.mp4', bgColor: '#121218', volume: 0.03, darkness: 0.0 },
    { id: 'stranger-things', title: '', chapter: 'Stranger Things', video: 'backgrounds/stranger-things.mp4', bgColor: '#0f0507', volume: 0.12, darkness: 0.0 },
    { id: 'spider-man', title: '', chapter: 'Spider-Man', video: 'backgrounds/spider-man.mp4', bgColor: '#050c1e', volume: 0.1, darkness: 0.0 },
    { id: 'apothecary-diaries', title: '', chapter: 'The Apothecary Diaries', video: 'backgrounds/apothecary-diaries.mp4', bgColor: '#061a14', volume: 0.07, darkness: 0.0 },
    { id: 'four-seasons', title: '', chapter: 'The Four Seasons', video: 'backgrounds/four-seasons.mp4', bgColor: '#1a1205', volume: 0.03, darkness: 0.0 },
    { id: 'ride-your-wave', title: '', chapter: 'Ride Your Wave', video: 'backgrounds/ride-your-wave.mp4', bgColor: '#051c24', volume: 0.12, darkness: 0.2 },
    { id: 'witch-hat-atelier', title: '', chapter: 'Witch Hat Atelier', video: 'backgrounds/witch-hat-atelier.mp4', bgColor: '#150d20', volume: 0.06, darkness: 0.0 },
    { id: 'alien-stage', title: '', chapter: '', video: 'backgrounds/alien-stage.mp4', bgColor: '#1f0518', volume: 0.07, darkness: 0.0 },
    { id: 'backrooms', title: '', chapter: 'The Backrooms', video: 'backgrounds/backrooms.mp4', bgColor: '#181608', volume: 0.06, darkness: 0.0 },
    { id: 'newtopia', title: '', chapter: 'Newtopia', video: 'backgrounds/newtopia.mp4', bgColor: '#051a1e', volume: 0.07, darkness: 0.0 },
    { id: 'stomi', title: '', chapter: '', video: 'backgrounds/stomi.mp4', bgColor: '#180b1e', volume: 0.03, darkness: 0.2 },
    { id: 'theme-12', title: '', chapter: '', video: 'backgrounds/newtopia.mp4', bgColor: '#181005', volume: 0.07, darkness: 0.0 },
    { id: 'theme-13', title: '', chapter: '', video: 'backgrounds/ride-your-wave.mp4', bgColor: '#051810', volume: 0.12, darkness: 0.2 },
    { id: 'theme-14', title: '', chapter: '', video: 'backgrounds/stranger-things.mp4', bgColor: '#081218', volume: 0.12, darkness: 0.0 }
];

export function buildGallery(trackContainer, photoBuckets, modalManager) {
    const videoElements = [];

    UNIVERSES.forEach((uni, idx) => {
        const universePhotos = photoBuckets[idx] || [];

        const section = document.createElement('section');
        section.className = `universe-section theme-${uni.id}`;
        section.id = `universe-${uni.id}`;

        const bgLayer = document.createElement('div');
        bgLayer.className = 'layer-bg';
        bgLayer.style.backgroundColor = uni.bgColor;

        const video = document.createElement('video');
        video.className = 'bg-video';
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.preload = 'none';
        
        video.dataset.volume = uni.volume !== undefined ? uni.volume : 0.32;
        
        const source = document.createElement('source');
        source.src = `${BASE_ASSETS_URL}/${uni.video}`;
        source.type = 'video/mp4';
        video.appendChild(source);

        const markLoaded = () => video.classList.add('loaded');
        video.addEventListener('canplay', markLoaded, { once: true });
        video.addEventListener('playing', markLoaded, { once: true });

        const darkMask = document.createElement('div');
        darkMask.className = 'video-dark-mask';
        darkMask.style.position = 'absolute';
        darkMask.style.inset = '0';
        darkMask.style.backgroundColor = '#000';
        darkMask.style.opacity = uni.darkness !== undefined ? uni.darkness : 0.0;
        darkMask.style.pointerEvents = 'none';
        darkMask.style.zIndex = '2';

        bgLayer.appendChild(video);
        bgLayer.appendChild(darkMask);
        videoElements.push(video);

        const photosLayer = document.createElement('div');
        photosLayer.className = 'layer-photos';

        // Сбалансированная ширина 2000px
        const sectionWidth = 2000;
        const padding = 150;
        const availableWidth = sectionWidth - padding * 2;
        const stepX = availableWidth / (universePhotos.length || 1);

        universePhotos.forEach((photo, pIdx) => {
            const card = document.createElement('div');
            card.className = 'photo-card';

            const posX = padding + pIdx * stepX + randomRange(-15, 15);

            // Скорректированный центр высоты (~20% от верха), чтобы крупные фото влезали идеально
            const baseCenterY = 20;
            const posY = baseCenterY + randomRange(-8, 8);

            const rotation = randomRange(-8, 8);
            const zIndex = randomInt(5, 30);

            card.style.left = `${posX}px`;
            card.style.top = `${posY}%`;
            card.style.transform = `rotate(${rotation}deg)`;
            card.style.zIndex = zIndex;

            card.innerHTML = `
                <div class="photo-inner">
                    <img src="${photo.src}" class="photo-img" alt="${photo.caption}" loading="lazy" decoding="async" onerror="this.src='${photo.fallback}'">
                </div>
            `;

            card.addEventListener('click', () => {
                modalManager.openPhotoModal(photo.src, photo.caption);
            });

            photosLayer.appendChild(card);
        });

        section.appendChild(bgLayer);
        section.appendChild(photosLayer);
        
        const overlay = document.createElement('div');
        overlay.className = 'universe-overlay';
        section.appendChild(overlay);

        trackContainer.appendChild(section);
    });

    return videoElements;
}