package com.bharathva.newsai.service;

import com.bharathva.newsai.model.News;
import com.bharathva.newsai.repository.NewsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service to identify top 10 trending/common news items across all sources.
 * 
 * Algorithm:
 * 1. Groups news by similar titles (fuzzy matching)
 * 2. Scores news based on:
 *    - Recency (newer = higher score)
 *    - Source diversity (appears in multiple sources = higher score)
 *    - Completeness (has image, description = higher score)
 * 3. Selects top 10 most trending items
 */
@Service
public class TrendingNewsService {

    private static final Logger log = LoggerFactory.getLogger(TrendingNewsService.class);
    private static final int TOP_TRENDING_COUNT = 10;
    private static final int MAX_AGE_HOURS = 48; // Only consider news from last 48 hours

    @Autowired
    private NewsRepository newsRepository;

    /**
     * Identify and return top 10 trending news items across all sources.
     * Trending news is determined by:
     * - Recency (published within last 48 hours)
     * - Source diversity (appears in multiple sources)
     * - Completeness (has image and description)
     * - Publication date (newer = more trending)
     */
    @Transactional(readOnly = true)
    public List<News> identifyTop10TrendingNews() {
        log.info("========================================");
        log.info("IDENTIFYING TOP {} TRENDING NEWS", TOP_TRENDING_COUNT);
        log.info("========================================");

        try {
            // Get all recent news (last 48 hours)
            LocalDateTime cutoffTime = LocalDateTime.now().minusHours(MAX_AGE_HOURS);
            List<News> recentNews = newsRepository.findAll().stream()
                    .filter(news -> news.getPubDate() != null && news.getPubDate().isAfter(cutoffTime))
                    .filter(news -> news.getImageUrl() != null && !news.getImageUrl().trim().isEmpty())
                    .filter(news -> news.getTitle() != null && !news.getTitle().trim().isEmpty())
                    .collect(Collectors.toList());

            if (recentNews.isEmpty()) {
                log.warn("No recent news found in last {} hours", MAX_AGE_HOURS);
                return getTop10ByDate();
            }

            log.info("Found {} recent news articles (last {} hours)", recentNews.size(), MAX_AGE_HOURS);

            // Group similar news by title similarity (common news across sources)
            Map<String, List<News>> newsGroups = groupSimilarNews(recentNews);

            // Score each news group
            List<NewsScore> scoredNews = scoreNewsGroups(newsGroups);

            // Select top 10
            List<News> topTrending = scoredNews.stream()
                    .sorted((a, b) -> Double.compare(b.score, a.score))
                    .limit(TOP_TRENDING_COUNT)
                    .map(score -> score.news)
                    .collect(Collectors.toList());

            log.info("========================================");
            log.info("TOP {} TRENDING NEWS IDENTIFIED", topTrending.size());
            topTrending.forEach(news -> 
                log.info("  [{}] {} - {} ({})", 
                    news.getId(), 
                    truncate(news.getTitle(), 60),
                    news.getSource(),
                    news.getPubDate())
            );
            log.info("========================================");

            return topTrending;

        } catch (Exception e) {
            log.error("Failed to identify trending news: {}", e.getMessage(), e);
            // Fallback to simple date-based selection
            return getTop10ByDate();
        }
    }

    /**
     * Group similar news items by title similarity.
     * News with similar titles from different sources are grouped together.
     */
    private Map<String, List<News>> groupSimilarNews(List<News> newsList) {
        Map<String, List<News>> groups = new HashMap<>();

        for (News news : newsList) {
            String normalizedTitle = normalizeTitle(news.getTitle());
            String groupKey = findSimilarGroup(normalizedTitle, groups);

            if (groupKey == null) {
                // Create new group
                groups.put(normalizedTitle, new ArrayList<>(List.of(news)));
            } else {
                // Add to existing group
                groups.get(groupKey).add(news);
            }
        }

        return groups;
    }

    /**
     * Find if a title belongs to an existing group (fuzzy matching).
     */
    private String findSimilarGroup(String normalizedTitle, Map<String, List<News>> groups) {
        for (String groupKey : groups.keySet()) {
            if (areTitlesSimilar(normalizedTitle, groupKey)) {
                return groupKey;
            }
        }
        return null;
    }

