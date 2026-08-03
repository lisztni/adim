import { shuffleArray, createPlaceholderPhoto, BASE_ASSETS_URL } from './utils.js';

export function getPhotoCollection() {
    const photos = [];
    const deletedNumbers = [23, 24, 25, 26];

    // 1. Первый сет: 1.jpg - 73.jpg c сервера
    for (let i = 1; i <= 73; i++) {
        if (deletedNumbers.includes(i)) continue;

        photos.push({
            id: `num-${i}`,
            src: `${BASE_ASSETS_URL}/photos/${i}.jpg`,
            fallback: createPlaceholderPhoto(i, `Memory #${i}`),
            caption: `Воспоминание #${i}`
        });
    }

    // 2. Второй сет: photo1.jpg - photo15.jpg c сервера
    for (let i = 1; i <= 15; i++) {
        photos.push({
            id: `photo-${i}`,
            src: `${BASE_ASSETS_URL}/photos/photo${i}.jpg`,
            fallback: createPlaceholderPhoto(i + 100, `Special Moment #${i}`),
            caption: `Special Moment #${i}`
        });
    }

    return shuffleArray(photos);
}

export function distributePhotosToWorlds(photos, universeCount) {
    const buckets = Array.from({ length: universeCount }, () => []);
    photos.forEach((photo, index) => {
        const bucketIndex = index % universeCount;
        buckets[bucketIndex].push(photo);
    });
    return buckets;
}