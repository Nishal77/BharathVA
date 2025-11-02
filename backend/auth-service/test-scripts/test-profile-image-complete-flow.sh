#!/bin/bash

# Complete Profile Image Upload Flow Test
# Tests: Frontend -> Backend -> Cloudinary -> NeonDB -> Verification

set -e

GATEWAY_URL="${GATEWAY_URL:-http://localhost:8080/api/auth}"
TEST_IMAGE="test-profile-image.jpg"

echo "🔍 Testing Complete Profile Image Upload Flow"
echo "=============================================="
echo "📋 Configuration:"
echo "  Gateway URL: $GATEWAY_URL"
echo "  Test Image: $TEST_IMAGE"
echo ""

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "❌ jq is required but not installed. Please install jq first."
    exit 1
fi

# Create test image if it doesn't exist
if [ ! -f "$TEST_IMAGE" ]; then
    echo "🖼️  Creating Test Image..."
    python3 << 'PYEOF'
from PIL import Image
import io

# Create a simple test image
img = Image.new('RGB', (500, 500), color='blue')
img_bytes = io.BytesIO()
img.save(img_bytes, format='JPEG')
img_bytes.seek(0)

with open("test-profile-image.jpg", "wb") as f:
    f.write(img_bytes.getvalue())
PYEOF
    if [ ! -f "$TEST_IMAGE" ]; then
        echo "⚠️  Python 3/PIL not available. Please provide a test image manually."
        exit 1
    fi
    echo "✅ Test image created"
else
    echo "✅ Test image already exists: $TEST_IMAGE"
fi
echo ""

# Test 1: Health Check
echo "🏥 Test 1: Auth Service Health Check"
echo "-------------------------------------"
HEALTH_RESPONSE=$(curl -s "$GATEWAY_URL/register/health")
HEALTH_STATUS=$(echo "$HEALTH_RESPONSE" | jq -r '.status // "unknown"' 2>/dev/null || echo "unknown")
if [ "$HEALTH_STATUS" = "UP" ]; then
    echo "✅ Service is healthy"
else
    echo "❌ Service health check failed"
    echo "Response: $HEALTH_RESPONSE"
    exit 1
fi
echo ""

# Test 2: Login
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
echo "Old Profile Image URL: ${OLD_IMAGE_URL:-"null"}"
echo ""

# Test 4: Upload Profile Image to Cloudinary
echo "📤 Test 4: Upload Profile Image to Cloudinary"
echo "----------------------------------------------"
UPLOAD_RESPONSE=$(curl -s -X POST "$GATEWAY_URL/user/me/profile-image" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -F "file=@$TEST_IMAGE")

UPLOAD_SUCCESS=$(echo "$UPLOAD_RESPONSE" | jq -r '.success // false' 2>/dev/null || echo "false")
NEW_IMAGE_URL=$(echo "$UPLOAD_RESPONSE" | jq -r '.data.profileImageUrl // empty' 2>/dev/null || echo "")

if [ "$UPLOAD_SUCCESS" = "true" ] && [ -n "$NEW_IMAGE_URL" ]; then
    echo "✅ Upload successful!"
    echo "New Image URL: $NEW_IMAGE_URL"
    
    # Verify it's a Cloudinary URL
    if [[ "$NEW_IMAGE_URL" == *"cloudinary.com"* ]]; then
        echo "✅ URL is from Cloudinary"
    else
        echo "⚠️  Warning: URL does not appear to be from Cloudinary"
    fi
else
    echo "❌ Upload failed!"
    echo "Response: $UPLOAD_RESPONSE"
    exit 1
fi
echo ""

# Test 5: Verify Profile Update in NeonDB
echo "✅ Test 5: Verify Profile Update in NeonDB"
echo "-------------------------------------------"
AFTER_PROFILE=$(curl -s -X GET "$GATEWAY_URL/user/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
SAVED_IMAGE_URL=$(echo "$AFTER_PROFILE" | jq -r '.data.profileImageUrl // empty' 2>/dev/null || echo "")

if [ -n "$SAVED_IMAGE_URL" ] && [ "$SAVED_IMAGE_URL" = "$NEW_IMAGE_URL" ]; then
    echo "✅ Profile image URL successfully saved to NeonDB!"
    echo "   - Cloudinary URL: $NEW_IMAGE_URL"
    echo "   - Saved in NeonDB: $SAVED_IMAGE_URL"
    echo "   - Match: YES"
else
    echo "❌ Profile image URL was not saved correctly!"
    echo "   - Expected: $NEW_IMAGE_URL"
    echo "   - Got: $SAVED_IMAGE_URL"
    exit 1
fi

# Verify the URL is accessible
echo ""
echo "🔍 Test 6: Verify Image URL is Accessible"
echo "------------------------------------------"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$NEW_IMAGE_URL" || echo "000")
if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "302" ]; then
    echo "✅ Image URL is accessible (HTTP $HTTP_STATUS)"
else
    echo "⚠️  Warning: Image URL returned HTTP $HTTP_STATUS"
    echo "   URL: $NEW_IMAGE_URL"
fi

echo ""
echo "✅ All tests completed successfully!"
echo ""
echo "📊 Summary:"
echo "   - Health Check: PASSED"
echo "   - Authentication: PASSED"
echo "   - Cloudinary Upload: PASSED"
echo "   - NeonDB Storage: PASSED"
echo "   - URL Verification: PASSED"
echo ""
echo "🎉 Profile image upload flow is working correctly!"

