# Test Database Storage - Supabase Verification

## Test Endpoint Created

A new test endpoint has been added to verify database storage:

**Endpoint**: `POST /api/news/test-data`

This endpoint will:
1. Insert a random test news article
2. Verify it was saved with an ID
3. Check the count before and after
4. Retrieve the saved article to confirm persistence
5. Return detailed results

## How to Test

### Step 1: Start the Service

```bash
cd backend/news-ai-service
mvn spring-boot:run
```

Or if running in Docker:
```bash
cd backend
docker-compose up news-ai-service
```

### Step 2: Check Current Database State

```bash
curl http://localhost:8083/api/news/stats
```

Expected response:
```json
{
  "totalArticles": 0,
  "latestCount": 0,
  "databaseConnected": true,
  "timestamp": "2025-01-11T10:30:00"
}
```

### Step 3: Insert Test Data

```bash
curl -X POST http://localhost:8083/api/news/test-data
```

Expected response (success):
```json
{
  "message": "Test data inserted and verified successfully",
  "testArticleId": 1,
  "testArticleTitle": "Test News Article - 1736582400000",
  "testArticleLink": "https://test.bharathva.com/news/test-1736582400000",
  "testArticleSource": "Test Source",
  "countBefore": 0,
  "countAfter": 1,
  "articlesAdded": 1,
  "verified": true,
  "totalArticlesInDatabase": 1,
  "timestamp": "2025-01-11T10:30:00"
}
```

### Step 4: Verify in Supabase

After inserting test data, check your Supabase dashboard:

1. Go to your Supabase project
2. Navigate to Table Editor
3. Select the `news` table
4. You should see the test article with:
   - ID: 1 (or next available)
   - Title: "Test News Article - [timestamp]"
   - Source: "Test Source"
   - Link: "https://test.bharathva.com/news/test-[timestamp]"

### Step 5: Verify Retrieval

```bash
curl http://localhost:8083/api/news/latest
```

Should return the test article in the list.

### Step 6: Check Stats Again

```bash
curl http://localhost:8083/api/news/stats
```

Should show:
```json
{
  "totalArticles": 1,
  "latestCount": 1,
  "databaseConnected": true,
  "latestArticle": "Test News Article - 1736582400000",
  "latestArticleDate": "2025-01-11T10:30:00"
}
```

## Test Multiple Times

You can call the test endpoint multiple times:

```bash
# Insert first test article
curl -X POST http://localhost:8083/api/news/test-data

# Insert second test article
curl -X POST http://localhost:8083/api/news/test-data

# Check count
curl http://localhost:8083/api/news/stats
```

Each call will create a unique test article with a different timestamp-based ID.

## Troubleshooting

### If Test Fails

**Error: "Failed to insert test data"**

1. Check database connection:
   ```bash
   curl http://localhost:8083/api/news/stats
   ```
   If `databaseConnected: false`, check your `.env.local` file.

2. Check application logs for:
   ```
   Database initialization failed
   Failed to initialize database
   ```

3. Verify `.env.local` has:
   ```bash
   SUPABASE_DB_URL=jdbc:postgresql://[host]:5432/[database]?sslmode=require
   SUPABASE_DB_USER=[username]
   SUPABASE_DB_PASSWORD=[password]
   ```

4. Check if table exists in Supabase:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name = 'news';
   ```

### If Data Doesn't Appear in Supabase

1. Check application logs for:
   ```
   Successfully saved news article [ID: X]
   ```

2. Verify transaction commit:
   - Check logs for "Test data inserted successfully with ID: X"
   - If ID is null, transaction didn't commit

3. Check Supabase connection:
   - Verify credentials in `.env.local`
   - Test connection manually with psql

## Expected Log Output

When test endpoint is called successfully, you should see:

```
Inserting test data to verify database connection and storage
Articles in database before insert: 0
Test data inserted successfully with ID: 1
Articles in database after insert: 1 (added: 1)
```

## Summary

The test endpoint provides:
- ✅ Direct database insertion test
- ✅ Transaction verification
- ✅ Count verification (before/after)
- ✅ Retrieval verification
- ✅ Detailed response with article ID

Use this endpoint to verify that:
1. Database connection works
2. Data is being stored
3. Transactions are committing
4. Data is retrievable

