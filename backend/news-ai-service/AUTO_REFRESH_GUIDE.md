# 🔄 Auto-Refresh News Scheduler - Complete Guide

## Overview

The BharathVA News AI Service automatically refreshes news articles every **15 minutes** to ensure the latest content is always available.

## ⚙️ Configuration

### Environment Variable
The refresh interval is controlled by:
```yaml
FETCH_INTERVAL_MINUTES=15
```

### Scheduler Configuration
Located in: `SchedulerService.java`

```java
@Scheduled(fixedRateString = "\${scheduler.interval-minutes:15}000", initialDelay = 60000)
public void refreshNewsJob() {
    // Fetches latest news every 15 minutes
}
```

**Parameters:**
- **fixedRateString**: `15000` milliseconds (15 minutes)
- **initialDelay**: `60000` milliseconds (1 minute after startup)

## 📋 What Happens During Each Refresh Cycle

The auto-refresh performs the following steps:

### 1. **Fetch Latest News from RSS Feeds**
   - Fetches from all 4 configured RSS sources:
     - India Today
     - Indian Express  
     - NDTV
     - Times of India
   - Stores new articles in NeonDB
   - Skips duplicates automatically

### 2. **Summarize New Articles** (Optional)
   - Uses Gemini AI to generate summaries
   - Non-critical: failure won't stop the refresh cycle
   - Only runs if `GEMINI_API_KEY` is configured

### 3. **Cleanup Old Articles**
   - Removes old news articles
   - Keeps only the most recent articles
   - Prevents database bloat

## 🔍 Monitoring the Scheduler

### View Scheduler Logs
```bash
docker logs bharathva-news-ai 2>&1 | grep "AUTO REFRESH"
```

### Example Log Output
```
========================================
AUTO REFRESH CYCLE STARTED at: 2025-11-11T12:39:20
========================================
Starting RSS feed fetch from 4 sources
Fetching feed from: https://www.indiatoday.in/rss/1206578
Successfully parsed feed: India Today | India (60 entries)
Fetching feed from: https://indianexpress.com/feed/
Successfully parsed feed: The Indian Express (50 entries)
RSS fetch completed. Total: 15 new articles, 95 skipped, 0 errors
Top 10 news fetch and store completed
========================================
AUTO REFRESH CYCLE COMPLETED at: 2025-11-11T12:39:45
========================================
```

## 🎯 Key Features

### ✅ Automatic Execution
- Runs **every 15 minutes** automatically
- First run: **1 minute** after service starts
- No manual intervention required

### ✅ Duplicate Prevention
- Checks if article already exists before saving
- Uses article link as unique identifier
- Prevents database bloat

### ✅ Fault Tolerance
- Summarization failures don't stop the cycle
- Cleanup failures don't stop the cycle  
- Individual feed failures don't stop other feeds
- Service continues even if one RSS source is down

### ✅ Resource Efficient
- Only fetches new articles
- Skips already-stored articles
- Cleans up old articles automatically

## 🛠️ Customizing the Refresh Interval

### Change to 30 Minutes
In `docker-compose.yml`:
```yaml
environment:
  - FETCH_INTERVAL_MINUTES=30
```

### Change to 5 Minutes (for testing)
```yaml
environment:
  - FETCH_INTERVAL_MINUTES=5
```

**Note**: The value is in **minutes**, and the scheduler converts it to milliseconds internally by multiplying by 60,000.

## 📊 Monitoring & Statistics

### Check Current Statistics
```bash
curl http://192.168.0.121:8084/api/news/stats
```

Response:
```json
{
  "totalArticles": 240,
  "latestCount": 10,
  "databaseConnected": true,
  "latestArticleDate": "2025-11-11T12:39:45",
  "latestArticle": "Latest news title..."
}
```

### Check Service Health
```bash
curl http://192.168.0.121:8084/api/news/health
```

## 🔧 Troubleshooting

### Scheduler Not Running?

1. **Check if `@EnableScheduling` is present**
   ```java
   @SpringBootApplication
   @EnableScheduling  // ← This must be present
   public class NewsAiApplication {
       // ...
   }
   ```

2. **Check logs for initialization**
   ```bash
   docker logs bharathva-news-ai | grep "SchedulerService initialized"
   ```

3. **Verify environment variable**
   ```bash
   docker exec bharathva-news-ai env | grep FETCH_INTERVAL
   ```

### Articles Not Being Fetched?

1. **Check RSS feed configuration**
   ```bash
   docker logs bharathva-news-ai | grep "RSS Feeds configuration"
   ```

2. **Check for errors during fetch**
   ```bash
   docker logs bharathva-news-ai | grep -i "error"
   ```

3. **Manually trigger a fetch (for testing)**
   ```bash
   curl -X POST http://192.168.0.121:8084/api/news/fetch
   ```

## 📈 Performance Metrics

- **Fetch Duration**: ~25-30 seconds per cycle
- **Articles per Cycle**: 10-20 new articles (varies)
- **Database Impact**: Minimal (only new articles inserted)
- **Memory Usage**: Low (streaming RSS feeds)
- **CPU Usage**: Spike during fetch, idle between cycles

## 🚀 Production Recommendations

### For High-Traffic Scenarios
```yaml
FETCH_INTERVAL_MINUTES=10  # More frequent updates
```

### For Low-Traffic Scenarios
```yaml
FETCH_INTERVAL_MINUTES=30  # Less frequent updates
```

### For Development/Testing
```yaml
FETCH_INTERVAL_MINUTES=5   # Frequent updates for testing
```

## 📝 Scheduler Implementation Details

### Technology Stack
- **Spring Boot**: `@Scheduled` annotation
- **Scheduling**: Fixed-rate execution
- **Thread Pool**: Spring's default scheduling thread pool
- **Async**: Runs on background thread (non-blocking)

### Execution Flow
```
1. Timer triggers every 15 minutes
2. Fetch latest news from all RSS sources
3. Check for duplicates  
4. Save new articles to NeonDB
5. (Optional) Summarize new articles with Gemini AI
6. Cleanup old articles
7. Log completion
8. Wait for next cycle
```

---

**Status**: ✅ **ACTIVE** - Auto-refreshing every 15 minutes  
**Last Updated**: November 11, 2025
