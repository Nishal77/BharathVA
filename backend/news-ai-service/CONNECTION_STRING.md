# Supabase Database Connection String

## Connection Details

### For JDBC (Spring Boot Application)

**Connection String:**
```
jdbc:postgresql://db.trawrzkanhvxtupbjkcc.supabase.co:5432/postgres?sslmode=require
```

**Credentials:**
- **Host**: `db.trawrzkanhvxtupbjkcc.supabase.co`
- **Database**: `postgres`
- **Username**: `postgres`
- **Password**: `Nishal@bharthva`
- **Port**: `5432` (default PostgreSQL port)
- **SSL Mode**: `require`

### For PostgreSQL Client (psql, pgAdmin, etc.)

**Connection URI:**
```
postgresql://postgres:Nishal%40bharthva@db.trawrzkanhvxtupbjkcc.supabase.co:5432/postgres?sslmode=require
```

**Note**: The `@` in the password must be URL-encoded as `%40` in the connection URI.

**Or use individual parameters:**
- **Host**: `db.trawrzkanhvxtupbjkcc.supabase.co`
- **Database**: `postgres`
- **Username**: `postgres`
- **Password**: `Nishal@bharthva`
- **Port**: `5432`
- **SSL Mode**: `require`

## Environment Variables for .env File

Create or update `backend/news-ai/.env` file with:

```bash
SUPABASE_URL=jdbc:postgresql://db.trawrzkanhvxtupbjkcc.supabase.co:5432/postgres?sslmode=require
SUPABASE_USER=postgres
SUPABASE_PASSWORD=Nishal@bharthva

RSS_FEEDS=https://www.indiatoday.in/rss/1206578,https://indianexpress.com/feed/,https://feeds.feedburner.com/ndtvnews-top-stories,https://timesofindia.indiatimes.com/rssfeedstopstories.cms,https://www.hindustantimes.com/feeds/rss/topnews/rssfeed.xml,https://www.indiatoday.in/rss/video
```

## Verification Steps

### 1. Test Connection with psql

```bash
psql "postgresql://postgres:Nishal%40bharthva@db.trawrzkanhvxtupbjkcc.supabase.co:5432/postgres?sslmode=require"
```

Then run:
```sql
SELECT COUNT(*) FROM news;
SELECT * FROM news ORDER BY created_at DESC LIMIT 10;
```

### 2. Test Connection with pgAdmin

1. Open pgAdmin
2. Right-click "Servers" → "Create" → "Server"
3. **General Tab**:
   - Name: `BharathVA News DB`
4. **Connection Tab**:
   - Host: `db.trawrzkanhvxtupbjkcc.supabase.co`
   - Port: `5432`
   - Database: `postgres`
   - Username: `postgres`
   - Password: `Nishal@bharthva`
5. **SSL Tab**:
   - SSL Mode: `Require`
6. Click "Save"

### 3. Verify Application Configuration

Check if your application is using the correct connection:

```bash
# Check if .env file exists
ls -la backend/news-ai/.env

# View .env file (be careful with credentials)
cat backend/news-ai/.env
```

### 4. Test Database Connection from Application

After starting the service, check logs for:
```
Database initialized successfully. Current news count: X
```

Or call the stats endpoint:
```bash
curl http://localhost:8083/api/news/stats
```

## Current Database State

- **Table**: `news` ✅ Exists
- **Schema**: ✅ Valid
- **Rows**: 0 (empty - ready for data)
- **Connection**: ✅ Verified (test insert worked)

## Troubleshooting

### If connection fails:

1. **Check SSL**: Ensure `sslmode=require` is in connection string
2. **Check Credentials**: Verify username and password are correct
3. **Check Network**: Ensure you can reach the Neon host
4. **Check Environment Variables**: Ensure `.env` file is loaded

### If data is not appearing:

1. **Check Application Logs**: Look for "Successfully saved news article [ID: X]"
2. **Check Transaction**: Ensure `@Transactional` is working
3. **Check Table**: Verify you're querying the correct database
4. **Check Branch**: Ensure you're on the correct Neon branch

## Direct SQL Test

Run this to verify the connection and insert a test record:

```sql
-- Check table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'news';

-- Insert test record
INSERT INTO news (title, description, link, source, pub_date) 
VALUES ('Test Article', 'Test Description', 'https://test.com/1', 'Test Source', CURRENT_TIMESTAMP)
RETURNING id, title, created_at;

-- Verify insertion
SELECT COUNT(*) FROM news;
SELECT * FROM news ORDER BY created_at DESC LIMIT 5;
```

## Project Information

- **Host**: `db.trawrzkanhvxtupbjkcc.supabase.co`
- **Database**: `postgres`
- **Provider**: Supabase

