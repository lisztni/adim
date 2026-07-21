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
// Zoom
// ----------------------------

viewport.addEventListener("wheel", (e) => {

    e.preventDefault();

    const zoom = e.deltaY < 0 ? 1.1 : 0.9;

    const oldScale = camera.targetScale;

    let newScale = oldScale * zoom;

    newScale = Math.max(
        MIN_SCALE,
        Math.min(MAX_SCALE, newScale)
    );

    const rect = viewport.getBoundingClientRect();

    const mx = e.clientX - rect.width / 2;
    const my = e.clientY - rect.height / 2;

    camera.targetX -= mx * (newScale - oldScale);
    camera.targetY -= my * (newScale - oldScale);

    camera.targetScale = newScale;

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