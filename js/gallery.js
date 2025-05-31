// gallery.js: Handles gallery initialization and image loading

/**
 * Shuffles an array using the Fisher-Yates algorithm
 * @param {Array} array - The array to shuffle
 * @returns {Array} The shuffled array
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Updates the lightbox image and alt text
 * @param {Object} image - The image object containing src and alt properties
 */
function updateLightboxImage(image) {
    const lightboxImage = document.getElementById('lightbox-image');
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
}

/**
 * Closes the lightbox and restores body scroll
 */
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Navigates through gallery images in the lightbox
 * @param {number} direction - The direction to navigate (-1 for previous, 1 for next)
 * @param {Array} images - The array of image objects
 * @param {number} currentIndex - The current image index
 * @returns {number} The new current index
 */
function navigateGallery(direction, images, currentIndex) {
    return (currentIndex + direction + images.length) % images.length;
}

/**
 * Copies the current image URL to clipboard and shows feedback
 * @param {string} url - The URL to copy
 */
async function copyImageUrl(url) {
    try {
        await navigator.clipboard.writeText(url);
        showShareFeedback('Image link copied!');
    } catch (err) {
        console.error('Failed to copy:', err);
        showShareFeedback('Failed to copy link');
    }
}

/**
 * Shows feedback when sharing
 * @param {string} message - The feedback message
 */
function showShareFeedback(message) {
    const tooltip = document.querySelector('.share-tooltip');
    const originalText = tooltip.textContent;
    
    tooltip.textContent = message;
    tooltip.style.opacity = '1';
    
    setTimeout(() => {
        tooltip.textContent = originalText;
        tooltip.style.opacity = '';
    }, 2000);
}

/**
 * Initializes the photo gallery with lightbox functionality
 */
async function initGallery() {
    const gallery = document.getElementById('gallery');
    const lightbox = document.getElementById('lightbox');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const closeButton = document.getElementById('close-button');
    const shareButton = document.getElementById('share-button');
    
    let currentIndex = 0;
    let images = [];

    try {
        // Fetch the image list from JSON
        const response = await fetch('/images/personal_photos/images.json');
        if (!response.ok) throw new Error('Failed to load image list');
        const data = await response.json();
        images = shuffleArray([...data.images]);

        // Create gallery items
        images.forEach((image, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.innerHTML = `
                <img src="${image.src}" 
                     alt="${image.alt}" 
                     loading="lazy"
                     onload="this.parentElement.classList.add('loaded')"
                     onerror="this.parentElement.classList.add('error')"
                     onclick="openLightbox(${index})">
            `;
            gallery.appendChild(item);
        });

        // Lightbox functions
        window.openLightbox = (index) => {
            currentIndex = index;
            updateLightboxImage(images[currentIndex]);
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Update share button with current image URL
            const currentImageUrl = new URL(images[currentIndex].src, window.location.origin).href;
            shareButton.onclick = () => copyImageUrl(currentImageUrl);
        };

        // Event listeners
        prevButton.addEventListener('click', () => {
            currentIndex = navigateGallery(-1, images, currentIndex);
            updateLightboxImage(images[currentIndex]);
            // Update share button with new image URL
            const currentImageUrl = new URL(images[currentIndex].src, window.location.origin).href;
            shareButton.onclick = () => copyImageUrl(currentImageUrl);
        });

        nextButton.addEventListener('click', () => {
            currentIndex = navigateGallery(1, images, currentIndex);
            updateLightboxImage(images[currentIndex]);
            // Update share button with new image URL
            const currentImageUrl = new URL(images[currentIndex].src, window.location.origin).href;
            shareButton.onclick = () => copyImageUrl(currentImageUrl);
        });

        closeButton.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    currentIndex = navigateGallery(-1, images, currentIndex);
                    updateLightboxImage(images[currentIndex]);
                    break;
                case 'ArrowRight':
                    currentIndex = navigateGallery(1, images, currentIndex);
                    updateLightboxImage(images[currentIndex]);
                    break;
                case 'Escape':
                    closeLightbox();
                    break;
            }
        });

    } catch (error) {
        console.error('Error loading gallery:', error);
        gallery.innerHTML = '<p class="error-message">Failed to load gallery. Please try again later.</p>';
    }
}

// Initialize gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', initGallery); 