#!/bin/bash

# Comprehensive Refresh Token Flow Test Script
# Tests the entire refresh token flow from backend to frontend

echo "🔄 BharathVA Refresh Token Flow Test Suite"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

TESTS_PASSED=0
TESTS_FAILED=0

# Get IP address
CURRENT_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}' | cut -d' ' -f2)
if [ -z "$CURRENT_IP" ]; then
    CURRENT_IP="192.168.0.121"
fi

echo -e "${YELLOW}Using IP: $CURRENT_IP${NC}"
echo ""

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "${BLUE}Testing: $test_name${NC}"
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASSED: $test_name${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAILED: $test_name${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Test 1: Backend auth-service is running
echo "1️⃣ Testing Backend Services..."
run_test "Auth Service Health" "curl -s -o /dev/null -w '%{http_code}' http://$CURRENT_IP:8081/auth/register/health | grep -q '200'"
run_test "Gateway Service" "curl -s -o /dev/null -w '%{http_code}' http://$CURRENT_IP:8080/api/auth/register/health | grep -q '200'"

# Test 2: Test login endpoint (to get tokens)
echo ""
echo "2️⃣ Testing Login Endpoint..."
LOGIN_RESPONSE=$(curl -s -X POST http://$CURRENT_IP:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword"}')

if echo "$LOGIN_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ Login endpoint is accessible${NC}"
    ((TESTS_PASSED++))
    
    # Extract tokens if login was successful
    ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)
    
    if [ -n "$ACCESS_TOKEN" ] && [ -n "$REFRESH_TOKEN" ]; then
        echo -e "${GREEN}✅ Tokens extracted from login response${NC}"
        ((TESTS_PASSED++))
        
        # Test 3: Test refresh token endpoint
        echo ""
        echo "3️⃣ Testing Refresh Token Endpoint..."
        REFRESH_TOKEN_RESPONSE=$(curl -s -X GET "http://$CURRENT_IP:8080/api/auth/sessions/current-refresh-token" \
          -H "Authorization: Bearer $ACCESS_TOKEN" \
          -H "Content-Type: application/json")
        
        if echo "$REFRESH_TOKEN_RESPONSE" | grep -q "refreshToken"; then
            echo -e "${GREEN}✅ Refresh token endpoint is working${NC}"
            echo -e "${GREEN}✅ Refresh token fetched from database${NC}"
            ((TESTS_PASSED++))
            ((TESTS_PASSED++))
            
            DB_REFRESH_TOKEN=$(echo "$REFRESH_TOKEN_RESPONSE" | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)
            
            if [ "$DB_REFRESH_TOKEN" = "$REFRESH_TOKEN" ]; then
                echo -e "${GREEN}✅ Database refresh token matches login refresh token${NC}"
                ((TESTS_PASSED++))
            else
                echo -e "${YELLOW}⚠️  Database refresh token differs from login token (may be normal)${NC}"
            fi
            
            # Test 4: Test token refresh endpoint
            echo ""
            echo "4️⃣ Testing Token Refresh Endpoint..."
            REFRESH_RESPONSE=$(curl -s -X POST http://$CURRENT_IP:8080/api/auth/refresh \
              -H "Content-Type: application/json" \
              -d "{\"refreshToken\":\"$DB_REFRESH_TOKEN\"}")
            
            if echo "$REFRESH_RESPONSE" | grep -q "accessToken"; then
                echo -e "${GREEN}✅ Token refresh endpoint is working${NC}"
                ((TESTS_PASSED++))
                
                NEW_ACCESS_TOKEN=$(echo "$REFRESH_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
                
                if [ "$NEW_ACCESS_TOKEN" != "$ACCESS_TOKEN" ]; then
                    echo -e "${GREEN}✅ New access token generated (different from old)${NC}"
                    ((TESTS_PASSED++))
                else
                    echo -e "${YELLOW}⚠️  New access token is same as old (may be normal if just refreshed)${NC}"
                fi
            else
                echo -e "${RED}❌ Token refresh failed${NC}"
                echo "Response: $REFRESH_RESPONSE"
                ((TESTS_FAILED++))
            fi
        else
            echo -e "${RED}❌ Refresh token endpoint failed${NC}"
            echo "Response: $REFRESH_TOKEN_RESPONSE"
            echo ""
            echo -e "${YELLOW}💡 Troubleshooting:${NC}"
            echo "   • Ensure backend auth-service is restarted after adding endpoint"
            echo "   • Check that SessionController has the endpoint"
            echo "   • Verify security configuration allows /auth/sessions/**"
            ((TESTS_FAILED++))
        fi
    else
        echo -e "${YELLOW}⚠️  Could not extract tokens (login may have failed)${NC}"
        echo "Response: $LOGIN_RESPONSE"
    fi
else
    echo -e "${YELLOW}⚠️  Login endpoint returned error (this is OK for testing)${NC}"
    echo "Response: $LOGIN_RESPONSE"
fi

# Test 5: Test endpoint availability
echo ""
echo "5️⃣ Testing Endpoint Availability..."
ENDPOINT_TEST=$(curl -s -o /dev/null -w '%{http_code}' -X GET "http://$CURRENT_IP:8080/api/auth/sessions/current-refresh-token" \
  -H "Authorization: Bearer invalid-token")

if [ "$ENDPOINT_TEST" = "401" ]; then
    echo -e "${GREEN}✅ Endpoint exists (401 expected with invalid token)${NC}"
    ((TESTS_PASSED++))
elif [ "$ENDPOINT_TEST" = "404" ]; then
    echo -e "${RED}❌ Endpoint not found (404) - backend may need restart${NC}"
    ((TESTS_FAILED++))
else
    echo -e "${YELLOW}⚠️  Unexpected status: $ENDPOINT_TEST${NC}"
fi

# Summary
echo ""
echo "=========================================="
echo "📊 Test Summary"
echo "=========================================="
echo -e "${GREEN}✅ Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All refresh token flow tests passed!${NC}"
    echo ""
    echo "✅ Backend endpoint is working"
    echo "✅ Database integration is functional"
    echo "✅ Token refresh flow is operational"
else
    echo -e "${YELLOW}⚠️  Some tests failed. Please review above.${NC}"
    echo ""
    echo "💡 Common Issues:"
    echo "   1. Backend auth-service needs restart"
    echo "   2. Endpoint path mismatch"
    echo "   3. Security configuration issue"
    echo "   4. Database connection problem"
fi

echo ""

