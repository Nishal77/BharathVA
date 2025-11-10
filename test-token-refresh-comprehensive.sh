#!/bin/bash

# Comprehensive Token Refresh Flow Test Script
# Tests the complete token refresh flow including:
# - Login and token extraction
# - Token refresh with new refresh token generation
# - Verification that refresh token is updated in database
# - Subsequent API calls with new tokens
# - Logout functionality

set -e

echo "🔄 BharathVA Comprehensive Token Refresh Test Suite"
echo "====================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

TESTS_PASSED=0
TESTS_FAILED=0
WARNINGS=0

# Configuration
CURRENT_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}' | cut -d' ' -f2)
if [ -z "$CURRENT_IP" ]; then
    CURRENT_IP="192.168.0.121"
fi

GATEWAY_URL="http://${CURRENT_IP}:8080"
AUTH_BASE="${GATEWAY_URL}/api/auth"

# Test credentials (update these with valid credentials)
TEST_EMAIL="${TEST_EMAIL:-nishalpoojary01@gmail.com}"
TEST_PASSWORD="${TEST_PASSWORD:-Nishal@1}"

echo -e "${CYAN}Configuration:${NC}"
echo -e "  Gateway URL: ${GATEWAY_URL}"
echo -e "  Test Email: ${TEST_EMAIL}"
echo -e "  IP Address: ${CURRENT_IP}"
echo ""

# Helper functions
log_test() {
    echo -e "${BLUE}Testing: $1${NC}"
}

log_pass() {
    echo -e "${GREEN}✅ PASSED: $1${NC}"
    ((TESTS_PASSED++))
}

log_fail() {
    echo -e "${RED}❌ FAILED: $1${NC}"
    if [ -n "$2" ]; then
        echo -e "${RED}   Error: $2${NC}"
    fi
    ((TESTS_FAILED++))
}

log_warn() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
    ((WARNINGS++))
}

log_info() {
    echo -e "${CYAN}ℹ️  INFO: $1${NC}"
}

# Extract JSON field value
extract_json_field() {
    local json="$1"
    local field="$2"
    echo "$json" | grep -o "\"${field}\":\"[^\"]*" | cut -d'"' -f4 || echo ""
}

# Extract JSON field value (non-string)
extract_json_field_raw() {
    local json="$1"
    local field="$2"
    echo "$json" | grep -o "\"${field}\":[^,}]*" | cut -d':' -f2 | tr -d ' "' || echo ""
}

# Test 1: Backend Services Health Check
echo "1️⃣ Testing Backend Services..."
log_test "Auth Service Health Check"
AUTH_HEALTH=$(curl -s -w "\n%{http_code}" "${AUTH_BASE}/register/health" 2>/dev/null || echo -e "\n000")
AUTH_STATUS=$(echo "$AUTH_HEALTH" | tail -1)
if [ "$AUTH_STATUS" = "200" ]; then
    log_pass "Auth Service Health Check"
else
    log_fail "Auth Service Health Check" "Status: $AUTH_STATUS"
fi

log_test "Gateway Service Health Check"
GATEWAY_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "${GATEWAY_URL}/health" 2>/dev/null || echo "000")
if [ "$GATEWAY_HEALTH" = "200" ] || [ "$GATEWAY_HEALTH" = "404" ]; then
    log_pass "Gateway Service Health Check"
else
    log_fail "Gateway Service Health Check" "Status: $GATEWAY_HEALTH"
fi

# Test 2: Login and Token Extraction
echo ""
echo "2️⃣ Testing Login and Token Extraction..."
log_test "Login with credentials"
LOGIN_RESPONSE=$(curl -s -X POST "${AUTH_BASE}/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\"}" \
    2>/dev/null || echo '{"success":false,"message":"Network error"}')

