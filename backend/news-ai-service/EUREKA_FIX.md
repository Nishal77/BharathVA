# News AI Service - Eureka Registration Fix

## Issues Fixed

### 1. Eureka Registration Configuration ✅
- Added `healthcheck.enabled: true` for Eureka health checks
- Added `hostname` configuration for proper service discovery
- Added `lease-renewal-interval-in-seconds` and `lease-expiration-duration-in-seconds`
- Added `health-check-url-path` and `status-page-url-path` for Eureka monitoring

### 2. Database Initialization Non-Blocking ✅
- Changed from `@PostConstruct` to `@EventListener(ApplicationReadyEvent.class)`
- This allows the service to start and register with Eureka BEFORE database initialization
- Database initialization failures no longer prevent service startup
- Service can register with Eureka even if database connection fails initially

### 3. Datasource Configuration ✅
- Added `continue-on-error: true` to allow service startup even if datasource initialization fails
- This ensures Eureka registration happens regardless of database status

## Eureka Service Name

The service will register as `NEWS-AI-SERVICE` (uppercase) in Eureka, matching the gateway configuration:
- Gateway route: `lb://NEWS-AI-SERVICE`
- Eureka registration: `NEWS-AI-SERVICE` (auto-converted from `news-ai-service`)

## Testing

After restarting the service:

1. **Check Eureka Dashboard**: http://localhost:8761
   - Should see `NEWS-AI-SERVICE` registered

2. **Check Service Health**: 
   ```bash
   curl http://localhost:8084/actuator/health
   ```

3. **Check Service Registration**:
   ```bash
   curl http://localhost:8761/eureka/apps/NEWS-AI-SERVICE
   ```

4. **Test Through Gateway**:
   ```bash
   curl http://localhost:8080/api/news/health
   ```

## Configuration Summary

### Eureka Client Configuration
```yaml
eureka:
  client:
    register-with-eureka: true
    fetch-registry: true
    healthcheck:
      enabled: true
  instance:
    prefer-ip-address: true
    hostname: news-ai-service
    health-check-url-path: /actuator/health
    status-page-url-path: /actuator/info
```

### Database Initialization
- Runs AFTER application is ready (ApplicationReadyEvent)
- Non-blocking - service starts even if database fails
- Logs warnings but doesn't crash the service

## Next Steps

1. Restart the service:
   ```bash
   cd backend
   docker-compose restart news-ai-service
   ```

2. Check logs:
   ```bash
   docker-compose logs -f news-ai-service
   ```

3. Verify Eureka registration:
   - Open http://localhost:8761
   - Look for `NEWS-AI-SERVICE` in the list

The service should now:
- ✅ Start successfully
- ✅ Register with Eureka
- ✅ Be accessible on port 8084
- ✅ Be discoverable through the gateway

