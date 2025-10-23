// MongoDB script to insert sample image and feed data
// Run this script with: mongosh < insert-sample-data.js

// Connect to the database
use('bharathva_feed');

print('🚀 Starting sample data insertion...');

// Sample user IDs (using existing user IDs from the database)
const user1 = '24436b2a-cb17-4aec-8923-7d4a9fc1f5ca';
const user2 = '9c58dc97-390f-43ed-8950-cdef29930756';

print('📋 Creating sample image metadata...');

// Insert sample image metadata
const image1 = {
    userId: user1,
    originalFileName: 'sample-beach-sunset.jpg',
    storedFileName: 'uuid-beach-sunset-12345.jpg',
    filePath: 'uploads/uuid-beach-sunset-12345.jpg',
    fileSize: 2048576,
    mimeType: 'image/jpeg',
    width: 1920,
    height: 1080,
    createdAt: new Date(),
    updatedAt: new Date(),
    _class: 'com.bharathva.feed.model.ImageMetadata'
};

const image2 = {
    userId: user1,
    originalFileName: 'sample-mountain-landscape.jpg',
    storedFileName: 'uuid-mountain-landscape-67890.jpg',
    filePath: 'uploads/uuid-mountain-landscape-67890.jpg',
    fileSize: 1536000,
    mimeType: 'image/jpeg',
    width: 1280,
    height: 720,
    createdAt: new Date(),
    updatedAt: new Date(),
    _class: 'com.bharathva.feed.model.ImageMetadata'
};

const image3 = {
    userId: user2,
    originalFileName: 'unsplash-nature-forest.jpg',
    storedFileName: 'uuid-unsplash-nature-forest-11111.jpg',
    filePath: 'uploads/uuid-unsplash-nature-forest-11111.jpg',
    fileSize: 3072000,
    mimeType: 'image/jpeg',
    width: 2560,
    height: 1440,
    createdAt: new Date(),
    updatedAt: new Date(),
    _class: 'com.bharathva.feed.model.ImageMetadata'
};

// Insert images
const result1 = db.image_metadata.insertOne(image1);
const result2 = db.image_metadata.insertOne(image2);
const result3 = db.image_metadata.insertOne(image3);

print('✅ Image metadata created successfully:');
print('  - Image 1 ID: ' + result1.insertedId + ' (sample-beach-sunset.jpg)');
print('  - Image 2 ID: ' + result2.insertedId + ' (sample-mountain-landscape.jpg)');
print('  - Image 3 ID: ' + result3.insertedId + ' (unsplash-nature-forest.jpg)');

print('📋 Creating sample feeds with image references...');

// Insert sample feeds with image references
const feed1 = {
    userId: user1,
    message: 'Beautiful sunset at the beach today! 🌅',
    imageIds: [result1.insertedId.toString()],
    createdAt: new Date(),
    updatedAt: new Date(),
    _class: 'com.bharathva.feed.model.Feed'
};

const feed2 = {
    userId: user1,
    message: 'Amazing mountain landscape from my hiking trip 🏔️',
    imageIds: [result2.insertedId.toString()],
    createdAt: new Date(),
    updatedAt: new Date(),
    _class: 'com.bharathva.feed.model.Feed'
};

const feed3 = {
    userId: user2,
    message: 'Peaceful forest walk in nature 🌲',
    imageIds: [result3.insertedId.toString()],
    createdAt: new Date(),
    updatedAt: new Date(),
    _class: 'com.bharathva.feed.model.Feed'
};

const feed4 = {
    userId: user1,
    message: 'Testing text-only post without images',
    imageIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    _class: 'com.bharathva.feed.model.Feed'
};

// Insert feeds
const feedResult1 = db.feeds.insertOne(feed1);
const feedResult2 = db.feeds.insertOne(feed2);
const feedResult3 = db.feeds.insertOne(feed3);
const feedResult4 = db.feeds.insertOne(feed4);

print('✅ Feeds created successfully:');
print('  - Feed 1 ID: ' + feedResult1.insertedId + ' (with 1 image)');
print('  - Feed 2 ID: ' + feedResult2.insertedId + ' (with 1 image)');
print('  - Feed 3 ID: ' + feedResult3.insertedId + ' (with 1 image)');
print('  - Feed 4 ID: ' + feedResult4.insertedId + ' (text only)');

// Verify data
const totalImages = db.image_metadata.countDocuments();
const totalFeeds = db.feeds.countDocuments();
const feedsWithImages = db.feeds.countDocuments({ imageIds: { $exists: true, $ne: [] } });

print('📊 Sample data summary:');
print('  - Total images: ' + totalImages);
print('  - Total feeds: ' + totalFeeds);
print('  - Feeds with images: ' + feedsWithImages);

print('🎉 Sample data insertion completed successfully!');
