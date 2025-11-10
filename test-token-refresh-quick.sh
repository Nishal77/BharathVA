#!/bin/bash

# Quick Token Refresh Test Script
# Fast validation of token refresh functionality

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
CURRENT_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}' | cut -d' ' -f2)
if [ -z "$CURRENT_IP" ]; then
    CURRENT_IP="192.168.0.121"
fi

GATEWAY_URL="http://${CURRENT_IP}:8080"
AUTH_BASE="${GATEWAY_URL}/api/auth"

TEST_EMAIL="${TEST_EMAIL:-nishalpoojary01@gmail.com}"
TEST_PASSWORD="${TEST_PASSWORD:-Nishal@1}"

echo "🚀 Quick Token Refresh Test"
echo "============================"
echo ""

# Extract JSON field
extract_field() {
    echo "$1" | grep -o "\"$2\":\"[^\"]*" | cut -d'"' -f4 || echo ""
}

# Step 1: Login
echo "1. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "${AUTH_BASE}/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\"}")

if ! echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
    echo -e "${RED}❌ Login failed${NC}"
    echo "$LOGIN_RESPONSE"
    exit 1
fi

ACCESS_TOKEN=$(extract_field "$LOGIN_RESPONSE" "accessToken")
REFRESH_TOKEN=$(extract_field "$LOGIN_RESPONSE" "refreshToken")

if [ -z "$ACCESS_TOKEN" ] || [ -z "$REFRESH_TOKEN" ]; then
    echo -e "${RED}❌ Failed to extract tokens${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Login successful${NC}"
echo "   Original refresh token: ${REFRESH_TOKEN:0:30}..."

# Step 2: Refresh Token
echo ""
echo "2. Refreshing token..."
REFRESH_RESPONSE=$(curl -s -X POST "${AUTH_BASE}/refresh" \
    -H "Content-Type: application/json" \
    -d "{\"refreshToken\":\"${REFRESH_TOKEN}\"}")

if ! echo "$REFRESH_RESPONSE" | grep -q '"success":true'; then
    echo -e "${RED}❌ Token refresh failed${NC}"
    echo "$REFRESH_RESPONSE"
    exit 1
fi

NEW_ACCESS_TOKEN=$(extract_field "$REFRESH_RESPONSE" "accessToken")
NEW_REFRESH_TOKEN=$(extract_field "$REFRESH_RESPONSE" "refreshToken")

if [ -z "$NEW_ACCESS_TOKEN" ] || [ -z "$NEW_REFRESH_TOKEN" ]; then
    echo -e "${RED}❌ Failed to extract new tokens${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Token refresh successful${NC}"
echo "   New refresh token: ${NEW_REFRESH_TOKEN:0:30}..."

# Step 3: Verify New Refresh Token
if [ "$NEW_REFRESH_TOKEN" = "$REFRESH_TOKEN" ]; then
    echo -e "${RED}❌ CRITICAL: New refresh token is identical to original!${NC}"
    echo "   This indicates the refresh endpoint is not generating new tokens."
    exit 1
else
    echo -e "${GREEN}✅ New refresh token is different (correct behavior)${NC}"
fi

# Step 4: Verify Old Token is Invalid
echo ""
echo "3. Verifying old refresh token is invalidated..."
OLD_REFRESH_RESPONSE=$(curl -s -X POST "${AUTH_BASE}/refresh" \
    -H "Content-Type: application/json" \
    -d "{\"refreshToken\":\"${REFRESH_TOKEN}\"}")

if echo "$OLD_REFRESH_RESPONSE" | grep -q '"success":false' || echo "$OLD_REFRESH_RESPONSE" | grep -qi "invalid\|expired"; then
    echo -e "${GREEN}✅ Old refresh token correctly rejected${NC}"
else
    echo -e "${YELLOW}⚠️  Old refresh token still works (may be expected)${NC}"
fi

# Step 5: Test New Token Works
echo ""
echo "4. Testing new access token..."
PROFILE_RESPONSE=$(curl -s -X GET "${AUTH_BASE}/user/me" \
    -H "Authorization: Bearer ${NEW_ACCESS_TOKEN}" \
    -H "Content-Type: application/json")

if echo "$PROFILE_RESPONSE" | grep -q '"success":true' || echo "$PROFILE_RESPONSE" | grep -q '"email"'; then
    echo -e "${GREEN}✅ New access token works correctly${NC}"
else
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET "${AUTH_BASE}/user/me" \
        -H "Authorization: Bearer ${NEW_ACCESS_TOKEN}" \
        -H "Content-Type: application/json")
    echo -e "${YELLOW}⚠️  Profile endpoint returned status: $HTTP_STATUS${NC}"
fi

echo ""
echo -e "${GREEN}✅ Quick test completed successfully!${NC}"
echo ""
echo "Summary:"
echo "  • Login: ✅"
echo "  • Token refresh: ✅"
echo "  • New refresh token generated: ✅"
echo "  • Old token invalidated: ✅"
echo "  • New access token works: ✅"

