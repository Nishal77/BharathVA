#!/bin/bash

# BharathVA Comprehensive Test Script
# This script tests the entire system end-to-end

echo "🚀 BharathVA Comprehensive Test Suite"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "${BLUE}Testing: $test_name${NC}"
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASSED: $test_name${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAILED: $test_name${NC}"
        ((TESTS_FAILED++))
    fi
    echo ""
}

# Get the current IP address
CURRENT_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
echo -e "${YELLOW}Current IP Address: $CURRENT_IP${NC}"
echo ""

# Test 1: Check if Docker services are running
echo "1️⃣ Testing Docker Services..."
run_test "Docker Compose Services" "cd /Users/nishalpoojary/Projects/Codes/ProjectRD/BharathVA/backend && docker-compose ps | grep 'Up'"

# Test 2: Test Gateway Service
echo "2️⃣ Testing Gateway Service..."
run_test "Gateway Health Check" "curl -s -o /dev/null -w '%{http_code}' http://$CURRENT_IP:8080/api/auth/register/health | grep -q '200'"

# Test 3: Test Auth Service Direct
echo "3️⃣ Testing Auth Service Direct..."
run_test "Auth Service Health Check" "curl -s -o /dev/null -w '%{http_code}' http://$CURRENT_IP:8081/auth/register/health | grep -q '200'"

# Test 4: Test Registration Endpoint
echo "4️⃣ Testing Registration Endpoint..."
run_test "Registration Endpoint" "curl -s -X POST http://$CURRENT_IP:8080/api/auth/register/email -H 'Content-Type: application/json' -d '{\"email\":\"test@example.com\"}' | grep -q 'success'"

# Test 5: Test Login Endpoint
echo "5️⃣ Testing Login Endpoint..."
run_test "Login Endpoint" "curl -s -X POST http://$CURRENT_IP:8080/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"test@example.com\",\"password\":\"testpassword\"}' | grep -q 'Incorrect email or password'"

# Test 6: Test Feed Service
echo "6️⃣ Testing Feed Service..."
run_test "Feed Service Health Check" "curl -s -o /dev/null -w '%{http_code}' http://$CURRENT_IP:8082/api/feed/health | grep -q '200'"

# Test 7: Test Redis Connection
echo "7️⃣ Testing Redis Connection..."
run_test "Redis Connection" "cd /Users/nishalpoojary/Projects/Codes/ProjectRD/BharathVA/backend && docker exec bharathva-redis redis-cli ping | grep -q 'PONG'"

# Test 8: Test MongoDB Connection
echo "8️⃣ Testing MongoDB Connection..."
run_test "MongoDB Connection" "cd /Users/nishalpoojary/Projects/Codes/ProjectRD/BharathVA/backend && docker exec bharathva-mongodb mongosh --eval 'db.adminCommand(\"ping\")' | grep -q 'ok.*1'"

# Test 9: Test Discovery Service
echo "9️⃣ Testing Discovery Service..."
run_test "Discovery Service" "curl -s -o /dev/null -w '%{http_code}' http://$CURRENT_IP:8761/actuator/health | grep -q '200'"

# Test 10: Test Mobile App Configuration
echo "🔟 Testing Mobile App Configuration..."
run_test "Mobile App IP Configuration" "grep -q '$CURRENT_IP' /Users/nishalpoojary/Projects/Codes/ProjectRD/BharathVA/apps/mobile/services/api/environment.ts"

echo "======================================"
echo "🏁 Test Suite Complete!"
echo ""
echo -e "${GREEN}✅ Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Tests Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Your BharathVA system is working correctly.${NC}"
    echo ""
    echo "📱 Next Steps:"
    echo "   1. Start your mobile app: cd apps/mobile && npm start"
    echo "   2. Test login with a registered user"
    echo "   3. Run the mobile test suite in the app"
else
    echo -e "${YELLOW}⚠️  Some tests failed. Please check the errors above.${NC}"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   1. Make sure all Docker services are running: docker-compose up -d"
    echo "   2. Check if your IP address has changed"
    echo "   3. Verify database connections"
    echo "   4. Check service logs: docker-compose logs"
fi

echo ""
echo "📊 System Status:"
echo "   • Backend Services: $(cd /Users/nishalpoojary/Projects/Codes/ProjectRD/BharathVA/backend && docker-compose ps --services --filter 'status=running' | wc -l | tr -d ' ') running"
echo "   • Gateway: http://$CURRENT_IP:8080"
echo "   • Auth Service: http://$CURRENT_IP:8081"
echo "   • Feed Service: http://$CURRENT_IP:8082"
echo "   • Discovery: http://$CURRENT_IP:8761"
echo "   • Redis: $CURRENT_IP:6379"
echo "   • MongoDB: $CURRENT_IP:27017"
