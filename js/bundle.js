// Bundled JavaScript for improved performance
// Combines: ui.js, monitoring.js, reading.js, and bookshelf.js functionality

// ========== UI MODULE ==========
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

// ========== MONITORING MODULE ==========
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.init();
    }

    init() {
        // Wait for window load
        window.addEventListener('load', () => {
            this.measurePerformance();
            this.observePerformance();
        });
    }

    measurePerformance() {
        // Core Web Vitals
        this.metrics.LCP = this.getLargestContentfulPaint();
        this.metrics.FID = this.getFirstInputDelay();
        this.metrics.CLS = this.getCumulativeLayoutShift();

        // Additional metrics
        this.metrics.FCP = this.getFirstContentfulPaint();
        this.metrics.TTFB = this.getTimeToFirstByte();
        
        // Use modern Performance API
        if (performance.timing) {
            this.metrics.DOMContentLoaded = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
            this.metrics.WindowLoad = performance.timing.loadEventEnd - performance.timing.navigationStart;
        }

        // Log metrics
        this.logMetrics();
    }

    getLargestContentfulPaint() {
        return new Promise(resolve => {
            if ('PerformanceObserver' in window) {
                new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    resolve(lastEntry.startTime);
                }).observe({ entryTypes: ['largest-contentful-paint'] });
            } else {
                resolve(null);
            }
        });
    }

    getFirstInputDelay() {
        return new Promise(resolve => {
            if ('PerformanceObserver' in window) {
                new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    entries.forEach(entry => {
                        if (entry.interactionId) {
                            resolve(entry.duration);
                        }
                    });
                }).observe({ entryTypes: ['first-input'] });
            } else {
                resolve(null);
            }
        });
    }

    getCumulativeLayoutShift() {
        return new Promise(resolve => {
            if ('PerformanceObserver' in window) {
                let cls = 0;
                new PerformanceObserver((entryList) => {
                    for (const entry of entryList.getEntries()) {
                        if (!entry.hadRecentInput) {
                            cls += entry.value;
                        }
                    }
                    resolve(cls);
                }).observe({ entryTypes: ['layout-shift'] });
            } else {
                resolve(null);
            }
        });
    }

    getFirstContentfulPaint() {
        if ('PerformanceObserver' in window) {
            const fcp = performance.getEntriesByType('paint')
                .find(entry => entry.name === 'first-contentful-paint');
            return fcp ? fcp.startTime : null;
        }
        return null;
    }

    getTimeToFirstByte() {
        if (performance.timing) {
            return performance.timing.responseStart - performance.timing.navigationStart;
        }
        return null;
    }

    observePerformance() {
        if ('PerformanceObserver' in window) {
            // Observe resource timing
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.initiatorType === 'img') {
                        this.logImageLoadTime(entry);
                    }
                }
            });

            observer.observe({ entryTypes: ['resource'] });
        }
    }

    logImageLoadTime(entry) {
        const loadTime = entry.duration;
        if (loadTime > 1000) { // Log slow images (>1s)
            console.warn(`Slow image load: ${entry.name} (${loadTime.toFixed(2)}ms)`);
        }
    }

    logMetrics() {
        console.log('Performance Metrics:', this.metrics);
        
        // Send to analytics if available
        if (typeof gtag !== 'undefined') {
            Object.entries(this.metrics).forEach(([key, value]) => {
                if (value !== null) {
                    gtag('event', 'performance_metric', {
                        metric_name: key,
                        value: Math.round(value)
                    });
                }
            });
        }
    }
}

// ========== READING MODULE ==========
class ReadingDisplay {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.apiUrl = '/api/reading';
        this.cacheKey = 'reading-cache';
        this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
        console.log('ReadingDisplay initialized for container:', containerId);
    }

    // Get cached data
    getCachedData() {
        try {
            const cached = localStorage.getItem(this.cacheKey);
            if (!cached) return null;
            
            const { data, timestamp } = JSON.parse(cached);
            const now = Date.now();
            
            // Check if cache is still valid
            if (now - timestamp < this.cacheExpiry) {
                return data;
            }
            
            // Cache expired, remove it
            localStorage.removeItem(this.cacheKey);
            return null;
        } catch (error) {
            console.error('Error reading cache:', error);
            return null;
        }
    }

    // Save data to cache
    saveToCache(data) {
        try {
            const cacheData = {
                data,
                timestamp: Date.now()
            };
            localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
        } catch (error) {
            console.error('Error saving to cache:', error);
        }
    }

    async fetchReadingData() {
        try {
            console.log('Fetching reading data from:', this.apiUrl);
            const response = await fetch(this.apiUrl);
            console.log('Reading API response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Reading API data received:', data);
            return data;
        } catch (error) {
            console.error('Error fetching reading data:', error);
            return null;
        }
    }

    createBookElement(bookData) {
        const bookDiv = document.createElement('p');
        bookDiv.innerHTML = `📚 ${bookData.title} by ${bookData.author} (<a href="/bookshelf">Bookshelf</a>)`;
        return bookDiv;
    }

    createFallbackElement() {
        const fallbackDiv = document.createElement('p');
        fallbackDiv.innerHTML = '📚 Fountainhead by Ayn Rand (<a href="/bookshelf">Bookshelf</a>)';
        return fallbackDiv;
    }

    // Display content immediately with cached data
    displayImmediately() {
        if (!this.container) {
            console.error('Reading container not found:', this.containerId);
            return;
        }

        const cachedData = this.getCachedData();
        console.log('Cached reading data:', cachedData);
        
        if (cachedData && cachedData.title) {
            // Clear existing content and show cached data
            this.container.innerHTML = '';
            this.container.appendChild(this.createBookElement(cachedData));
            console.log('Displayed cached reading data');
        } else {
            console.log('No cached data, keeping fallback content');
        }
        // If no cached data, keep the fallback content that's already in HTML
    }

    // Update with fresh data
    async updateWithFreshData() {
        if (!this.container) {
            console.error('Reading container not found for update:', this.containerId);
            return;
        }

        console.log('Updating reading display with fresh data...');
        const freshData = await this.fetchReadingData();
        
        if (freshData && freshData.title) {
            // Save to cache
            this.saveToCache(freshData);
            
            // Always update the display with fresh data
            this.container.innerHTML = '';
            this.container.appendChild(this.createBookElement(freshData));
            console.log('Updated reading display with fresh data');
        } else {
            console.log('No fresh data received, keeping current content');
        }
    }
}

