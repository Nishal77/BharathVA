# News AI Service - Complete Rebuild Instructions

## Problem
Service was registered with old port 8083 in Eureka and showing as DOWN.

## Solution
Complete rebuild to use port 8084 consistently across all configurations.

## Quick Start

### Option 1: Automated Rebuild (Recommended)
```bash
cd backend/news-ai-service
./rebuild-and-test.sh
```

This script will:
1. Stop and remove old container
2. Remove old Docker image
3. Build new image from scratch
4. Start the service
5. Wait for service to be ready
6. Wait for Eureka registration
7. Run comprehensive tests

### Option 2: Manual Rebuild
```bash
cd backend

# Stop and remove old service
docker-compose stop news-ai-service
docker-compose rm -f news-ai-service

# Remove old image (optional but recommended)
docker rmi backend-news-ai-service

# Rebuild and start
docker-compose up --build -d news-ai-service

# Watch logs
docker-compose logs -f news-ai-service
```

## Configuration Verification

### Port Configuration (All set to 8084)
- ✅ `application.yml`: `server.port: ${SERVER_PORT:8084}`
- ✅ `docker-compose.yml`: `ports: - "8084:8084"`
- ✅ `Dockerfile`: `EXPOSE 8084`
- ✅ Eureka instance-id: `news-ai-service:8084`
- ✅ Health check: `http://localhost:8084/actuator/health`

### Environment Variables Required
Create `backend/news-ai-service/.env.local`:
```bash
# Database Configuration (Supabase)
SUPABASE_DB_URL=jdbc:postgresql://db.trawrzkanhvxtupbjkcc.supabase.co:5432/postgres?sslmode=require
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=Nishal@bharthva

# Supabase API
SUPABASE_URL=https://trawrzkanhvxtupbjkcc.supabase.co
SERVICE_KEY=your_supabase_service_key_here

# Service Configuration
SERVER_PORT=8084
FETCH_INTERVAL_MINUTES=15

# Eureka Configuration
EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://discovery-service:8761/eureka/
EUREKA_INSTANCE_PREFERIPADDRESS=true
EUREKA_INSTANCE_INSTANCEID=news-ai-service:8084
EUREKA_INSTANCE_HOSTNAME=news-ai-service

# RSS Feeds
RSS_FEEDS=https://www.indiatoday.in/rss/1206578,https://www.indiatoday.in/rss/1206514,https://indianexpress.com/feed/,https://feeds.feedburner.com/ndtv/TopStories,https://timesofindia.indiatimes.com/rssfeedstopstories.cms,https://www.hindustantimes.com/rss/topnews/rss2.xml

# Gemini API (optional)
GEMINI_API_KEY=your_gemini_api_key_here
```

## Testing After Rebuild

### 1. Check Service Health
```bash
curl http://localhost:8084/actuator/health
```
Expected: `{"status":"UP"}`

### 2. Check Custom Health Endpoint
```bash
curl http://localhost:8084/api/news/health
```
Expected: `News AI Service is running`

### 3. Check Eureka Registration
```bash
curl http://localhost:8761/eureka/apps/NEWS-AI-SERVICE
```
Look for: Instance with port `8084` and status `UP`

Or visit: http://localhost:8761

### 4. Check Database Stats
```bash
curl http://localhost:8084/api/news/stats
```
Expected: JSON with database statistics

### 5. Test Through Gateway
```bash
curl http://localhost:8080/api/news/health
```
Expected: `News AI Service is running`

### 6. Insert Test Data
```bash
curl -X POST http://localhost:8084/api/news/test-data
```
Expected: JSON with test article details

### 7. Fetch Latest News
```bash
curl http://localhost:8084/api/news/latest?page=0&size=10
```
Expected: JSON with news articles

## Troubleshooting

### Service Won't Start
```bash
# Check logs
docker-compose logs news-ai-service

# Check if port is in use
lsof -i :8084

# Check container status
docker-compose ps news-ai-service
```

### Service Not Registering with Eureka
```bash
# Check discovery service is running
docker-compose ps discovery-service
curl http://localhost:8761/eureka/apps

# Check network connectivity
docker network inspect backend_bharathva-network

# Restart service
docker-compose restart news-ai-service
```

### Database Connection Issues
```bash
# Check .env.local exists
ls -la backend/news-ai-service/.env.local

# Test database connection manually
psql "postgresql://postgres:Nishal@bharthva@db.trawrzkanhvxtupbjkcc.supabase.co:5432/postgres?sslmode=require"

# Check logs for connection errors
docker-compose logs news-ai-service | grep -i "database\|connection\|error"
```

### Old Instance Stuck in Eureka
The old instance (8083) will automatically be removed from Eureka after 90 seconds of inactivity. To speed this up:
```bash
# Restart Eureka
docker-compose restart discovery-service

# Wait 30 seconds and check
curl http://localhost:8761/eureka/apps/NEWS-AI-SERVICE
```

## Verification Checklist

After rebuild, verify:
- [ ] Service starts successfully
- [ ] Health endpoint returns UP
- [ ] Service registered in Eureka on port 8084
- [ ] Old instance (8083) removed from Eureka
- [ ] Database connection working (if credentials provided)
- [ ] Gateway routing to service works
- [ ] Test data can be inserted
- [ ] News endpoints return data

## Expected Timeline

- Service startup: ~30-60 seconds
- Eureka registration: ~30-60 seconds after startup
- Old instance removal: ~90 seconds after old service stopped
- Total time: ~2-3 minutes

## Success Indicators

When everything is working:
1. Eureka dashboard shows `NEWS-AI-SERVICE` with status `UP (1)` on port `8084`
2. Health check returns `{"status":"UP"}`
3. Gateway can route to the service
4. Database operations work (if database connected)
5. No error logs in container

## Next Steps After Successful Rebuild

1. **Test RSS Feed Fetching**:
   ```bash
   curl -X POST http://localhost:8084/api/news/fetch-top10
   ```

2. **Check Stored News**:
   ```bash
   curl http://localhost:8084/api/news/latest?page=0&size=10
   ```

3. **Monitor Scheduled Jobs**:
   ```bash
   docker-compose logs -f news-ai-service | grep "Auto refresh"
   ```

4. **Test Mobile App Integration**:
   - Ensure mobile app uses `http://192.168.0.121:8084`
   - Update `apps/mobile/services/api/environment.ts` if needed

## Support

If issues persist:
1. Check all environment variables are set correctly
2. Verify Docker network is healthy
3. Ensure dependencies (discovery-service, gateway-service) are running
4. Check Docker logs for specific error messages
5. Verify database credentials in Supabase dashboard

