// reading.js: Fetches and displays currently reading book from Notion with caching

class ReadingDisplay {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.apiUrl = '/api/reading';
    this.cacheKey = 'reading-cache';
    this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
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
      const response = await fetch(this.apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
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
    if (!this.container) return;

    const cachedData = this.getCachedData();
    
    if (cachedData && cachedData.title) {
      this.container.appendChild(this.createBookElement(cachedData));
    } else {
      this.container.appendChild(this.createFallbackElement());
    }
  }

  // Update with fresh data
  async updateWithFreshData() {
    if (!this.container) return;

    const freshData = await this.fetchReadingData();
    
    if (freshData && freshData.title) {
      // Save to cache
      this.saveToCache(freshData);
      
      // Update the display if it's different from cached
      const cachedData = this.getCachedData();
      if (!cachedData || cachedData.title !== freshData.title) {
        // Clear container and show fresh data
        this.container.innerHTML = '';
        this.container.appendChild(this.createBookElement(freshData));
      }
    }
  }

  async displayReading() {
    if (!this.container) {
      console.error(`Container with id '${this.containerId}' not found`);
      return;
    }

    // Show cached data immediately
    this.displayImmediately();
    
    // Fetch fresh data in the background
    setTimeout(() => {
      this.updateWithFreshData();
    }, 100); // Small delay to ensure immediate display
  }
}

// Initialize reading display when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const readingContainer = document.getElementById('reading-container');
  if (readingContainer) {
    const readingDisplay = new ReadingDisplay('reading-container');
    readingDisplay.displayReading();
  }
}); 