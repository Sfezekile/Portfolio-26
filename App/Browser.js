// ---------- Browser window ----------
// Owns tab state INSIDE #win-browser only. Never touches .active on
// #win-browser itself — that's WindowManager's job (avoids the
// "browser won't reopen" bug from a stray inline style.display).

let activeTabs = ['tab-1'];
let currentTab = 'tab-1';

function ShowOnlyB(id) {
    const manualPage = document.getElementById('manualPage');
    const projectsPage = document.getElementById('projectsPage');
    const howItWorksPage = document.getElementById('howItWorksPage');

    manualPage.style.display = (id === 'manualPage') ? 'flex' : 'none';
    projectsPage.style.display = (id === 'projectsPage') ? 'flex' : 'none';
    howItWorksPage.style.display = (id === 'howItWorksPage') ? 'flex' : 'none';
}

function openProjectsTab() {
    if (activeTabs.includes('tab-2')) {
        switchToTab('tab-2');
        return;
    }

    activeTabs.push('tab-2');
    document.getElementById('tab-2').style.display = 'flex';
    switchToTab('tab-2');
    loadProjects();
}

function openHowItWorksTab() {
    if (activeTabs.includes('tab-3')) {
        switchToTab('tab-3');
        return;
    }

    activeTabs.push('tab-3');
    document.getElementById('tab-3').style.display = 'flex';
    switchToTab('tab-3');
}

async function loadProjects() {
    ShowOnlyB('projectsPage');
    document.querySelector('.path-name').textContent = 'projects.com';

    const repos = await fetchGitHubRepos();
    const categorized = categorizeRepos(repos);

    let html = '';
    categorized.all.forEach(repo => {
        html += createProjRepoHTML(repo);
    });
    if (!html) {
        html = '<p>No mini projects found on GitHub.</p>';
    }
    document.getElementsByClassName('project-list')[0].innerHTML = html;
}

function switchToTab(tabId) {
    currentTab = tabId;

    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.id === tabId) tab.classList.add('active');
    });

    if (tabId === 'tab-1') {
        ShowOnlyB('manualPage');
        document.querySelector('.path-name').textContent = 'portfolio-26';
    } else if (tabId === 'tab-2') {
        loadProjects();
    } else if (tabId === 'tab-3') {
        ShowOnlyB('howItWorksPage');
        document.querySelector('.path-name').textContent = 'how-it-works';
    }
}

function closeTab(tabId) {
    if (activeTabs.length <= 1) return; // never close the last tab

    const index = activeTabs.indexOf(tabId);
    if (index > -1) activeTabs.splice(index, 1);

    document.getElementById(tabId).style.display = 'none';

    if (currentTab === tabId) {
        const nextTab = activeTabs[0] || 'tab-1';
        switchToTab(nextTab);
    }
}

function goHome() {
    if (!activeTabs.includes('tab-1')) {
        activeTabs.push('tab-1');
        document.getElementById('tab-1').style.display = 'flex';
    }
    switchToTab('tab-1');
}

function initBrowser() {
    // Project Repos button (Tab-1 -> opens Tab-2)
    const projectListBtn = document.getElementById('projectListBtn');
    projectListBtn?.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        openProjectsTab();
    });

    // How It Works button (Tab-1 -> opens Tab-3)
    const howItWorksBtn = document.getElementById('howItWorksBtn');
    howItWorksBtn?.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        openHowItWorksTab();
    });

    // Clicking a tab switches to it (unless the click was on its close button)
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function (e) {
            if (e.target.closest('.close-tab-btn')) return;
            switchToTab(this.id);
        });
    });

    // Close-tab buttons
    document.querySelectorAll('.close-tab-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            closeTab(this.getAttribute('data-tab'));
        });
    });

    // If multiple tabs are open, closing the window should close the
    // extra tabs first instead of closing the whole window. Registered
    // as a hook so window-manager.js is still the only thing that
    // actually toggles the window's .active class.
    window.WindowManager.beforeClose['browser'] = function () {
        if (activeTabs.length > 1) {
            while (activeTabs.length > 1) {
                closeTab(activeTabs[activeTabs.length - 1]);
            }
            return false; // cancel the window close
        }
        return true; // only one tab left — go ahead and close the window
    };

    // Initial state — only tab-1 visible
    document.getElementById('tab-1').style.display = 'flex';
    document.getElementById('tab-2').style.display = 'none';
    document.getElementById('tab-3').style.display = 'none';
    switchToTab('tab-1');
}

document.addEventListener('DOMContentLoaded', initBrowser);

window.Browser = { openProjectsTab, openHowItWorksTab, closeTab, goHome, switchToTab, ShowOnlyB };
// kept as globals too since HTML uses inline onclick="goHome()"
window.goHome = goHome;
window.closeTab = closeTab;
window.switchToTab = switchToTab;
window.ShowOnlyB = ShowOnlyB;
window.openProjectsTab = openProjectsTab;
window.openHowItWorksTab = openHowItWorksTab;