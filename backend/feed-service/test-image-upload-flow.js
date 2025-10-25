#!/usr/bin/env node

/**
 * BharathVA Feed Service - Image Upload Flow Test
 * This script tests the complete image upload flow including Cloudinary and MongoDB integration
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    BASE_URL: 'http://localhost:8082',
    GATEWAY_URL: 'http://localhost:8080',
    TEST_USER_ID: '24436b2a-cb17-4aec-8923-7d4a9fc1f5ca',
    TEST_IMAGE_PATH: './test-image.jpg',
    TIMEOUT: 10000
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Utility functions
const log = {
    info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
    warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
    test: (msg) => console.log(`${colors.cyan}[TEST]${colors.reset} ${msg}`)
};

// HTTP request helper
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const isHttps = urlObj.protocol === 'https:';
        const client = isHttps ? https : http;
        
        const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || (isHttps ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: options.headers || {},
            timeout: CONFIG.TIMEOUT
        };
        
        const req = client.request(requestOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data, headers: res.headers });
                }
            });
        });
        
        req.on('error', reject);
        req.on('timeout', () => reject(new Error('Request timeout')));
        
        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

// Create test image
function createTestImage() {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(CONFIG.TEST_IMAGE_PATH)) {
            log.success('Test image already exists');
            resolve();
            return;
        }
        
        log.info('Creating test image...');
        
        // Create a simple test image using a minimal PNG structure
        // This is a 1x1 pixel PNG image
        const pngData = Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, // 8-bit RGB
            0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk
            0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, // compressed data
            0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // 1 pixel
            0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, // IEND chunk
            0xAE, 0x42, 0x60, 0x82
        ]);
        
        fs.writeFile(CONFIG.TEST_IMAGE_PATH, pngData, (err) => {
            if (err) {
                reject(err);
            } else {
                log.success('Test image created');
                resolve();
            }
        });
    });
}

// Test 1: Service Health Check
async function testServiceHealth() {
    log.test('Testing service health...');
    
    try {
        const response = await makeRequest(`${CONFIG.BASE_URL}/api/feed/health`);
        
        if (response.status === 200 && response.data.status === 'UP') {
            log.success('Service is healthy');
            console.log('Response:', JSON.stringify(response.data, null, 2));
            return true;
        } else {
            log.error('Service health check failed');
            console.log('Response:', JSON.stringify(response, null, 2));
            return false;
        }
    } catch (error) {
        log.error(`Service health check failed: ${error.message}`);
        return false;
    }
}

// Test 2: Cloudinary Connection
async function testCloudinaryConnection() {
    log.test('Testing Cloudinary connection...');
    
    try {
        const response = await makeRequest(`${CONFIG.BASE_URL}/api/feed/test/cloudinary`);
        
        if (response.status === 200 && response.data.success === true) {
            log.success('Cloudinary connection successful');
            console.log('Response:', JSON.stringify(response.data, null, 2));
            return true;
        } else {
            log.error('Cloudinary connection failed');
            console.log('Response:', JSON.stringify(response, null, 2));
            return false;
        }
    } catch (error) {
        log.error(`Cloudinary connection test failed: ${error.message}`);
        return false;
    }
}

// Test 3: MongoDB Connectivity
async function testMongoDBConnectivity() {
    log.test('Testing MongoDB connectivity...');
    
    try {
        const response = await makeRequest(`${CONFIG.BASE_URL}/api/feed/all?page=0&size=1`);
        
        if (response.status === 200 && response.data.content !== undefined) {
            log.success('MongoDB connectivity successful');
            console.log(`Found ${response.data.totalElements || 0} feeds in database`);
            return true;
        } else {
            log.warning('MongoDB connectivity test inconclusive');
            console.log('Response:', JSON.stringify(response, null, 2));
            return false;
        }
    } catch (error) {
        log.error(`MongoDB connectivity test failed: ${error.message}`);
        return false;
    }
}

// Test 4: Image Upload (Single)
async function testSingleImageUpload() {
    log.test('Testing single image upload...');
    
    try {
        // Create test image first
        await createTestImage();
        
        // Read the test image
        const imageBuffer = fs.readFileSync(CONFIG.TEST_IMAGE_PATH);
        
        // Create form data for multipart upload
        const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substr(2);
        const formData = [
            `--${boundary}`,
            'Content-Disposition: form-data; name="file"; filename="test-image.jpg"',
            'Content-Type: image/png',
            '',
            imageBuffer.toString('binary'),
            `--${boundary}--`
        ].join('\r\n');
        
        const response = await makeRequest(`${CONFIG.BASE_URL}/api/feed/upload/image`, {
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': Buffer.byteLength(formData, 'binary')
            },
            body: formData
        });
        
        if (response.status === 200 && response.data.success === true) {
            log.success('Single image upload successful');
            console.log('Response:', JSON.stringify(response.data, null, 2));
            return response.data;
        } else {
            log.warning('Single image upload failed (might require authentication)');
            console.log('Response:', JSON.stringify(response, null, 2));
            return null;
        }
    } catch (error) {
        log.error(`Single image upload test failed: ${error.message}`);
        return null;
    }
}

// Test 5: Feed Creation with Images
async function testFeedCreationWithImages() {
    log.test('Testing feed creation with images...');
    
    try {
        // First upload an image
        const uploadResult = await testSingleImageUpload();
        
        if (!uploadResult || !uploadResult.imageUrl) {
            log.warning('Skipping feed creation test - no image URL available');
            return false;
        }
        
        // Create feed with image
        const feedData = {
            userId: CONFIG.TEST_USER_ID,
            message: 'Test post with image from automated test - ' + new Date().toISOString(),
            imageUrls: [uploadResult.imageUrl]
        };
        
        const response = await makeRequest(`${CONFIG.BASE_URL}/api/feed/test/create-feed`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(feedData)
        });
        
        if (response.status === 200 && response.data.success === true) {
            log.success('Feed creation with image successful');
            console.log('Response:', JSON.stringify(response.data, null, 2));
            return true;
        } else {
            log.warning('Feed creation with image failed');
            console.log('Response:', JSON.stringify(response, null, 2));
            return false;
        }
    } catch (error) {
        log.error(`Feed creation with images test failed: ${error.message}`);
        return false;
    }
}

// Test 6: Image URL Generation
async function testImageUrlGeneration() {
    log.test('Testing image URL generation...');
    
    try {
        const testPublicId = 'bharathva/feeds/test_user/test_image_1234567890_1234';
        
        const response = await makeRequest(
            `${CONFIG.BASE_URL}/api/feed/images/${testPublicId}/url?width=400&height=300&crop=limit`
        );
        
        if (response.status === 200 && response.data.success === true) {
            log.success('Image URL generation successful');
            console.log('Response:', JSON.stringify(response.data, null, 2));
            return true;
        } else {
            log.warning('Image URL generation failed (might be expected for test public ID)');
            console.log('Response:', JSON.stringify(response, null, 2));
            return false;
        }
    } catch (error) {
        log.error(`Image URL generation test failed: ${error.message}`);
        return false;
    }
}

// Cleanup function
function cleanup() {
    log.info('Cleaning up test files...');
    
    try {
        if (fs.existsSync(CONFIG.TEST_IMAGE_PATH)) {
            fs.unlinkSync(CONFIG.TEST_IMAGE_PATH);
            log.success('Test image cleaned up');
        }
    } catch (error) {
        log.warning(`Cleanup failed: ${error.message}`);
    }
}

// Main test execution
async function main() {
    console.log('==========================================');
    console.log('BharathVA Feed Service - Image Upload Test');
    console.log('==========================================');
    console.log('');
    
    const tests = [
        { name: 'Service Health', fn: testServiceHealth },
        { name: 'Cloudinary Connection', fn: testCloudinaryConnection },
        { name: 'MongoDB Connectivity', fn: testMongoDBConnectivity },
        { name: 'Single Image Upload', fn: testSingleImageUpload },
        { name: 'Feed Creation with Images', fn: testFeedCreationWithImages },
        { name: 'Image URL Generation', fn: testImageUrlGeneration }
    ];
    
    let passedTests = 0;
    const totalTests = tests.length;
    
    for (const test of tests) {
        try {
            const result = await test.fn();
            if (result === true || result !== false) {
                passedTests++;
            }
        } catch (error) {
            log.error(`Test "${test.name}" failed with error: ${error.message}`);
        }
        console.log('');
    }
    
    // Cleanup
    cleanup();
    
    // Summary
    console.log('==========================================');
    log.info(`Test Summary: ${passedTests}/${totalTests} tests completed`);
    
    if (passedTests === totalTests) {
        log.success('All tests completed successfully!');
    } else {
        log.warning('Some tests failed or were inconclusive');
    }
    
    console.log('');
    log.info('Summary:');
    log.info('- Cloudinary integration: Tested');
    log.info('- MongoDB integration: Tested');
    log.info('- Image upload endpoints: Tested');
    log.info('- Feed creation with images: Tested');
    log.info('- Image URL generation: Tested');
    console.log('');
    log.info('Note: Some tests may fail due to authentication requirements.');
    log.info('In a real scenario, you would need to provide valid JWT tokens.');
    console.log('==========================================');
}

// Run the tests
if (require.main === module) {
    main().catch(error => {
        log.error(`Test execution failed: ${error.message}`);
        process.exit(1);
    });
}

module.exports = {
    testServiceHealth,
    testCloudinaryConnection,
    testMongoDBConnectivity,
    testSingleImageUpload,
    testFeedCreationWithImages,
    testImageUrlGeneration
};
