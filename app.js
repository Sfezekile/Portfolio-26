(function () {
    'use strict';

    // ---- state ----
    const windows = {
        explorer: { element: document.getElementById('win-explorer'), open: false },
        notepad: { element: document.getElementById('win-notepad'), open: false },
        browser: { element: document.getElementById('win-browser'), open: false },
    };

    let activeWindowId = null;

    // ---- helpers ----
    function updateTaskbar() {
        const container = document.getElementById('taskbar-apps');
        container.innerHTML = '';
        for (const [id, win] of Object.entries(windows)) {
            if (win.open) {
                const btn = document.createElement('span');
                btn.className = 'taskbar-app' + (activeWindowId === id ? ' active-app' : '');
                btn.textContent = id.charAt(0).toUpperCase() + id.slice(1);
                btn.dataset.app = id;
                btn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    focusWindow(id);
                });
                container.appendChild(btn);
            }
        }
    }

    function focusWindow(id) {
        if (!windows[id] || !windows[id].open) return;
        activeWindowId = id;
        // bring to front by setting z-index
        const allWindows = document.querySelectorAll('.window');
        let maxZ = 100;
        allWindows.forEach(w => {
            if (w.style.display !== 'none') {
                const z = parseInt(w.style.zIndex) || 100;
                if (z > maxZ) maxZ = z;
            }
        });
        const winEl = windows[id].element;
        winEl.style.zIndex = maxZ + 1;
        // update active class
        allWindows.forEach(w => w.classList.remove('active'));
        winEl.classList.add('active');
        updateTaskbar();
    }

    function openWindow(id) {
        if (!windows[id]) return;
        const win = windows[id];
        if (win.open) {
            focusWindow(id);
            return;
        }
        win.open = true;
        const el = win.element;
        el.style.display = 'flex';
        // set z-index to top
        let maxZ = 100;
        document.querySelectorAll('.window').forEach(w => {
            const z = parseInt(w.style.zIndex) || 100;
            if (z > maxZ) maxZ = z;
        });
        el.style.zIndex = maxZ + 1;
        el.classList.add('active');
        // remove active from others
        document.querySelectorAll('.window').forEach(w => {
            if (w !== el) w.classList.remove('active');
        });
        activeWindowId = id;
        updateTaskbar();
    }

    function closeWindow(id) {
        if (!windows[id]) return;
        windows[id].open = false;
        windows[id].element.style.display = 'none';
        windows[id].element.classList.remove('active');
        if (activeWindowId === id) {
            activeWindowId = null;
            // set active to the topmost visible window
            const openWins = Object.entries(windows).filter(([k, v]) => v.open);
            if (openWins.length > 0) {
                // focus the one with highest z-index
                let top = openWins[0][0];
                let topZ = -1;
                openWins.forEach(([k, v]) => {
                    const z = parseInt(v.element.style.zIndex) || 100;
                    if (z > topZ) { topZ = z; top = k; }
                });
                focusWindow(top);
            }
        }
        updateTaskbar();
    }

    function toggleStartMenu() {
        const menu = document.getElementById('start-menu');
        menu.classList.toggle('open');
    }

    // ---- clock ----
    function updateClock() {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        document.getElementById('clock').textContent = h + ':' + m;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // ---- drag windows ----
    function makeDraggable(winEl) {
        const header = winEl.querySelector('.window-header');
        let isDragging = false, offsetX = 0, offsetY = 0;

        header.addEventListener('mousedown', function (e) {
            if (e.target.closest('.window-controls')) return;
            isDragging = true;
            const rect = winEl.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            winEl.style.cursor = 'grabbing';
            // bring to front on drag start
            const id = winEl.id.replace('win-', '');
            if (windows[id] && windows[id].open) focusWindow(id);
            e.preventDefault();
        });

        document.addEventListener('mousemove', function (e) {
            if (!isDragging) return;
            let left = e.clientX - offsetX;
            let top = e.clientY - offsetY;
            // clamp to viewport
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

    // ---- init all windows ----
    document.querySelectorAll('.window').forEach(win => {
        makeDraggable(win);
        // add resize handle (basic)
        // (native resize is enabled via CSS resize:both, but we also need to handle it)
        // For simplicity we just rely on CSS resize.
    });

    // ---- event listeners ----
    // Desktop icons
    document.querySelectorAll('.desktop-icon').forEach(icon => {
        icon.addEventListener('dblclick', function () {
            const app = this.dataset.app;
            if (app) openWindow(app);
        });
    });

    // Window control buttons (close, minimize, maximize)
    document.querySelectorAll('.window-controls button').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const action = this.dataset.action;
            const winEl = this.closest('.window');
            if (!winEl) return;
            const id = winEl.id.replace('win-', '');
            if (action === 'close') {
                closeWindow(id);
            } else if (action === 'minimize') {
                // minimize = close but keep in taskbar? Actually we just close for demo
                // But for better UX, we can hide it but keep it "open" in taskbar.
                // Let's implement minimize as hide but keep state open.
                const win = windows[id];
                if (win) {
                    win.element.style.display = 'none';
                    win.element.classList.remove('active');
                    // keep win.open = true so it stays in taskbar
                    updateTaskbar();
                    // focus another window
                    const openWins = Object.entries(windows).filter(([k, v]) => v.open && v.element.style.display !== 'none');
                    if (openWins.length > 0) {
                        focusWindow(openWins[0][0]);
                    } else {
                        activeWindowId = null;
                    }
                }
            } else if (action === 'maximize') {
                const rect = winEl.getBoundingClientRect();
                if (winEl.style.width === '100%' || winEl.style.width === '100vw') {
                    // restore
                    winEl.style.width = winEl.dataset.prevWidth || '500px';
                    winEl.style.height = winEl.dataset.prevHeight || '350px';
                    winEl.style.top = winEl.dataset.prevTop || '80px';
                    winEl.style.left = winEl.dataset.prevLeft || '100px';
                } else {
                    // save current
                    winEl.dataset.prevWidth = winEl.style.width || '500px';
                    winEl.dataset.prevHeight = winEl.style.height || '350px';
                    winEl.dataset.prevTop = winEl.style.top || '80px';
                    winEl.dataset.prevLeft = winEl.style.left || '100px';
                    winEl.style.width = '100%';
                    winEl.style.height = 'calc(100% - 50px)';
                    winEl.style.top = '0';
                    winEl.style.left = '0';
                }
            }
        });
    });

    // Start button
    document.getElementById('start-btn').addEventListener('click', function (e) {
        e.stopPropagation();
        toggleStartMenu();
    });

    // Start menu items
    document.querySelectorAll('.start-menu-item[data-app]').forEach(item => {
        item.addEventListener('click', function () {
            const app = this.dataset.app;
            if (app) openWindow(app);
            document.getElementById('start-menu').classList.remove('open');
        });
    });

    // Shutdown
    document.getElementById('shutdown-item').addEventListener('click', function () {
        if (confirm('Shut down the desktop?')) {
            document.body.innerHTML = `
                    <div style="display:flex; justify-content:center; align-items:center; height:100vh; background:#111; color:white; font-family: sans-serif; flex-direction:column;">
                        <div style="font-size:48px; margin-bottom:20px;">⏻</div>
                        <h1>Shutting down...</h1>
                        <p style="color:#888; margin-top:10px;">(Refresh the page to restart)</p>
                    </div>
                `;
        }
    });

    // Close start menu on outside click
    document.addEventListener('click', function (e) {
        const menu = document.getElementById('start-menu');
        const startBtn = document.getElementById('start-btn');
        if (menu.classList.contains('open') && !menu.contains(e.target) && !startBtn.contains(e.target)) {
            menu.classList.remove('open');
        }
    });

    // Taskbar app clicks (already handled in updateTaskbar via event listeners)
    // But we also need to handle click on taskbar items to focus

    // ---- initial open a window as demo ----
    openWindow('explorer');

    // ---- keyboard shortcut: Escape to close start menu ----
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            document.getElementById('start-menu').classList.remove('open');
        }
    });

})();