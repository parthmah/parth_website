import { shuffleArray, updateLightboxImage, closeLightbox, navigateGallery } from '../gallery';

describe('Gallery Module', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="lightbox">
        <img id="lightbox-image" src="" alt="">
      </div>
    `;
  });

  describe('shuffleArray', () => {
    it('should maintain array length after shuffle', () => {
      const array = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray([...array]);
      expect(shuffled.length).toBe(array.length);
    });

    it('should contain all original elements', () => {
      const array = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray([...array]);
      array.forEach(item => {
        expect(shuffled).toContain(item);
      });
    });
  });

  describe('updateLightboxImage', () => {
    it('should update lightbox image source and alt text', () => {
      const image = {
        src: 'test.jpg',
        alt: 'Test Image'
      };
      
      updateLightboxImage(image);
      const lightboxImage = document.getElementById('lightbox-image');
      
      expect(lightboxImage.src).toContain(image.src);
      expect(lightboxImage.alt).toBe(image.alt);
    });
  });

  describe('closeLightbox', () => {
    it('should remove active class from lightbox', () => {
      const lightbox = document.getElementById('lightbox');
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      closeLightbox();
      
      expect(lightbox.classList.contains('active')).toBe(false);
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('navigateGallery', () => {
    const images = [
      { src: '1.jpg', alt: 'Image 1' },
      { src: '2.jpg', alt: 'Image 2' },
      { src: '3.jpg', alt: 'Image 3' }
    ];

    it('should navigate to next image', () => {
      const currentIndex = 0;
      const newIndex = navigateGallery(1, images, currentIndex);
      expect(newIndex).toBe(1);
    });

    it('should navigate to previous image', () => {
      const currentIndex = 1;
      const newIndex = navigateGallery(-1, images, currentIndex);
      expect(newIndex).toBe(0);
    });

    it('should wrap around to end when going previous from first image', () => {
      const currentIndex = 0;
      const newIndex = navigateGallery(-1, images, currentIndex);
      expect(newIndex).toBe(images.length - 1);
    });

    it('should wrap around to start when going next from last image', () => {
      const currentIndex = images.length - 1;
      const newIndex = navigateGallery(1, images, currentIndex);
      expect(newIndex).toBe(0);
    });
  });
}); 