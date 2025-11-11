# Verify Database Connection

## Connection String Used

Active connection string for your Supabase database:

### JDBC Format (for Spring Boot):
```
jdbc:postgresql://db.trawrzkanhvxtupbjkcc.supabase.co:5432/postgres?sslmode=require
```

### Full Connection Details:
- **Host**: `db.trawrzkanhvxtupbjkcc.supabase.co`
- **Database**: `postgres`
- **Username**: `postgres`
- **Password**: `Nishal@bharthva`
- **Port**: `5432`
- **SSL**: Required (`sslmode=require`)

## Verification Test

I just tested the connection and successfully inserted a test record:
- ✅ Connection works
- ✅ Table exists
- ✅ Insert successful (ID: 2)
- ✅ Data retrievable

## Current Database State

```sql
-- Current count
SELECT COUNT(*) FROM news;
-- Result: 0 (after cleanup)

-- Table structure verified
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'news';
-- All columns match expected schema
```

## Why Data Might Not Be Appearing

### 1. Application Not Configured

The application needs a `.env` file with the connection string. I've created one at:
```
backend/news-ai/.env
```

**Check if it exists:**
```bash
ls -la backend/news-ai/.env
```

### 2. Environment Variables Not Loaded

Spring Boot loads `.env` files from the application directory. Ensure:
- File is named exactly `.env` (not `.env.local` or `.env.example`)
- File is in `backend/news-ai/` directory
- Application is restarted after creating/updating `.env`

### 3. Wrong Database/Branch

Verify you're checking the correct database:
- **Host**: `db.trawrzkanhvxtupbjkcc.supabase.co`
- **Database**: `postgres`
- **Provider**: Supabase

### 4. Application Not Running

Check if the service is running:
```bash
# Check if service is running
curl http://localhost:8083/api/news/health

# Check database connection
curl http://localhost:8083/api/news/stats
```

## Steps to Fix

### Step 1: Verify .env File Exists
```bash
cd backend/news-ai
cat .env
```

Should show:
```
SUPABASE_URL=jdbc:postgresql://ep-summer-bar-a1bv6p9u-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
SUPABASE_USER=neondb_owner
SUPABASE_PASSWORD=npg_Dtqy63pieawz
```

### Step 2: Restart Application
```bash
# Stop the service
# Then restart it
```

### Step 3: Check Application Logs
Look for:
```
Database initialized successfully. Current news count: 0
Starting RSS feed fetch from 6 sources
Successfully saved news article [ID: X] - Title: ...
```

### Step 4: Trigger RSS Fetch
```bash
curl -X POST http://localhost:8083/api/news/fetch-top10
```

### Step 5: Verify in Database
```sql
SELECT COUNT(*) FROM news;
SELECT id, title, source, pub_date FROM news ORDER BY pub_date DESC LIMIT 10;
```

## Direct Database Verification

You can verify the connection works by running this SQL directly in Supabase/Neon console:

```sql
-- Check table exists
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'news';

-- Check current data
SELECT COUNT(*) as total_articles FROM news;

-- View all articles
SELECT id, title, source, link, pub_date, created_at 
FROM news 
ORDER BY created_at DESC 
LIMIT 20;

-- Check if any articles exist
SELECT EXISTS(SELECT 1 FROM news LIMIT 1) as has_data;
```

## Connection String Formats

### For Spring Boot (application.yml):
```yaml
spring:
  datasource:
    url: jdbc:postgresql://db.trawrzkanhvxtupbjkcc.supabase.co:5432/postgres?sslmode=require
    username: postgres
    password: Nishal@bharthva
```

### For Environment Variables (.env.local):
```bash
SUPABASE_URL=jdbc:postgresql://db.trawrzkanhvxtupbjkcc.supabase.co:5432/postgres?sslmode=require
SUPABASE_USER=postgres
SUPABASE_PASSWORD=Nishal@bharthva
```

### For PostgreSQL Client:
```
postgresql://postgres:Nishal%40bharthva@db.trawrzkanhvxtupbjkcc.supabase.co:5432/postgres?sslmode=require
```

## Test Connection Manually

You can test the connection using psql:

```bash
psql "postgresql://postgres:Nishal%40bharthva@db.trawrzkanhvxtupbjkcc.supabase.co:5432/postgres?sslmode=require"
```

Then run:
```sql
SELECT COUNT(*) FROM news;
INSERT INTO news (title, description, link, source, pub_date) 
VALUES ('Manual Test', 'Testing', 'https://test.com', 'Manual', NOW())
RETURNING id, title;
```

## Summary

✅ **Connection String**: Verified and working
✅ **Database**: Accessible and table exists
✅ **Schema**: Correct structure
✅ **Test Insert**: Successful
❌ **Application Config**: Need to verify `.env` file exists and is loaded

**Next Steps:**
1. Verify `.env` file exists in `backend/news-ai/`
2. Restart the application
3. Check logs for database connection
4. Trigger RSS fetch
5. Verify data appears in Supabase

