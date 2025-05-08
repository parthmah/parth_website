/**
 * Component inclusion handler
 */

// Core elements
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Set initial theme immediately to prevent flash
const savedTheme = localStorage.getItem('theme');
const initialTheme = savedTheme || (prefersDarkScheme.matches ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', initialTheme);

// Preload header content
let headerContent = null;
fetch('/components/header.html')
    .then(response => response.text())
    .then(html => {
        headerContent = html;
        // If the header component exists, insert the content immediately
        const headerComponent = document.getElementById('header-component');
        if (headerComponent) {
            headerComponent.innerHTML = html;
            initThemeToggle();
        }
    })
    .catch(error => console.error('Error preloading header:', error));

/**
 * Initialize theme toggle functionality
 * Handles system preference detection and user selection
 */
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    // Set theme and update UI
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        themeToggle.textContent = theme === 'dark' ? '🌞' : '🌚';
    }
    
    // Set initial button state
    setTheme(initialTheme);
    
    // Toggle theme on button click
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
    
    // Listen for system theme changes
    prefersDarkScheme.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
}

async function includeComponent(elementId, path) {
    try {
        let html;
        if (elementId === 'header-component' && headerContent) {
            // Use preloaded header content
            html = headerContent;
        } else {
            const response = await fetch(path);
            if (!response.ok) throw new Error(`Failed to load ${path}`);
            html = await response.text();
        }
        
        document.getElementById(elementId).innerHTML = html;
        
        // If this is the header component, initialize theme toggle
        if (elementId === 'header-component') {
            initThemeToggle();
        }
    } catch (error) {
        console.error(`Error loading component ${path}:`, error);
    }
}

// Initialize components
document.addEventListener('DOMContentLoaded', () => {
    // If header content is already loaded, use it immediately
    if (headerContent) {
        const headerComponent = document.getElementById('header-component');
        if (headerComponent) {
            headerComponent.innerHTML = headerContent;
            initThemeToggle();
        }
    }
    
    includeComponent('header-component', '/components/header.html');
    includeComponent('footer-component', '/components/footer.html');
}); 