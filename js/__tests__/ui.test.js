import { initSmoothScroll, addHoverEffect, initHoverEffects } from '../ui';

describe('UI Module', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <a href="#test">Test Link</a>
      <div id="test">Test Section</div>
      <div class="social-links">
        <a href="#">Social Link 1</a>
        <a href="#">Social Link 2</a>
      </div>
      <div class="notfound-emoji">😊</div>
      <a class="home-link">Home</a>
    `;
  });

  describe('initSmoothScroll', () => {
    it('should prevent default anchor click behavior', () => {
      const anchor = document.querySelector('a[href="#test"]');
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true
      });
      
      anchor.addEventListener('click', (e) => {
        expect(e.defaultPrevented).toBe(true);
      });
      
      anchor.dispatchEvent(clickEvent);
    });
  });

  describe('addHoverEffect', () => {
    it('should add hover effect to element', () => {
      const element = document.createElement('div');
      const options = {
        transform: 'translateY(-5px)',
        transition: 'transform 0.3s'
      };

      addHoverEffect(element, options);
      
      // Test mouseenter
      element.dispatchEvent(new MouseEvent('mouseenter'));
      expect(element.style.transform).toBe(options.transform);
      
      // Test mouseleave
      element.dispatchEvent(new MouseEvent('mouseleave'));
      expect(element.style.transform).toBe('none');
    });
  });

  describe('initHoverEffects', () => {
    it('should initialize hover effects for social links and emoji elements', () => {
      initHoverEffects();
      
      const socialLinks = document.querySelectorAll('.social-links a');
      const emojiElements = document.querySelectorAll('.notfound-emoji, .home-link');
      
      socialLinks.forEach(link => {
        expect(link.style.transition).toBeTruthy();
      });
      
      emojiElements.forEach(emoji => {
        expect(emoji.style.transition).toBeTruthy();
      });
    });
  });
}); 