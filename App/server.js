// GitHub API configuration
const GITHUB_USERNAME = 'Sfezekile'; // Your GitHub username
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos`;

// Function to fetch repositories from GitHub
async function fetchGitHubRepos() {
    try {
        const response = await fetch(GITHUB_API_URL, {
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const repos = await response.json();
        return repos;
    } catch (error) {
        console.error('Error fetching GitHub repos:', error);
        return [];
    }
}

// Function to filter and organize repos by category
function categorizeRepos(repos) {
    const categories = {
        all: repos,
        miniProjects: [],
        caseStudies: [],
        research: [],
        other: []
    };

    repos.forEach(repo => {
        // Categorize based on repository name or description
        const name = repo.name.toLowerCase();
        const description = (repo.description || '').toLowerCase();

        if (name.includes('live') || name.includes('player') || name.includes('ui')) {
            categories.miniProjects.push(repo);
        } else if (name.includes('case-study') || name.includes('card') || description.includes('case study')) {
            categories.caseStudies.push(repo);
        } else if (name.includes('research') || name.includes('space') || name.includes('design')) {
            categories.research.push(repo);
        } else {
            categories.other.push(repo);
        }
    });

    return categories;
}

// Function to create HTML for a repository
function createRepoHTML(repo) {
    const icon = 'https://cdn.iconscout.com/icon/premium/png-512-thumb/document-folder-icon-svg-download-png-10290706.png?f=webp&w=256';
    const repoName = repo.name.replace(/-/g, ' ').replace(/_/g, ' ');

    return `
        <a href="${repo.html_url}" target="_blank" class="file">
            <div class="folder-img">
                <img src="${icon}" alt="${repoName}">
            </div>
            <span>${repoName}</span>
            ${repo.description ? `<p class="repo-desc">${repo.description}</p>` : ''}
        </a>
    `;
}

// Function to create HTML for a repository
function createProjRepoHTML(repo) {
    const icon = 'https://cdn.iconscout.com/icon/premium/png-512-thumb/document-folder-icon-svg-download-png-10290706.png?f=webp&w=256';
    const repoName = repo.name.replace(/-/g, ' ').replace(/_/g, ' ');
    const repoLanguage = repo.language ? `<span class="repo-language">${repo.language}</span>` : '';
    const repoUpdated = repo.updated ? `<span class="repo-updated">${repo.updated_at}</span>` : '';
    const homepageLink = repo.homepage ? `<a href="${repo.homepage}" target="_blank" rel="noopener" class="repo-homepage">Live Demo</a>` : '';

    return `
        <div class="repo-row repo-card">
            <a href="${repo.html_url}" target="_blank" rel="noopener" class="repo-link">
                <span class="repo-name">${repoName}</span>
                <div class="repo-meta">
                    ${repoLanguage}
                    ${repoUpdated}
                </div>
            </a>
            ${homepageLink}
        </div>
    `;
}

function timeAgo(dateString) {
    const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
    const intervals = [
        ['year', 31536000], ['month', 2592000], ['week', 604800],
        ['day', 86400], ['hour', 3600], ['minute', 60]
    ];
    for (const [label, secs] of intervals) {
        const count = Math.floor(seconds / secs);
        if (count >= 1) return `${count} ${label}${count > 1 ? 's' : ''} ago`;
    }
    return 'just now';
}

async function loadRecentRepo() {
    const nameEl = document.getElementById('recentRepoName');
    const metaEl = document.getElementById('recentRepoMeta');
    if (!nameEl) return;

    try {
        const repos = await fetchGitHubRepos();
        if (!repos.length) {
            nameEl.textContent = 'No repos found';
            metaEl.textContent = '';
            return;
        }
        const latest = [...repos].sort(
            (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
        )[0];
        const displayName = latest.name.replace(/-/g, ' ').replace(/_/g, ' ');

        nameEl.innerHTML = `<a href="${latest.html_url}" target="_blank" rel="noopener">${displayName}</a>`;
        metaEl.textContent = `${latest.language ? latest.language + ' · ' : ''}updated ${timeAgo(latest.updated_at)}`;
    } catch (err) {
        console.error('Could not load recent repo:', err);
        nameEl.textContent = 'Unavailable';
        metaEl.textContent = '';
    }
}

// load once on page load
document.addEventListener('DOMContentLoaded', loadRecentRepo);

// refresh whenever the start menu is opened
startBtn.addEventListener('click', () => {
    if (menu.classList.contains('open')) loadRecentRepo();
});

// keep it "live" while the tab stays open — GitHub's unauthenticated
// rate limit is 60 req/hr, so every 5 min is safe
setInterval(loadRecentRepo, 5 * 60 * 1000);