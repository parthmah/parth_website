// Critical theme functionality - external file to avoid CSP issues
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
const savedTheme = localStorage.getItem('theme');
const initialTheme = savedTheme || (prefersDarkScheme.matches ? 'dark' : 'light');

document.documentElement.setAttribute('data-theme', initialTheme);

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) themeToggle.textContent = theme === 'dark' ? '🌞' : '🌚';
}

// Initialize theme toggle
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        setTheme(initialTheme);
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            setTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    }
    
    // Listen for system theme changes
    prefersDarkScheme.addEventListener('change', function(e) {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
});
