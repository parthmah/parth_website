// Mock API for local development
// This simulates the Notion API responses when testing locally

class MockAPI {
    constructor() {
        this.isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';
        
        if (this.isLocalhost) {
            this.setupMockEndpoints();
        }
    }

    setupMockEndpoints() {
        console.log('Setting up mock API endpoints for local development');
        
        // Mock reading data
        this.mockReadingData = {
            title: "The Pragmatic Programmer",
            author: "David Thomas & Andrew Hunt",
            url: "https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/",
            coverImage: null,
            lastUpdated: new Date().toISOString()
        };

        // Mock bookshelf data
        this.mockBookshelfData = {
            books: [
                {
                    id: "1",
                    title: "The Pragmatic Programmer",
                    author: "David Thomas & Andrew Hunt",
                    url: "https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/",
                    coverImage: null,
                    status: "Reading",
                    summary: "A comprehensive guide to software development practices and principles.",
                    rating: "Not yet rated",
                    category: "Programming",
                    currentPage: 45,
                    totalPages: 352,
                    dateStarted: "2025-01-15",
                    dateFinished: null,
                    progress: 12.8
                },
                {
                    id: "2",
                    title: "Atomic Habits",
                    author: "James Clear",
                    url: "https://jamesclear.com/atomic-habits",
                    coverImage: null,
                    status: "Completed",
                    summary: "An easy and proven way to build good habits and break bad ones.",
                    rating: "4⭐",
                    category: "Self-Development",
                    currentPage: 320,
                    totalPages: 320,
                    dateStarted: "2024-11-01",
                    dateFinished: "2024-12-15",
                    progress: 100
                },
                {
                    id: "3",
                    title: "Deep Work",
                    author: "Cal Newport",
                    url: "https://calnewport.com/books/deep-work/",
                    coverImage: null,
                    status: "To Read",
                    summary: "Rules for focused success in a distracted world.",
                    rating: "Not yet rated",
                    category: "Productivity",
                    currentPage: null,
                    totalPages: 304,
                    dateStarted: null,
                    dateFinished: null,
                    progress: 0
                }
            ],
            totalBooks: 3,
            lastUpdated: new Date().toISOString()
        };
    }

    // Mock fetch for local development
    async mockFetch(url) {
        console.log('Mock API called:', url);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (url.includes('/api/reading')) {
            return {
                ok: true,
                status: 200,
                json: async () => this.mockReadingData
            };
        } else if (url.includes('/api/bookshelf')) {
            return {
                ok: true,
                status: 200,
                json: async () => this.mockBookshelfData
            };
        }
        
        return {
            ok: false,
            status: 404,
            json: async () => ({ error: 'Not found' })
        };
    }
}

// Initialize mock API if on localhost
const mockAPI = new MockAPI();

// Override fetch for localhost
if (mockAPI.isLocalhost) {
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        if (url.includes('/api/')) {
            return mockAPI.mockFetch(url);
        }
        return originalFetch(url, options);
    };
    console.log('Mock API enabled for local development');
}
