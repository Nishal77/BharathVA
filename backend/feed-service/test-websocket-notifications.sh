#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "🚀 BharathVA WebSocket Notifications Test"
echo "=========================================="
echo "Testing real-time feed notifications via WebSocket..."

# --- Configuration ---
GATEWAY_URL="http://localhost:8080"
FEED_SERVICE_URL="http://localhost:8080/api/feed"
AUTH_SERVICE_URL="http://localhost:8080/api/auth"
TEST_USER_EMAIL="testuser_websocket@example.com"
TEST_USER_PASSWORD="password123"
TEST_MESSAGE="WebSocket test message - $(date)"

# --- Helper Functions ---
log_info() {
  echo -e "\n🔵 $1"
}

log_success() {
  echo -e "✅ $1"
}

log_error() {
  echo -e "❌ $1"
  exit 1
}

log_warning() {
  echo -e "⚠️ $1"
}

# --- Main Test Logic ---

log_info "📝 Registering test user..."
REGISTER_RESPONSE=$(curl -s -X POST "$AUTH_SERVICE_URL/register" \
  -H "Content-Type: application/json" \
  -d "{
        \"username\": \"testuser_websocket\",
        \"email\": \"$TEST_USER_EMAIL\",
        \"password\": \"$TEST_USER_PASSWORD\",
        \"fullName\": \"Test User WebSocket\"
      }")

if echo "$REGISTER_RESPONSE" | grep -q "User registered successfully"; then
  log_success "Test user registered."
elif echo "$REGISTER_RESPONSE" | grep -q "User with this email already exists"; then
  log_warning "Test user already exists. Proceeding with login."
else
  log_error "Failed to register test user: $REGISTER_RESPONSE"
fi

log_info "🔑 Logging in test user..."
LOGIN_RESPONSE=$(curl -s -X POST "$AUTH_SERVICE_URL/login" \
  -H "Content-Type: application/json" \
  -d "{
        \"email\": \"$TEST_USER_EMAIL\",
        \"password\": \"$TEST_USER_PASSWORD\"
      }")

ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')
USER_ID=$(echo "$LOGIN_RESPONSE" | jq -r '.userId')

if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" == "null" ]; then
  log_error "Failed to get access token. Login response: $LOGIN_RESPONSE"
else
  log_success "Logged in successfully. User ID: $USER_ID"
fi

log_info "➕ Creating a test feed..."
CREATE_FEED_RESPONSE=$(curl -s -X POST "$FEED_SERVICE_URL/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{
        \"userId\": \"$USER_ID\",
        \"message\": \"$TEST_MESSAGE\"
      }")

NEW_FEED_ID=$(echo "$CREATE_FEED_RESPONSE" | jq -r '.feedId')

if [ -z "$NEW_FEED_ID" ] || [ "$NEW_FEED_ID" == "null" ]; then
  log_error "Failed to create test feed. Response: $CREATE_FEED_RESPONSE"
else
  log_success "Test feed created with ID: $NEW_FEED_ID"
fi

log_info "⏳ Waiting 3 seconds for WebSocket notification to be sent..."
sleep 3

log_info "🗑️ Deleting the test feed..."
DELETE_FEED_RESPONSE=$(curl -s -X DELETE "$FEED_SERVICE_URL/$NEW_FEED_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$DELETE_FEED_RESPONSE" | grep -q "Feed deleted successfully"; then
  log_success "Test feed $NEW_FEED_ID deleted successfully."
else
  log_error "Failed to delete test feed $NEW_FEED_ID. Response: $DELETE_FEED_RESPONSE"
fi

log_info "⏳ Waiting 3 seconds for WebSocket deletion notification to be sent..."
sleep 3

log_info "✅ WebSocket notifications test completed!"
log_info "📱 Check your mobile app Feed.tsx to verify:"
log_info "   1. The new feed appeared in real-time when created"
log_info "   2. The feed was removed from the UI when deleted"
log_info "   3. WebSocket connection logs show the events"

echo ""
echo "🔍 To monitor WebSocket events in real-time, check the feed-service logs:"
echo "   docker-compose logs -f feed-service"
