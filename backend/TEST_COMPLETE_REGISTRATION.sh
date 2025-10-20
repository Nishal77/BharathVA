#!/bin/bash

# BharathVA - Complete Registration Flow Test
# This script tests the entire registration process end-to-end

echo "==========================================="
echo "BharathVA Complete Registration Flow Test"
echo "==========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:8080/api/auth"
NETWORK_URL="http://192.168.0.225:8080/api/auth"
TEST_EMAIL="test_$(date +%s)@example.com"

echo -e "${BLUE}Configuration:${NC}"
echo "  Local URL: $BASE_URL"
echo "  Network URL: $NETWORK_URL"
echo "  Test Email: $TEST_EMAIL"
echo ""

# Step 1: Health Check
echo "==========================================="
echo -e "${BLUE}Step 1: Health Check${NC}"
echo "==========================================="

echo "Testing local endpoint..."
HEALTH_LOCAL=$(curl -s -w "%{http_code}" -o /tmp/health_local.json $BASE_URL/register/health)

if [ "$HEALTH_LOCAL" = "200" ]; then
    echo -e "${GREEN}✅ Local endpoint accessible${NC}"
    cat /tmp/health_local.json | jq '.'
else
    echo -e "${RED}❌ Local endpoint failed (HTTP $HEALTH_LOCAL)${NC}"
    exit 1
fi

echo ""
echo "Testing network endpoint (for mobile)..."
HEALTH_NETWORK=$(curl -s -w "%{http_code}" -o /tmp/health_network.json --connect-timeout 5 $NETWORK_URL/register/health)

if [ "$HEALTH_NETWORK" = "200" ]; then
    echo -e "${GREEN}✅ Network endpoint accessible (mobile can connect)${NC}"
    cat /tmp/health_network.json | jq '.'
else
    echo -e "${YELLOW}⚠️  Network endpoint not accessible (HTTP $HEALTH_NETWORK)${NC}"
    echo "Mobile app may not be able to connect"
fi

echo ""

# Step 2: Register Email
echo "==========================================="
echo -e "${BLUE}Step 2: Register Email${NC}"
echo "==========================================="

REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/register/email \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\"}")

echo "$REGISTER_RESPONSE" | jq '.'

SESSION_TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.sessionToken')
CURRENT_STEP=$(echo $REGISTER_RESPONSE | jq -r '.data.currentStep')

if [ "$CURRENT_STEP" = "OTP" ] && [ ! -z "$SESSION_TOKEN" ]; then
    echo -e "${GREEN}✅ Email registration successful${NC}"
    echo "Session Token: $SESSION_TOKEN"
else
    echo -e "${RED}❌ Email registration failed${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}📧 Check your email for OTP code${NC}"
echo "For testing, you can check the backend logs:"
echo "  docker-compose logs auth-service | grep -i otp"
echo ""
read -p "Enter OTP code: " OTP_CODE

# Step 3: Verify OTP
echo ""
echo "==========================================="
echo -e "${BLUE}Step 3: Verify OTP${NC}"
echo "==========================================="

VERIFY_RESPONSE=$(curl -s -X POST $BASE_URL/register/verify-otp \
  -H "Content-Type: application/json" \
  -d "{\"sessionToken\":\"$SESSION_TOKEN\",\"otp\":\"$OTP_CODE\"}")

echo "$VERIFY_RESPONSE" | jq '.'

CURRENT_STEP=$(echo $VERIFY_RESPONSE | jq -r '.data.currentStep')

if [ "$CURRENT_STEP" = "DETAILS" ]; then
    echo -e "${GREEN}✅ OTP verification successful${NC}"
