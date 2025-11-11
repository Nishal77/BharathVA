package com.bharathva.newsai.service;

import com.bharathva.newsai.model.News;
import com.bharathva.newsai.repository.NewsRepository;
import com.rometools.rome.feed.synd.SyndContent;
import com.rometools.rome.feed.synd.SyndEntry;
import com.rometools.rome.feed.synd.SyndFeed;
import com.rometools.rome.io.SyndFeedInput;
import com.rometools.rome.io.XmlReader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.net.URL;
import java.net.URLConnection;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
public class RssFetchService {

    private static final Logger log = LoggerFactory.getLogger(RssFetchService.class);
    private static final String USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

    private final List<String> rssFeedList;
    private final NewsRepository repo;
    private final ImageFetchService imageFetchService;

    @Autowired
    public RssFetchService(@org.springframework.beans.factory.annotation.Qualifier("rssFeedList") List<String> rssFeedList, 
                          NewsRepository repo,
                          ImageFetchService imageFetchService) {
        this.rssFeedList = rssFeedList;
        this.repo = repo;
        this.imageFetchService = imageFetchService;
        log.info("RssFetchService initialized with {} RSS feed sources", rssFeedList != null ? rssFeedList.size() : 0);
        if (rssFeedList != null && !rssFeedList.isEmpty()) {
            rssFeedList.forEach(feed -> log.info("  Configured feed: {}", feed));
        }
    }

    public void fetchLatest() {
        if (rssFeedList == null || rssFeedList.isEmpty()) {
            log.warn("RSS feed list is empty. Please configure RSS_FEEDS environment variable.");
            return;
        }

        log.info("Starting RSS feed fetch from {} sources", rssFeedList.size());
        SyndFeedInput input = new SyndFeedInput();
        int totalFetched = 0;
        int totalSkipped = 0;
        int totalErrors = 0;

        for (String url : rssFeedList) {
            if (url == null || url.trim().isEmpty()) {
                log.warn("Skipping empty RSS feed URL");
                continue;
            }

            try {
                FeedFetchResult result = fetchFeedFromUrl(url.trim(), input);
                totalFetched += result.fetched;
                totalSkipped += result.skipped;
                totalErrors += result.errors;
            } catch (Exception e) {
                log.error("Failed to fetch feed {}: {}", url, e.getMessage(), e);
                totalErrors++;
            }
        }

        log.info("RSS fetch completed. Total: {} new articles, {} skipped, {} errors", 
                totalFetched, totalSkipped, totalErrors);
    }

    @Autowired
    private NewsStorageService newsStorageService;

    private FeedFetchResult fetchFeedFromUrl(String url, SyndFeedInput input) {
        FeedFetchResult result = new FeedFetchResult();
        List<News> newsArticles = new java.util.ArrayList<>();
        
        try {
            log.info("Fetching feed from: {}", url);
            URL feedUrl = new URL(url);
            
            URLConnection connection = feedUrl.openConnection();
            connection.setRequestProperty("User-Agent", USER_AGENT);
            connection.setConnectTimeout(10000);
            connection.setReadTimeout(30000);
            
            SyndFeed feed = input.build(new XmlReader(connection.getInputStream()));
            log.info("Successfully parsed feed: {} ({} entries)", feed.getTitle(), feed.getEntries().size());
            
            String sourceName = feed.getTitle() != null ? feed.getTitle() : extractSourceName(url);
            
            for (SyndEntry entry : (List<SyndEntry>) feed.getEntries()) {
                try {
                    String entryLink = entry.getLink();
                    if (entryLink == null || entryLink.trim().isEmpty()) {
                        log.warn("Skipping entry with no link: {}", entry.getTitle());
                        result.skipped++;
                        continue;
                    }

                    entryLink = entryLink.trim();
                    
                    if (repo.existsByLink(entryLink)) {
                        result.skipped++;
                        continue;
                    }

                    News news = createNewsFromEntry(entry, entryLink, sourceName);
                    newsArticles.add(news);
                    result.fetched++;
                    
                } catch (Exception e) {
                    log.error("Failed to process entry from {}: {}", url, e.getMessage(), e);
                    result.errors++;
                }
            }
            
            if (!newsArticles.isEmpty()) {
                int saved = newsStorageService.saveNewsArticles(newsArticles);
                result.fetched = saved;
                result.skipped += (newsArticles.size() - saved);
            }
            
            log.info("Processed feed {} - Fetched: {}, Skipped: {}, Errors: {}", 
                    url, result.fetched, result.skipped, result.errors);
            
        } catch (Exception e) {
            log.error("Failed to fetch feed {}: {}", url, e.getMessage(), e);
            result.errors++;
        }
        
        return result;
    }