// ========== BOOKSHELF MODULE ==========
class BookshelfDisplay {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.apiUrl = '/api/bookshelf';
        console.log('BookshelfDisplay initialized for container:', containerId);
    }

    async fetchBookshelfData() {
        try {
            console.log('Fetching bookshelf data from:', this.apiUrl);
            const response = await fetch(this.apiUrl);
            console.log('Bookshelf API response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Bookshelf API data received:', data);
            return data;
        } catch (error) {
            console.error('Error fetching bookshelf data:', error);
            return null;
        }
    }

    createBookCard(book) {
        const card = document.createElement('div');
        card.className = 'book-card';
        
        // Create cover image or placeholder
        const coverHtml = book.coverImage 
            ? `<img src="${book.coverImage}" alt="Cover of ${book.title}" loading="lazy">`
            : '<div class="book-cover-placeholder">📚</div>';
        
        // Create status class
        const statusClass = book.status.toLowerCase().replace(/\s+/g, '');
        
        // Create rating display with stars
        let ratingDisplay = '';
        if (book.rating && book.rating !== 'Not yet rated') {
            if (book.rating.includes('⭐')) {
                ratingDisplay = book.rating;
            } else {
                const ratingNum = parseInt(book.rating.split('⭐')[0]) || parseInt(book.rating);
                if (ratingNum && ratingNum > 0) {
                    const stars = '★'.repeat(ratingNum) + '☆'.repeat(5 - ratingNum);
                    ratingDisplay = `<span class="rating-stars">${stars}</span>`;
                } else {
                    ratingDisplay = book.rating;
                }
            }
        }
        
        // Use summary directly without "My thoughts:" prefix
        const summaryText = book.summary || '';
        
        card.innerHTML = `
            <div class="book-cover">
                ${coverHtml}
            </div>
            <div class="book-info">
                <div class="book-content">
                    <p class="book-author">${book.author}</p>
                    <h3 class="book-title">${book.title}</h3>
                    ${summaryText ? `<p class="book-summary">${summaryText}</p>` : ''}
                </div>
                <div class="book-meta">
                    <span class="book-status ${statusClass}">${book.status}</span>
                    ${ratingDisplay ? `<span class="book-rating">${ratingDisplay}</span>` : ''}
                </div>
            </div>
        `;
        
        // Add click handler to open book link if available
        if (book.url) {
            const coverElement = card.querySelector('.book-cover');
            coverElement.style.cursor = 'pointer';
            coverElement.addEventListener('click', () => {
                window.open(book.url, '_blank', 'noopener,noreferrer');
            });
        }
        
        return card;
    }

    createErrorElement() {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.innerHTML = `
            <h3>Failed to load bookshelf</h3>
            <p>Please try refreshing the page or check back later.</p>
        `;
        return errorDiv;
    }

    async displayBookshelf() {
        if (!this.container) {
            console.error(`Container with id '${this.containerId}' not found`);
            return;
        }

        const data = await this.fetchBookshelfData();
        
        if (!data || !data.books) {
            this.container.appendChild(this.createErrorElement());
            return;
        }

        // Clear container
        this.container.innerHTML = '';

        // Add books
        data.books.forEach(book => {
            const bookCard = this.createBookCard(book);
            this.container.appendChild(bookCard);
        });
    }
}

// ========== INITIALIZATION ==========
// Initialize performance monitoring
const performanceMonitor = new PerformanceMonitor();

// Export functions for use in other scripts
window.initSmoothScroll = initSmoothScroll;
window.initHoverEffects = initHoverEffects;
window.ReadingDisplay = ReadingDisplay;
window.BookshelfDisplay = BookshelfDisplay;

console.log('Bundle.js loaded successfully');
console.log('Available classes:', {
    ReadingDisplay: typeof ReadingDisplay,
    BookshelfDisplay: typeof BookshelfDisplay,
    initHoverEffects: typeof initHoverEffects,
    initSmoothScroll: typeof initSmoothScroll
});