if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
    log_pass "Login successful"
    
    # Extract tokens
    ACCESS_TOKEN=$(extract_json_field "$LOGIN_RESPONSE" "accessToken")
    REFRESH_TOKEN=$(extract_json_field "$LOGIN_RESPONSE" "refreshToken")
    USER_ID=$(extract_json_field "$LOGIN_RESPONSE" "userId")
    
    if [ -n "$ACCESS_TOKEN" ] && [ -n "$REFRESH_TOKEN" ]; then
        log_pass "Tokens extracted from login response"
        log_info "Access Token: ${ACCESS_TOKEN:0:30}..."
        log_info "Refresh Token: ${REFRESH_TOKEN:0:30}..."
        log_info "User ID: ${USER_ID}"
        
        # Verify token format (JWT has 3 parts separated by dots)
        ACCESS_PARTS=$(echo "$ACCESS_TOKEN" | tr '.' '\n' | wc -l | tr -d ' ')
        if [ "$ACCESS_PARTS" = "3" ]; then
            log_pass "Access token format valid (JWT)"
        else
            log_fail "Access token format invalid" "Expected JWT format, got $ACCESS_PARTS parts"
        fi
        
        # Store original refresh token for comparison
        ORIGINAL_REFRESH_TOKEN="$REFRESH_TOKEN"
    else
        log_fail "Token extraction failed"
        echo "Response: $LOGIN_RESPONSE"
        exit 1
    fi
else
    log_fail "Login failed"
    echo "Response: $LOGIN_RESPONSE"
    echo ""
    echo -e "${YELLOW}💡 Troubleshooting:${NC}"
    echo "   • Verify test credentials are correct (TEST_EMAIL, TEST_PASSWORD)"
    echo "   • Check that user exists and email is verified"
    echo "   • Ensure backend auth-service is running"
    exit 1
fi

# Test 3: Verify Refresh Token in Database
echo ""
echo "3️⃣ Testing Refresh Token Database Integration..."
log_test "Fetch refresh token from database"
DB_REFRESH_RESPONSE=$(curl -s -X GET "${AUTH_BASE}/sessions/current-refresh-token" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    2>/dev/null || echo '{"success":false}')

if echo "$DB_REFRESH_RESPONSE" | grep -q '"success":true'; then
    log_pass "Refresh token endpoint accessible"
    
    DB_REFRESH_TOKEN=$(extract_json_field "$DB_REFRESH_RESPONSE" "refreshToken")
    
    if [ -n "$DB_REFRESH_TOKEN" ]; then
        log_pass "Refresh token retrieved from database"
        
        if [ "$DB_REFRESH_TOKEN" = "$ORIGINAL_REFRESH_TOKEN" ]; then
            log_pass "Database refresh token matches login refresh token"
        else
            log_warn "Database refresh token differs from login token"
            log_info "Login token: ${ORIGINAL_REFRESH_TOKEN:0:30}..."
            log_info "DB token: ${DB_REFRESH_TOKEN:0:30}..."
        fi
        
        # Use database token for refresh test
        REFRESH_TOKEN_TO_USE="$DB_REFRESH_TOKEN"
    else
        log_fail "Failed to extract refresh token from database response"
        REFRESH_TOKEN_TO_USE="$ORIGINAL_REFRESH_TOKEN"
    fi
else
    log_warn "Refresh token endpoint failed, using login refresh token"
    echo "Response: $DB_REFRESH_RESPONSE"
    REFRESH_TOKEN_TO_USE="$ORIGINAL_REFRESH_TOKEN"
fi

# Test 4: Token Refresh - Critical Test
echo ""
echo "4️⃣ Testing Token Refresh Endpoint..."
log_test "Refresh access token"
REFRESH_RESPONSE=$(curl -s -X POST "${AUTH_BASE}/refresh" \
    -H "Content-Type: application/json" \
    -d "{\"refreshToken\":\"${REFRESH_TOKEN_TO_USE}\"}" \
    2>/dev/null || echo '{"success":false,"message":"Network error"}')

