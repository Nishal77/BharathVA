# Summary Generation & IST Timezone Fix

## Issues Fixed

### 1. Summary Generation Not Working ❌ → ✅
**Problem**: News articles showing "Summary unavailable" in frontend
**Root Cause**: Controller was referencing deleted `SummarizerService` instead of `IntelligentSummarizerService`
**Solution**: Updated all controller references to use `IntelligentSummarizerService`

### 2. Empty News Table ❌ → ✅
**Problem**: Neon DB `news` table was empty
**Root Cause**: Service not running or scheduler not triggered
**Solution**: 
- Created news table schema with proper indexes
- Added test endpoints to manually trigger fetch and summarization
- Implemented automatic scheduling (every 10-15 minutes)

### 3. IST Timezone Missing ❌ → ✅
**Problem**: Timestamps not displayed in IST
**Root Cause**: No timezone conversion utility
**Solution**: 
- Created `DateTimeUtil` with IST conversion
- Added `publishedAtIst` and `publishedAtRelative` fields to News model
- Backend stores in UTC, converts to IST for display

## Files Modified/Created

### Created Files
1. `DateTimeUtil.java` - IST timezone utility
2. `TestController.java` - Test/debug endpoints
3. `SUMMARY_GENERATION_FIX.md` - This documentation

### Modified Files
1. `NewsController.java` - Fixed SummarizerService references, added IST timestamps
2. `News.java` - Added IST formatting methods

## API Endpoints

### Testing & Debug Endpoints

#### 1. Comprehensive System Test
```http
GET http://localhost:8084/api/test/system
```
Tests:
- ✅ Database connection
- ✅ Summary coverage
- ✅ News fetching
- ✅ AI summarization
- ✅ IST timestamp formatting
- ✅ Latest news retrieval

**Response Example**:
```json
{
  "1_database_connected": true,
  "1_total_news_in_db": 50,
  "2_news_with_summary": 45,
  "2_news_without_summary": 5,
  "2_summary_coverage_percent": 90,
  "3_news_fetched": 10,
  "4_ai_summarization_working": true,
  "4_test_summary_length": 1024,
  "5_ist_timestamp_formatted": "12 Jan 2025, 03:30 PM IST",
  "5_relative_time": "5 hours ago",
  "status": "SUCCESS"
}
```

#### 2. Manual Fetch & Summarize
```http
POST http://localhost:8084/api/test/fetch-and-summarize
```
Triggers:
1. Fetch news from RSS feeds
2. Store in database (with duplicate detection)
3. Auto-summarize all unsummarized news

#### 3. Summary Statistics
```http
GET http://localhost:8084/api/test/summary-stats
```
Returns:
```json
{
  "total_news": 50,
  "with_summary": 45,
  "without_summary": 5,
  "coverage_percent": 90
}
```

### Production Endpoints

#### Get News with Summary (IST)
```http
GET http://localhost:8084/api/news/{id}/summary
```
Returns:
```json
{
  "id": 1,
  "title": "...",
  "summary": "...",
  "publishedAt": "2025-01-12T10:00:00",
  "publishedAtIst": "12 Jan 2025, 03:30 PM IST",
  "publishedAtRelative": "5 hours ago"
}
```

#### Get All News
```http
GET http://localhost:8084/api/news?page=0&size=20
```
All news items now include:
- `publishedAtIst`: Full IST timestamp
- `publishedAtRelative`: Relative time (e.g., "5 hours ago")

## IST Timezone Implementation

### Backend (UTC Storage, IST Display)

**Storage**: Always store in UTC in database
```java
LocalDateTime utcTime = DateTimeUtil.nowInUtc();
news.setPubDate(utcTime);
```

**Display**: Convert to IST for API responses
```java
String istTime = DateTimeUtil.formatAsIst(news.getPubDate());
// Output: "12 Jan 2025, 03:30 PM IST"

String relativeTime = DateTimeUtil.formatRelativeTime(news.getPubDate());
// Output: "5 hours ago"
```

### Frontend Integration

