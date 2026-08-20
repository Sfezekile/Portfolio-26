// ---------- App entry point ----------
// Each module (window-manager, start-menu, browser, file-finder, clock)
// wires up its own listeners on load / DOMContentLoaded. This file is
// just a sanity check that everything loaded in the right order.

document.addEventListener('DOMContentLoaded', () => {
    console.log('All modules loaded:', {
        WindowManager: !!window.WindowManager,
        Browser: !!window.Browser,
        FileFinder: !!window.FileFinder
    });
});