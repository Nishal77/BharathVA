#!/bin/bash

# BharathVA Backend Health Check Script
# Tests connectivity to all backend services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration - Auto-detect IP address
DETECTED_IP=$(ifconfig | grep -E "inet " | grep -v "127.0.0.1" | awk '{print $2}' | head -1)
GATEWAY_URL="${GATEWAY_URL:-http://${DETECTED_IP:-192.168.0.203}:8080}"
LOCAL_GATEWAY_URL="http://localhost:8080"
DISCOVERY_URL="http://localhost:8761"
AUTH_SERVICE_URL="http://localhost:8081"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}BharathVA Backend Health Check${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Detected IP Address: ${DETECTED_IP:-192.168.0.203}${NC}"
echo -e "${YELLOW}Testing Gateway URL: ${GATEWAY_URL}${NC}"
echo ""

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -e "${YELLOW}Testing ${name}...${NC}"
    
    if curl -s -f -o /dev/null -w "%{http_code}" --max-time 5 "$url" | grep -q "$expected_status"; then
        echo -e "${GREEN}  ✓ ${name} is accessible (${url})${NC}"
        return 0
    else
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null || echo "000")
        if [ "$HTTP_CODE" = "000" ]; then
            echo -e "${RED}  ✗ ${name} is not accessible (Connection failed)${NC}"
        else
            echo -e "${RED}  ✗ ${name} returned HTTP ${HTTP_CODE} (expected ${expected_status})${NC}"
        fi
        return 1
    fi
}

# Test Docker containers
echo -e "${BLUE}Docker Container Status:${NC}"
if command -v docker &> /dev/null; then
    if docker ps --format "{{.Names}}" | grep -q "bharathva"; then
        echo -e "${GREEN}  ✓ BharathVA containers are running${NC}"
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep bharathva || true
    else
        echo -e "${RED}  ✗ No BharathVA containers are running${NC}"
        echo -e "${YELLOW}  Run: cd backend && ./start-services.sh${NC}"
    fi
else
    echo -e "${RED}  ✗ Docker is not installed or not running${NC}"
fi

echo ""

# Test local endpoints
echo -e "${BLUE}Local Endpoint Tests:${NC}"
LOCAL_PASSED=0
LOCAL_TOTAL=0

LOCAL_TOTAL=$((LOCAL_TOTAL + 1))
if test_endpoint "Discovery Service" "$DISCOVERY_URL" "200"; then
    LOCAL_PASSED=$((LOCAL_PASSED + 1))
fi

LOCAL_TOTAL=$((LOCAL_TOTAL + 1))
if test_endpoint "Auth Service Health" "$AUTH_SERVICE_URL/auth/register/health" "200"; then
    LOCAL_PASSED=$((LOCAL_PASSED + 1))
fi

LOCAL_TOTAL=$((LOCAL_TOTAL + 1))
if test_endpoint "Gateway Health" "$LOCAL_GATEWAY_URL/actuator/health" "200"; then
    LOCAL_PASSED=$((LOCAL_PASSED + 1))
fi

LOCAL_TOTAL=$((LOCAL_TOTAL + 1))
if test_endpoint "Gateway Auth Health" "$LOCAL_GATEWAY_URL/api/auth/register/health" "200"; then
    LOCAL_PASSED=$((LOCAL_PASSED + 1))
fi

echo ""

# Test network endpoint (for mobile app)
echo -e "${BLUE}Network Endpoint Tests (for mobile app):${NC}"
NETWORK_PASSED=0
NETWORK_TOTAL=0

NETWORK_TOTAL=$((NETWORK_TOTAL + 1))
if test_endpoint "Gateway (Network)" "$GATEWAY_URL/actuator/health" "200"; then
    NETWORK_PASSED=$((NETWORK_PASSED + 1))
fi

NETWORK_TOTAL=$((NETWORK_TOTAL + 1))
if test_endpoint "Auth Health (Network)" "$GATEWAY_URL/api/auth/register/health" "200"; then
    NETWORK_PASSED=$((NETWORK_PASSED + 1))
fi

echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Summary:${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Local endpoints: ${GREEN}${LOCAL_PASSED}/${LOCAL_TOTAL}${NC} passed"
echo -e "Network endpoints: ${GREEN}${NETWORK_PASSED}/${NETWORK_TOTAL}${NC} passed"
echo ""

if [ $LOCAL_PASSED -eq $LOCAL_TOTAL ] && [ $NETWORK_PASSED -eq $NETWORK_TOTAL ]; then
    echo -e "${GREEN}✓ All health checks passed!${NC}"
    exit 0
elif [ $LOCAL_PASSED -eq $LOCAL_TOTAL ]; then
    echo -e "${YELLOW}⚠ Local services are healthy, but network access may be blocked${NC}"
    echo -e "${YELLOW}  Check firewall settings and ensure device is on the same network${NC}"
    exit 1
else
    echo -e "${RED}✗ Some services are not healthy${NC}"
    echo -e "${YELLOW}  Check logs: docker-compose logs${NC}"
    exit 1
fi

