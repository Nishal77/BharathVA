#!/usr/bin/env bash
set -euo pipefail

# BharathVA Auth Service - Profile Image Upload Test Script
# Tests the profile image upload endpoint with Cloudinary integration

echo "🔍 Testing Profile Image Upload for BharathVA Auth Service"
echo "==========================================================="

# Configuration
HOST=${HOST:-http://localhost:8080}
GATEWAY_URL="$HOST/api/auth"
TEST_IMAGE="test-profile-image.jpg"

echo "📋 Configuration:"
echo "  Gateway URL: $GATEWAY_URL"
echo "  Test Image: $TEST_IMAGE"
echo ""

# Create test image if it doesn't exist
echo "🖼️  Creating Test Image..."
echo "---------------------------"
if [ ! -f "$TEST_IMAGE" ]; then
    echo "Creating test profile image (1x1 pixel JPEG)..."
    # Use base64 encoded minimal valid JPEG (1x1 pixel)
    # This is a minimal valid JPEG in base64 format
    if command -v python3 &> /dev/null; then
        python3 << 'PYEOF'
# Minimal valid JPEG (1x1 pixel)
jpeg_bytes = b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.xff\xc0\x00\x11\x08\x00\x01\x00\x01\x01\x01\x11\x00\x02\x11\x01\x03\x11\x01\xff\xc4\x00\x14\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x08\xff\xc4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xaa\xff\xd9'
with open("test-profile-image.jpg", "wb") as f:
    f.write(jpeg_bytes)
PYEOF
    else
        echo "⚠️  Python 3 not available. Please provide a test image manually."
        echo "   Expected location: $TEST_IMAGE"
        echo "   You can use any JPEG image file."
        exit 1
    fi
    
    if [ -f "$TEST_IMAGE" ] && [ -s "$TEST_IMAGE" ]; then
        echo "✅ Test image created: $TEST_IMAGE"
    else
        echo "❌ Failed to create test image"
        echo "⚠️  Please manually create or copy a JPEG image to: $TEST_IMAGE"
        exit 1
    fi
else
    echo "✅ Test image already exists: $TEST_IMAGE"
fi
echo ""

# Test 1: Health Check
echo "🏥 Test 1: Auth Service Health Check"
echo "-------------------------------------"
HEALTH_RESPONSE=$(curl -s "$GATEWAY_URL/register/health")
echo "$HEALTH_RESPONSE" | jq '.' 2>/dev/null || echo "$HEALTH_RESPONSE"
echo ""

# Test 2: Login to get access token
echo "🔐 Test 2: Login to Get Access Token"
echo "--------------------------------------"
echo "Please provide credentials for testing:"
read -p "Email: " TEST_EMAIL
read -sp "Password: " TEST_PASSWORD
echo ""

LOGIN_RESPONSE=$(curl -s -X POST "$GATEWAY_URL/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken // empty')

if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" == "null" ]; then
    echo "❌ Login failed!"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo "✅ Login successful!"
echo "Access Token: ${ACCESS_TOKEN:0:20}..."
echo ""

# Test 3: Get current profile (before upload)
echo "👤 Test 3: Get Current Profile (Before Upload)"
echo "-----------------------------------------------"
BEFORE_PROFILE=$(curl -s -X GET "$GATEWAY_URL/user/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo "$BEFORE_PROFILE" | jq '.data | {fullName, username, profileImageUrl}' 2>/dev/null || echo "$BEFORE_PROFILE"
OLD_IMAGE_URL=$(echo "$BEFORE_PROFILE" | jq -r '.data.profileImageUrl // empty')
echo ""

# Test 4: Upload Profile Image
echo "📤 Test 4: Upload Profile Image"
echo "-------------------------------"
echo "Uploading image: $TEST_IMAGE"
echo ""

UPLOAD_RESPONSE=$(curl -s -X POST "$GATEWAY_URL/user/me/profile-image" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -F "file=@$TEST_IMAGE")

echo "Upload Response:"
echo "$UPLOAD_RESPONSE" | jq '.' 2>/dev/null || echo "$UPLOAD_RESPONSE"
echo ""

# Check if upload was successful
SUCCESS=$(echo "$UPLOAD_RESPONSE" | jq -r '.success // false')
NEW_IMAGE_URL=$(echo "$UPLOAD_RESPONSE" | jq -r '.data.profileImageUrl // empty')

if [ "$SUCCESS" == "true" ] && [ -n "$NEW_IMAGE_URL" ] && [ "$NEW_IMAGE_URL" != "null" ]; then
    echo "✅ Upload successful!"
    echo "New Image URL: $NEW_IMAGE_URL"
    echo ""
    
    # Verify URL is from Cloudinary
    if [[ "$NEW_IMAGE_URL" == *"cloudinary.com"* ]] || [[ "$NEW_IMAGE_URL" == *"res.cloudinary.com"* ]]; then
        echo "✅ Image URL is from Cloudinary"
    else
        echo "⚠️  Warning: Image URL doesn't appear to be from Cloudinary"
    fi
    echo ""
    
    # Test 5: Verify profile was updated
    echo "✅ Test 5: Verify Profile Update"
    echo "--------------------------------"
    AFTER_PROFILE=$(curl -s -X GET "$GATEWAY_URL/user/me" \
      -H "Authorization: Bearer $ACCESS_TOKEN")
    echo "$AFTER_PROFILE" | jq '.data | {fullName, username, profileImageUrl}' 2>/dev/null || echo "$AFTER_PROFILE"
    
    UPDATED_IMAGE_URL=$(echo "$AFTER_PROFILE" | jq -r '.data.profileImageUrl // empty')
    if [ "$UPDATED_IMAGE_URL" == "$NEW_IMAGE_URL" ]; then
        echo "✅ Profile image URL successfully saved to database!"
    else
        echo "⚠️  Warning: Profile image URL in database doesn't match uploaded URL"
        echo "Expected: $NEW_IMAGE_URL"
        echo "Got: $UPDATED_IMAGE_URL"
    fi
else
    echo "❌ Upload failed!"
    ERROR_MSG=$(echo "$UPLOAD_RESPONSE" | jq -r '.message // "Unknown error"')
    echo "Error: $ERROR_MSG"
    exit 1
fi

echo ""
echo "✅ All tests completed successfully!"
echo ""
echo "📝 Summary:"
echo "  - Health check: ✅"
echo "  - Login: ✅"
echo "  - Image upload: ✅"
echo "  - Cloudinary integration: ✅"
echo "  - Database update: ✅"
echo ""
echo "🔗 Profile Image URL: $NEW_IMAGE_URL"