    /**
     * Check if two titles are similar (common news across sources).
     */
    private boolean areTitlesSimilar(String title1, String title2) {
        if (title1 == null || title2 == null) return false;

        // Extract key words (remove common words)
        Set<String> words1 = extractKeyWords(title1);
        Set<String> words2 = extractKeyWords(title2);

        // Calculate similarity (Jaccard similarity)
        Set<String> intersection = new HashSet<>(words1);
        intersection.retainAll(words2);
        Set<String> union = new HashSet<>(words1);
        union.addAll(words2);

        if (union.isEmpty()) return false;

        double similarity = (double) intersection.size() / union.size();
        return similarity >= 0.4; // 40% word overlap = similar
    }

    /**
     * Extract key words from title (remove common stop words).
     */
    private Set<String> extractKeyWords(String title) {
        Set<String> stopWords = Set.of("the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "is", "are", "was", "were", "be", "been", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "must", "can", "this", "that", "these", "those");
        
        return Arrays.stream(title.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", " ")
                .split("\\s+"))
                .filter(word -> word.length() > 2)
                .filter(word -> !stopWords.contains(word))
                .collect(Collectors.toSet());
    }

    /**
     * Normalize title for comparison.
     */
    private String normalizeTitle(String title) {
        if (title == null) return "";
        return title.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    /**
     * Score news groups to identify trending items.
     */
    private List<NewsScore> scoreNewsGroups(Map<String, List<News>> groups) {
        List<NewsScore> scoredNews = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (Map.Entry<String, List<News>> entry : groups.entrySet()) {
            List<News> group = entry.getValue();
            
            // Select the best news from each group (most recent, most complete)
            News bestNews = group.stream()
                    .max(Comparator
                            .comparing((News n) -> n.getPubDate() != null ? n.getPubDate() : LocalDateTime.MIN)
                            .thenComparing((News n) -> n.getImageUrl() != null ? 1 : 0)
                            .thenComparing((News n) -> n.getDescription() != null && !n.getDescription().isEmpty() ? 1 : 0))
                    .orElse(group.get(0));

            // Calculate score
            double score = calculateTrendingScore(bestNews, group.size(), now);
            scoredNews.add(new NewsScore(bestNews, score));
        }

        return scoredNews;
    }

    /**
     * Calculate trending score for a news item.
     */
    private double calculateTrendingScore(News news, int sourceCount, LocalDateTime now) {
        double score = 0.0;

        // Recency score (0-40 points): Newer = higher score
        if (news.getPubDate() != null) {
            long hoursAgo = java.time.Duration.between(news.getPubDate(), now).toHours();
            score += Math.max(0, 40 - (hoursAgo * 2)); // 40 points for now, -2 per hour
        }

        // Source diversity score (0-30 points): More sources = higher score
        score += Math.min(30, sourceCount * 10); // 10 points per source, max 30

        // Completeness score (0-20 points)
        if (news.getImageUrl() != null && !news.getImageUrl().trim().isEmpty()) {
            score += 10;
        }
        if (news.getDescription() != null && !news.getDescription().trim().isEmpty()) {
            score += 10;
        }

        // Title quality score (0-10 points): Longer, more descriptive titles
        if (news.getTitle() != null) {
            int titleLength = news.getTitle().length();
            if (titleLength >= 50 && titleLength <= 200) {
                score += 10;
            } else if (titleLength >= 20) {
                score += 5;
            }
        }

        return score;
    }

    /**
     * Fallback: Get top 10 by publication date.
     */
    private List<News> getTop10ByDate() {
        log.info("Using fallback: Top 10 by publication date");
        return newsRepository.findTop10News();
    }

    /**
     * Truncate string for logging.
     */
    private String truncate(String str, int maxLength) {
        if (str == null) return "null";
        if (str.length() <= maxLength) return str;
        return str.substring(0, maxLength) + "...";
    }

    /**
     * Helper class for scoring news.
     */
    private static class NewsScore {
        final News news;
        final double score;

        NewsScore(News news, double score) {
            this.news = news;
            this.score = score;
        }
    }
}

