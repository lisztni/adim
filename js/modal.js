/**
 * Modal Manager for Photo Inspection with AutoScroll Pause Callbacks
 */
export class ModalManager {
    constructor(onOpenCallback, onCloseCallback) {
        this.backdrop = document.getElementById('modal-backdrop');
        this.content = document.getElementById('modal-content');
        this.closeBtn = document.getElementById('modal-close-btn');
        this.onOpen = onOpenCallback;
        this.onClose = onCloseCallback;

        this.initEvents();
    }

    initEvents() {
        this.closeBtn.addEventListener('click', () => this.close());
        this.backdrop.addEventListener('click', (e) => {
            if (e.target === this.backdrop) this.close();
        });
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
        });
    }

    openPhotoModal(photoSrc, caption) {
        if (this.onOpen) this.onOpen();

        this.content.innerHTML = `
            <img src="${photoSrc}" style="max-width: 100%; max-height: 70vh; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.9);" />
            <p style="margin-top: 15px; font-weight: 500; color: #e5e7eb; text-align: center;">${caption}</p>
        `;
        this.backdrop.classList.remove('hidden');
    }

    close() {
        if (!this.backdrop.classList.contains('hidden')) {
            this.backdrop.classList.add('hidden');
            if (this.onClose) this.onClose();
        }
    }
}