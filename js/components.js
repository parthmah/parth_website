// components.js: Handles dynamic component inclusion
let headerContent = null;
async function includeComponent(elementId, path) {
    try {
        let html;
        if (elementId === 'header-component' && headerContent) {
            html = headerContent;
        } else {
            const response = await fetch(path);
            if (!response.ok) throw new Error(`Failed to load ${path}`);
            html = await response.text();
        }
        document.getElementById(elementId).innerHTML = html;
        if (elementId === 'header-component') {
            if (typeof initThemeToggle === 'function') initThemeToggle();
        }
    } catch (error) {
        console.error(`Error loading component ${path}:`, error);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    includeComponent('header-component', '/components/header.html');
    includeComponent('footer-component', '/components/footer.html');
});