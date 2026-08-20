// ---------- File Finder ----------
// Owns #home / #miniProject / #caseStudies / #research panel switching.

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

function ShowOnly(id) {
    ['home', 'miniProject', 'caseStudies', 'research'].forEach(sectionId => {
        document.getElementById(sectionId).style.display = (sectionId === id) ? 'grid' : 'none';
    });
}

// Referenced by the "Home" sidebar button and the reload button in
// File Finder's HTML (onclick="OpenHomeModel()") — was missing before.
function OpenHomeModel() {
    ShowOnly('home');
    document.querySelector('.page-path').textContent = 'Home';
}

async function OpenMiniModel() {
    ShowOnly('miniProject');
    document.querySelector('.page-path').textContent = 'Mini Projects';

    const repos = await fetchGitHubRepos();
    const categorized = categorizeRepos(repos);

    let html = '';
    categorized.miniProjects.forEach(repo => {
        html += createRepoHTML(repo);
    });
    if (!html) html = '<p>No mini projects found on GitHub.</p>';

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
    if (!html) html = '<p>No case studies found on GitHub.</p>';

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
    if (!html) html = '<p>No research projects found on GitHub.</p>';

    document.getElementById('research').innerHTML = html;
}

window.FileFinder = { OpenHomeModel, OpenMiniModel, OpenCaseModel, OpenResearchModel, ShowOnly };
// kept as globals too since the HTML uses inline onclick=""
window.OpenHomeModel = OpenHomeModel;
window.OpenMiniModel = OpenMiniModel;
window.OpenCaseModel = OpenCaseModel;
window.OpenResearchModel = OpenResearchModel;