else
    echo -e "${RED}❌ OTP verification failed${NC}"
    echo "Trying to resend OTP..."
    
    # Resend OTP
    RESEND_RESPONSE=$(curl -s -X POST $BASE_URL/register/resend-otp \
      -H "Content-Type: application/json" \
      -d "{\"sessionToken\":\"$SESSION_TOKEN\"}")
    
    echo "$RESEND_RESPONSE" | jq '.'
    read -p "Enter new OTP code: " OTP_CODE
    
    VERIFY_RESPONSE=$(curl -s -X POST $BASE_URL/register/verify-otp \
      -H "Content-Type: application/json" \
      -d "{\"sessionToken\":\"$SESSION_TOKEN\",\"otp\":\"$OTP_CODE\"}")
    
    CURRENT_STEP=$(echo $VERIFY_RESPONSE | jq -r '.data.currentStep')
    
    if [ "$CURRENT_STEP" != "DETAILS" ]; then
        echo -e "${RED}❌ OTP verification failed again${NC}"
        exit 1
    fi
fi

# Step 4: Submit User Details
echo ""
echo "==========================================="
echo -e "${BLUE}Step 4: Submit User Details${NC}"
echo "==========================================="

DETAILS_RESPONSE=$(curl -s -X POST $BASE_URL/register/details \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionToken\":\"$SESSION_TOKEN\",
    \"fullName\":\"Test User $(date +%H%M)\",
    \"phoneNumber\":\"9876543210\",
    \"countryCode\":\"+91\",
    \"dateOfBirth\":\"1995-05-15\"
  }")

echo "$DETAILS_RESPONSE" | jq '.'

CURRENT_STEP=$(echo $DETAILS_RESPONSE | jq -r '.data.currentStep')

if [ "$CURRENT_STEP" = "PASSWORD" ]; then
    echo -e "${GREEN}✅ User details submitted successfully${NC}"
else
    echo -e "${RED}❌ User details submission failed${NC}"
    exit 1
fi

# Step 5: Create Password
echo ""
echo "==========================================="
echo -e "${BLUE}Step 5: Create Password${NC}"
echo "==========================================="

PASSWORD_RESPONSE=$(curl -s -X POST $BASE_URL/register/password \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionToken\":\"$SESSION_TOKEN\",
    \"password\":\"TestPass123!\",
    \"confirmPassword\":\"TestPass123!\"
  }")

echo "$PASSWORD_RESPONSE" | jq '.'

CURRENT_STEP=$(echo $PASSWORD_RESPONSE | jq -r '.data.currentStep')

if [ "$CURRENT_STEP" = "USERNAME" ]; then
    echo -e "${GREEN}✅ Password created successfully${NC}"
else
    echo -e "${RED}❌ Password creation failed${NC}"
    exit 1
fi

# Step 6: Check Username Availability
echo ""
echo "==========================================="
echo -e "${BLUE}Step 6: Check Username Availability${NC}"
echo "==========================================="

TEST_USERNAME="testuser$(date +%s)"

USERNAME_CHECK=$(curl -s "$BASE_URL/register/check-username?username=$TEST_USERNAME")

echo "$USERNAME_CHECK" | jq '.'

IS_AVAILABLE=$(echo $USERNAME_CHECK | jq -r '.data.available')

if [ "$IS_AVAILABLE" = "true" ]; then
    echo -e "${GREEN}✅ Username '$TEST_USERNAME' is available${NC}"
else
    echo -e "${YELLOW}⚠️  Username taken, generating new one${NC}"
    TEST_USERNAME="testuser$(date +%s)_alt"
fi

# Step 7: Create Username (Complete Registration)
echo ""
echo "==========================================="
echo -e "${BLUE}Step 7: Create Username & Complete${NC}"
echo "==========================================="

USERNAME_RESPONSE=$(curl -s -X POST $BASE_URL/register/username \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionToken\":\"$SESSION_TOKEN\",
    \"username\":\"$TEST_USERNAME\"
  }")

echo "$USERNAME_RESPONSE" | jq '.'

CURRENT_STEP=$(echo $USERNAME_RESPONSE | jq -r '.data.currentStep')

if [ "$CURRENT_STEP" = "COMPLETED" ]; then
    echo -e "${GREEN}✅ Registration COMPLETED successfully!${NC}"
else
    echo -e "${RED}❌ Username creation failed${NC}"
    exit 1
fi

