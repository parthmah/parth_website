const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const crypto = require('crypto');

// Configuration
const PHOTOS_DIR = path.join(__dirname, '..', 'images', 'personal_photos');
const JSON_FILE = path.join(PHOTOS_DIR, 'images.json');
const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.JPG', '.JPEG', '.PNG', '.WEBP'];
const CONVERTED_EXTENSION = '.jpg';
const HEIC_EXTENSIONS = ['.heic', '.HEIC'];

// Function to calculate file hash
function calculateFileHash(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(fileBuffer).digest('hex');
}

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

// Function to get all image files in directory
function getAllImageFiles() {
    const files = fs.readdirSync(PHOTOS_DIR);
    return files.filter(file => {
        const filePath = path.join(PHOTOS_DIR, file);
        const ext = path.extname(file).toLowerCase();
        return !fs.statSync(filePath).isDirectory() && 
               file !== 'images.json' && 
               (SUPPORTED_EXTENSIONS.includes(ext) || HEIC_EXTENSIONS.includes(ext));
    });
}

// Function to process all files in directory
async function processFiles() {
    try {
        // Get current state from JSON
        let currentState = {};
        if (fs.existsSync(JSON_FILE)) {
            const jsonContent = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
            currentState = jsonContent.images.reduce((acc, img) => {
                const fileName = path.basename(img.src);
                acc[fileName] = img;
                return acc;
            }, {});
        }

        // Get all current image files
        const allImageFiles = getAllImageFiles();
        const convertedFiles = [];
        const supportedFiles = [];
        const failedFiles = [];
        const newImages = [];
        let hasChanges = false;

        // Process each file
        for (const file of allImageFiles) {
            const filePath = path.join(PHOTOS_DIR, file);
            const ext = path.extname(file).toLowerCase();

            // Check if file is new or modified
            const fileHash = calculateFileHash(filePath);
            const isNewOrModified = !currentState[file] || currentState[file].hash !== fileHash;

            if (isNewOrModified) {
                hasChanges = true;
                if (SUPPORTED_EXTENSIONS.includes(ext)) {
                    supportedFiles.push(file);
                    newImages.push({
                        src: `/images/personal_photos/${file}`,
                        alt: 'Photography by Parth Maheshwari',
                        hash: fileHash
                    });
                } else if (HEIC_EXTENSIONS.includes(ext) || !SUPPORTED_EXTENSIONS.includes(ext)) {
                    // Try to convert unsupported files
                    const convertedPath = await convertToJpg(filePath);
                    if (convertedPath) {
                        const convertedFile = path.basename(convertedPath);
                        convertedFiles.push(convertedFile);
                        newImages.push({
                            src: `/images/personal_photos/${convertedFile}`,
                            alt: 'Photography by Parth Maheshwari',
                            hash: calculateFileHash(convertedPath)
                        });
                    } else {
                        failedFiles.push(file);
                    }
                }
            } else {
                // Keep existing image entry
                newImages.push(currentState[file]);
            }
        }

        // Check for removed files
        const currentFiles = new Set(newImages.map(img => path.basename(img.src)));
        const removedFiles = Object.keys(currentState).filter(file => !currentFiles.has(file));
        
        if (removedFiles.length > 0) {
            hasChanges = true;
            console.log('\n🗑️ Removed files from gallery:');
            removedFiles.forEach(file => console.log(`  - ${file}`));
        }

        // Only update if there are changes
        if (hasChanges) {
            // Sort images by filename
            newImages.sort((a, b) => {
                const nameA = path.basename(a.src);
                const nameB = path.basename(b.src);
                return nameA.localeCompare(nameB);
            });

            // Update JSON file
            const jsonContent = {
                images: newImages,
                lastUpdated: new Date().toISOString(),
                totalImages: newImages.length
            };

            fs.writeFileSync(JSON_FILE, JSON.stringify(jsonContent, null, 4));
            console.log(`\n✅ Successfully updated ${JSON_FILE}`);

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
            console.log(`\n📸 Total images in gallery: ${newImages.length}`);
            return true;
        } else {
            console.log('No changes detected in the gallery.');
            return false;
        }

    } catch (error) {
        console.error('Error processing files:', error);
        process.exit(1);
    }
}

// Main function
async function main() {
    console.log('🔄 Processing gallery images...');
    await processFiles();
    process.exit(0);
}

// Run the script
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
}); 