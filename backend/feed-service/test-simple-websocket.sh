#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "🚀 BharathVA Simple WebSocket Test"
echo "=================================="
echo "Testing WebSocket endpoint and feed service integration..."

# --- Configuration ---
FEED_SERVICE_URL="http://localhost:8082"
WEBSOCKET_URL="ws://localhost:8082/ws"

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

log_info "📡 Testing Feed Service Health..."
if curl -s "$FEED_SERVICE_URL/actuator/health" | grep -q '"status":"UP"'; then
  log_success "Feed Service: Healthy"
else
  log_error "Feed Service: Unhealthy"
fi

log_info "🔌 Testing WebSocket Endpoint..."
HTTP_CODE=$(curl -s -I -o /dev/null -w "%{http_code}" "$FEED_SERVICE_URL/ws")
if [ "$HTTP_CODE" = "405" ] || [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "200" ]; then
  log_success "WebSocket Endpoint: Available (HTTP $HTTP_CODE - expected for WebSocket)"
else
  log_error "WebSocket Endpoint: Unavailable (HTTP $HTTP_CODE)"
fi

log_info "📊 Testing Feed Service Endpoints..."
# Test the test upload endpoint
if curl -s -X GET "$FEED_SERVICE_URL/api/feed/test/upload/image" > /dev/null; then
  log_success "Test Upload Endpoint: Available"
else
  log_warning "Test Upload Endpoint: Not available (this is expected for GET request)"
fi

log_info "🔍 Checking Feed Service Logs for WebSocket Configuration..."
echo "Recent WebSocket-related logs:"
docker-compose logs feed-service --tail=20 | grep -i websocket || echo "No WebSocket logs found in recent output"

log_info "✅ Simple WebSocket test completed!"
log_info "📱 Next steps:"
log_info "   1. Open your mobile app and navigate to the Feed tab"
log_info "   2. Create a new post (text or with image)"
log_info "   3. Delete a post from the database or through the app"
log_info "   4. Verify that the Feed.tsx component updates in real-time"
log_info "   5. Check the browser console for WebSocket connection logs"

echo ""
echo "🔍 To monitor WebSocket events in real-time:"
echo "   docker-compose logs -f feed-service | grep -i websocket"
