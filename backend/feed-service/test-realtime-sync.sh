#!/bin/bash

# BharathVA Real-time Feed Synchronization Test
# Tests WebSocket connection and MongoDB Change Streams

set -e

echo "🚀 BharathVA Real-time Feed Synchronization Test"
echo "=================================================="

# Configuration
GATEWAY_URL="http://localhost:8080"
FEED_SERVICE_URL="http://localhost:8082"
WEBSOCKET_URL="ws://localhost:8080/ws"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test functions
test_service_health() {
    echo -e "\n${BLUE}📡 Testing Service Health...${NC}"
    
    # Test Gateway
    if curl -s -f "$GATEWAY_URL/actuator/health" > /dev/null; then
        echo -e "✅ Gateway Service: ${GREEN}Healthy${NC}"
    else
        echo -e "❌ Gateway Service: ${RED}Unhealthy${NC}"
        return 1
    fi
    
    # Test Feed Service
    if curl -s -f "$FEED_SERVICE_URL/actuator/health" > /dev/null; then
        echo -e "✅ Feed Service: ${GREEN}Healthy${NC}"
    else
        echo -e "❌ Feed Service: ${RED}Unhealthy${NC}"
        return 1
    fi
}

test_websocket_endpoint() {
    echo -e "\n${BLUE}🔌 Testing WebSocket Endpoint...${NC}"
    
    # Test WebSocket endpoint availability
    HTTP_CODE=$(curl -s -I -o /dev/null -w "%{http_code}" "$GATEWAY_URL/ws")
    if [ "$HTTP_CODE" = "405" ] || [ "$HTTP_CODE" = "400" ]; then
        echo -e "✅ WebSocket Endpoint: ${GREEN}Available (HTTP $HTTP_CODE - expected for WebSocket)${NC}"
    else
        echo -e "❌ WebSocket Endpoint: ${RED}Unavailable (HTTP $HTTP_CODE)${NC}"
        return 1
    fi
}

test_feed_creation() {
    echo -e "\n${BLUE}📝 Testing Feed Creation...${NC}"
    
    # Create a test feed
    RESPONSE=$(curl -s -X POST "$GATEWAY_URL/api/feed/test/upload/image" \
        -F "file=@test-image.jpg" \
        -w "\n%{http_code}")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n -1)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "✅ Image Upload: ${GREEN}Success${NC}"
        echo "Response: $BODY"
        
        # Extract image URL from response
        IMAGE_URL=$(echo "$BODY" | grep -o '"imageUrl":"[^"]*"' | cut -d'"' -f4)
        if [ -n "$IMAGE_URL" ]; then
            echo "Image URL: $IMAGE_URL"
        fi
    else
        echo -e "❌ Image Upload: ${RED}Failed${NC} (HTTP $HTTP_CODE)"
        echo "Response: $BODY"
        return 1
    fi
}

test_mongodb_connection() {
    echo -e "\n${BLUE}🗄️ Testing MongoDB Connection...${NC}"
    
    # Test MongoDB connection through feed service
    RESPONSE=$(curl -s -X GET "$FEED_SERVICE_URL/actuator/health" | grep -o '"mongodb":{"status":"[^"]*"}' || echo "")
    
    if echo "$RESPONSE" | grep -q "UP"; then
        echo -e "✅ MongoDB Connection: ${GREEN}Connected${NC}"
    else
        echo -e "❌ MongoDB Connection: ${RED}Disconnected${NC}"
        return 1
    fi
}

test_change_streams() {
    echo -e "\n${BLUE}📡 Testing MongoDB Change Streams...${NC}"
    
    # Check if change streams are running by looking at logs
    if docker logs bharathva-feed 2>&1 | grep -q "Change stream monitoring started successfully"; then
        echo -e "✅ Change Streams: ${GREEN}Active${NC}"
    else
        echo -e "⚠️ Change Streams: ${YELLOW}Status Unknown${NC}"
        echo "Check logs: docker logs bharathva-feed"
    fi
}