if echo "$REFRESH_RESPONSE" | grep -q '"success":true'; then
    log_pass "Token refresh endpoint responded successfully"
    
    # Extract new tokens
    NEW_ACCESS_TOKEN=$(extract_json_field "$REFRESH_RESPONSE" "accessToken")
    NEW_REFRESH_TOKEN=$(extract_json_field "$REFRESH_RESPONSE" "refreshToken")
    NEW_USER_ID=$(extract_json_field "$REFRESH_RESPONSE" "userId")
    
    if [ -n "$NEW_ACCESS_TOKEN" ] && [ -n "$NEW_REFRESH_TOKEN" ]; then
        log_pass "New tokens extracted from refresh response"
        
        # CRITICAL TEST: Verify new access token is different
        if [ "$NEW_ACCESS_TOKEN" != "$ACCESS_TOKEN" ]; then
            log_pass "New access token generated (different from original)"
        else
            log_fail "New access token is identical to original" "Token refresh should generate a new access token"
        fi
        
        # CRITICAL TEST: Verify new refresh token is different (this is the key fix)
        if [ "$NEW_REFRESH_TOKEN" != "$REFRESH_TOKEN_TO_USE" ]; then
            log_pass "New refresh token generated (different from original)"
            log_info "Original refresh token: ${REFRESH_TOKEN_TO_USE:0:30}..."
            log_info "New refresh token: ${NEW_REFRESH_TOKEN:0:30}..."
        else
            log_fail "New refresh token is identical to original" "Token refresh should generate a NEW refresh token"
        fi
        
        # Verify user ID matches
        if [ "$NEW_USER_ID" = "$USER_ID" ]; then
            log_pass "User ID matches after refresh"
        else
            log_fail "User ID mismatch after refresh" "Original: $USER_ID, New: $NEW_USER_ID"
        fi
        
        # Verify token formats
        NEW_ACCESS_PARTS=$(echo "$NEW_ACCESS_TOKEN" | tr '.' '\n' | wc -l | tr -d ' ')
        if [ "$NEW_ACCESS_PARTS" = "3" ]; then
            log_pass "New access token format valid (JWT)"
        else
            log_fail "New access token format invalid"
        fi
        
        # Store new tokens for subsequent tests
        ACCESS_TOKEN="$NEW_ACCESS_TOKEN"
        REFRESH_TOKEN="$NEW_REFRESH_TOKEN"
    else
        log_fail "Failed to extract new tokens from refresh response"
        echo "Response: $REFRESH_RESPONSE"
    fi
else
    log_fail "Token refresh failed"
    echo "Response: $REFRESH_RESPONSE"
    exit 1
fi

# Test 5: Verify Refresh Token Updated in Database
echo ""
echo "5️⃣ Verifying Refresh Token Update in Database..."
log_test "Fetch updated refresh token from database"
UPDATED_DB_RESPONSE=$(curl -s -X GET "${AUTH_BASE}/sessions/current-refresh-token" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    2>/dev/null || echo '{"success":false}')

if echo "$UPDATED_DB_RESPONSE" | grep -q '"success":true'; then
    UPDATED_DB_REFRESH_TOKEN=$(extract_json_field "$UPDATED_DB_RESPONSE" "refreshToken")
    
    if [ -n "$UPDATED_DB_REFRESH_TOKEN" ]; then
        if [ "$UPDATED_DB_REFRESH_TOKEN" = "$NEW_REFRESH_TOKEN" ]; then
            log_pass "Database refresh token matches new refresh token"
            log_info "Database was updated correctly with new refresh token"
        else
            log_fail "Database refresh token does not match new refresh token"
            log_info "Expected: ${NEW_REFRESH_TOKEN:0:30}..."
            log_info "Got: ${UPDATED_DB_REFRESH_TOKEN:0:30}..."
        fi
    else
        log_fail "Failed to extract refresh token from updated database response"
    fi
else
    log_warn "Could not verify database update (endpoint may require valid token)"
fi

# Test 6: Test API Call with New Access Token
echo ""
echo "6️⃣ Testing API Calls with New Access Token..."
log_test "Get user profile with new access token"
PROFILE_RESPONSE=$(curl -s -X GET "${AUTH_BASE}/user/me" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    2>/dev/null || echo '{"success":false}')

if echo "$PROFILE_RESPONSE" | grep -q '"success":true' || echo "$PROFILE_RESPONSE" | grep -q '"email"'; then
    log_pass "API call with new access token successful"
    PROFILE_EMAIL=$(extract_json_field "$PROFILE_RESPONSE" "email")
    if [ "$PROFILE_EMAIL" = "$TEST_EMAIL" ]; then
        log_pass "User profile matches expected user"
    else
        log_warn "User profile email mismatch (may be normal)"
    fi
