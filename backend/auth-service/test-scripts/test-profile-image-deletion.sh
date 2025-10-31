#!/bin/bash

# Test script for profile image deletion
# This tests the DELETE profile image functionality

set -e

BASE_URL="${BASE_URL:-http://localhost:8080}"
EMAIL="${EMAIL:-nishalpoojary9@gmail.com}"
PASSWORD="${PASSWORD:-Test@1234}"

echo "🧪 Testing Profile Image Deletion"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Health check
echo "1️⃣ Checking backend health..."
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "${BASE_URL}/api/auth/health" || echo "000")
HEALTH_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
HEALTH_BODY=$(echo "$HEALTH_RESPONSE" | sed '$d')

if [ "$HEALTH_CODE" != "200" ]; then
    echo -e "${RED}❌ Backend is not responding (HTTP $HEALTH_CODE)${NC}"
    echo "Response: $HEALTH_BODY"
    exit 1
fi
echo -e "${GREEN}✅ Backend is healthy${NC}"
echo ""

# Step 2: Login
echo "2️⃣ Logging in..."
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${EMAIL}\",
    \"password\": \"${PASSWORD}\"
  }")

LOGIN_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')

if [ "$LOGIN_CODE" != "200" ]; then
    echo -e "${RED}❌ Login failed (HTTP $LOGIN_CODE)${NC}"
    echo "Response: $LOGIN_BODY"
    exit 1
fi

ACCESS_TOKEN=$(echo "$LOGIN_BODY" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
if [ -z "$ACCESS_TOKEN" ]; then
    echo -e "${RED}❌ Failed to extract access token${NC}"
    echo "Response: $LOGIN_BODY"
    exit 1
fi

echo -e "${GREEN}✅ Login successful${NC}"
echo "Token: ${ACCESS_TOKEN:0:20}..."
echo ""

# Step 3: Get current profile
echo "3️⃣ Fetching current profile..."
PROFILE_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/api/auth/user/me" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

PROFILE_CODE=$(echo "$PROFILE_RESPONSE" | tail -n1)
PROFILE_BODY=$(echo "$PROFILE_RESPONSE" | sed '$d')

if [ "$PROFILE_CODE" != "200" ]; then
    echo -e "${RED}❌ Failed to fetch profile (HTTP $PROFILE_CODE)${NC}"
    echo "Response: $PROFILE_BODY"
    exit 1
fi

CURRENT_IMAGE_URL=$(echo "$PROFILE_BODY" | grep -o '"profileImageUrl":"[^"]*' | cut -d'"' -f4 || echo "")
echo "Current profileImageUrl: ${CURRENT_IMAGE_URL:-null}"
echo ""

if [ -z "$CURRENT_IMAGE_URL" ] || [ "$CURRENT_IMAGE_URL" == "null" ]; then
    echo -e "${YELLOW}⚠️  No profile image to delete. Uploading a test image first...${NC}"
    # Upload a test image first
    echo "📤 Uploading test image..."
    UPLOAD_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/api/auth/user/me/profile-image" \
      -H "Authorization: Bearer ${ACCESS_TOKEN}" \
      -F "file=@/dev/urandom;filename=test.jpg" 2>/dev/null || echo "000")
    
    UPLOAD_CODE=$(echo "$UPLOAD_RESPONSE" | tail -n1)
    if [ "$UPLOAD_CODE" == "200" ]; then
        echo -e "${GREEN}✅ Test image uploaded${NC}"
        # Get updated profile
        PROFILE_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/api/auth/user/me" \
          -H "Authorization: Bearer ${ACCESS_TOKEN}")
        CURRENT_IMAGE_URL=$(echo "$PROFILE_RESPONSE" | sed '$d' | grep -o '"profileImageUrl":"[^"]*' | cut -d'"' -f4 || echo "")
        echo "New profileImageUrl: ${CURRENT_IMAGE_URL}"
    fi
    echo ""
fi

# Step 4: Delete profile image
echo "4️⃣ Deleting profile image (setting to null)..."
DELETE_RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "${BASE_URL}/api/auth/user/me/profile" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"profileImageUrl": null}')

DELETE_CODE=$(echo "$DELETE_RESPONSE" | tail -n1)
DELETE_BODY=$(echo "$DELETE_RESPONSE" | sed '$d')

echo "Response Code: $DELETE_CODE"
echo "Response Body: $DELETE_BODY"
echo ""

if [ "$DELETE_CODE" != "200" ]; then
    echo -e "${RED}❌ Failed to delete profile image (HTTP $DELETE_CODE)${NC}"
    echo "Response: $DELETE_BODY"
    exit 1
fi

echo -e "${GREEN}✅ Profile image deletion successful${NC}"
echo ""

# Step 5: Verify deletion
echo "5️⃣ Verifying deletion..."
VERIFY_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/api/auth/user/me" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

VERIFY_CODE=$(echo "$VERIFY_RESPONSE" | tail -n1)
VERIFY_BODY=$(echo "$VERIFY_RESPONSE" | sed '$d')

if [ "$VERIFY_CODE" != "200" ]; then
    echo -e "${RED}❌ Failed to verify profile (HTTP $VERIFY_CODE)${NC}"
    exit 1
fi

UPDATED_IMAGE_URL=$(echo "$VERIFY_BODY" | grep -o '"profileImageUrl":"[^"]*' | cut -d'"' -f4 || echo "")
if [ -z "$UPDATED_IMAGE_URL" ] || [ "$UPDATED_IMAGE_URL" == "null" ]; then
    echo -e "${GREEN}✅ Profile image successfully deleted (profileImageUrl is null)${NC}"
else
    echo -e "${YELLOW}⚠️  Profile image still exists: $UPDATED_IMAGE_URL${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Test completed successfully!${NC}"

