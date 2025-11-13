package com.bharathva.newsai.service;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Bulletproof image fetching service with multiple fallback strategies.
 * Ensures every news article has an image through aggressive extraction.
 */
@Service
public class ImageFetchService {

    private static final Logger log = LoggerFactory.getLogger(ImageFetchService.class);
    private static final String USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
    
    // Source-specific fallback images (high-quality logos)
    private static final String INDIA_TODAY_FALLBACK = "https://akm-img-a-in.tosshub.com/sites/all/themes/itg/logo.png";
    private static final String INDIAN_EXPRESS_FALLBACK = "https://indianexpress.com/wp-content/themes/indianexpress/images/indian-express-logo-n.svg";
    private static final String NDTV_FALLBACK = "https://drop.ndtv.com/homepage/images/ndtvlogo_new.png";
    private static final String TOI_FALLBACK = "https://static.toiimg.com/photo/msid-97054851.cms";
    private static final String DEFAULT_FALLBACK = "https://via.placeholder.com/800x600/FF6B35/FFFFFF?text=BharathVA+News";

    /**
     * Extract image URL with multiple fallback strategies.
     * This method is bulletproof and always returns a valid image URL.
     */
    public String extractImageUrlBulletproof(String articleUrl, String description, String source, com.rometools.rome.feed.synd.SyndEntry entry) {
        log.debug("Extracting image for: {}", articleUrl);
        
        // Strategy 1: RSS Enclosures (fastest)
        String imageUrl = extractFromEnclosures(entry);
        if (isValidImageUrl(imageUrl)) {
            log.debug("Found image from RSS enclosures");
            return imageUrl;
        }
        
        // Strategy 2: Extract from HTML content in RSS
        imageUrl = extractFromHtmlContent(description);
        if (isValidImageUrl(imageUrl)) {
            log.debug("Found image from RSS HTML content");
            return imageUrl;
        }
        
        // Strategy 3: Media content from RSS extensions
        imageUrl = extractFromMediaContent(entry);
        if (isValidImageUrl(imageUrl)) {
            log.debug("Found image from RSS media content");
            return imageUrl;
        }
        
        // Strategy 4: Open Graph / Meta tags from article page (web scraping)
        imageUrl = scrapeImageFromArticle(articleUrl);
        if (isValidImageUrl(imageUrl)) {
            log.debug("Found image from web scraping");
            return imageUrl;
        }
        
        // Strategy 5: Source-specific fallback (high-quality logos)
        imageUrl = getSourceSpecificFallback(source);
        log.debug("Using source-specific fallback for: {}", source);
        return imageUrl;
    }

    /**
     * Strategy 1: Extract from RSS enclosures
     */
    private String extractFromEnclosures(com.rometools.rome.feed.synd.SyndEntry entry) {
        if (entry == null || entry.getEnclosures() == null || entry.getEnclosures().isEmpty()) {
            return null;
        }
        
        for (var enclosure : entry.getEnclosures()) {
            String type = enclosure.getType();
            if (type != null && type.toLowerCase().contains("image")) {
                String url = enclosure.getUrl();
                if (url != null && !url.trim().isEmpty()) {
                    return normalizeImageUrl(url);
                }
            }
        }
        
        return null;
    }

    /**
     * Strategy 2: Extract from HTML content
     */
    private String extractFromHtmlContent(String content) {
        if (content == null || content.isEmpty()) {
            return null;
        }
        
        // Try img tag with src
        Pattern imgPattern = Pattern.compile(
            "<img[^>]+src=[\"']([^\"']+)[\"'][^>]*>",
            Pattern.CASE_INSENSITIVE
        );
        Matcher matcher = imgPattern.matcher(content);
        if (matcher.find()) {
            String url = matcher.group(1);
            if (isValidImageUrl(url)) {
                return normalizeImageUrl(url);
            }
        }
        
        // Try img tag with data-src (lazy loading)
        Pattern dataSrcPattern = Pattern.compile(
            "<img[^>]+data-src=[\"']([^\"']+)[\"'][^>]*>",
            Pattern.CASE_INSENSITIVE
        );
        matcher = dataSrcPattern.matcher(content);
        if (matcher.find()) {
            String url = matcher.group(1);
            if (isValidImageUrl(url)) {
                return normalizeImageUrl(url);
            }
        }
        
        // Try direct image URLs in content
        Pattern urlPattern = Pattern.compile(
            "https?://[^\\s<>\"']+\\.(jpg|jpeg|png|gif|webp|JPG|JPEG|PNG|GIF|WEBP)",
            Pattern.CASE_INSENSITIVE
        );
        matcher = urlPattern.matcher(content);
        if (matcher.find()) {
            return normalizeImageUrl(matcher.group(0));
        }
        
        return null;
    }