The News model automatically includes IST fields in JSON response:
```typescript
interface NewsItem {
  id: number;
  title: string;
  publishedAt: string;           // UTC: "2025-01-12T10:00:00"
  publishedAtIst: string;         // IST: "12 Jan 2025, 03:30 PM IST"
  publishedAtRelative: string;    // Relative: "5 hours ago"
}
```

**Usage in Frontend**:
```typescript
// For news cards - use relative time
<Text>{news.publishedAtRelative}</Text>
// Output: "5 hours ago"

// For detail view - use full IST timestamp
<Text>{news.publishedAtIst}</Text>
// Output: "12 Jan 2025, 03:30 PM IST"
```

## Relative Time Format

| Time Difference | Display |
|---|---|
| < 1 minute | "Just now" |
| 1-59 minutes | "X minutes ago" |
| 1-23 hours | "X hours ago" |
| 1-6 days | "X days ago" |
| > 7 days | "12 Jan, 03:30 PM" |

## Testing the Fix

### Step 1: Test System
```bash
curl http://localhost:8084/api/test/system
```
Verify all checks pass.

### Step 2: Trigger News Fetch
```bash
curl -X POST http://localhost:8084/api/test/fetch-and-summarize
```
This will:
1. Fetch news from RSS feeds
2. Store in database
3. Generate AI summaries

### Step 3: Check Database
```sql
SELECT 
  id, 
  title, 
  LENGTH(summary) as summary_length,
  summary IS NOT NULL as has_summary,
  pub_date
FROM news
ORDER BY pub_date DESC
LIMIT 10;
```

### Step 4: Test Frontend
1. Open mobile app
2. Navigate to news section
3. Verify:
   - ✅ News displays with summaries
   - ✅ Timestamps show in IST
   - ✅ Relative time (e.g., "5 hours ago") displays

## Troubleshooting

### Issue: "Summary unavailable"

**Check 1**: Is AI service working?
```bash
curl http://localhost:8084/api/news/test-gemini
```

**Check 2**: Are API keys configured?
```bash
echo $OPENROUTER_API_KEY
```

**Check 3**: Trigger manual summarization
```bash
curl -X POST http://localhost:8084/api/test/fetch-and-summarize
```

### Issue: Wrong timezone

**Verify IST conversion**:
```bash
curl http://localhost:8084/api/test/system | jq '.["5_ist_timestamp_formatted"]'
```
Should show: "DD MMM YYYY, HH:MM AM/PM IST"

### Issue: No news in database

**Trigger manual fetch**:
```bash
curl -X POST http://localhost:8084/api/news/fetch-top10
```

## Environment Variables Required

```bash
# OpenRouter AI
OPENROUTER_API_KEY=sk-or-v1-your-key-here
PRIMARY_MODEL=google/gemini-2.0-flash-exp:free
SECONDARY_MODEL=moonshotai/kimi-k2-0711:free
TERTIARY_MODEL=mistralai/mistral-small-24b-instruct-2501:free

# Database
NEON_DB_URL=jdbc:postgresql://your-neon-db-url/neondb?sslmode=require
NEON_DB_USER=your-username
NEON_DB_PASSWORD=your-password

# RSS Feeds
RSS_FEEDS=https://www.indiatoday.in/rss/1206578,https://indianexpress.com/feed/

# Scheduler
FETCH_INTERVAL_MINUTES=15
```

## Monitoring

### Check Summary Coverage
```bash
curl http://localhost:8084/api/test/summary-stats
```

### Check Latest News
```bash
curl http://localhost:8084/api/news/latest
```

### Monitor Logs
```bash
tail -f logs/news-ai-service.log | grep -E "(SUMMARY|IST|FETCH)"
```

## Success Criteria

- ✅ All news articles have summaries (700-1500 chars)
- ✅ No "Summary unavailable" errors
- ✅ Timestamps display in IST
- ✅ Relative time shows correctly (e.g., "5 hours ago")
- ✅ Duplicate news filtered out
- ✅ Auto-refresh works every 10-15 minutes

---

**Last Updated**: 2025-01-12  
**Author**: BharathVA Engineering Team