test_websocket_connection() {
    echo -e "\n${BLUE}🔌 Testing WebSocket Connection...${NC}"
    
    # Create a simple WebSocket test using Node.js if available
    if command -v node >/dev/null 2>&1; then
        cat > /tmp/websocket-test.js << 'EOF'
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080/ws');

ws.on('open', function open() {
    console.log('✅ WebSocket Connection: Connected');
    ws.close();
});

ws.on('error', function error(err) {
    console.log('❌ WebSocket Connection: Failed -', err.message);
    process.exit(1);
});

setTimeout(() => {
    console.log('⚠️ WebSocket Connection: Timeout');
    process.exit(1);
}, 5000);
EOF
        
        if node /tmp/websocket-test.js; then
            echo -e "✅ WebSocket Test: ${GREEN}Passed${NC}"
        else
            echo -e "❌ WebSocket Test: ${RED}Failed${NC}"
            return 1
        fi
        
        rm -f /tmp/websocket-test.js
    else
        echo -e "⚠️ WebSocket Test: ${YELLOW}Skipped (Node.js not available)${NC}"
    fi
}

test_real_time_sync() {
    echo -e "\n${BLUE}⚡ Testing Real-time Synchronization...${NC}"
    
    echo "This test requires manual verification:"
    echo "1. Open the mobile app and navigate to the profile tab"
    echo "2. Create a new post with text and/or images"
    echo "3. Verify the post appears immediately in the feed"
    echo "4. Delete a post from the database manually"
    echo "5. Verify the post disappears from the feed immediately"
    
    echo -e "\n${YELLOW}Manual Test Steps:${NC}"
    echo "1. Check browser console for WebSocket connection logs"
    echo "2. Look for '🔌 WebSocket connected' messages"
    echo "3. Look for '📥 Real-time feed created/deleted event' messages"
    echo "4. Verify feed updates without manual refresh"
}

show_logs() {
    echo -e "\n${BLUE}📋 Recent Feed Service Logs:${NC}"
    echo "=================================="
    docker logs --tail 20 bharathva-feed 2>&1 | grep -E "(WebSocket|Change Stream|Feed|Error)" || echo "No relevant logs found"
}

show_mongodb_status() {
    echo -e "\n${BLUE}🗄️ MongoDB Collections Status:${NC}"
    echo "=================================="
    
    # Check if MongoDB is accessible
    if command -v mongosh >/dev/null 2>&1; then
        mongosh --eval "
            use bharathva_feed;
            print('Collections:');
            db.getCollectionNames().forEach(name => {
                const count = db.getCollection(name).countDocuments();
                print('  ' + name + ': ' + count + ' documents');
            });
        " 2>/dev/null || echo "MongoDB not accessible via mongosh"
    else
        echo "MongoDB shell not available"
    fi
}

# Main test execution
main() {
    echo "Starting comprehensive real-time synchronization test..."
    
    # Wait for services to be ready
    echo -e "\n${YELLOW}⏳ Waiting for services to be ready...${NC}"
    sleep 5
    
    # Run tests
    test_service_health
    test_websocket_endpoint
    test_mongodb_connection
    test_change_streams
    test_websocket_connection
    test_feed_creation
    test_real_time_sync
    
    # Show status information
    show_logs
    show_mongodb_status
    
    echo -e "\n${GREEN}🎉 Real-time Synchronization Test Complete!${NC}"
    echo "=================================================="
    echo -e "\n${YELLOW}Next Steps:${NC}"
    echo "1. Test the mobile app with real-time updates"
    echo "2. Create and delete posts to verify synchronization"
    echo "3. Check WebSocket connection in browser dev tools"
    echo "4. Monitor logs for real-time events"
    
    echo -e "\n${BLUE}Useful Commands:${NC}"
    echo "• View logs: docker logs -f bharathva-feed"
    echo "• Test WebSocket: wscat -c ws://localhost:8080/ws"
    echo "• Check MongoDB: mongosh bharathva_feed"
}

# Run main function
main "$@"
