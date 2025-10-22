# Quick Test Guide - Feed Creation

## ✅ Fix Applied Successfully

The gateway routing issue has been fixed. Your mobile app should now be able to create feed posts.

## How to Test

### Option 1: Mobile App (Recommended)

1. **Open your mobile app** on your device/emulator
2. **Make sure you're logged in** (you should see the home screen)
3. **Tap the "+" (Create) tab** at the bottom
4. **Type a message** like "Hello from BharathVA!"
5. **Tap the Post button**
6. **Expected Result**: 
   - Success message appears
   - You're redirected back to home
   - Your post appears in the feed

### Option 2: cURL Test (Backend Verification)

```bash
# Step 1: Login to get JWT token
curl -X POST http://192.168.0.225:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "YOUR_EMAIL",
    "password": "YOUR_PASSWORD"
  }'

# Step 2: Copy the accessToken from response

# Step 3: Create a feed post
curl -X POST http://192.168.0.225:8080/api/feed/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "userId": "YOUR_USER_ID",
    "message": "Test post from cURL!"
  }'

# Expected: HTTP 201 Created with feed response
```

## What Was Fixed

**Before:** 
- Error: "No static resource feed/create"
- Request was not reaching feed service

**After:**
- Gateway properly routes to feed service ✅
- Request reaches feed service ✅
- Only requires valid JWT token ✅

## Services Running

Check all services are up:

```bash
cd backend
docker-compose ps
```

Expected output:
- ✅ bharathva-gateway - Up (healthy)
- ✅ bharathva-feed - Up (healthy)
- ✅ bharathva-auth - Up (healthy)
- ✅ bharathva-discovery - Up (healthy)
- ✅ bharathva-mongodb - Up (healthy)
- ✅ bharathva-redis - Up (healthy)

## Viewing Logs

If you encounter any issues:

```bash
# Gateway logs
docker logs bharathva-gateway --tail 50

# Feed service logs
docker logs bharathva-feed --tail 50

# Auth service logs
docker logs bharathva-auth --tail 50
```

## Mobile App Debug Console

Your mobile app has a debug console (bug icon button). Use it to:
- View request/response logs
- Check JWT token
- Verify API endpoint URLs
- See detailed error messages

## Troubleshooting

### Issue: "401 Unauthorized"
**Cause**: JWT token expired or invalid  
**Solution**: Logout and login again in mobile app

### Issue: "Network request failed"
**Cause**: Mobile device can't reach gateway  
**Solution**: Verify mobile device and computer are on same network

### Issue: "User not found"
**Cause**: userId doesn't exist in auth database  
**Solution**: Register a new user or use existing credentials

### Issue: Gateway not responding
**Solution**: 
```bash
cd backend
docker-compose restart gateway-service
```

## MongoDB Verification

View your posts in MongoDB Atlas:
1. Go to MongoDB Atlas dashboard
2. Browse Collections
3. Database: `bharathva_feed`
4. Collection: `feeds`
5. You should see your posts with userId, message, and timestamps

## Success Indicators

✅ Mobile app creates post without errors  
✅ Post appears in home feed  
✅ MongoDB contains the post document  
✅ Gateway logs show successful request routing  
✅ Feed service logs show feed creation  

## Need Help?

Check these files for detailed information:
- `FEED_CREATION_FIX_COMPLETE.md` - Complete fix documentation
- `backend/FEED_SERVICE_TESTING_GUIDE.md` - Feed service API testing
- `backend/test-feed-complete-flow.sh` - Automated test script

---

**Status**: All systems operational ✅  
**Ready for**: Production testing

