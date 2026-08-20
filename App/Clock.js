// ---------- Menubar clock ----------
function updateClock() {
    const el = document.getElementById('clock');
    if (!el) return;
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    el.textContent = `${hours}:${minutes}`;
}

updateClock();
setInterval(updateClock, 1000);