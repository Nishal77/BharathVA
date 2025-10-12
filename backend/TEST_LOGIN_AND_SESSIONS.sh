#!/bin/bash

# BharathVA - Test Login and Session Creation
# This script tests the complete authentication flow and verifies database storage

echo "===========================================  "
echo "BharathVA - Login & Session Test"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:8080/api/auth"

echo -e "${YELLOW}Step 1: Register Test User${NC}"
echo "Email: testuser@example.com"
echo ""

# Register email
REGISTER_RESPONSE=$(curl -s -X POST ${BASE_URL}/register/email \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com"}')

echo "Response: $REGISTER_RESPONSE"
SESSION_TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"sessionToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$SESSION_TOKEN" ]; then
    echo -e "${RED}Failed to get session token!${NC}"
    exit 1
fi

echo -e "${GREEN}Session Token: $SESSION_TOKEN${NC}"
echo ""
echo -e "${YELLOW}Check your email for OTP and enter it:${NC}"
read -p "Enter OTP: " OTP

# Verify OTP
echo ""
echo -e "${YELLOW}Step 2: Verify OTP${NC}"
curl -s -X POST ${BASE_URL}/register/verify-otp \
  -H "Content-Type: application/json" \
  -d "{\"sessionToken\":\"$SESSION_TOKEN\",\"otp\":\"$OTP\"}" | jq '.'

echo ""
echo -e "${YELLOW}Step 3: Submit Details${NC}"
curl -s -X POST ${BASE_URL}/register/details \
  -H "Content-Type: application/json" \
  -d "{\"sessionToken\":\"$SESSION_TOKEN\",\"full_name\":\"Test User\",\"phoneNumber\":\"9876543210\",\"countryCode\":\"+91\",\"dateOfBirth\":\"1995-05-15\"}" | jq '.'

echo ""
echo -e "${YELLOW}Step 4: Create Password${NC}"
curl -s -X POST ${BASE_URL}/register/password \
  -H "Content-Type: application/json" \
  -d "{\"sessionToken\":\"$SESSION_TOKEN\",\"password\":\"TestPass123!\",\"confirmPassword\":\"TestPass123!\"}" | jq '.'

echo ""
echo -e "${YELLOW}Step 5: Create Username${NC}"
curl -s -X POST ${BASE_URL}/register/username \
  -H "Content-Type: application/json" \
  -d "{\"sessionToken\":\"$SESSION_TOKEN\",\"username\":\"testuser$(date +%s)\"}" | jq '.'

echo ""
echo -e "${GREEN}Registration complete!${NC}"
echo ""

# Now test login from multiple devices
echo "=========================================="
echo -e "${YELLOW}Testing Login from Multiple Devices${NC}"
echo "=========================================="
echo ""

echo -e "${YELLOW}Device 1: Android${NC}"
LOGIN1=$(curl -s -X POST ${BASE_URL}/login \
  -H "Content-Type: application/json" \
  -H "X-Device-Info: Android 14 | Pixel 8 Pro" \
  -H "X-IP-Address: 49.207.153.17" \
  -d '{"email":"testuser@example.com","password":"TestPass123!"}')

echo "$LOGIN1" | jq '.'
ACCESS_TOKEN1=$(echo $LOGIN1 | jq -r '.data.accessToken')
REFRESH_TOKEN1=$(echo $LOGIN1 | jq -r '.data.refreshToken')

echo ""
sleep 2

echo -e "${YELLOW}Device 2: iOS${NC}"
LOGIN2=$(curl -s -X POST ${BASE_URL}/login \
  -H "Content-Type: application/json" \
  -H "X-Device-Info: iOS 17 | iPhone 15 Pro" \
  -H "X-IP-Address: 13.250.22.45" \
  -d '{"email":"testuser@example.com","password":"TestPass123!"}')

echo "$LOGIN2" | jq '.'
ACCESS_TOKEN2=$(echo $LOGIN2 | jq -r '.data.accessToken')

echo ""
sleep 2

echo -e "${YELLOW}Device 3: macOS${NC}"
LOGIN3=$(curl -s -X POST ${BASE_URL}/login \
  -H "Content-Type: application/json" \
  -H "X-Device-Info: macOS 15 | Chrome" \
  -H "X-IP-Address: 103.45.67.89" \
  -d '{"email":"testuser@example.com","password":"TestPass123!"}')

echo "$LOGIN3" | jq '.'
ACCESS_TOKEN3=$(echo $LOGIN3 | jq -r '.data.accessToken')

echo ""
echo "=========================================="
echo -e "${YELLOW}Fetching Active Sessions${NC}"
echo "=========================================="
echo ""

curl -s -X GET ${BASE_URL}/sessions \
  -H "Authorization: Bearer $ACCESS_TOKEN3" | jq '.'

echo ""
echo "=========================================="
echo -e "${GREEN}Test Complete!${NC}"
echo "=========================================="
echo ""
echo "Now verify in database:"
echo "1. Connect to Neon DB"
echo "2. Run: SELECT * FROM users WHERE email = 'testuser@example.com';"
echo "3. Run: SELECT * FROM user_sessions WHERE user_id = (SELECT id FROM users WHERE email = 'testuser@example.com');"
echo ""
echo "You should see:"
echo "  - 1 user record"
echo "  - 3 session records with different IPs and devices"
echo ""