    private News createNewsFromEntry(SyndEntry entry, String entryLink, String sourceName) {
        News news = new News();
        news.setTitle(entry.getTitle() != null ? entry.getTitle().trim() : "Untitled");
        news.setLink(entryLink);
        
        String description = extractDescription(entry);
        news.setDescription(description);
        news.setSource(sourceName);

        if (entry.getPublishedDate() != null) {
            news.setPubDate(entry.getPublishedDate()
                    .toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime());
        } else {
            news.setPubDate(LocalDateTime.now());
        }

        // Bulletproof image extraction with multiple fallback strategies
        String imageUrl = imageFetchService.extractImageUrlBulletproof(
            entryLink, 
            description, 
            sourceName, 
            entry
        );
        news.setImageUrl(imageUrl); // Always has a valid image URL

        String videoUrl = extractVideoUrl(entry);
        if (videoUrl != null) {
            news.setVideoUrl(videoUrl);
        }
        
        return news;
    }


    private static class FeedFetchResult {
        int fetched = 0;
        int skipped = 0;
        int errors = 0;
    }

    private String extractDescription(SyndEntry entry) {
        if (entry.getDescription() != null) {
            SyndContent description = entry.getDescription();
            if (description != null && description.getValue() != null) {
                return description.getValue().trim();
            }
        }
        
        if (entry.getContents() != null && !entry.getContents().isEmpty()) {
            SyndContent content = entry.getContents().get(0);
            if (content != null && content.getValue() != null) {
                return content.getValue().trim();
            }
        }
        
        return "";
    }

    private String extractImageUrl(SyndEntry entry, String description) {
        if (entry.getEnclosures() != null && !entry.getEnclosures().isEmpty()) {
            for (var enclosure : entry.getEnclosures()) {
                String type = enclosure.getType();
                if (type != null && (type.startsWith("image") || type.contains("image"))) {
                    String url = enclosure.getUrl();
                    if (url != null && !url.trim().isEmpty()) {
                        return normalizeImageUrl(url);
                    }
                }
            }
        }

        if (description != null && !description.isEmpty()) {
            String imageUrl = extractImageUrlFromContent(description);
            if (imageUrl != null) {
                return imageUrl;
            }
        }

        return null;
    }

    private String extractVideoUrl(SyndEntry entry) {
        if (entry.getEnclosures() != null && !entry.getEnclosures().isEmpty()) {
            for (var enclosure : entry.getEnclosures()) {
                String type = enclosure.getType();
                if (type != null && (type.startsWith("video") || type.contains("video"))) {
                    String url = enclosure.getUrl();
                    if (url != null && !url.trim().isEmpty()) {
                        return url.trim();
                    }
                }
            }
        }
        return null;
    }

    private String normalizeImageUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return null;
        }
        
        url = url.trim();
        if (url.startsWith("//")) {
            return "https:" + url;
        }
        if (url.startsWith("/") && !url.startsWith("//")) {
            return null;
        }
        return url;
    }

    private String extractSourceName(String url) {
        if (url.contains("indiatoday.in")) {
            return "India Today";
        } else if (url.contains("indianexpress.com")) {
            return "Indian Express";
        } else if (url.contains("ndtv")) {
            return "NDTV";
        } else if (url.contains("timesofindia")) {
            return "Times of India";
        } else if (url.contains("hindustantimes.com")) {
            return "Hindustan Times";
        }
        return "Unknown Source";
    }

    private String extractImageUrlFromContent(String content) {
        if (content == null || content.isEmpty()) {
            return null;
        }

        java.util.regex.Pattern imgPattern = java.util.regex.Pattern.compile(
                "<img[^>]+src=[\"']([^\"']+)[\"'][^>]*>",
                java.util.regex.Pattern.CASE_INSENSITIVE
        );
        java.util.regex.Matcher matcher = imgPattern.matcher(content);
        if (matcher.find()) {
            String imageUrl = matcher.group(1);
            return normalizeImageUrl(imageUrl);
        }

        java.util.regex.Pattern dataSrcPattern = java.util.regex.Pattern.compile(
                "<img[^>]+data-src=[\"']([^\"']+)[\"'][^>]*>",
                java.util.regex.Pattern.CASE_INSENSITIVE
        );
        matcher = dataSrcPattern.matcher(content);
        if (matcher.find()) {
            String imageUrl = matcher.group(1);
            return normalizeImageUrl(imageUrl);
        }

        java.util.regex.Pattern urlPattern = java.util.regex.Pattern.compile(
                "https?://[^\\s<>\"']+\\.(jpg|jpeg|png|gif|webp|JPG|JPEG|PNG|GIF|WEBP)",
                java.util.regex.Pattern.CASE_INSENSITIVE
        );
        matcher = urlPattern.matcher(content);
        if (matcher.find()) {
            return normalizeImageUrl(matcher.group(0));
        }

        java.util.regex.Pattern cdnPattern = java.util.regex.Pattern.compile(
                "https?://[^\\s<>\"']*cdn[^\\s<>\"']*\\.(jpg|jpeg|png|gif|webp)",
                java.util.regex.Pattern.CASE_INSENSITIVE
        );
        matcher = cdnPattern.matcher(content);
        if (matcher.find()) {
            return normalizeImageUrl(matcher.group(0));
        }

        return null;
    }
}
