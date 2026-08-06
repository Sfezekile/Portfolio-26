// ---------- Generic window manager ----------
// Handles opening a window from a taskbar icon (data-app="X" -> #win-X)
// and the shared minimize/maximize/close controls on every .window.

document.querySelectorAll('.taskbar-icon').forEach(icon => {
    icon.addEventListener('click', () => {
        const app = icon.getAttribute('data-app');
        const win = document.getElementById('win-' + app);
        if (win) {
            win.style.display = 'flex';
            bringToFront(win);
        }
    });
});

document.querySelectorAll('.window').forEach(win => {
    win.querySelector('.close-btn')?.addEventListener('click', () => {
        win.style.display = 'none';
    });
    win.querySelector('.min-btn')?.addEventListener('click', () => {
        win.style.display = 'none';
    });
    win.querySelector('.max-btn')?.addEventListener('click', () => {
        win.classList.toggle('maximized');
    });
    win.addEventListener('mousedown', () => bringToFront(win));
});

// Window control buttons (close, minimize, maximize)
document.querySelectorAll('.window-control button').forEach(btn => {
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
                winEl.style.height = 'calc(100% - 90px)';
                winEl.style.top = '30px';
                winEl.style.left = '0';
                winEl.style.border = none;
                winEl.style.borderRadius = '0';
            }
        }
    });
});
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

let zCounter = 10;
function bringToFront(win) {
    zCounter++;
    win.style.zIndex = zCounter;
}

// ---------- File Finder logic (scoped with  prefix) ----------
const miniProjectFolder = {
    folder_1: {
        icon: 'https://cdn.iconscout.com/icon/premium/png-512-thumb/calendar-icon-svg-download-png-8756633.png?f=webp&w=256',
        fileName: 'Calendar-UI',
        link: 'https://sfezekile.github.io/Calendar-UI/',
    },
    folder_2: {
        icon: 'https://cdn.iconscout.com/icon/premium/png-512-thumb/music-player-icon-svg-download-png-10592997.png?f=webp&w=256',
        fileName: 'MiniPocket-Player',
    },
};
const caseFolder = {
    folder_1: { icon: 'https://cdn.iconscout.com/icon/premium/png-512-thumb/document-folder-icon-svg-download-png-10290706.png?f=webp&w=256', fileName: 'Product Card - Case Study', gitLink: 'https://github.com/Sfezekile/case-study-card-1' },
    folder_2: { icon: 'https://cdn.iconscout.com/icon/premium/png-512-thumb/document-folder-icon-svg-download-png-10290706.png?f=webp&w=256', fileName: 'Profile Card - Case Study', gitLink: 'https://github.com/Sfezekile/case-study-card-2' },
    folder_3: { icon: 'https://cdn.iconscout.com/icon/premium/png-512-thumb/document-folder-icon-svg-download-png-10290706.png?f=webp&w=256', fileName: 'Animation in CSS - Case Study', gitLink: 'https://github.com/Sfezekile/Case-study-animation-1' },
    folder_4: { icon: 'https://cdn.iconscout.com/icon/premium/png-512-thumb/document-folder-icon-svg-download-png-10290706.png?f=webp&w=256', fileName: 'Coffee Customization Card - Case Study', gitLink: 'https://github.com/Sfezekile/case-study-card-3' },
    folder_5: { icon: 'https://cdn.iconscout.com/icon/premium/png-512-thumb/document-folder-icon-svg-download-png-10290706.png?f=webp&w=256', fileName: 'Status Indicator Component: A UI/UX Case Study', gitLink: 'https://github.com/Sfezekile/case-study-btn-2' },
    folder_6: { icon: 'https://cdn.iconscout.com/icon/premium/png-512-thumb/document-folder-icon-svg-download-png-10290706.png?f=webp&w=256', fileName: 'Button Design Case Study', gitLink: 'https://github.com/Sfezekile/case-study-btn-1' },
};
const researchFolder = {
    folder_1: {
        icon: 'https://cdn.iconscout.com/icon/premium/png-512-thumb/document-folder-icon-svg-download-png-10290706.png?f=webp&w=256',
        fileName: 'Plants in Space',
    },
    folder_2: {
        icon: 'https://cdn.iconscout.com/icon/premium/png-512-thumb/document-folder-icon-svg-download-png-10290706.png?f=webp&w=256',
        fileName: 'e-com UI',
    },
    folder_3: {
        icon: 'https://cdn.iconscout.com/icon/premium/png-512-thumb/document-folder-icon-svg-download-png-10290706.png?f=webp&w=256',
        fileName: 'React Apps',
    },
    folder_4: {
        icon: 'https://cdn.iconscout.com/icon/premium/png-512-thumb/document-folder-icon-svg-download-png-10290706.png?f=webp&w=256',
        fileName: 'Landing Page Designs',
    },
};


// Update these functions to fetch and display GitHub repos
async function OpenMiniModel() {
    ShowOnly('miniProject');
    document.querySelector('.page-path').textContent = 'Mini Projects';

    const repos = await fetchGitHubRepos();
    const categorized = categorizeRepos(repos);

    let html = '';
    categorized.miniProjects.forEach(repo => {
        html += createRepoHTML(repo);
    });

    // If no repos found, show fallback content
    if (!html) {
        html = '<p>No mini projects found on GitHub.</p>';
    }

    document.getElementById('miniProject').innerHTML = html;
}

async function OpenCaseModel() {
    ShowOnly('caseStudies');
    document.querySelector('.page-path').textContent = 'Case Studies';

    const repos = await fetchGitHubRepos();
    const categorized = categorizeRepos(repos);

    let html = '';
    categorized.caseStudies.forEach(repo => {
        html += createRepoHTML(repo);
    });

    if (!html) {
        html = '<p>No case studies found on GitHub.</p>';
    }

    document.getElementById('caseStudies').innerHTML = html;
}

async function OpenResearchModel() {
    ShowOnly('research');
    document.querySelector('.page-path').textContent = 'Research';

    const repos = await fetchGitHubRepos();
    const categorized = categorizeRepos(repos);

    let html = '';
    categorized.research.forEach(repo => {
        html += createRepoHTML(repo);
    });

    if (!html) {
        html = '<p>No research projects found on GitHub.</p>';
    }

    document.getElementById('research').innerHTML = html;
}

// Keep the original ShowOnly function
function ShowOnly(id) {
    ['home', 'miniProject', 'caseStudies', 'research'].forEach(sectionId => {
        document.getElementById(sectionId).style.display = (sectionId === id) ? 'grid' : 'none';
    });
}

// Live clock (menubar)
function UpdateClock() {
    const el = document.getElementById('clock');
    if (el) {
        el.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
}
UpdateClock();
setInterval(UpdateClock, 1000 * 30);

// Cache management
let repoCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchGitHubReposWithCache() {
    // Check if cache is valid
    if (repoCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
        return repoCache;
    }

    // Fetch fresh data
    const repos = await fetchGitHubRepos();
    repoCache = repos;
    cacheTimestamp = Date.now();
    return repos;
}
