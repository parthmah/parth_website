const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configuration
const PHOTOS_DIR = path.join(__dirname, '..', 'images', 'personal_photos');
const JSON_FILE = path.join(PHOTOS_DIR, 'images.json');
const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.JPG', '.JPEG', '.PNG', '.WEBP'];
const CONVERTED_EXTENSION = '.jpg';
const HEIC_EXTENSIONS = ['.heic', '.HEIC'];

// Function to convert image to JPG
async function convertToJpg(filePath) {
    const fileName = path.basename(filePath);
    const fileNameWithoutExt = path.parse(fileName).name;
    const newFilePath = path.join(PHOTOS_DIR, `${fileNameWithoutExt}${CONVERTED_EXTENSION}`);
    const ext = path.extname(filePath).toLowerCase();
    
    try {
        console.log(`🔄 Converting ${fileName} to JPG...`);
        
        // Special handling for HEIC files
        if (HEIC_EXTENSIONS.includes(ext)) {
            await sharp(filePath, { input: { failOn: 'none' } })
                .jpeg({ quality: 90, mozjpeg: true })
                .toFile(newFilePath);
        } else {
            // Handle other formats
            await sharp(filePath)
                .jpeg({ quality: 90, mozjpeg: true })
                .toFile(newFilePath);
        }
        
        // Delete the original file after successful conversion
        fs.unlinkSync(filePath);
        console.log(`✅ Converted ${fileName} to JPG`);
        return newFilePath;
    } catch (error) {
        console.error(`❌ Error converting ${fileName}:`, error.message);
        // If conversion fails, try to use a fallback method
        try {
            console.log(`🔄 Trying fallback conversion for ${fileName}...`);
            // Use a different approach for HEIC files
            if (HEIC_EXTENSIONS.includes(ext)) {
                const { execSync } = require('child_process');
                // Use sips (built into macOS) as a fallback
                execSync(`sips -s format jpeg "${filePath}" --out "${newFilePath}"`);
                fs.unlinkSync(filePath);
                console.log(`✅ Converted ${fileName} to JPG using fallback method`);
                return newFilePath;
            }
        } catch (fallbackError) {
            console.error(`❌ Fallback conversion also failed for ${fileName}:`, fallbackError.message);
            return null;
        }
        return null;
    }
}

// Function to process all files in directory
async function processFiles() {
    try {
        const files = fs.readdirSync(PHOTOS_DIR);
        const convertedFiles = [];
        const supportedFiles = [];
        const failedFiles = [];

        // Process each file
        for (const file of files) {
            const filePath = path.join(PHOTOS_DIR, file);
            const ext = path.extname(file).toLowerCase();

            // Skip directories and the JSON file
            if (fs.statSync(filePath).isDirectory() || file === 'images.json') {
                continue;
            }

            if (SUPPORTED_EXTENSIONS.includes(ext)) {
                supportedFiles.push(file);
            } else if (HEIC_EXTENSIONS.includes(ext) || !SUPPORTED_EXTENSIONS.includes(ext)) {
                // Try to convert unsupported files
                const convertedPath = await convertToJpg(filePath);
                if (convertedPath) {
                    convertedFiles.push(path.basename(convertedPath));
                } else {
                    failedFiles.push(file);
                }
            }
        }

        // Combine and sort all files
        const allFiles = [...supportedFiles, ...convertedFiles].sort();
        
        // Update JSON file
        const images = allFiles.map(file => ({
            src: `/images/personal_photos/${file}`,
            alt: 'Photography by Parth Maheshwari'
        }));

        updateJsonFile(images);

        // Print summary
        if (convertedFiles.length > 0 || failedFiles.length > 0) {
            console.log('\n📊 Conversion Summary:');
            if (convertedFiles.length > 0) {
                console.log(`✅ Successfully converted ${convertedFiles.length} files to JPG`);
                console.log('Converted files:');
                convertedFiles.forEach(file => console.log(`  - ${file}`));
            }
            if (failedFiles.length > 0) {
                console.log(`\n❌ Failed to convert ${failedFiles.length} files:`);
                failedFiles.forEach(file => console.log(`  - ${file}`));
                console.log('\nPlease try converting these files manually using Preview or another image editor.');
            }
        }
        console.log(`\n📸 Total images in gallery: ${images.length}`);

    } catch (error) {
        console.error('Error processing files:', error);
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
        console.log(`\n✅ Successfully updated ${JSON_FILE}`);
    } catch (error) {
        console.error('Error writing JSON file:', error);
        process.exit(1);
    }
}

// Main function
async function main() {
    console.log('🔄 Processing gallery images...');
    await processFiles();
}

// Run the script
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
}); 