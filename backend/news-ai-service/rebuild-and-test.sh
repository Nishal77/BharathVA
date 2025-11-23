#!/bin/bash

# Complete Rebuild and Test Script for News AI Service
# This script stops, rebuilds, starts, and tests the news-ai-service

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVICE_NAME="news-ai-service"
SERVICE_PORT=8084
SERVICE_URL="http://localhost:${SERVICE_PORT}"
GATEWAY_URL="http://localhost:8080"
EUREKA_URL="http://localhost:8761"
MAX_WAIT=120
CHECK_INTERVAL=5

echo ""
echo "=========================================="
echo "News AI Service - Complete Rebuild & Test"
echo "=========================================="
echo ""

# Step 1: Stop and remove old container
echo -e "${BLUE}Step 1: Stopping and removing old container...${NC}"
cd ../
docker-compose stop ${SERVICE_NAME} 2>/dev/null || true
docker-compose rm -f ${SERVICE_NAME} 2>/dev/null || true
echo -e "${GREEN}✓ Old container removed${NC}"
echo ""

# Step 2: Remove old image
echo -e "${BLUE}Step 2: Removing old image...${NC}"
docker rmi backend-${SERVICE_NAME} 2>/dev/null || true
echo -e "${GREEN}✓ Old image removed${NC}"
echo ""

