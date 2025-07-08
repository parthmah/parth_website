# Personal Website

A minimalist, responsive personal website built with HTML, CSS, and JavaScript.

## 🚀 Features

- Responsive design with dark/light theme support
- Photo gallery with lazy loading and lightbox
- Component-based architecture
- SEO optimized
- Minimal dependencies

## 🛠️ Development

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/parthmah/personal_website.git
   cd personal_website
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start local development:
   ```bash
   # Use any static file server, for example:
   npx serve
   ```

### Project Structure

```
personal_website/
├── components/     # Reusable HTML components
├── js/            # JavaScript modules
├── images/        # Image assets
│   └── personal_photos/  # Gallery images
├── fav/           # Favicon and PWA assets
└── styles.css     # Global styles
```

### Key Commands

- `npm run update-gallery`: Update the photo gallery
- `npm run build`: Build for production (if implemented)
