/**
 * Personal Website JS
 */

// Initialize non-critical features after DOM load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFeatures);
} else {
    initFeatures();
}

/**
 * Initialize all non-critical features
 */
function initFeatures() {
    initSmoothScroll();
}

/**
 * Initialize smooth scrolling for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Enhance social links with subtle animations
 */
function enhanceSocialLinks() {
    const socialLinks = document.querySelectorAll('.social-links a');
    
    socialLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            link.style.transform = 'translateY(-2px)';
        });
        
        link.addEventListener('mouseleave', () => {
            link.style.transform = 'translateY(0)';
        });
    });
} 