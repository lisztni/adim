const viewport = document.getElementById("viewport");
const world = document.getElementById("world");
const scene = document.getElementById("scene");

// ----------------------------
// Camera
// ----------------------------

let camera = {
    x: 0,
    y: 0,
    scale: 1,

    targetX: 0,
    targetY: 0,
    targetScale: 1
};

// ----------------------------
// Settings
// ----------------------------

const MIN_SCALE = 0.4;
const MAX_SCALE = 3;

const SMOOTH = 0.12;

// ----------------------------
// Drag
// ----------------------------

let dragging = false;

let lastX = 0;
let lastY = 0;

viewport.addEventListener("mousedown", (e) => {

    dragging = true;

    lastX = e.clientX;
    lastY = e.clientY;

});

window.addEventListener("mouseup", () => {

    dragging = false;

});

window.addEventListener("mousemove", (e) => {

    if (!dragging) return;

    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;

    camera.targetX += dx;
    camera.targetY += dy;

    lastX = e.clientX;
    lastY = e.clientY;

});

// ----------------------------
// Touch Drag
// ----------------------------

let lastTouchDistance = 0;
let lastCenterX = 0;
let lastCenterY = 0;

viewport.addEventListener("touchstart", (e) => {

    if (e.touches.length === 1) {

        dragging = true;

        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;

    }

    if (e.touches.length === 2) {

        dragging = false;

        lastTouchDistance = getTouchDistance(e);

        lastCenterX =
            (e.touches[0].clientX + e.touches[1].clientX) / 2;

        lastCenterY =
            (e.touches[0].clientY + e.touches[1].clientY) / 2;

    }

}, { passive:false });

viewport.addEventListener("touchmove", (e) => {

    e.preventDefault();

    // Один палец — перемещение
    if (e.touches.length === 1) {

        const x = e.touches[0].clientX;
        const y = e.touches[0].clientY;

        camera.targetX += x - lastX;
        camera.targetY += y - lastY;

        lastX = x;
        lastY = y;

    }

    // Два пальца — зум
    if (e.touches.length === 2) {

        const rect = viewport.getBoundingClientRect();

        const centerX =
            (e.touches[0].clientX + e.touches[1].clientX) / 2;

        const centerY =
            (e.touches[0].clientY + e.touches[1].clientY) / 2;

        const mouseX = centerX - rect.width / 2;
        const mouseY = centerY - rect.height / 2;

        const oldScale = camera.targetScale;

        const distance = getTouchDistance(e);

        let newScale =
            oldScale * (distance / lastTouchDistance);

        newScale = Math.max(
            MIN_SCALE,
            Math.min(MAX_SCALE, newScale)
        );

        // Мировая точка под центром пальцев
        const worldX =
            (mouseX - camera.targetX) / oldScale;

        const worldY =
            (mouseY - camera.targetY) / oldScale;

        camera.targetScale = newScale;

        camera.targetX =
            mouseX - worldX * newScale;

        camera.targetY =
            mouseY - worldY * newScale;

        // Если пальцы двигаются вместе — панорамирование
        camera.targetX += centerX - lastCenterX;
        camera.targetY += centerY - lastCenterY;

        lastCenterX = centerX;
        lastCenterY = centerY;

        lastTouchDistance = distance;

    }

}, { passive:false });

viewport.addEventListener("touchend", (e) => {

    dragging = false;

    if (e.touches.length === 1) {

        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;

    }

}, { passive:false });

function getTouchDistance(e){

    const dx =
        e.touches[0].clientX -
        e.touches[1].clientX;

    const dy =
        e.touches[0].clientY -
        e.touches[1].clientY;

    return Math.hypot(dx,dy);

}

// ----------------------------
// Zoom
// ----------------------------

viewport.addEventListener("wheel", (e) => {

    e.preventDefault();

    const rect = viewport.getBoundingClientRect();

    const mouseX = e.clientX - rect.width / 2;
    const mouseY = e.clientY - rect.height / 2;

    const oldScale = camera.targetScale;

    let newScale = oldScale * (e.deltaY < 0 ? 1.1 : 0.9);

    newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));

    // Мировая точка под курсором ДО изменения масштаба
    const worldX = (mouseX - camera.targetX) / oldScale;
    const worldY = (mouseY - camera.targetY) / oldScale;

    camera.targetScale = newScale;

    // Смещаем камеру так, чтобы эта же мировая точка осталась под курсором
    camera.targetX = mouseX - worldX * newScale;
    camera.targetY = mouseY - worldY * newScale;

}, { passive: false });

// ----------------------------
// Clamp
// ----------------------------

function clampCamera() {

    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;

    const svg = scene.querySelector("svg");

    const w = svg.viewBox.baseVal.width;
    const h = svg.viewBox.baseVal.height;

    const margin = 0.10;

    const scaledW = w * camera.targetScale;
    const scaledH = h * camera.targetScale;

    const limitX =
        Math.max(0, (scaledW - vw) / 2) +
        scaledW * margin;

    const limitY =
        Math.max(0, (scaledH - vh) / 2) +
        scaledH * margin;

    camera.targetX = Math.max(
        -limitX,
        Math.min(limitX, camera.targetX)
    );

    camera.targetY = Math.max(
        -limitY,
        Math.min(limitY, camera.targetY)
    );

}

// ----------------------------
// Resize
// ----------------------------

window.addEventListener("resize", clampCamera);


// ----------------------------
// Fit
// ----------------------------

function fitToScreen() {
    const svg = scene.querySelector("svg");

    const w = svg.viewBox.baseVal.width;
    const h = svg.viewBox.baseVal.height;

    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;

    const scaleX = vw / w;
    const scaleY = vh / h;

    camera.scale =
        camera.targetScale =
            Math.min(scaleX, scaleY);

    camera.x =
        camera.targetX =
            0;

    camera.y =
        camera.targetY =
            0;

}

// ----------------------------
// Render
// ----------------------------

function render() {

    camera.x += (camera.targetX - camera.x) * SMOOTH;
    camera.y += (camera.targetY - camera.y) * SMOOTH;

    camera.scale += (camera.targetScale - camera.scale) * SMOOTH;

    clampCamera();

    const svg = scene.querySelector("svg");

    const w = svg.viewBox.baseVal.width;
    const h = svg.viewBox.baseVal.height;

    world.style.transform = `
        translate(
            ${camera.x - (w * camera.scale) / 2}px,
            ${camera.y - (h * camera.scale) / 2}px
        )
        scale(${camera.scale})
    `;

    requestAnimationFrame(render);

}

fetch("screen.svg")
    .then(r => r.text())
    .then(text => {

        scene.innerHTML = text;
        const svg = scene.querySelector("svg");

        const title = document.getElementById("birthday-title");

        title.style.width = svg.viewBox.baseVal.width + "px";

        initScene();

        fitToScreen();

        render();

    });

function initScene() {

    const adinaShelf = document.getElementById("adinaShelf");

    if (!adinaShelf) return;

    adinaShelf.style.cursor = "pointer";

    adinaShelf.addEventListener("click", () => {

        alert("Полка Адины");

    });

}