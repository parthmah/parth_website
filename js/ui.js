// ui.js: Handles UI enhancements like smooth scrolling and social link animation
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
    // Add hover effect for notfound-emoji/home-link
    document.querySelectorAll('.notfound-emoji, .home-link').forEach(emoji => {
        emoji.addEventListener('mouseenter', () => {
            emoji.style.transform = 'scale(1.15)';
            emoji.style.transition = 'transform 0.2s';
        });
        emoji.addEventListener('mouseleave', () => {
            emoji.style.transform = 'scale(1)';
        });
    });
}
document.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();
    enhanceSocialLinks();
});