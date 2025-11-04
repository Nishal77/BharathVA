# Notification System - Complete Fix Documentation

## Issue Summary

The notification system had the following issues:
1. **404 Error**: The `/api/feed/notifications` endpoint was returning 404
2. **Compilation Error**: Test file `FeedServiceTest.java` was calling `getAllFeeds` with incorrect parameters
3. **Gateway Routing**: Gateway configuration needed to use service discovery

## Root Causes

### 1. Gateway Routing Issue
- **Problem**: Gateway was using hardcoded Docker hostname `http://feed-service:8082`
- **Impact**: Requests to `/api/feed/notifications` couldn't reach the feed-service
- **Solution**: Changed to use service discovery `lb://FEED-SERVICE`

### 2. Test Compilation Error
- **Problem**: `FeedService.getAllFeeds()` method signature changed to include `currentUserId` parameter
- **Impact**: Test file was calling method with only 2 parameters instead of 3
- **Solution**: Updated test to pass `null` or actual user ID as third parameter

### 3. Controller Registration
- **Problem**: Controller needed proper Spring Boot component scanning
- **Impact**: Controller might not be registered if service wasn't restarted
- **Solution**: Verified `@ComponentScan` includes `com.bharathva.feed` package

## Fixes Applied

### 1. Gateway Configuration (`backend/gateway-service/src/main/resources/application.yml`)

**Before:**
```yaml
- id: feed-service
  uri: http://feed-service:8082
```

**After:**
```yaml
- id: feed-service
  uri: ${FEED_SERVICE_URI:lb://FEED-SERVICE}
```

### 2. Test File Fix (`backend/feed-service/src/test/java/com/bharathva/feed/FeedServiceTest.java`)

**Before:**
```java
var feeds = feedService.getAllFeeds(0, 10);
```

**After:**
```java
var feeds = feedService.getAllFeeds(0, 10, null);
```

Also added new test method:
```java
@Test
public void testGetAllFeedsWithCurrentUser() {
    var feeds = feedService.getAllFeeds(0, 10, testUserId1);
    // Verify userLiked status
}
```

### 3. Notification Controller Enhancements

Added health check endpoint:
```java
@GetMapping("/health")
public ResponseEntity<Map<String, Object>> health() {
    // Returns service status
}
```

Enhanced error handling:
- Separate handling for authentication errors (401)
- Detailed logging at each step
- Clear error messages

### 4. Security Configuration

Added health check endpoint to permitted paths:
```java
.requestMatchers("/api/feed/notifications/health").permitAll()
```

## Verification Steps

### 1. Compile Backend
```bash
cd backend
mvn clean install -DskipTests
```
**Expected**: BUILD SUCCESS

### 2. Test Compilation
```bash
cd backend/feed-service
mvn test-compile
```
**Expected**: BUILD SUCCESS

### 3. Health Check Endpoint
```bash
curl http://localhost:8080/api/feed/notifications/health
```
**Expected**: 
```json
{
  "status": "UP",
  "service": "notification-controller",
  "message": "Notification controller is running",
  "timestamp": "..."
}
```

### 4. Full Integration Test
```bash
cd backend/feed-service
mvn test -Dtest=NotificationControllerTest
```

## Component Structure

### Backend Components

1. **NotificationController** (`/api/feed/notifications`)
   - `GET /api/feed/notifications` - Get paginated notifications
   - `GET /api/feed/notifications/health` - Health check
   - `GET /api/feed/notifications/unread/count` - Unread count
   - `PUT /api/feed/notifications/{id}/read` - Mark as read
   - `PUT /api/feed/notifications/read-all` - Mark all as read

2. **NotificationService**
   - Creates/deletes notifications
   - Retrieves paginated notifications
   - Handles read/unread status

3. **NotificationRepository**
   - MongoDB repository for notifications
   - Custom queries for filtering and sorting

4. **Notification Model**
   - Stores recipient, actor, type, feed info
   - Tracks read/unread status
   - Timestamps for sorting

### Frontend Components

1. **notificationService.ts**
   - `getNotifications(page, size)` - Fetch notifications
   - `getUnreadCount()` - Get unread count
   - `markAsRead(notificationId)` - Mark single as read
   - `markAllAsRead()` - Mark all as read

2. **NotificationsContent.tsx**
   - Displays notifications with proper UI
   - Handles loading states and errors
   - Pull-to-refresh support
   - Pagination support

## API Endpoints

### Base URL
- Development: `http://192.168.0.121:8080/api/feed/notifications`
- Production: `https://api.bharathva.com/api/feed/notifications`

### Authentication
All endpoints (except `/health`) require JWT authentication:
```
Authorization: Bearer <token>
```

### Response Format

**Success Response:**
```json
{
  "content": [
    {
      "id": "...",
      "recipientUserId": "...",
      "actorUserId": "...",
      "actorUsername": "...",
      "actorFullName": "...",
      "actorProfileImageUrl": "...",
      "type": "LIKE",
      "feedId": "...",
      "feedImageUrl": "...",
      "isRead": false,
      "createdAt": "2025-11-04T07:00:00",
      "timeAgoHours": 2
    }
  ],
  "totalElements": 10,
  "totalPages": 1,
  "number": 0,
  "size": 20,
  "first": true,
  "last": true
}
```

## Testing

### Unit Tests
- `FeedServiceTest.java` - Tests feed service with user context
- `NotificationControllerTest.java` - Tests notification controller

### Integration Tests
Run all tests:
```bash
cd backend/feed-service
mvn test
```

Run specific test:
```bash
mvn test -Dtest=NotificationControllerTest
```

## Deployment Checklist

- [ ] Backend compiled successfully
- [ ] All tests pass
- [ ] Gateway service restarted
- [ ] Feed service restarted
- [ ] Health check endpoint accessible
- [ ] Notification endpoint accessible with authentication
- [ ] Frontend can fetch notifications
- [ ] Notifications display correctly in UI

## Next Steps

1. **Restart Services**
   ```bash
   docker-compose restart gateway-service feed-service
   ```

2. **Verify Endpoints**
   - Health check: `curl http://localhost:8080/api/feed/notifications/health`
   - With auth: Test via mobile app

3. **Monitor Logs**
   - Check for "Getting notifications" log entries
   - Verify no 404 errors
   - Confirm authentication working

## Notes

- The notification system is fully integrated with the like functionality
- Notifications are automatically created when posts are liked
- Notifications are deleted when posts are unliked
- The system supports pagination for efficient data retrieval
- All endpoints include proper error handling and logging

