# Testing Profile Image Upload

This document explains how to test the profile image upload functionality.

## Quick Test (Mobile App)

### Option 1: Use Test Component

1. Import the test component:
```typescript
import ProfileImageUploadTest from '../components/ProfileImageUploadTest';
```

2. Add it to a test screen or debug menu:
```typescript
<ProfileImageUploadTest />
```

3. Run the app and tap "Test Image Upload" button

### Option 2: Run Test Function Directly

```typescript
import { testProfileImageUpload } from './utils/testProfileImageUpload';

// In your component or test file
const handleTest = async () => {
  // Pick an image first
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
  
  if (!result.canceled && result.assets[0]) {
    const testResult = await testProfileImageUpload(result.assets[0].uri);
    console.log('Test result:', testResult);
  }
};
```

## Backend API Test

### Using Shell Script

1. Navigate to test scripts directory:
```bash
cd backend/auth-service/test-scripts
```

2. Run the test script:
```bash
./test-profile-image-upload.sh
```

3. Enter your credentials when prompted

### Manual cURL Test

1. First, login to get access token:
```bash
ACCESS_TOKEN=$(curl -s -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}' \
  | jq -r '.data.accessToken')
```

2. Upload image:
```bash
curl -X POST "http://localhost:8080/api/auth/user/me/profile-image" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -F "file=@path/to/image.jpg"
```

3. Verify profile:
```bash
curl -X GET "http://localhost:8080/api/auth/user/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  | jq '.data.profileImageUrl'
```

## What Gets Tested

### Mobile Test Functions

- **`testProfileImageUpload(uri)`**: Tests image upload to Cloudinary
  - Checks authentication
  - Fetches current profile
  - Uploads image
  - Verifies profile update
  - Confirms Cloudinary URL

- **`testProfileUpdateWithImage(uri)`**: Tests full update flow
  - Uploads image
  - Updates profile with image URL
  - Verifies persistence

- **`testImageUploadErrorHandling()`**: Tests error cases
  - Invalid URIs
  - Non-existent files
  - Empty strings

### Backend Test Script

- Service health check
- User authentication
- Profile fetch (before upload)
- Image upload to Cloudinary
- Database update verification
- Cloudinary URL validation

## Expected Results

### Successful Upload

```json
{
  "success": true,
  "data": {
    "uploadedUrl": "https://res.cloudinary.com/dqmryiyhz/image/upload/v1234567890/profile/xxx.jpg",
    "savedUrl": "https://res.cloudinary.com/dqmryiyhz/image/upload/v1234567890/profile/xxx.jpg",
    "matches": true
  }
}
```

### Common Issues

1. **"No static resource" error**
   - **Solution**: Rebuild and restart auth-service
   - Verify endpoint path matches: `/api/auth/user/me/profile-image`

2. **"Authentication required" error**
   - **Solution**: Make sure user is logged in
   - Check access token is valid

3. **Cloudinary upload fails**
   - **Solution**: Verify Cloudinary credentials in `application.yml`
   - Check network connectivity

4. **Database update fails**
   - **Solution**: Verify NeonDB connection
   - Check `profile_image_url` column exists

## Debugging

### Enable Detailed Logging

The test functions include console logging. Check your console/terminal for:
- `📤 [ProfileService]` - Upload requests
- `📥 [ProfileService]` - Upload responses
- `✅` - Success messages
- `❌` - Error messages

### Check Backend Logs

```bash
# View auth-service logs
tail -f backend/logs/auth-service.log

# Or if using Docker
docker logs auth-service -f
```

Look for:
- `Received profile image upload request`
- `Uploading file to Cloudinary`
- `Cloudinary upload successful`
- `Profile image updated for user`

## Next Steps

After successful tests:
1. Remove test components from production code
2. Keep test scripts for regression testing
3. Add to CI/CD pipeline if needed

