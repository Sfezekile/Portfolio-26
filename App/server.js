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