#!/bin/bash

# BharathVA Feed Service - Cloudinary Test Script

echo "🔍 Testing Cloudinary Integration for BharathVA Feed Service"
echo "============================================================"

# Configuration
GATEWAY_URL="http://localhost:8080"
FEED_SERVICE_URL="http://localhost:8082"

echo "📋 Configuration:"
echo "  Gateway URL: $GATEWAY_URL"
echo "  Feed Service URL: $FEED_SERVICE_URL"
echo ""

# Test 1: Health Check
echo "🏥 Test 1: Feed Service Health Check"
echo "------------------------------------"
curl -s "$FEED_SERVICE_URL/api/feed/health" | jq '.' 2>/dev/null || curl -s "$FEED_SERVICE_URL/api/feed/health"
echo ""

# Test 2: Cloudinary Connection Test
echo "☁️  Test 2: Cloudinary Connection Test"
echo "--------------------------------------"
curl -s "$FEED_SERVICE_URL/api/feed/test/cloudinary" | jq '.' 2>/dev/null || curl -s "$FEED_SERVICE_URL/api/feed/test/cloudinary"
echo ""

# Test 3: Gateway Health Check
echo "🌐 Test 3: Gateway Health Check"
echo "-------------------------------"
curl -s "$GATEWAY_URL/actuator/health" | jq '.' 2>/dev/null || curl -s "$GATEWAY_URL/actuator/health"
echo ""

# Test 4: Gateway Cloudinary Test
echo "🌐☁️  Test 4: Gateway Cloudinary Test"
echo "------------------------------------"
curl -s "$GATEWAY_URL/api/feed/test/cloudinary" | jq '.' 2>/dev/null || curl -s "$GATEWAY_URL/api/feed/test/cloudinary"
echo ""

echo "✅ Cloudinary integration test completed!"
echo ""
echo "📝 Next Steps:"
echo "  1. If Cloudinary test fails, check the credentials in application.yml"
echo "  2. Ensure the feed service is running on port 8082"
echo "  3. Check the logs for detailed error messages"
echo "  4. Test image upload functionality through the mobile app"
