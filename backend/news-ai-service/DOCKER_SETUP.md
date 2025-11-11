# News AI Service Docker Configuration

## Docker Compose Integration

The `news-ai-service` is now properly integrated into the main `docker-compose.yml` file.

### Service Configuration

```yaml
news-ai-service:
  build:
    context: .
    dockerfile: news-ai-service/Dockerfile
  container_name: bharathva-news-ai
  ports:
    - "8083:8083"
  env_file:
    - ./news-ai-service/.env.local
  depends_on:
    discovery-service:
      condition: service_healthy
    gateway-service:
      condition: service_healthy
  networks:
    - bharathva-network
  restart: unless-stopped
  healthcheck:
    test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:8083/actuator/health"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 60s
```

## Database Connection

### Supabase Connection String

**JDBC Format:**
```
jdbc:postgresql://db.trawrzkanhvxtupbjkcc.supabase.co:5432/postgres?sslmode=require
```

**Environment Variables (.env.local):**
```bash
SUPABASE_URL=jdbc:postgresql://db.trawrzkanhvxtupbjkcc.supabase.co:5432/postgres?sslmode=require
SUPABASE_USER=postgres
SUPABASE_PASSWORD=Nishal@bharthva
```

## Running the Service

### Start All Services
```bash
cd backend
docker-compose up --build
```

### Start Only News AI Service
```bash
cd backend
docker-compose up --build news-ai-service
```

### Check Service Status
```bash
docker-compose ps news-ai-service
docker-compose logs news-ai-service
```

### Verify Health
```bash
curl http://localhost:8083/actuator/health
curl http://localhost:8083/api/news/stats
```

## Configuration Files Updated

1. ✅ `docker-compose.yml` - Added news-ai-service with proper dependencies
2. ✅ `news-ai-service/Dockerfile` - Updated to use news-ai-service directory
3. ✅ `backend/pom.xml` - Updated module reference to news-ai-service
4. ✅ `feed-service/Dockerfile` - Updated to exclude news-ai-service
5. ✅ `application.yml` - Configured to load .env.local files
6. ✅ `.env.local` - Created with Supabase connection string

## Service Dependencies

The news-ai-service depends on:
- **discovery-service** (Eureka) - Must be healthy before starting
- **gateway-service** - Must be healthy before starting

## Network Configuration

All services run on the `bharathva-network` bridge network, allowing inter-service communication.

## Health Check

The service includes a health check endpoint:
- **Endpoint**: `http://localhost:8083/actuator/health`
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3
- **Start Period**: 60 seconds (allows time for initialization)

## Environment Variables

The service loads environment variables from `./news-ai-service/.env.local`:

- `SUPABASE_URL` - Database connection string
- `SUPABASE_USER` - Database username
- `SUPABASE_PASSWORD` - Database password
- `RSS_FEEDS` - Comma-separated RSS feed URLs
- `SERVER_PORT` - Service port (default: 8083)
- `FETCH_INTERVAL_MINUTES` - RSS fetch interval (default: 15)

## Troubleshooting

### Service Won't Start

1. Check if dependencies are running:
   ```bash
   docker-compose ps discovery-service gateway-service
   ```

2. Check logs:
   ```bash
   docker-compose logs news-ai-service
   ```

3. Verify .env.local exists:
   ```bash
   ls -la backend/news-ai-service/.env.local
   ```

### Database Connection Issues

1. Verify connection string in `.env.local`
2. Check if Supabase database is accessible
3. Verify credentials are correct
4. Check logs for connection errors

### Build Issues

1. Clean and rebuild:
   ```bash
   docker-compose build --no-cache news-ai-service
   ```

2. Check Maven build:
   ```bash
   cd backend
   mvn clean install -pl news-ai-service -am
   ```

## Summary

✅ **Docker Integration**: Complete
✅ **Database Connection**: Configured for Supabase
✅ **Service Dependencies**: Properly configured
✅ **Health Checks**: Enabled
✅ **Environment Variables**: Loaded from .env.local
✅ **Network**: Connected to bharathva-network

The service is ready to run in Docker!

