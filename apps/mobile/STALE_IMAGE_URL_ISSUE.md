# Stale Image URL Issue - Root Cause Identified

## Problem Summary

The "Profile image from NeonDB failed to load" error is caused by **stale URLs** in the database. Images have been deleted from Cloudinary, but their URLs are still stored in NeonDB.

## Evidence

### curl Test Result:
```bash
curl -I "https://res.cloudinary.com/dqmryiyhz/image/upload/v1761887275/profile/lzizi88tpwldqbaenzkr.jpg"

HTTP/2 404
x-cld-error: Resource not found - profile/lzizi88tpwldqbaenzkr
```

**Status**: Image does not exist in Cloudinary
**Root Cause**: Image was deleted from Cloudinary but URL remains in database

## Why This Happens

1. **Image Deletion**: Images are deleted from Cloudinary (manually or programmatically)
2. **Stale URLs**: The `profile_image_url` column in NeonDB still contains the deleted image's URL
3. **Load Failure**: React Native Image component tries to load non-existent image → 404 error

## Current Error Handling

The app now:
- ✅ Detects 404 errors specifically
- ✅ Shows placeholder avatar when image fails to load
- ✅ Logs detailed error information including 404 status
- ✅ Warns about stale URLs in console

## Solutions

### Option 1: Clean Up Stale URLs (Recommended)

**Backend Solution**: Add a cleanup job that:
1. Periodically checks all `profile_image_url` values in NeonDB
2. Verifies URLs with Cloudinary API
3. Sets `profile_image_url` to `NULL` if image doesn't exist
4. Runs daily/weekly as a maintenance task

**Implementation**:
```java
// In UserService or a new MaintenanceService
@Scheduled(cron = "0 0 2 * * ?") // Daily at 2 AM
public void cleanupStaleProfileImages() {
    List<User> usersWithImages = userRepository.findByProfileImageUrlIsNotNull();
    
    for (User user : usersWithImages) {
        String url = user.getProfileImageUrl();
        if (!cloudinaryService.imageExists(url)) {
            log.info("Cleaning up stale profile image URL for user {}: {}", user.getId(), url);
            user.setProfileImageUrl(null);
            userRepository.save(user);
        }
    }
}
```

### Option 2: Frontend Cleanup

**When 404 is detected**, optionally:
- Call backend API to clear the stale URL
- Prevent showing placeholder indefinitely

### Option 3: Prevent Future Stale URLs

**When deleting images from Cloudinary**:
1. Always update corresponding user record in NeonDB
2. Set `profile_image_url` to `NULL`
3. Or update to a new image URL

## Immediate Fix

For now, the app handles this gracefully:
- ✅ Shows placeholder avatar instead of broken image
- ✅ Logs detailed error information
- ✅ Identifies 404 errors specifically

## Database Cleanup Query

To manually clean up stale URLs:

```sql
-- Find users with profile images
SELECT id, username, profile_image_url 
FROM users 
WHERE profile_image_url IS NOT NULL;

-- To set all profile_image_url to NULL (use with caution):
-- UPDATE users SET profile_image_url = NULL WHERE profile_image_url IS NOT NULL;
```

## Verification

After cleanup, verify:
1. URLs in database should point to existing Cloudinary images
2. All profile images should load successfully
3. Placeholders should only show for users who never uploaded images

## Prevention Best Practices

1. **Delete Image Flow**:
   ```java
   // When deleting profile image
   1. Delete from Cloudinary
   2. Update user.setProfileImageUrl(null)
   3. Save to database
   ```

2. **Upload New Image Flow**:
   ```java
   // When uploading new image
   1. Upload to Cloudinary
   2. Get URL
   3. If user has old image URL:
      - Delete old image from Cloudinary
   4. Save new URL to database
   ```

3. **Image Validation**:
   - Validate image exists before saving URL to database
   - Or handle 404 gracefully (current approach)

## Status

✅ **Issue Identified**: Stale URLs in database
✅ **Error Handling**: Improved to detect and log 404 errors
✅ **User Experience**: Placeholder shown instead of broken image
🔄 **Next Step**: Implement backend cleanup job (Option 1)

