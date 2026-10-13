// ---------- Menubar system status ----------
// Owns the wifi / volume / battery pills in the menubar only.
(function () {
    const net = document.getElementById('networkStatus');
    const vol = document.getElementById('volumeStatus');
    const bat = document.getElementById('batteryStatus');
    if (!net || !vol || !bat) return;

    // ----- Network -----
    function updateNetwork() {
        const online = navigator.onLine;
        const type = navigator.connection?.effectiveType; // Chromium only
        net.querySelector('i').className = online ? 'ri-wifi-line' : 'ri-wifi-off-line';
        net.classList.toggle('warn', !online);
        net.title = online ? `Online${type ? ' (' + type + ')' : ''}` : 'Offline';
    }
    window.addEventListener('online', updateNetwork);
    window.addEventListener('offline', updateNetwork);
    navigator.connection?.addEventListener('change', updateNetwork);
    updateNetwork();

    // ----- Battery -----
    if (navigator.getBattery) {
        navigator.getBattery().then(b => {
            function updateBattery() {
                const pct = Math.round(b.level * 100);
                bat.querySelector('i').className = b.charging
                    ? 'ri-battery-charging-line'
                    : pct <= 20 ? 'ri-battery-low-line' : 'ri-battery-line';
                bat.querySelector('span').textContent = pct + '%';
                bat.classList.toggle('warn', !b.charging && pct <= 20);
                bat.title = b.charging ? 'Charging' : 'On battery';
            }
            b.addEventListener('levelchange', updateBattery);
            b.addEventListener('chargingchange', updateBattery);
            updateBattery();
        });
    } else {
        bat.style.display = 'none'; // Firefox / Safari
    }

    // ----- Volume (MyOS-only, not the system volume) -----
    let volume = 0.7, muted = false;
    function updateVolume() {
        vol.querySelector('i').className =
            (muted || volume === 0) ? 'ri-volume-mute-line'
            : volume < 0.5 ? 'ri-volume-down-line'
            : 'ri-volume-up-line';
        vol.title = muted ? 'Muted' : `Volume ${Math.round(volume * 100)}% (scroll to change)`;
    }
    vol.addEventListener('click', () => { muted = !muted; updateVolume(); });
    vol.addEventListener('wheel', (e) => {
        e.preventDefault();
        volume = Math.min(1, Math.max(0, volume + (e.deltaY < 0 ? 0.05 : -0.05)));
        muted = false;
        updateVolume();
    }, { passive: false });
    updateVolume();

    // Future audio code can read this
    window.MyOSAudio = { get volume() { return muted ? 0 : volume; } };
})();