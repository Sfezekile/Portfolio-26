// ---------- Generic window manager ----------
// This is the ONLY file allowed to touch .active / z-index / position
// on .window elements. Other files (browser.js, file-finder.js) should
// call WindowManager.close('browser') etc. instead of touching the
// element directly — that's what caused the "browser won't reopen" bug.

let zCounter = 10;

// Tracks which window IDs are currently maximized. When this is
// non-empty, <body> gets a class that CSS uses to hide the menubar.
const maximizedWindows = new Set();

function updateMenubarVisibility() {
    document.body.classList.toggle('has-maximized-window', maximizedWindows.size > 0);
}

function bringToFront(win) {
    zCounter++;
    win.style.zIndex = zCounter;
}

function openWindow(appId) {
    const win = document.getElementById('win-' + appId);
    if (!win) return;
    win.classList.add('active');
    bringToFront(win);
}

function closeWindow(appId) {
    const win = document.getElementById('win-' + appId);
    if (!win) return;
    win.classList.remove('active');

    // If a maximized window gets closed, the menubar needs to come back.
    if (maximizedWindows.has(win.id)) {
        maximizedWindows.delete(win.id);
        updateMenubarVisibility();
    }
}

function minimizeWindow(appId) {
    // For now minimize behaves like close (no taskbar "restore" state yet).
    // If you want a real taskbar restore later, this is the only place
    // that needs to change.
    closeWindow(appId);
}

function toggleMaximize(winEl) {
    const isMaximized = winEl.classList.contains('maximized');

    if (isMaximized) {
        // restore
        winEl.style.width = winEl.dataset.prevWidth || '500px';
        winEl.style.height = winEl.dataset.prevHeight || '350px';
        winEl.style.top = winEl.dataset.prevTop || '80px';
        winEl.style.left = winEl.dataset.prevLeft || '100px';
        winEl.style.border = '';
        winEl.style.borderRadius = '';
        winEl.classList.remove('maximized');
        maximizedWindows.delete(winEl.id);
    } else {
        // save current, then maximize
        winEl.dataset.prevWidth = winEl.style.width || '500px';
        winEl.dataset.prevHeight = winEl.style.height || '350px';
        winEl.dataset.prevTop = winEl.style.top || '80px';
        winEl.dataset.prevLeft = winEl.style.left || '100px';
        winEl.style.width = '100%';
        winEl.style.height = 'calc(100% - 0px)';
        winEl.style.top = '0px';
        winEl.style.left = '0';
        winEl.style.border = 'none';
        winEl.style.borderRadius = '0';
        winEl.classList.add('maximized');
        maximizedWindows.add(winEl.id);
    }

    updateMenubarVisibility();
}

// ---- taskbar icons open windows ----
document.querySelectorAll('.taskbar-icon').forEach(icon => {
    icon.addEventListener('click', () => {
        const app = icon.getAttribute('data-app');
        openWindow(app);
    });
});

// ---- window-control buttons (close / minimize / maximize) ----
// Single source of truth — no duplicate listeners elsewhere.
document.querySelectorAll('.window-control button').forEach(btn => {
    btn.addEventListener('click', function (e) {
        e.stopPropagation();
        const action = this.dataset.action;
        const winEl = this.closest('.window');
        if (!winEl) return;
        const id = winEl.id.replace('win-', '');

        if (action === 'close') {
            // Give the owning module (e.g. Browser) a chance to intercept —
            // e.g. "close extra tabs" instead of closing the whole window.
            const hook = window.WindowManager.beforeClose[id];
            const shouldClose = hook ? hook() : true;
            if (shouldClose) closeWindow(id);
        } else if (action === 'minimize') {
            minimizeWindow(id);
        } else if (action === 'maximize') {
            toggleMaximize(winEl);
        }
    });
});

// bring to front on any click inside a window
document.querySelectorAll('.window').forEach(win => {
    win.addEventListener('mousedown', () => bringToFront(win));
});

// ---- drag windows ----
function makeDraggable(winEl) {
    const header = winEl.querySelector('.window-header');
    if (!header) return;
    let isDragging = false, offsetX = 0, offsetY = 0;

    header.addEventListener('mousedown', function (e) {
        if (e.target.closest('.window-control')) return;
        isDragging = true;
        const rect = winEl.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        winEl.style.cursor = 'grabbing';
        bringToFront(winEl);
        e.preventDefault();
    });

    document.addEventListener('mousemove', function (e) {
        if (!isDragging) return;
        let left = e.clientX - offsetX;
        let top = e.clientY - offsetY;
        left = Math.max(0, Math.min(left, window.innerWidth - winEl.offsetWidth));
        top = Math.max(0, Math.min(top, window.innerHeight - winEl.offsetHeight - 50));
        winEl.style.left = left + 'px';
        winEl.style.top = top + 'px';
    });

    document.addEventListener('mouseup', function () {
        if (isDragging) {
            isDragging = false;
            winEl.style.cursor = '';
        }
    });
}

document.querySelectorAll('.window').forEach(win => makeDraggable(win));

// Shared API other modules can call instead of touching .window directly.
// beforeClose[appId] = () => boolean — return false to cancel the close.
// (e.g. Browser registers 'browser' to close extra tabs first.)
window.WindowManager = {
    open: openWindow,
    close: closeWindow,
    minimize: minimizeWindow,
    bringToFront,
    beforeClose: {}
};