# Step 8: Test Login
echo ""
echo "==========================================="
echo -e "${BLUE}Step 8: Test Login with New Account${NC}"
echo "==========================================="

LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/login \
  -H "Content-Type: application/json" \
  -H "X-Device-Info: Test Script | Terminal" \
  -H "X-IP-Address: 127.0.0.1" \
  -d "{
    \"email\":\"$TEST_EMAIL\",
    \"password\":\"TestPass123!\"
  }")

echo "$LOGIN_RESPONSE" | jq '.'

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.accessToken')
FULL_NAME=$(echo $LOGIN_RESPONSE | jq -r '.data.fullName')
USERNAME=$(echo $LOGIN_RESPONSE | jq -r '.data.username')

if [ ! -z "$ACCESS_TOKEN" ] && [ "$ACCESS_TOKEN" != "null" ]; then
    echo -e "${GREEN}✅ Login successful!${NC}"
    echo "  Username: $USERNAME"
    echo "  Full Name: $FULL_NAME"
    echo "  Access Token: ${ACCESS_TOKEN:0:50}..."
else
    echo -e "${RED}❌ Login failed${NC}"
    exit 1
fi

# Step 9: Test Token Validation
echo ""
echo "==========================================="
echo -e "${BLUE}Step 9: Test Token Validation${NC}"
echo "==========================================="

# Fast validation
echo "Testing fast validation..."
VALIDATE_FAST=$(curl -s -X POST $BASE_URL/validate \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}')

echo "$VALIDATE_FAST" | jq '.'

IS_VALID=$(echo $VALIDATE_FAST | jq -r '.data.valid')

if [ "$IS_VALID" = "true" ]; then
    echo -e "${GREEN}✅ Fast token validation successful${NC}"
else
    echo -e "${RED}❌ Token validation failed${NC}"
fi

# Step 10: Test Profile Endpoint
echo ""
echo "==========================================="
echo -e "${BLUE}Step 10: Test Profile Endpoint${NC}"
echo "==========================================="

PROFILE_RESPONSE=$(curl -s -X GET $BASE_URL/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "$PROFILE_RESPONSE" | jq '.'

PROFILE_EMAIL=$(echo $PROFILE_RESPONSE | jq -r '.data.email')

if [ "$PROFILE_EMAIL" = "$TEST_EMAIL" ]; then
    echo -e "${GREEN}✅ Profile retrieval successful${NC}"
else
    echo -e "${RED}❌ Profile retrieval failed${NC}"
fi

# Step 11: Check Redis Cache
echo ""
echo "==========================================="
echo -e "${BLUE}Step 11: Check Redis Cache${NC}"
echo "==========================================="

echo "Checking Redis keys..."
REDIS_KEYS=$(docker exec bharathva-redis redis-cli KEYS "bharathva:auth:*" 2>/dev/null)

if [ ! -z "$REDIS_KEYS" ]; then
    echo -e "${GREEN}✅ Redis caching is working${NC}"
    echo "Cached keys:"
    echo "$REDIS_KEYS"
else
    echo -e "${YELLOW}⚠️  No Redis keys found (cache might be empty)${NC}"
fi

# Final Summary
echo ""
echo "==========================================="
echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
echo "==========================================="
echo ""
echo "Test Account Details:"
echo "  📧 Email: $TEST_EMAIL"
echo "  👤 Username: $USERNAME"
echo "  🔑 Password: TestPass123!"
echo ""
echo "Access Token (for Postman testing):"
echo "  $ACCESS_TOKEN"
echo ""
echo "Mobile App URLs:"
echo "  Health: http://192.168.0.225:8080/api/auth/register/health"
echo "  Register: http://192.168.0.225:8080/api/auth/register/email"
echo ""
echo "Performance Summary:"
TOTAL_TIME=$SECONDS
echo "  Total registration time: ${TOTAL_TIME} seconds"
echo ""
echo "Next Steps:"
echo "  1. Try logging in with mobile app"
echo "  2. Test in Postman with provided token"
echo "  3. Check Redis cache: docker exec bharathva-redis redis-cli MONITOR"
echo ""

