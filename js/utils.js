/**
 * Utility functions and remote server config.
 */

export const BASE_ASSETS_URL = 'https://aspazmaster.com/uploads/adimi';

export function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}

export function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

export function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function createPlaceholderPhoto(id, title) {
    const colors = ['#1a1c29', '#2d1b2e', '#1b2d29', '#2d271b', '#1b242d'];
    const bg = colors[id % colors.length];
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
        <rect width="100%" height="100%" fill="${bg}"/>
        <circle cx="200" cy="180" r="70" fill="none" stroke="#f3ce72" stroke-width="3" opacity="0.4"/>
        <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="#f3ce72" font-family="serif" font-size="24">MEMORY #${id}</text>
        <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="14" opacity="0.7">${title}</text>
    </svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function createFrameOverlaySVG(frameIndex) {
    const borders = ['#f3ce72', '#a855f7', '#3b82f6', '#10b981', '#ef4444', '#eab308'];
    const color = borders[frameIndex % borders.length];
    
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
        <rect x="2" y="2" width="96" height="96" fill="none" stroke="${color}" stroke-width="2" opacity="0.6"/>
        <circle cx="5" cy="5" r="3" fill="${color}"/>
        <circle cx="95" cy="5" r="3" fill="${color}"/>
        <circle cx="5" cy="95" r="3" fill="${color}"/>
        <circle cx="95" cy="95" r="3" fill="${color}"/>
    </svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}