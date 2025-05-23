// gallery.js: Handles gallery initialization and image loading

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function initGallery() {
    const gallery = document.getElementById('gallery');
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const closeButton = document.getElementById('close-button');
    
    let currentIndex = 0;
    let images = [];

    // Fetch the image list from JSON
    try {
        const response = await fetch('/images/personal_photos/images.json');
        if (!response.ok) throw new Error('Failed to load image list');
        const data = await response.json();
        // Shuffle the images array
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
            updateLightboxImage();
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        function updateLightboxImage() {
            const image = images[currentIndex];
            lightboxImage.src = image.src;
            lightboxImage.alt = image.alt;
        }

        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }

        function navigateGallery(direction) {
            currentIndex = (currentIndex + direction + images.length) % images.length;
            updateLightboxImage();
        }

        // Event listeners
        prevButton.addEventListener('click', () => navigateGallery(-1));
        nextButton.addEventListener('click', () => navigateGallery(1));
        closeButton.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    navigateGallery(-1);
                    break;
                case 'ArrowRight':
                    navigateGallery(1);
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