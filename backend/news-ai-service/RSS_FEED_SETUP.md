# RSS Feed Setup Guide

## Overview
This document explains how to configure and use the RSS feed fetching system for BharathVA News AI Service.

## Configuration

### Environment Variables

Create a `.env` file in the `backend/news-ai` directory with the following RSS feed configuration:

```bash
RSS_FEEDS=https://www.indiatoday.in/rss/1206578,https://indianexpress.com/feed/,https://feeds.feedburner.com/ndtvnews-top-stories,https://timesofindia.indiatimes.com/rssfeedstopstories.cms,https://www.hindustantimes.com/feeds/rss/topnews/rssfeed.xml,https://www.indiatoday.in/rss/video
```

**Important**: RSS feeds must be comma-separated with no spaces, or use spaces after commas.

### Supported RSS Feeds

The following RSS feeds are currently configured and tested:

1. **India Today (General News)**: `https://www.indiatoday.in/rss/1206578`
2. **Indian Express**: `https://indianexpress.com/feed/`
3. **NDTV Top Stories**: `https://feeds.feedburner.com/ndtvnews-top-stories`
4. **Times of India Top Stories**: `https://timesofindia.indiatimes.com/rssfeedstopstories.cms`
5. **Hindustan Times Top News**: `https://www.hindustantimes.com/feeds/rss/topnews/rssfeed.xml`
6. **India Today (Video)**: `https://www.indiatoday.in/rss/video`

## Features

### RSS Feed Parsing
- Automatically extracts title, description, link, and publication date
- Extracts images from RSS enclosures and HTML content
- Extracts video URLs from RSS enclosures
- Handles different RSS feed formats (RSS 2.0, Atom, etc.)
- Normalizes image URLs (handles protocol-relative URLs)
- Extracts images from HTML content using regex patterns

### Database Storage
- Stores all news articles in PostgreSQL (Supabase)
- Prevents duplicate entries using unique link constraint
- Automatically sets timestamps (created_at, updated_at, pub_date)
- Indexes on pub_date, source, and link for fast queries

### Scheduled Fetching
- Automatically fetches news every 15 minutes
- Configurable interval via `FETCH_INTERVAL_MINUTES` environment variable
- Runs summarization and cleanup after fetching
- Logs detailed statistics (fetched, skipped, errors)

### API Endpoints

#### Get Trending News
```
GET /api/news/trending?page=0&size=10
```

Returns paginated list of trending news articles.

#### Get Database Statistics
```
GET /api/news/stats
```

Returns database connection status, total articles count, and latest article information.

#### Manual RSS Fetch Trigger
```
POST /api/news/fetch
```

Manually triggers RSS feed fetching (useful for testing).

## Database Schema

The `news` table structure:

```sql
CREATE TABLE news (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    summary TEXT,
    link VARCHAR(2048) UNIQUE NOT NULL,
    source VARCHAR(200),
    image_url VARCHAR(2048),
    video_url VARCHAR(2048),
    pub_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## Troubleshooting

### No News Articles Being Fetched

1. **Check RSS Feed Configuration**:
   - Verify `RSS_FEEDS` environment variable is set correctly
   - Ensure feeds are comma-separated
   - Check feed URLs are accessible

2. **Check Database Connection**:
   - Verify Supabase credentials are correct
   - Check database connection using `/api/news/stats` endpoint
   - Ensure the `news` table exists

3. **Check Logs**:
   - Look for RSS fetch logs in application logs
   - Check for connection errors or parsing errors
   - Verify feed URLs are returning valid RSS/Atom XML

### Images Not Being Extracted

- Some RSS feeds may not include images in standard formats
- The service attempts multiple extraction methods:
  1. RSS enclosures with image MIME types
  2. HTML `<img>` tags in description/content
  3. Direct image URLs in content
  4. CDN image URLs

### Database Not Storing Data

1. **Check JPA Configuration**:
   - Ensure `JPA_DDL_AUTO` is set to `update` or `create`
   - Or manually run the migration script: `V1__create_news_table.sql`

2. **Check Database Permissions**:
   - Verify database user has INSERT permissions
   - Check for unique constraint violations (duplicate links)

3. **Check Application Logs**:
   - Look for database connection errors
   - Check for constraint violation errors
   - Verify transaction commits are successful

## Testing

### Manual RSS Fetch Test

```bash
curl -X POST http://localhost:8083/api/news/fetch
```

### Check Database Stats

```bash
curl http://localhost:8083/api/news/stats
```

### Get Trending News

```bash
curl http://localhost:8083/api/news/trending?page=0&size=10
```

## Mobile App Integration

The mobile app automatically:
- Fetches 10 trending news articles on load
- Refreshes news every 15 minutes
- Displays news in card format with images
- Shows source, title, description, and publication date

## Performance Considerations

- RSS feeds are fetched sequentially (one at a time)
- Each feed has a 10-second connection timeout and 30-second read timeout
- Duplicate articles are skipped (based on link uniqueness)
- Database queries are optimized with indexes on frequently queried columns

