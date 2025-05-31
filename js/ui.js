// ui.js: Handles UI enhancements like smooth scrolling and hover effects

/**
 * Adds smooth scrolling behavior to anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

/**
 * Adds hover effect to elements
 * @param {HTMLElement} element - The element to add hover effect to
 * @param {Object} options - Hover effect options
 * @param {string} options.transform - CSS transform value for hover state
 * @param {string} options.transition - CSS transition value
 */
function addHoverEffect(element, options = {}) {
    const {
        transform = 'translateY(-2px)',
        transition = 'transform 0.2s'
    } = options;

    element.style.transition = transition;
    element.addEventListener('mouseenter', () => {
        element.style.transform = transform;
    });
    element.addEventListener('mouseleave', () => {
        element.style.transform = 'none';
    });
}

/**
 * Initializes hover effects for social links and emoji elements
 */
function initHoverEffects() {
    // Add hover effect to social links
    document.querySelectorAll('.social-links a').forEach(link => {
        addHoverEffect(link);
    });

    // Add hover effect to emoji elements
    document.querySelectorAll('.notfound-emoji, .home-link').forEach(emoji => {
        addHoverEffect(emoji, { transform: 'scale(1.15)' });
    });
}

// Initialize UI enhancements when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();
    initHoverEffects();
});