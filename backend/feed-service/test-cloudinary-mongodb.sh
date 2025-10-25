#!/bin/bash

# BharathVA Feed Service - Quick Cloudinary and MongoDB Test
# This script tests the basic connectivity and configuration

set -e

# Configuration
BASE_URL="http://localhost:8082"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Test 1: Service Health Check
test_service_health() {
    print_status "Testing service health..."
    
    local response=$(curl -s "$BASE_URL/api/feed/health" 2>/dev/null || echo "{}")
    local status=$(echo "$response" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    
    if [ "$status" = "UP" ]; then
        print_success "Service is healthy"
        echo "Response: $response"
        return 0
    else
        print_error "Service health check failed"
        echo "Response: $response"
        return 1
    fi
}

# Test 2: Cloudinary Connection Test
test_cloudinary() {
    print_status "Testing Cloudinary connection..."
    
    local response=$(curl -s "$BASE_URL/api/feed/test/cloudinary" 2>/dev/null || echo "{}")
    local success=$(echo "$response" | grep -o '"success":[^,]*' | cut -d':' -f2 | tr -d ' "')
    
    if [ "$success" = "true" ]; then
        print_success "Cloudinary connection successful"
        echo "Response: $response"
        return 0
    else
        print_error "Cloudinary connection failed"
        echo "Response: $response"
        return 1
    fi
}

# Test 3: MongoDB Data Check
test_mongodb() {
    print_status "Testing MongoDB connectivity..."
    
    local response=$(curl -s "$BASE_URL/api/feed/all?page=0&size=1" 2>/dev/null || echo "{}")
    
    if echo "$response" | grep -q "content\|totalElements"; then
        print_success "MongoDB connectivity successful"
        echo "Response: $response"
        return 0
    else
        print_warning "MongoDB connectivity test inconclusive"
        echo "Response: $response"
        return 1
    fi
}

# Test 4: Check existing data in MongoDB
check_existing_data() {
    print_status "Checking existing data in MongoDB..."
    
    # Check feeds collection
    local feeds_response=$(curl -s "$BASE_URL/api/feed/all?page=0&size=5" 2>/dev/null || echo "{}")
    local total_feeds=$(echo "$feeds_response" | grep -o '"totalElements":[^,]*' | cut -d':' -f2 | tr -d ' "')
    
    if [ -n "$total_feeds" ] && [ "$total_feeds" != "null" ]; then
        print_success "Found $total_feeds feeds in database"
    else
        print_warning "No feeds found or unable to count feeds"
    fi
    
    echo "Feeds response: $feeds_response"
}

# Main execution
main() {
    echo "=========================================="
    echo "BharathVA Feed Service - Quick Test"
    echo "=========================================="
    echo ""
    
    # Check if curl is available
    if ! command -v curl > /dev/null 2>&1; then
        print_error "curl is required but not installed"
        exit 1
    fi
    
    # Run tests
    local tests_passed=0
    local total_tests=4
    
    # Test 1: Service Health
    if test_service_health; then
        ((tests_passed++))
    fi
    echo ""
    
    # Test 2: Cloudinary
    if test_cloudinary; then
        ((tests_passed++))
    fi
    echo ""
    
    # Test 3: MongoDB
    if test_mongodb; then
        ((tests_passed++))
    fi
    echo ""
    
    # Test 4: Existing Data
    check_existing_data
    ((tests_passed++))
    echo ""
    
    # Summary
    echo "=========================================="
    print_status "Test Summary: $tests_passed/$total_tests tests completed"
    
    if [ $tests_passed -eq $total_tests ]; then
        print_success "All tests completed successfully!"
    else
        print_warning "Some tests failed or were inconclusive"
    fi
    
    echo ""
    print_status "Next steps:"
    print_status "1. If Cloudinary test failed, check your API credentials in application.yml"
    print_status "2. If MongoDB test failed, check your MongoDB connection string"
    print_status "3. Run the full test suite with: ./test-complete-image-flow.sh"
    echo "=========================================="
}

# Run main function
main "$@"
