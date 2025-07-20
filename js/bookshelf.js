// bookshelf.js: Fetches and displays all books from Notion database

class BookshelfDisplay {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.apiUrl = '/api/bookshelf';
  }

  async fetchBookshelfData() {
    try {
      const response = await fetch(this.apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
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
    
    if (data && data.books && data.books.length > 0) {
      // Clear loading message
      this.container.innerHTML = '';
      
      // Add all book cards
      data.books.forEach(book => {
        this.container.appendChild(this.createBookCard(book));
      });
    } else {
      this.container.innerHTML = '';
      this.container.appendChild(this.createErrorElement());
    }
  }
}

// Initialize bookshelf display when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const bookshelfGrid = document.getElementById('bookshelf-grid');
  if (bookshelfGrid) {
    const bookshelfDisplay = new BookshelfDisplay('bookshelf-grid');
    bookshelfDisplay.displayBookshelf();
  }
}); 