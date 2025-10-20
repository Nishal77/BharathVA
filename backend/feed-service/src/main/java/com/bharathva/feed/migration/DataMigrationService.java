package com.bharathva.feed.migration;

import com.bharathva.feed.model.Feed;
import com.bharathva.feed.model.FeedType;
import com.bharathva.feed.model.MediaContent;
import com.bharathva.feed.model.MediaItem;
import com.bharathva.feed.repository.FeedRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class DataMigrationService implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataMigrationService.class);

    @Autowired
    private FeedRepository feedRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting data migration to MongoDB...");
        
        try {
            // Check if data already exists
            long existingCount = feedRepository.count();
            if (existingCount > 0) {
                log.info("Data already exists in MongoDB. Count: {}", existingCount);
                return;
            }

            // Create sample feeds
            createSampleFeeds();
            
            log.info("Data migration completed successfully!");
            
        } catch (Exception e) {
            log.error("Error during data migration: {}", e.getMessage(), e);
        }
    }

    private void createSampleFeeds() {
        log.info("Creating sample feeds...");

        // Sample User 1 - Nishal Poojary
        String userId1 = "bc9c9187-844b-42b3-b29e-928d99f57655";
        String username1 = "nishalp6";
        String fullName1 = "Nishal N P";

        // Sample User 2 - Test User
        String userId2 = "test-user-123";
        String username2 = "testuser";
        String fullName2 = "Test User";

        // Create sample feeds
        List<Feed> sampleFeeds = Arrays.asList(
            // Feed 1 - Welcome message
            createFeed(
                userId1, username1, fullName1,
                "Welcome to BharathVA! The Voice of India is here to connect millions of voices across our diverse nation. 🇮🇳 #BharathVA #VoiceOfIndia",
                Arrays.asList("🇮🇳", "🎉", "💪"),
                null,
                FeedType.ORIGINAL
            ),

            // Feed 2 - Technology post
            createFeed(
                userId1, username1, fullName1,
                "Building the next generation social platform for India! Excited to see how technology can bring our communities closer together. #TechForIndia #Innovation",
                Arrays.asList("🚀", "💻", "🌟"),
                createMediaContent("single", Arrays.asList(
                    createMediaItem("tech-image-1", "image", "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500", "Technology innovation")
                )),
                FeedType.ORIGINAL
            ),

            // Feed 3 - Thread starter
            createFeed(
                userId1, username1, fullName1,
                "Thread: Why India needs its own social media platform 🧵\n\n1. Cultural context matters\n2. Language diversity support\n3. Local content discovery\n4. Privacy-first approach",
                Arrays.asList("🧵", "💭", "📱"),
                null,
                FeedType.ORIGINAL
            ),

            // Feed 4 - Reply to thread
            createFeed(
                userId2, username2, fullName2,
                "Great points! I especially agree with the language diversity aspect. We have 22 official languages and hundreds of dialects. A platform that truly supports this would be revolutionary.",
                Arrays.asList("👍", "💯"),
                null,
                FeedType.REPLY
            ),

            // Feed 5 - Media post
            createFeed(
                userId1, username1, fullName1,
                "Beautiful sunset from my hometown! Sometimes the best inspiration comes from the simple moments. #Sunset #India #Inspiration",
                Arrays.asList("🌅", "❤️", "✨"),
                createMediaContent("grid", Arrays.asList(
                    createMediaItem("sunset-1", "image", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300", "Sunset view 1"),
                    createMediaItem("sunset-2", "image", "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=300", "Sunset view 2"),
                    createMediaItem("sunset-3", "image", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300", "Sunset view 3"),
                    createMediaItem("sunset-4", "image", "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=300", "Sunset view 4")
                )),
                FeedType.ORIGINAL
            ),

            // Feed 6 - Quote tweet
            createFeed(
                userId2, username2, fullName2,
                "This is exactly what we need! A platform built by Indians, for Indians. The cultural understanding and local context will make all the difference.",
                Arrays.asList("🎯", "🔥"),
                null,
                FeedType.QUOTE_TWEET
            ),

            // Feed 7 - Trending topic
            createFeed(
                userId1, username1, fullName1,
                "The future of social media is not about following the same patterns. It's about creating spaces that truly serve our communities. #FutureOfSocial #CommunityFirst",
                Arrays.asList("🔮", "🌍", "💡"),
                null,
                FeedType.ORIGINAL
            ),

            // Feed 8 - Engagement post
            createFeed(
                userId2, username2, fullName2,
                "Just discovered this amazing new feature! The interface is so intuitive and the performance is incredible. Well done team! 👏",
                Arrays.asList("👏", "🚀", "💯"),
                null,
                FeedType.ORIGINAL
            )
        );

        // Save all feeds
        feedRepository.saveAll(sampleFeeds);
        
        log.info("Created {} sample feeds", sampleFeeds.size());
    }

    private Feed createFeed(String userId, String username, String fullName, String content, 
                           List<String> emojis, MediaContent media, FeedType feedType) {
        Feed feed = new Feed();
        feed.setId(UUID.randomUUID().toString());
        feed.setUserId(userId);
        feed.setUsername(username);
        feed.setFullName(fullName);
        feed.setAvatarUrl("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face");
        feed.setVerified(true);
        feed.setContent(content);
        feed.setEmojis(emojis);
        feed.setMedia(media);
        feed.setFeedType(feedType);
        feed.setRepliesCount(0);
        feed.setRetweetsCount(0);
        feed.setLikesCount(0);
        feed.setBookmarksCount(0);
        feed.setViewsCount(0);
        feed.setIsLiked(false);
        feed.setIsRetweeted(false);
        feed.setIsBookmarked(false);
        feed.setCreatedAt(LocalDateTime.now());
        feed.setUpdatedAt(LocalDateTime.now());
        feed.setIsDeleted(false);
        
        return feed;
    }

    private MediaContent createMediaContent(String type, List<MediaItem> items) {
        MediaContent media = new MediaContent();
        media.setType(type);
        media.setItems(items);
        return media;
    }

    private MediaItem createMediaItem(String id, String type, String url, String altText) {
        MediaItem item = new MediaItem();
        item.setId(id);
        item.setType(type);
        item.setUrl(url);
        item.setThumbnailUrl(url);
        item.setAltText(altText);
        item.setWidth(500);
        item.setHeight(300);
        item.setFileSize(1024000L);
        return item;
    }
}
