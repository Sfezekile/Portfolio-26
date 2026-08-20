// ---------- Start Menu ----------
// Owns #aboutMenu open/close only. Nothing else should toggle
// the .open class on this element.

const menu = document.getElementById('aboutMenu');
const startBtn = document.getElementById('start-btn');
const closeBtn = document.getElementById('menuClose');

startBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('open');
});

closeBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    menu.classList.remove('open');
});

// close on outside click, like a real start menu
document.addEventListener('click', (e) => {
    if (menu.classList.contains('open') && !menu.contains(e.target) && e.target !== startBtn) {
        menu.classList.remove('open');
    }
});

// About menu tab panels (Overview / Skills / Experience / Education / Contact)
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('panel-' + btn.dataset.panel).classList.add('active');
    });
});