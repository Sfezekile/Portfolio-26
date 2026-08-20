// ---------- Welcome intro ----------
// Shows a one-time explainer on desktop so first-time visitors know
// what they're looking at. Does NOT run at all on the mobile/tablet
// block screen — that's handled entirely by CSS in onboarding.css.

const INTRO_STORAGE_KEY = 'myos_intro_seen';

function showIntro() {
    const overlay = document.getElementById('intro-overlay');
    overlay?.classList.add('open');
}

function hideIntro(rememberChoice) {
    const overlay = document.getElementById('intro-overlay');
    overlay?.classList.remove('open');

    const dontShowAgain = document.getElementById('introDontShowAgain');
    if (rememberChoice && dontShowAgain?.checked) {
        localStorage.setItem(INTRO_STORAGE_KEY, '1');
    }
}

function initIntro() {
    const overlay = document.getElementById('intro-overlay');
    if (!overlay) return;

    const enterBtn = document.getElementById('introEnterBtn');
    enterBtn?.addEventListener('click', () => hideIntro(true));

    // Escape key also dismisses it
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('open')) {
            hideIntro(true);
        }
    });

    // Skip showing it again if the visitor already dismissed it before
    const alreadySeen = localStorage.getItem(INTRO_STORAGE_KEY) === '1';
    if (!alreadySeen) {
        showIntro();
    }
}

document.addEventListener('DOMContentLoaded', initIntro);

window.Intro = { show: showIntro, hide: hideIntro };