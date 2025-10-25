package com.bharathva.feed.config;

import com.bharathva.feed.model.Feed;
import com.bharathva.feed.model.ImageMetadata;
import com.bharathva.feed.repository.FeedRepository;
import com.bharathva.feed.repository.ImageMetadataRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;

/**
 * Sample Data Loader - Loads sample data into MongoDB for testing
 * This component runs on application startup and inserts sample image and feed data
 */
@Component
public class SampleDataLoader implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(SampleDataLoader.class);

    @Autowired
    private FeedRepository feedRepository;

    @Autowired
    private ImageMetadataRepository imageMetadataRepository;

    @Value("${feed.migration.sample-data:false}")
    private boolean loadSampleData;

    @Override
    public void run(String... args) throws Exception {
        if (loadSampleData) {
            log.info("🚀 Loading sample data into MongoDB...");
            loadSampleData();
            log.info("✅ Sample data loaded successfully!");
        } else {
            log.info("📋 Sample data loading is disabled. Set feed.migration.sample-data=true to enable.");
        }
    }

    private void loadSampleData() {
        try {
            // Check if sample data already exists
            long existingFeeds = feedRepository.count();
            long existingImages = imageMetadataRepository.count();
            
            if (existingFeeds > 0 || existingImages > 0) {
                log.info("📋 Sample data already exists ({} feeds, {} images). Skipping sample data creation.", 
                        existingFeeds, existingImages);
                return;
            }

            log.info("📋 Creating sample image metadata...");

            // Sample user IDs (using existing user IDs from the database)
            String user1 = "24436b2a-cb17-4aec-8923-7d4a9fc1f5ca";
            String user2 = "9c58dc97-390f-43ed-8950-cdef29930756";

            // Create sample image metadata
            ImageMetadata image1 = new ImageMetadata();
            image1.setUserId(user1);
            image1.setOriginalFileName("sample-beach-sunset.jpg");
            image1.setStoredFileName("uuid-beach-sunset-12345.jpg");
            image1.setFilePath("uploads/uuid-beach-sunset-12345.jpg");
            image1.setFileSize(2048576L); // 2MB
            image1.setMimeType("image/jpeg");
            image1.setWidth(1920);
            image1.setHeight(1080);
            image1.setCreatedAt(LocalDateTime.now());
            image1.setUpdatedAt(LocalDateTime.now());

            ImageMetadata image2 = new ImageMetadata();
            image2.setUserId(user1);
            image2.setOriginalFileName("sample-mountain-landscape.jpg");
            image2.setStoredFileName("uuid-mountain-landscape-67890.jpg");
            image2.setFilePath("uploads/uuid-mountain-landscape-67890.jpg");
            image2.setFileSize(1536000L); // 1.5MB
            image2.setMimeType("image/jpeg");
            image2.setWidth(1280);
            image2.setHeight(720);
            image2.setCreatedAt(LocalDateTime.now());
            image2.setUpdatedAt(LocalDateTime.now());

            ImageMetadata image3 = new ImageMetadata();
            image3.setUserId(user2);
            image3.setOriginalFileName("unsplash-nature-forest.jpg");
            image3.setStoredFileName("uuid-unsplash-nature-forest-11111.jpg");
            image3.setFilePath("uploads/uuid-unsplash-nature-forest-11111.jpg");
            image3.setFileSize(3072000L); // 3MB
            image3.setMimeType("image/jpeg");
            image3.setWidth(2560);
            image3.setHeight(1440);
            image3.setCreatedAt(LocalDateTime.now());
            image3.setUpdatedAt(LocalDateTime.now());

            // Save image metadata to MongoDB
            ImageMetadata savedImage1 = imageMetadataRepository.save(image1);
            ImageMetadata savedImage2 = imageMetadataRepository.save(image2);
            ImageMetadata savedImage3 = imageMetadataRepository.save(image3);

            log.info("✅ Image metadata created successfully:");
            log.info("  - Image 1 ID: {} ({})", savedImage1.getId(), savedImage1.getOriginalFileName());
            log.info("  - Image 2 ID: {} ({})", savedImage2.getId(), savedImage2.getOriginalFileName());
            log.info("  - Image 3 ID: {} ({})", savedImage3.getId(), savedImage3.getOriginalFileName());

            log.info("📋 Creating sample feeds with image references...");

            // Create sample feeds with image references
            Feed feed1 = new Feed();
            feed1.setUserId(user1);
            feed1.setMessage("Beautiful sunset at the beach today! 🌅");
            feed1.setImageUrls(Arrays.asList("https://res.cloudinary.com/dqmryiyhz/image/upload/v1234567890/sample-beach-sunset.jpg"));
            feed1.setCreatedAt(LocalDateTime.now());
            feed1.setUpdatedAt(LocalDateTime.now());

            Feed feed2 = new Feed();
            feed2.setUserId(user1);
            feed2.setMessage("Amazing mountain landscape from my hiking trip 🏔️");
            feed2.setImageUrls(Arrays.asList("https://res.cloudinary.com/dqmryiyhz/image/upload/v1234567890/sample-mountain-landscape.jpg"));
            feed2.setCreatedAt(LocalDateTime.now());
            feed2.setUpdatedAt(LocalDateTime.now());

            Feed feed3 = new Feed();
            feed3.setUserId(user2);
            feed3.setMessage("Peaceful forest walk in nature 🌲");
            feed3.setImageUrls(Arrays.asList("https://res.cloudinary.com/dqmryiyhz/image/upload/v1234567890/unsplash-nature-forest.jpg"));
            feed3.setCreatedAt(LocalDateTime.now());
            feed3.setUpdatedAt(LocalDateTime.now());

            Feed feed4 = new Feed();
            feed4.setUserId(user1);
            feed4.setMessage("Testing text-only post without images");
            feed4.setImageUrls(Arrays.asList()); // Empty image list
            feed4.setCreatedAt(LocalDateTime.now());
            feed4.setUpdatedAt(LocalDateTime.now());

            // Save feeds to MongoDB
            Feed savedFeed1 = feedRepository.save(feed1);
            Feed savedFeed2 = feedRepository.save(feed2);
            Feed savedFeed3 = feedRepository.save(feed3);
            Feed savedFeed4 = feedRepository.save(feed4);

            log.info("✅ Feeds created successfully:");
            log.info("  - Feed 1 ID: {} (with 1 image)", savedFeed1.getId());
            log.info("  - Feed 2 ID: {} (with 1 image)", savedFeed2.getId());
            log.info("  - Feed 3 ID: {} (with 1 image)", savedFeed3.getId());
            log.info("  - Feed 4 ID: {} (text only)", savedFeed4.getId());

            // Verify data
            long totalImages = imageMetadataRepository.count();
            long totalFeeds = feedRepository.count();
            long feedsWithImages = feedRepository.findAll().stream()
                    .filter(feed -> feed.getImageUrls() != null && !feed.getImageUrls().isEmpty())
                    .count();

            log.info("📊 Sample data summary:");
            log.info("  - Total images: {}", totalImages);
            log.info("  - Total feeds: {}", totalFeeds);
            log.info("  - Feeds with images: {}", feedsWithImages);

        } catch (Exception e) {
            log.error("❌ Error loading sample data: {}", e.getMessage(), e);
            throw e;
        }
    }
}
