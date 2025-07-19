// reading.js: Fetches and displays currently reading book from Notion

class ReadingDisplay {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.apiUrl = '/api/reading';
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
    bookDiv.innerHTML = `📚 ${bookData.title} by ${bookData.author}(<a href="/bookshelf">Bookshelf</a>)`;
    return bookDiv;
  }

  createFallbackElement() {
    const fallbackDiv = document.createElement('p');
    fallbackDiv.innerHTML = '📚 Fountainhead by Ayn Rand(<a href="/bookshelf">Bookshelf</a>)';
    return fallbackDiv;
  }

  async displayReading() {
    if (!this.container) {
      console.error(`Container with id '${this.containerId}' not found`);
      return;
    }

    const bookData = await this.fetchReadingData();
    
    if (bookData && bookData.title) {
      this.container.appendChild(this.createBookElement(bookData));
    } else {
      this.container.appendChild(this.createFallbackElement());
    }
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