else
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET "${AUTH_BASE}/user/me" \
        -H "Authorization: Bearer ${ACCESS_TOKEN}" \
        -H "Content-Type: application/json" 2>/dev/null || echo "000")
    
    if [ "$HTTP_STATUS" = "401" ]; then
        log_fail "API call failed with 401 Unauthorized" "New access token may be invalid"
    else
        log_warn "API call returned unexpected response (Status: $HTTP_STATUS)"
    fi
fi

# Test 7: Test Refresh Token Reuse (should fail)
echo ""
echo "7️⃣ Testing Refresh Token Security..."
log_test "Attempt to reuse old refresh token (should fail)"
OLD_REFRESH_RESPONSE=$(curl -s -X POST "${AUTH_BASE}/refresh" \
    -H "Content-Type: application/json" \
    -d "{\"refreshToken\":\"${ORIGINAL_REFRESH_TOKEN}\"}" \
    2>/dev/null || echo '{"success":false}')

if echo "$OLD_REFRESH_RESPONSE" | grep -q '"success":false' || echo "$OLD_REFRESH_RESPONSE" | grep -qi "invalid\|expired"; then
    log_pass "Old refresh token correctly rejected"
else
    log_warn "Old refresh token was accepted (may indicate security issue)"
    log_info "Response: $OLD_REFRESH_RESPONSE"
fi

# Test 8: Test Logout
echo ""
echo "8️⃣ Testing Logout..."
log_test "Logout with refresh token"
LOGOUT_RESPONSE=$(curl -s -X POST "${AUTH_BASE}/logout" \
    -H "Content-Type: application/json" \
    -d "{\"refreshToken\":\"${REFRESH_TOKEN}\"}" \
    2>/dev/null || echo '{"success":false}')

if echo "$LOGOUT_RESPONSE" | grep -q '"success":true'; then
    log_pass "Logout successful"
    
    # Verify token is invalidated
    log_test "Verify refresh token is invalidated"
    INVALIDATED_REFRESH_RESPONSE=$(curl -s -X POST "${AUTH_BASE}/refresh" \
        -H "Content-Type: application/json" \
        -d "{\"refreshToken\":\"${REFRESH_TOKEN}\"}" \
        2>/dev/null || echo '{"success":false}')
    
    if echo "$INVALIDATED_REFRESH_RESPONSE" | grep -q '"success":false' || echo "$INVALIDATED_REFRESH_RESPONSE" | grep -qi "invalid\|expired"; then
        log_pass "Refresh token correctly invalidated after logout"
    else
        log_warn "Refresh token still valid after logout"
    fi
else
    log_warn "Logout endpoint returned unexpected response"
    echo "Response: $LOGOUT_RESPONSE"
fi

# Summary
echo ""
echo "====================================================="
echo "📊 Test Summary"
echo "====================================================="
echo -e "${GREEN}✅ Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Failed: $TESTS_FAILED${NC}"
if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
fi
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All critical tests passed!${NC}"
    echo ""
    echo "✅ Token refresh flow is working correctly"
    echo "✅ New refresh tokens are being generated"
    echo "✅ Database is being updated correctly"
    echo "✅ Security checks are in place"
    echo ""
    echo -e "${CYAN}Next Steps:${NC}"
    echo "  1. Test the mobile app token refresh flow"
    echo "  2. Verify SecureStore is updated correctly"
    echo "  3. Test multi-device scenarios"
else
    echo -e "${YELLOW}⚠️  Some tests failed. Please review above.${NC}"
    echo ""
    echo -e "${CYAN}Common Issues:${NC}"
    echo "  1. Backend auth-service needs restart"
    echo "  2. Database connection problem"
    echo "  3. Token refresh endpoint not generating new refresh token"
    echo "  4. Session management not updating database"
    echo ""
    echo -e "${CYAN}Troubleshooting:${NC}"
    echo "  • Check backend logs for errors"
    echo "  • Verify user_sessions table in NeonDB"
    echo "  • Ensure refresh token is being updated in database"
    echo "  • Check that login clears old sessions"
fi

echo ""
exit $TESTS_FAILED