# Step 3: Build new image
echo -e "${BLUE}Step 3: Building new image...${NC}"
docker-compose build --no-cache ${SERVICE_NAME}
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Image built successfully${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi
echo ""

# Step 4: Start service
echo -e "${BLUE}Step 4: Starting service...${NC}"
docker-compose up -d ${SERVICE_NAME}
echo -e "${GREEN}✓ Service started${NC}"
echo ""

# Step 5: Wait for service to be ready
echo -e "${BLUE}Step 5: Waiting for service to be ready (max ${MAX_WAIT}s)...${NC}"
elapsed=0
while [ $elapsed -lt $MAX_WAIT ]; do
    status=$(curl -s -o /dev/null -w "%{http_code}" "${SERVICE_URL}/actuator/health" 2>/dev/null || echo "000")
    if [ "$status" = "200" ]; then
        echo -e "${GREEN}✓ Service is UP! (took ${elapsed}s)${NC}"
        break
    fi
    echo -e "${YELLOW}⏳ Waiting... (${elapsed}s)${NC}"
    sleep $CHECK_INTERVAL
    elapsed=$((elapsed + CHECK_INTERVAL))
done

if [ $elapsed -ge $MAX_WAIT ]; then
    echo -e "${RED}✗ Service failed to start within ${MAX_WAIT}s${NC}"
    echo ""
    echo "Checking logs..."
    docker-compose logs --tail=50 ${SERVICE_NAME}
    exit 1
fi
echo ""

# Step 6: Wait for Eureka registration
echo -e "${BLUE}Step 6: Waiting for Eureka registration (max 60s)...${NC}"
elapsed=0
while [ $elapsed -lt 60 ]; do
    eureka_status=$(curl -s -o /dev/null -w "%{http_code}" "${EUREKA_URL}/eureka/apps/NEWS-AI-SERVICE" 2>/dev/null || echo "000")
    if [ "$eureka_status" = "200" ]; then
        echo -e "${GREEN}✓ Registered in Eureka! (took ${elapsed}s)${NC}"
        break
    fi
    echo -e "${YELLOW}⏳ Waiting for registration... (${elapsed}s)${NC}"
    sleep $CHECK_INTERVAL
    elapsed=$((elapsed + CHECK_INTERVAL))
done
echo ""

# Step 7: Run comprehensive tests
echo "=========================================="
echo "Running Comprehensive Tests"
echo "=========================================="
echo ""

# Test 1: Actuator Health
echo -e "${BLUE}Test 1: Actuator Health Endpoint${NC}"
health_response=$(curl -s "${SERVICE_URL}/actuator/health")
if echo "$health_response" | grep -q '"status":"UP"'; then
    echo -e "${GREEN}✓ PASS${NC} - Service health is UP"
    echo "   Response: $health_response"
else
    echo -e "${RED}✗ FAIL${NC} - Service health check failed"
    echo "   Response: $health_response"
fi
echo ""

# Test 2: Custom Health Endpoint
echo -e "${BLUE}Test 2: Custom Health Endpoint (/api/news/health)${NC}"
custom_health=$(curl -s "${SERVICE_URL}/api/news/health")
if echo "$custom_health" | grep -q "running"; then
    echo -e "${GREEN}✓ PASS${NC} - Custom health endpoint working"
    echo "   Response: $custom_health"
else
    echo -e "${RED}✗ FAIL${NC} - Custom health endpoint failed"
    echo "   Response: $custom_health"
fi
echo ""

# Test 3: Eureka Registration
echo -e "${BLUE}Test 3: Eureka Registration${NC}"
eureka_response=$(curl -s "${EUREKA_URL}/eureka/apps/NEWS-AI-SERVICE")
if echo "$eureka_response" | grep -q "NEWS-AI-SERVICE"; then
    # Check for port 8084
    if echo "$eureka_response" | grep -q "8084"; then
        echo -e "${GREEN}✓ PASS${NC} - Service registered in Eureka on port 8084"
        # Extract instance info
        instance_id=$(echo "$eureka_response" | grep -oP '(?<=<instanceId>)[^<]+' | head -1)
        echo "   Instance ID: $instance_id"
    else
        echo -e "${YELLOW}⚠ WARNING${NC} - Service registered but not on port 8084"
    fi
else
    echo -e "${RED}✗ FAIL${NC} - Service not found in Eureka"
fi
echo ""

# Test 4: Database Stats
echo -e "${BLUE}Test 4: Database Stats Endpoint${NC}"
stats_response=$(curl -s "${SERVICE_URL}/api/news/stats")
if echo "$stats_response" | grep -q "totalArticles"; then
    echo -e "${GREEN}✓ PASS${NC} - Database connected and stats endpoint working"
    total_articles=$(echo "$stats_response" | grep -oP '(?<="totalArticles":)\d+')
    echo "   Total articles in database: $total_articles"
elif echo "$stats_response" | grep -q "databaseConnected.*false"; then
    echo -e "${YELLOW}⚠ WARNING${NC} - Service running but database not connected"
    echo "   Response: $stats_response"
else
    echo -e "${RED}✗ FAIL${NC} - Stats endpoint failed"
    echo "   Response: $stats_response"
fi
echo ""

# Test 5: Gateway Routing
echo -e "${BLUE}Test 5: Gateway Routing${NC}"
gateway_response=$(curl -s "${GATEWAY_URL}/api/news/health")
if echo "$gateway_response" | grep -q "running"; then
    echo -e "${GREEN}✓ PASS${NC} - Service accessible through gateway"
    echo "   Gateway URL: ${GATEWAY_URL}/api/news/"
else
    echo -e "${YELLOW}⚠ WARNING${NC} - Gateway routing may not be working yet"
    echo "   Response: $gateway_response"
    echo "   Note: Gateway may take a few seconds to discover the service"
fi
echo ""

# Test 6: Test Data Insertion (if database is connected)
if echo "$stats_response" | grep -q "totalArticles"; then
    echo -e "${BLUE}Test 6: Test Data Insertion${NC}"
    test_data_response=$(curl -s -X POST "${SERVICE_URL}/api/news/test-data")
    if echo "$test_data_response" | grep -q "testArticleId"; then
        echo -e "${GREEN}✓ PASS${NC} - Test data inserted successfully"
        test_id=$(echo "$test_data_response" | grep -oP '(?<="testArticleId":)\d+' | head -1)
        echo "   Test article ID: $test_id"
    else
        echo -e "${RED}✗ FAIL${NC} - Failed to insert test data"
        echo "   Response: $test_data_response"
    fi
    echo ""
fi

# Test 7: Latest News Endpoint
echo -e "${BLUE}Test 7: Latest News Endpoint${NC}"
latest_response=$(curl -s "${SERVICE_URL}/api/news/latest?page=0&size=5")
if [ $? -eq 0 ]; then
    if echo "$latest_response" | grep -q "content"; then
        echo -e "${GREEN}✓ PASS${NC} - Latest news endpoint working"
        count=$(echo "$latest_response" | grep -oP '(?<="totalElements":)\d+' | head -1)
        echo "   Total news articles: $count"
    else
        echo -e "${YELLOW}⚠ WARNING${NC} - Latest news endpoint returned but may have no data"
    fi
else
    echo -e "${RED}✗ FAIL${NC} - Latest news endpoint failed"
fi
echo ""

# Summary
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo ""
echo "Service Information:"
echo "  - Service URL:     ${SERVICE_URL}"
echo "  - Gateway URL:     ${GATEWAY_URL}/api/news"
echo "  - Eureka Dashboard: ${EUREKA_URL}"
echo "  - Container Name:  bharathva-news-ai"
echo ""
echo "Quick Commands:"
echo "  - View logs:       docker-compose logs -f ${SERVICE_NAME}"
echo "  - Check health:    curl ${SERVICE_URL}/actuator/health"
echo "  - Check stats:     curl ${SERVICE_URL}/api/news/stats"
echo "  - Insert test:     curl -X POST ${SERVICE_URL}/api/news/test-data"
echo "  - Latest news:     curl ${SERVICE_URL}/api/news/latest"
echo ""
echo -e "${GREEN}✓ Rebuild and test completed!${NC}"
echo ""

# Optional: Show last few log lines
echo "Last 20 log lines:"
echo "----------------------------------------"
docker-compose logs --tail=20 ${SERVICE_NAME}
echo ""




