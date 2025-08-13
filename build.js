#!/usr/bin/env node

/**
 * Build script for personal website optimization
 * This script helps prepare assets for production deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🏗️  Building personal website for production...');

// Function to minify CSS (basic minification)
function minifyCSS(css) {
    return css
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
        .replace(/\s+/g, ' ') // Collapse whitespace
        .replace(/\s*([{}:;,])\s*/g, '$1') // Remove spaces around brackets, colons, semicolons, commas
        .replace(/;\s*}/g, '}') // Remove semicolons before closing braces
        .replace(/\s*{\s*/g, '{') // Remove spaces around opening braces
        .replace(/\s*}\s*/g, '}') // Remove spaces around closing braces
        .trim();
}

// Function to minify JavaScript (basic minification)
function minifyJS(js) {
    return js
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
        .replace(/\/\/.*$/gm, '') // Remove line comments
        .replace(/\s+/g, ' ') // Collapse whitespace
        .replace(/\s*([{}:;,])\s*/g, '$1') // Remove spaces around brackets, colons, semicolons, commas
        .replace(/;\s*}/g, '}') // Remove semicolons before closing braces
        .replace(/\s*{\s*/g, '{') // Remove spaces around opening braces
        .replace(/\s*}\s*/g, '}') // Remove spaces around closing braces
        .trim();
}

// Function to create optimized bundle
function createOptimizedBundle() {
    console.log('📦 Creating optimized JavaScript bundle...');
    
    const bundlePath = path.join(__dirname, 'js', 'bundle.js');
    const bundleContent = fs.readFileSync(bundlePath, 'utf8');
    
    // Create minified version
    const minifiedContent = minifyJS(bundleContent);
    
    // Write minified bundle
    const minifiedPath = path.join(__dirname, 'js', 'bundle.min.js');
    fs.writeFileSync(minifiedPath, minifiedContent);
    
    console.log(`✅ Minified bundle created: ${minifiedPath}`);
    console.log(`📊 Original size: ${(bundleContent.length / 1024).toFixed(2)} KB`);
    console.log(`📊 Minified size: ${(minifiedContent.length / 1024).toFixed(2)} KB`);
    console.log(`📊 Compression: ${((1 - minifiedContent.length / bundleContent.length) * 100).toFixed(1)}%`);
}

// Function to optimize CSS
function optimizeCSS() {
    console.log('🎨 Optimizing CSS files...');
    
    const cssFiles = [
        'styles.css',
        'styles/critical.css',
        'styles/gallery.css'
    ];
    
    cssFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            const minified = minifyCSS(content);
            
            const minifiedPath = filePath.replace('.css', '.min.css');
            fs.writeFileSync(minifiedPath, minified);
            
            console.log(`✅ ${file} optimized: ${(content.length / 1024).toFixed(2)} KB → ${(minified.length / 1024).toFixed(2)} KB`);
        }
    });
}

// Function to generate critical CSS
function generateCriticalCSS() {
    console.log('⚡ Generating critical CSS...');
    
    // This would typically involve analyzing the HTML and extracting above-the-fold styles
    // For now, we'll just copy the critical CSS file
    const criticalPath = path.join(__dirname, 'styles', 'critical.css');
    const criticalContent = fs.readFileSync(criticalPath, 'utf8');
    
    // Create inline version for HTML
    const inlinePath = path.join(__dirname, 'styles', 'critical-inline.css');
    fs.writeFileSync(inlinePath, criticalContent);
    
    console.log(`✅ Critical CSS prepared for inlining`);
}

// Function to analyze bundle size
function analyzeBundle() {
    console.log('📊 Analyzing bundle sizes...');
    
    const jsDir = path.join(__dirname, 'js');
    const jsFiles = fs.readdirSync(jsDir).filter(file => file.endsWith('.js'));
    
    jsFiles.forEach(file => {
        const filePath = path.join(jsDir, file);
        const stats = fs.statSync(filePath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        console.log(`📁 ${file}: ${sizeKB} KB`);
    });
}

// Main build process
function build() {
    try {
        createOptimizedBundle();
        optimizeCSS();
        generateCriticalCSS();
        analyzeBundle();
        
        console.log('\n🎉 Build completed successfully!');
        console.log('\n📋 Next steps:');
        console.log('1. Update HTML files to use .min.js and .min.css files');
        console.log('2. Consider inlining critical CSS for better performance');
        console.log('3. Test the optimized build locally before deployment');
        
    } catch (error) {
        console.error('❌ Build failed:', error.message);
        process.exit(1);
    }
}

// Run build if this script is executed directly
if (require.main === module) {
    build();
}

module.exports = {
    build,
    minifyCSS,
    minifyJS,
    createOptimizedBundle,
    optimizeCSS
};
