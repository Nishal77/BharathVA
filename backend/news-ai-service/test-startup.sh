#!/bin/bash

# News AI Service Startup Test Script
# This script tests if the service can start and respond to health checks

set -e

echo "=========================================="
echo "News AI Service Startup Test"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SERVICE_PORT=8084
SERVICE_URL="http://localhost:${SERVICE_PORT}"
MAX_WAIT=120
CHECK_INTERVAL=5

echo "Testing service on port ${SERVICE_PORT}..."
echo ""

# Function to check if service is responding
check_service() {
    local response=$(curl -s -o /dev/null -w "%{http_code}" "${SERVICE_URL}/actuator/health" 2>/dev/null || echo "000")
    echo "$response"
}

# Function to check Eureka registration
check_eureka() {
    local response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8761/eureka/apps/NEWS-AI-SERVICE" 2>/dev/null || echo "000")
    echo "$response"
}

# Wait for service to start
echo "Waiting for service to start (max ${MAX_WAIT}s)..."
elapsed=0
while [ $elapsed -lt $MAX_WAIT ]; do
    status=$(check_service)
    if [ "$status" = "200" ]; then
        echo -e "${GREEN}✓ Service is UP!${NC}"
        break
    elif [ "$status" = "000" ]; then
        echo -e "${YELLOW}⏳ Service not responding yet... (${elapsed}s)${NC}"
    else
        echo -e "${YELLOW}⏳ Service responding with status ${status}... (${elapsed}s)${NC}"
    fi
    sleep $CHECK_INTERVAL
    elapsed=$((elapsed + CHECK_INTERVAL))
done

if [ $elapsed -ge $MAX_WAIT ]; then
    echo -e "${RED}✗ Service failed to start within ${MAX_WAIT}s${NC}"
    echo ""
    echo "Troubleshooting steps:"
    echo "1. Check Docker logs: docker-compose logs news-ai-service"
    echo "2. Check if service is running: docker-compose ps news-ai-service"
    echo "3. Check port availability: lsof -i :8084"
    echo "4. Verify .env.local exists: ls -la backend/news-ai-service/.env.local"
    exit 1
fi

echo ""
echo "=========================================="
echo "Running Health Checks"
echo "=========================================="
echo ""

# Test 1: Actuator Health
echo -n "1. Actuator Health Endpoint: "
health_response=$(curl -s "${SERVICE_URL}/actuator/health")
if echo "$health_response" | grep -q '"status":"UP"'; then
    echo -e "${GREEN}✓ PASS${NC}"
    echo "   Response: $health_response"
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "   Response: $health_response"
fi
echo ""

# Test 2: Custom Health Endpoint
echo -n "2. Custom Health Endpoint (/api/news/health): "
custom_health=$(curl -s "${SERVICE_URL}/api/news/health")
if echo "$custom_health" | grep -q "running"; then
    echo -e "${GREEN}✓ PASS${NC}"
    echo "   Response: $custom_health"
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "   Response: $custom_health"
fi
echo ""

# Test 3: Eureka Registration
echo -n "3. Eureka Registration: "
eureka_status=$(check_eureka)
if [ "$eureka_status" = "200" ]; then
    echo -e "${GREEN}✓ REGISTERED${NC}"
    echo "   Service is registered in Eureka"
elif [ "$eureka_status" = "404" ]; then
    echo -e "${YELLOW}⚠ NOT REGISTERED${NC}"
    echo "   Service is running but not registered in Eureka"
    echo "   Check Eureka connection and service logs"
else
    echo -e "${RED}✗ ERROR${NC}"
    echo "   Could not check Eureka status (HTTP $eureka_status)"
fi
echo ""

# Test 4: Database Stats (may fail if DB not connected)
echo -n "4. Database Stats Endpoint: "
stats_response=$(curl -s "${SERVICE_URL}/api/news/stats" || echo "ERROR")
if echo "$stats_response" | grep -q "totalArticles"; then
    echo -e "${GREEN}✓ PASS${NC}"
    echo "   Response: $stats_response"
elif echo "$stats_response" | grep -q "databaseConnected.*false"; then
    echo -e "${YELLOW}⚠ DATABASE NOT CONNECTED${NC}"
    echo "   Service is running but database connection failed"
    echo "   Check database credentials in .env.local"
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "   Response: $stats_response"
fi
echo ""

# Test 5: Gateway Routing
echo -n "5. Gateway Routing (/api/news/health): "
gateway_response=$(curl -s "http://localhost:8080/api/news/health" || echo "ERROR")
if echo "$gateway_response" | grep -q "running"; then
    echo -e "${GREEN}✓ PASS${NC}"
    echo "   Service accessible through gateway"
elif echo "$gateway_response" | grep -q "503"; then
    echo -e "${YELLOW}⚠ SERVICE UNAVAILABLE${NC}"
    echo "   Gateway cannot route to service - check Eureka registration"
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "   Response: $gateway_response"
fi
echo ""

echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo ""
echo "Service URL: ${SERVICE_URL}"
echo "Eureka Dashboard: http://localhost:8761"
echo "Gateway URL: http://localhost:8080"
echo ""
echo "Next Steps:"
echo "1. If database is not connected, check .env.local file"
echo "2. If Eureka registration failed, check discovery-service logs"
echo "3. If gateway routing failed, verify service is registered in Eureka"
echo ""




