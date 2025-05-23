const fs = require('fs');
const path = require('path');

// Configuration
const PHOTOS_DIR = path.join(__dirname, '..', 'images', 'personal_photos');
const JSON_FILE = path.join(PHOTOS_DIR, 'images.json');
const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.JPG', '.JPEG', '.PNG', '.WEBP'];

// Function to get all image files from directory
function getImageFiles() {
    try {
        const files = fs.readdirSync(PHOTOS_DIR);
        return files
            .filter(file => SUPPORTED_EXTENSIONS.includes(path.extname(file)))
            .sort() // Sort files alphabetically
            .map(file => ({
                src: `/images/personal_photos/${file}`,
                alt: 'Photography by Parth Maheshwari'
            }));
    } catch (error) {
        console.error('Error reading directory:', error);
        process.exit(1);
    }
}

// Function to update the JSON file
function updateJsonFile(images) {
    const jsonContent = {
        images: images
    };

    try {
        fs.writeFileSync(JSON_FILE, JSON.stringify(jsonContent, null, 4));
        console.log(`✅ Successfully updated ${JSON_FILE}`);
        console.log(`📸 Found ${images.length} images`);
    } catch (error) {
        console.error('Error writing JSON file:', error);
        process.exit(1);
    }
}

// Main function
function main() {
    console.log('🔄 Updating gallery images...');
    const images = getImageFiles();
    updateJsonFile(images);
}

// Run the script
main(); 