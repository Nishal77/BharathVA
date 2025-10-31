# Auth Service Test Scripts

This directory contains test scripts for the BharathVA Auth Service.

## Profile Image Upload Test

### `test-profile-image-upload.sh`

Tests the profile image upload functionality with Cloudinary integration.

#### Prerequisites

- Backend services must be running (gateway, auth-service, etc.)
- Valid user account credentials
- `curl` and `jq` installed
- Test image will be auto-generated if not present

#### Usage

```bash
# Basic usage (will prompt for email/password)
cd backend/auth-service/test-scripts
./test-profile-image-upload.sh

# Or specify host
HOST=http://192.168.0.121:8080 ./test-profile-image-upload.sh
```

#### What it tests

1. **Health Check** - Verifies auth service is running
2. **Login** - Authenticates and retrieves access token
3. **Get Current Profile** - Fetches user profile before upload
4. **Upload Image** - Uploads test image to Cloudinary via backend
5. **Verify Update** - Confirms image URL is saved in database

#### Expected Output

```
🔍 Testing Profile Image Upload for BharathVA Auth Service
===========================================================
📋 Configuration:
  Gateway URL: http://localhost:8080/api/auth
  Test Image: test-profile-image.jpg

🖼️  Creating Test Image...
✅ Test image created

🏥 Test 1: Auth Service Health Check
✅ Service is healthy

🔐 Test 2: Login to Get Access Token
✅ Login successful!

👤 Test 3: Get Current Profile (Before Upload)
Profile: { fullName, username, profileImageUrl }

📤 Test 4: Upload Profile Image
✅ Upload successful!
New Image URL: https://res.cloudinary.com/...

✅ Test 5: Verify Profile Update
✅ Profile image URL successfully saved to database!

✅ All tests completed successfully!
```

#### Troubleshooting

- **"No static resource" error**: Make sure backend is rebuilt with latest changes
- **"Authentication required" error**: Check if token is valid
- **Cloudinary upload fails**: Verify Cloudinary credentials in `application.yml`
- **Database update fails**: Check database connection and schema

#### Notes

- Test image is a minimal 1x1 pixel JPEG (created automatically)
- Access token is used for authenticated requests
- Image URL is verified to be from Cloudinary
- Profile is verified to be updated in NeonDB

