package com.bharathva.newsai.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

@Configuration
public class RssConfig {

    private static final Logger log = LoggerFactory.getLogger(RssConfig.class);

    @Value("${rss.feeds}")
    private String rssFeeds;

    @Bean("rssFeedList")
    public List<String> rssFeedList() {
        log.info("Creating RSS Feed List Bean");
        log.info("RSS Feeds configuration value: {}", rssFeeds);
        List<String> feeds = Arrays.stream(rssFeeds.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(java.util.stream.Collectors.toList());
        log.info("Parsed {} RSS feed URLs", feeds.size());
        feeds.forEach(feed -> log.info("  - {}", feed));
        return feeds;
    }
}