    /**
     * Strategy 3: Extract from media:content (RSS Media extension)
     */
    private String extractFromMediaContent(com.rometools.rome.feed.synd.SyndEntry entry) {
        if (entry == null) {
            return null;
        }
        
        try {
            // Try to get media:content from foreign markup
            var foreignMarkup = entry.getForeignMarkup();
            if (foreignMarkup != null) {
                for (var element : foreignMarkup) {
                    String name = element.getName();
                    if (name != null && (name.equals("content") || name.equals("thumbnail"))) {
                        String url = element.getAttributeValue("url");
                        if (url != null && !url.trim().isEmpty()) {
                            return normalizeImageUrl(url);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.debug("Could not extract media content: {}", e.getMessage());
        }
        
        return null;
    }

    /**
     * Strategy 4: Scrape image from article page (Open Graph, Twitter Card, etc.)
     */
    private String scrapeImageFromArticle(String articleUrl) {
        if (articleUrl == null || articleUrl.isEmpty()) {
            return null;
        }
        
        try {
            Document doc = Jsoup.connect(articleUrl)
                    .userAgent(USER_AGENT)
                    .timeout(10000)
                    .followRedirects(true)
                    .get();
            
            // Try Open Graph image
            Element ogImage = doc.selectFirst("meta[property=og:image]");
            if (ogImage != null) {
                String url = ogImage.attr("content");
                if (isValidImageUrl(url)) {
                    return normalizeImageUrl(url);
                }
            }
            
            // Try Twitter Card image
            Element twitterImage = doc.selectFirst("meta[name=twitter:image]");
            if (twitterImage != null) {
                String url = twitterImage.attr("content");
                if (isValidImageUrl(url)) {
                    return normalizeImageUrl(url);
                }
            }
            
            // Try first large image in article
            Elements images = doc.select("article img, .article img, .story img");
            for (Element img : images) {
                String url = img.attr("src");
                if (url.isEmpty()) {
                    url = img.attr("data-src");
                }
                if (isValidImageUrl(url) && isLargeEnoughImage(url)) {
                    return normalizeImageUrl(url);
                }
            }
            
        } catch (Exception e) {
            log.debug("Could not scrape image from article: {}", e.getMessage());
        }
        
        return null;
    }

    /**
     * Strategy 5: Get source-specific fallback image
     */
    private String getSourceSpecificFallback(String source) {
        if (source == null) {
            return DEFAULT_FALLBACK;
        }
        
        String sourceLower = source.toLowerCase();
        if (sourceLower.contains("india today")) {
            return INDIA_TODAY_FALLBACK;
        } else if (sourceLower.contains("indian express")) {
            return INDIAN_EXPRESS_FALLBACK;
        } else if (sourceLower.contains("ndtv")) {
            return NDTV_FALLBACK;
        } else if (sourceLower.contains("times of india")) {
            return TOI_FALLBACK;
        }
        
        return DEFAULT_FALLBACK;
    }

    /**
     * Normalize image URL (fix relative URLs, protocol-less URLs, etc.)
     */
    private String normalizeImageUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return null;
        }
        
        url = url.trim();
        
        // Fix protocol-less URLs
        if (url.startsWith("//")) {
            return "https:" + url;
        }
        
        // Skip relative URLs (we can't fix them without base URL)
        if (url.startsWith("/") && !url.startsWith("//")) {
            return null;
        }
        
        // Ensure HTTPS
        if (url.startsWith("http://")) {
            url = url.replace("http://", "https://");
        }
        
        return url;
    }

    /**
     * Validate that URL looks like a real image
     */
    private boolean isValidImageUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return false;
        }
        
        String urlLower = url.toLowerCase();
        
        // Must be HTTP/HTTPS
        if (!urlLower.startsWith("http://") && !urlLower.startsWith("https://")) {
            return false;
        }
        
        // Check for image extensions or CDN indicators
        if (urlLower.matches(".*\\.(jpg|jpeg|png|gif|webp)(\\?.*)?$") ||
            urlLower.contains("/photo/") ||
            urlLower.contains("/images/") ||
            urlLower.contains("/img/") ||
            urlLower.contains("cdn") ||
            urlLower.contains("static") ||
            urlLower.contains("media")) {
            return true;
        }
        
        return false;
    }

    /**
     * Check if image is likely large enough (not an icon/thumbnail)
     */
    private boolean isLargeEnoughImage(String url) {
        if (url == null) {
            return false;
        }
        
        String urlLower = url.toLowerCase();
        
        // Skip obvious thumbnails/icons
        if (urlLower.contains("thumb") ||
            urlLower.contains("icon") ||
            urlLower.contains("avatar") ||
            urlLower.contains("logo") && !urlLower.contains("og")) {
            return false;
        }
        
        return true;
    }
}

