# BharathVA Bulletproof News System

## Overview

Production-grade news aggregation and AI summarization system with intelligent duplicate detection and automatic summary generation.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   NEWS PROCESSING PIPELINE                   │
└─────────────────────────────────────────────────────────────┘

1. RSS Feed Fetching (Every 10-15 minutes)
   ↓
2. Validation & Sanitization
   ↓
3. **Duplicate Detection** (Multi-Strategy)
   │  ├─ Exact URL matching
   │  ├─ Title similarity (85% threshold)
   │  └─ Title + Source combination
   ↓
4. Database Storage (Neon PostgreSQL)
   ↓
5. **AI Summarization** (OpenRouter)
   │  ├─ Primary: Gemini 2.0 Flash Exp
   │  ├─ Secondary: Kimi K2
   │  └─ Tertiary: Mistral Small 24B
   ↓
6. Summary Storage & Delivery
```

## Key Features

### 1. Intelligent Duplicate Detection

**File**: `DuplicateNewsDetectionService.java`

**Strategies**:
1. **Exact URL Match** - Fastest, most accurate
2. **Title Similarity** - Catches same news from different sources
   - Uses Levenshtein distance algorithm
   - 85% similarity threshold
   - Prevents near-duplicate content
3. **Title + Source Combo** - Same source, same title detection

**Benefits**:
- ✅ Zero duplicate news in database
- ✅ Clean, high-quality news feed
- ✅ Reduced storage and processing costs
- ✅ Better user experience

### 2. Automatic AI Summarization

**File**: `IntelligentSummarizerService.java`

**Features**:
- **Multi-Model Fallback**: Automatic switching on rate limits
- **Load Balancing**: 20% randomization to distribute load
- **Quality Control**: 700-1500 character summaries
- **Comprehensive**: Uses title + description for context

**Model Configuration**:
```yaml
Primary: google/gemini-2.0-flash-exp:free    # Fastest
Secondary: moonshotai/kimi-k2-0711:free      # Balanced
Tertiary: mistralai/mistral-small-24b-instruct-2501:free  # Factual
```

### 3. Bulletproof News Storage

**File**: `NewsStorageService.java`

**Process Flow**:
1. **Validation**: Title (≥10 chars), URL, required fields
2. **Duplicate Check**: Multi-strategy detection
3. **Database Save**: PostgreSQL with error handling
4. **Summary Queue**: Automatic AI summarization

**Error Handling**:
- Constraint violations caught and logged
- Invalid news filtered automatically
- Comprehensive error tracking
- Detailed logs for debugging

### 4. Scheduled Refresh

**File**: `SchedulerService.java`

**Interval**: Every 10-15 minutes (configurable)

**Cycle**:
1. Fetch RSS feeds
2. Save news (with duplicate detection)
3. Auto-summarize all unsummarized news
4. Cleanup old news (retention policy)

## Database Schema

```sql
CREATE TABLE news (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    summary TEXT,                    -- AI-generated summary
    link VARCHAR(2048) UNIQUE NOT NULL,
    source VARCHAR(200),
    image_url VARCHAR(2048),
    video_url VARCHAR(2048),
    pub_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_news_pub_date ON news(pub_date DESC);
CREATE INDEX idx_news_source ON news(source);
CREATE INDEX idx_news_link ON news(link);
CREATE INDEX idx_news_created_at ON news(created_at DESC);
CREATE INDEX idx_news_title ON news USING gin(to_tsvector('english', title));
CREATE INDEX idx_news_summary_null ON news(id) WHERE summary IS NULL;
```

## Configuration

### Environment Variables

```bash
# OpenRouter API
OPENROUTER_API_KEY=sk-or-v1-your-key-here
PRIMARY_MODEL=google/gemini-2.0-flash-exp:free
SECONDARY_MODEL=moonshotai/kimi-k2-0711:free
TERTIARY_MODEL=mistralai/mistral-small-24b-instruct-2501:free

# Database
NEON_DB_URL=jdbc:postgresql://your-neon-db-url/neondb?sslmode=require
NEON_DB_USER=your-username
NEON_DB_PASSWORD=your-password

# RSS Feeds (comma-separated)
RSS_FEEDS=https://www.indiatoday.in/rss/1206578,https://indianexpress.com/feed/

# Scheduler
FETCH_INTERVAL_MINUTES=15
```

## API Endpoints

### Get All News
```http
GET /api/news?page=0&size=20
```

### Get News with Summary
```http
GET /api/news/{id}/summary
```

### Get Recent News
```http
GET /api/news/recent?hours=24
```

## Duplicate Detection Examples

### Example 1: Exact URL Match
```
News A: https://example.com/article-123
News B: https://example.com/article-123?utm_source=twitter
Result: ✅ Duplicate (normalized URLs match)
```

### Example 2: Similar Titles
```
News A: "PM Modi announces new economic reforms"
News B: "PM Modi announces major economic reforms"
Similarity: 95%
Result: ✅ Duplicate (above 85% threshold)
```

### Example 3: Same Source + Title
```
News A: "India wins cricket match" (Source: Times of India)
News B: "India wins cricket match" (Source: Times of India)
Result: ✅ Duplicate (exact match from same source)
```

## Monitoring & Logging

### Key Metrics Logged

1. **Storage Stats**: Saved, Duplicates Skipped, Errors
2. **Summarization Stats**: Success, Failed, Model Used
3. **Duplicate Detection**: Strategy used, Similarity score
4. **Performance**: Processing time, API response time

### Log Levels

- **INFO**: Normal operations, stats, success messages
- **WARN**: Duplicates detected, minor issues
- **ERROR**: Failures, exceptions, critical issues
- **DEBUG**: Detailed processing info, algorithm decisions

## Error Recovery

### Automatic Recovery
- API rate limits → Switch to fallback model
- Network errors → Retry with exponential backoff
- Database constraints → Skip and log

### Manual Recovery
- Failed summaries → Rerun summarization service
- Database connection → Auto-reconnect on next cycle

## Performance Optimization

1. **Duplicate Detection**: O(n) complexity with early exit
2. **Database Indexes**: Fast lookups for URL and title
3. **Batch Processing**: Process news in chunks
4. **Async Summarization**: Non-blocking, scheduled execution

## Testing

### Run Service
```bash
cd backend/news-ai-service
mvn spring-boot:run
```

### Check Logs
```bash
tail -f logs/news-ai-service.log
```

### Database Queries
```sql
-- Check summary coverage
SELECT 
    COUNT(*) as total,
    COUNT(summary) as with_summary,
    COUNT(*) - COUNT(summary) as without_summary
FROM news;

-- Find duplicate candidates
SELECT title, COUNT(*) as count
FROM news
GROUP BY title
HAVING COUNT(*) > 1;
```

## Production Checklist

- [x] Duplicate detection implemented
- [x] AI summarization with fallback
- [x] Error handling and logging
- [x] Database indexes optimized
- [x] Scheduled refresh configured
- [x] Environment variables documented
- [x] API endpoints tested
- [x] Monitoring logs reviewed

## Maintenance

### Daily Tasks
- Monitor duplicate detection rate
- Check summarization success rate
- Review error logs

### Weekly Tasks
- Analyze news quality
- Review API quota usage
- Update RSS feed sources if needed

### Monthly Tasks
- Database cleanup (old news)
- Performance optimization review
- Model performance comparison

## Support

For issues or questions:
1. Check logs in `logs/news-ai-service.log`
2. Review database state with SQL queries
3. Monitor duplicate detection stats
4. Verify API keys and configuration

---

**Built with ❤️ by BharathVA Engineering Team**

*Last Updated: 2025-01-12*

