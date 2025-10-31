# Backend Rebuild Instructions for Cloudinary Fix

## Issue Fixed
The "Invalid transformation component" error was caused by incorrect Cloudinary transformation parameter format. The fix changes the transformation parameters from nested Object arrays to direct parameters, matching the feed-service implementation.

## What Was Changed

### File: `src/main/java/com/bharathva/auth/service/CloudinaryService.java`
- Changed transformation parameters from nested Object arrays to direct parameters
- This matches the working pattern used in `feed-service/src/main/java/com/bharathva/feed/service/CloudinaryService.java`

## Rebuild Steps

### Option 1: Using Maven (if installed)
```bash
cd backend/auth-service
mvn clean package -DskipTests
```

### Option 2: Using Docker (if using Docker Compose)
```bash
cd backend
docker-compose build auth-service
docker-compose up -d auth-service
```

### Option 3: Using IDE
- Right-click on `auth-service` project
- Select "Build" or "Rebuild Project"
- Restart the Spring Boot application

## Verification

After rebuilding and restarting, the backend console should show:
- `🚀 [CloudinaryService] Starting profile image upload`
- `📦 [CloudinaryService] Upload options: ...`
- `✅ [CloudinaryService] Upload successful`
- `🔗 [CloudinaryService] Secure URL: ...`

## Cloudinary Configuration

The credentials are already configured in `application.yml`:
```yaml
cloudinary:
  cloud_name: dqmryiyhz
  api_key: 397473723639954
  api_secret: FM-U9FOM6wm1KWDjS_vc39dngCg
```

## Test the Fix

1. Upload a profile image from the mobile app
2. Check backend console for detailed logs
3. Verify image appears in Cloudinary console: https://console.cloudinary.com/app/c-3ffb73b229b944f33fae7e718c3eac/assets/media_library/folders/cd1c399e1f09628303fff4ab845eb020fc?view_mode=mosaic
4. Delete the image and verify it's removed from Cloudinary

## Deletion Functionality

The deletion is already implemented:
- When user deletes image in EditProfile, `profileImageUrl` is set to `null`
- Backend extracts public ID from Cloudinary URL
- Calls `cloudinaryService.deleteImage(publicId)` to remove from Cloudinary
- Updates database to set `profileImageUrl = null`

