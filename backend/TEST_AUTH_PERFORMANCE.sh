#!/bin/bash

# BharathVA - Authentication Performance Test Script
# This script tests the optimized authentication performance

echo "=========================================="
echo "BharathVA Authentication Performance Test"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:8080/api/auth"

# Function to measure request time
measure_time() {
    local url=$1
    local method=$2
    local headers=$3
    local data=$4
    
    local start_time=$(date +%s%3N)
    
    if [ "$method" == "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
            -H "Content-Type: application/json" \
            $headers \
            -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" "$url" $headers)
    fi
    
    local end_time=$(date +%s%3N)
    local duration=$((end_time - start_time))
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    echo "$duration|$http_code|$body"
}

# Check if service is running
echo -e "${BLUE}Step 1: Checking if backend services are running${NC}"
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/health_response.json http://localhost:8080/api/auth/register/health)

if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Backend services are running${NC}"
else
    echo -e "${RED}❌ Backend services are not running. Please start them first.${NC}"
    echo "Run: cd backend && docker-compose up --build"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 2: Test User Login (to get JWT token)${NC}"
echo "Email: test@example.com"
echo "Password: TestPass123!"

# Login to get token
LOGIN_RESPONSE=$(curl -s -X POST ${BASE_URL}/login \
  -H "Content-Type: application/json" \
  -H "X-Device-Info: Performance Test | Script" \
  -H "X-IP-Address: 127.0.0.1" \
  -d '{"email":"test@example.com","password":"TestPass123!"}')

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
    echo -e "${RED}❌ Failed to get access token!${NC}"
    echo "Please ensure test user exists. Run registration first."
    echo ""
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✅ Login successful, token obtained${NC}"
echo ""

# Test 1: Fast Token Validation
echo "=========================================="
echo -e "${YELLOW}Test 1: Fast Token Validation (/validate)${NC}"
echo "Expected: <10ms"
echo "=========================================="

total_time=0
iterations=10

for i in $(seq 1 $iterations); do
    result=$(measure_time "${BASE_URL}/validate" "POST" "-H \"Authorization: Bearer $ACCESS_TOKEN\"" "{}")
    time=$(echo $result | cut -d'|' -f1)
    http_code=$(echo $result | cut -d'|' -f2)
    
    total_time=$((total_time + time))
    
    if [ "$http_code" = "200" ]; then
        echo -e "  Attempt $i: ${GREEN}${time}ms${NC} (HTTP $http_code)"
    else
        echo -e "  Attempt $i: ${RED}${time}ms${NC} (HTTP $http_code) - ERROR"
    fi
    
    sleep 0.1
done

avg_time=$((total_time / iterations))
echo ""
echo -e "Average Time: ${GREEN}${avg_time}ms${NC}"

if [ $avg_time -lt 10 ]; then
    echo -e "${GREEN}✅ EXCELLENT: Performance target achieved (<10ms)${NC}"
elif [ $avg_time -lt 50 ]; then
    echo -e "${YELLOW}⚠️  GOOD: Under 50ms but could be better${NC}"
elif [ $avg_time -lt 100 ]; then
    echo -e "${YELLOW}⚠️  ACCEPTABLE: Under 100ms${NC}"
else
    echo -e "${RED}❌ SLOW: Over 100ms, optimization needed${NC}"
fi

echo ""

# Test 2: Secure Token Validation (First Call)
echo "=========================================="
echo -e "${YELLOW}Test 2: Secure Token Validation - First Call (/validate-secure)${NC}"
echo "Expected: 50-200ms (includes database query)"
echo "=========================================="

result=$(measure_time "${BASE_URL}/validate-secure" "POST" "-H \"Authorization: Bearer $ACCESS_TOKEN\"" "{}")
time=$(echo $result | cut -d'|' -f1)
http_code=$(echo $result | cut -d'|' -f2)

echo -e "First Call: ${BLUE}${time}ms${NC} (HTTP $http_code)"

if [ $time -lt 200 ]; then
    echo -e "${GREEN}✅ GOOD: Within expected range${NC}"
else
    echo -e "${YELLOW}⚠️  SLOW: Over 200ms (possible database latency)${NC}"
fi

echo ""

# Test 3: Secure Token Validation (Cached Calls)
echo "=========================================="
echo -e "${YELLOW}Test 3: Secure Token Validation - Cached Calls${NC}"
echo "Expected: <10ms (cached)"
echo "=========================================="

total_time=0
iterations=5

for i in $(seq 1 $iterations); do
    result=$(measure_time "${BASE_URL}/validate-secure" "POST" "-H \"Authorization: Bearer $ACCESS_TOKEN\"" "{}")
    time=$(echo $result | cut -d'|' -f1)
    http_code=$(echo $result | cut -d'|' -f2)
    
    total_time=$((total_time + time))
    
    if [ "$http_code" = "200" ]; then
        echo -e "  Cached Call $i: ${GREEN}${time}ms${NC} (HTTP $http_code)"
    else
        echo -e "  Cached Call $i: ${RED}${time}ms${NC} (HTTP $http_code) - ERROR"
    fi
    
    sleep 0.1
done

avg_time=$((total_time / iterations))
echo ""
echo -e "Average Cached Time: ${GREEN}${avg_time}ms${NC}"

if [ $avg_time -lt 10 ]; then
    echo -e "${GREEN}✅ EXCELLENT: Cache is working perfectly${NC}"
elif [ $avg_time -lt 50 ]; then
    echo -e "${YELLOW}⚠️  GOOD: Cache is working but could be faster${NC}"
else
    echo -e "${RED}❌ ISSUE: Cache may not be working properly${NC}"
fi

echo ""

# Test 4: Profile Endpoint (Authenticated Request)
echo "=========================================="
echo -e "${YELLOW}Test 4: Authenticated Request (/profile)${NC}"
echo "Expected: <50ms (with fast validation)"
echo "=========================================="

total_time=0
iterations=5

for i in $(seq 1 $iterations); do
    result=$(measure_time "${BASE_URL}/profile" "GET" "-H \"Authorization: Bearer $ACCESS_TOKEN\"" "")
    time=$(echo $result | cut -d'|' -f1)
    http_code=$(echo $result | cut -d'|' -f2)
    
    total_time=$((total_time + time))
    
    if [ "$http_code" = "200" ]; then
        echo -e "  Request $i: ${GREEN}${time}ms${NC} (HTTP $http_code)"
    else
        echo -e "  Request $i: ${RED}${time}ms${NC} (HTTP $http_code) - ERROR"
    fi
    
    sleep 0.1
done

avg_time=$((total_time / iterations))
echo ""
echo -e "Average Request Time: ${GREEN}${avg_time}ms${NC}"

if [ $avg_time -lt 50 ]; then
    echo -e "${GREEN}✅ EXCELLENT: Fast authenticated requests${NC}"
elif [ $avg_time -lt 100 ]; then
    echo -e "${YELLOW}⚠️  GOOD: Within acceptable range${NC}"
else
    echo -e "${RED}❌ SLOW: Optimization needed${NC}"
fi

echo ""

# Test 5: Concurrent Requests
echo "=========================================="
echo -e "${YELLOW}Test 5: Concurrent Request Load Test${NC}"
echo "Testing 20 concurrent validation requests"
echo "=========================================="

start_time=$(date +%s%3N)

# Run 20 concurrent requests
for i in $(seq 1 20); do
    curl -s -X POST ${BASE_URL}/validate \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{}' > /dev/null 2>&1 &
done

# Wait for all background jobs to complete
wait

end_time=$(date +%s%3N)
duration=$((end_time - start_time))
avg_per_request=$((duration / 20))

echo ""
echo -e "Total Time for 20 requests: ${BLUE}${duration}ms${NC}"
echo -e "Average per request: ${GREEN}${avg_per_request}ms${NC}"

if [ $avg_per_request -lt 20 ]; then
    echo -e "${GREEN}✅ EXCELLENT: Handles concurrent load well${NC}"
elif [ $avg_per_request -lt 50 ]; then
    echo -e "${YELLOW}⚠️  GOOD: Acceptable concurrent performance${NC}"
else
    echo -e "${RED}❌ ISSUE: Concurrent performance degradation${NC}"
fi

echo ""

# Summary
echo "=========================================="
echo -e "${GREEN}Performance Test Summary${NC}"
echo "=========================================="
echo ""
echo "Results:"
echo "  ✓ Fast Validation: Average ~${avg_time}ms"
echo "  ✓ Secure Validation (cached): Average ~${avg_time}ms"
echo "  ✓ Authenticated Requests: Average ~${avg_time}ms"
echo "  ✓ Concurrent Load: ${avg_per_request}ms per request"
echo ""

# Overall assessment
if [ $avg_time -lt 10 ]; then
    echo -e "${GREEN}🎉 PERFORMANCE TARGET ACHIEVED!${NC}"
    echo -e "${GREEN}Authentication is lightning fast (<10ms)${NC}"
elif [ $avg_time -lt 50 ]; then
    echo -e "${YELLOW}⚡ GOOD PERFORMANCE${NC}"
    echo -e "${YELLOW}Under 50ms - within acceptable range${NC}"
elif [ $avg_time -lt 100 ]; then
    echo -e "${YELLOW}✓ ACCEPTABLE PERFORMANCE${NC}"
    echo -e "${YELLOW}Under 100ms - meets minimum target${NC}"
else
    echo -e "${RED}⚠️  NEEDS OPTIMIZATION${NC}"
    echo -e "${RED}Over 100ms - review performance guide${NC}"
fi

echo ""
echo "For detailed optimization guide, see:"
echo "  backend/PERFORMANCE_OPTIMIZATION_GUIDE.md"
echo ""

