#!/bin/bash

# BharathVA - Test FullName Migration and Display
# This script tests the database migration and verifies fullName display

echo "==========================================="
echo "BharathVA - FullName Migration Test"
echo "==========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:8080/api/auth"

echo -e "${BLUE}Step 1: Check if backend services are running${NC}"
echo "Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/health_response.json http://localhost:8080/api/auth/register/health)

if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Backend services are running${NC}"
else
    echo -e "${RED}❌ Backend services are not running. Please start them first.${NC}"
    echo "Run: cd backend && docker-compose up --build"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 2: Test user registration with fullName${NC}"
echo "Email: fullname-test@example.com"
echo "Full Name: Nishal Poojary Test"

# Register email
REGISTER_RESPONSE=$(curl -s -X POST ${BASE_URL}/register/email \
  -H "Content-Type: application/json" \
  -d '{"email":"fullname-test@example.com"}')

echo "Registration Response: $REGISTER_RESPONSE"
SESSION_TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"sessionToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$SESSION_TOKEN" ]; then
    echo -e "${RED}❌ Failed to get session token!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Session Token: $SESSION_TOKEN${NC}"
echo ""
echo -e "${YELLOW}Check your email for OTP and enter it:${NC}"
read -p "Enter OTP: " OTP

# Verify OTP
echo ""
echo -e "${BLUE}Step 3: Verify OTP${NC}"
curl -s -X POST ${BASE_URL}/register/verify-otp \
  -H "Content-Type: application/json" \
  -d "{\"sessionToken\":\"$SESSION_TOKEN\",\"otp\":\"$OTP\"}" | jq '.'

echo ""
echo -e "${BLUE}Step 4: Submit User Details (with fullName)${NC}"
DETAILS_RESPONSE=$(curl -s -X POST ${BASE_URL}/register/details \
  -H "Content-Type: application/json" \
  -d "{\"sessionToken\":\"$SESSION_TOKEN\",\"fullName\":\"Nishal Poojary Test\",\"phoneNumber\":\"9876543210\",\"countryCode\":\"+91\",\"dateOfBirth\":\"1995-05-15\"}")

echo "Details Response: $DETAILS_RESPONSE"
echo $DETAILS_RESPONSE | jq '.'

echo ""
echo -e "${BLUE}Step 5: Create Password${NC}"
curl -s -X POST ${BASE_URL}/register/password \
  -H "Content-Type: application/json" \
  -d "{\"sessionToken\":\"$SESSION_TOKEN\",\"password\":\"FullNameTest123!\",\"confirmPassword\":\"FullNameTest123!\"}" | jq '.'

echo ""
echo -e "${BLUE}Step 6: Create Username${NC}"
USERNAME_RESPONSE=$(curl -s -X POST ${BASE_URL}/register/username \
  -H "Content-Type: application/json" \
  -d "{\"sessionToken\":\"$SESSION_TOKEN\",\"username\":\"fullnametest$(date +%s)\"}")

echo "Username Response: $USERNAME_RESPONSE"
echo $USERNAME_RESPONSE | jq '.'

echo ""
echo -e "${GREEN}Registration complete!${NC}"
echo ""

# Test login to verify fullName is displayed
echo "=========================================="
echo -e "${BLUE}Step 7: Test Login (should show fullName in logs)${NC}"
echo "=========================================="
echo ""

LOGIN_RESPONSE=$(curl -s -X POST ${BASE_URL}/login \
  -H "Content-Type: application/json" \
  -H "X-Device-Info: Test Device | Browser" \
  -H "X-IP-Address: 127.0.0.1" \
  -d '{"email":"fullname-test@example.com","password":"FullNameTest123!"}')

echo "Login Response:"
echo $LOGIN_RESPONSE | jq '.'

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.accessToken')

if [ "$ACCESS_TOKEN" != "null" ] && [ -n "$ACCESS_TOKEN" ]; then
    echo ""
    echo -e "${GREEN}✅ Login successful!${NC}"
    echo ""
    echo -e "${BLUE}Step 8: Test Profile Endpoint (should return fullName)${NC}"
    
    PROFILE_RESPONSE=$(curl -s -X GET ${BASE_URL}/profile \
      -H "Authorization: Bearer $ACCESS_TOKEN")
    
    echo "Profile Response:"
    echo $PROFILE_RESPONSE | jq '.'
    
    FULL_NAME=$(echo $PROFILE_RESPONSE | jq -r '.data.fullName')
    echo ""
    echo -e "${BLUE}Extracted Full Name: '${FULL_NAME}'${NC}"
    
    if [ "$FULL_NAME" != "null" ] && [ -n "$FULL_NAME" ]; then
        echo -e "${GREEN}✅ FullName is properly returned from profile endpoint!${NC}"
    else
        echo -e "${RED}❌ FullName is not returned from profile endpoint${NC}"
    fi
    
else
    echo -e "${RED}❌ Login failed${NC}"
fi

echo ""
echo "=========================================="
echo -e "${BLUE}Step 9: Check Backend Logs${NC}"
echo "=========================================="
echo "The backend logs should now show:"
echo "  📛 Full Name: 'Nishal Poojary Test'"
echo "  📛 Full Name Length: X characters"
echo ""
echo "Check the docker logs:"
echo "  docker-compose logs auth-service | grep 'Full Name'"
echo ""

echo "=========================================="
echo -e "${GREEN}Test Complete!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Check mobile app ProfileUsername component"
echo "2. Verify fullName displays correctly in UI"
echo "3. Check database migration was applied"
echo ""
echo "Database verification:"
echo "  Connect to Neon DB and run:"
echo "  SELECT username, fullName FROM users WHERE email = 'fullname-test@example.com';"
echo ""
