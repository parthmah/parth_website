// gallery.js: Handles gallery initialization and image loading
async function initGallery() {
    const gallery = document.getElementById('gallery');
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const closeButton = document.getElementById('close-button');
    
    let currentIndex = 0;
    let images = [];

    // Fetch the directory listing
    try {
        const response = await fetch('/images/personal_photos/');
        const text = await response.text();
        
        // Parse the directory listing to find image files
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const links = Array.from(doc.querySelectorAll('a'));
        
        // Filter for image files and create image objects
        images = links
            .map(link => link.href)
            .filter(href => {
                const ext = href.toLowerCase().split('.').pop();
                return ['jpg', 'jpeg', 'png', 'webp'].includes(ext);
            })
            .map(href => ({
                src: href,
                alt: 'Photography by Parth Maheshwari'
            }));

        // Sort images by filename for consistent ordering
        images.sort((a, b) => a.src.localeCompare(b.src));

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