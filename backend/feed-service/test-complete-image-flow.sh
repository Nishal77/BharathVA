#!/bin/bash

# BharathVA Feed Service - Complete Image Upload Flow Test
# This script tests the entire image upload flow including Cloudinary and MongoDB integration

set -e

# Configuration
BASE_URL="http://localhost:8082"
GATEWAY_URL="http://localhost:8080"  # Assuming gateway is running on 8080
TEST_USER_ID="24436b2a-cb17-4aec-8923-7d4a9fc1f5ca"  # Use existing user ID from MongoDB
TEST_IMAGE_PATH="./test-image.jpg"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Function to check if service is running
check_service() {
    local service_name=$1
    local url=$2
    
    print_status "Checking if $service_name is running..."
    
    if curl -s -f "$url" > /dev/null 2>&1; then
        print_success "$service_name is running"
        return 0
    else
        print_error "$service_name is not running at $url"
        return 1
    fi
}

# Function to create test image if it doesn't exist
create_test_image() {
    if [ ! -f "$TEST_IMAGE_PATH" ]; then
        print_status "Creating test image..."
        
        # Create a simple test image using ImageMagick if available
        if command -v convert > /dev/null 2>&1; then
            convert -size 800x600 xc:lightblue -pointsize 72 -fill black -gravity center -annotate +0+0 "BharathVA\nTest Image\n$(date)" "$TEST_IMAGE_PATH"
            print_success "Test image created using ImageMagick"
        else
            # Create a simple colored rectangle as a test image
            print_warning "ImageMagick not found, creating a simple test file..."
            echo "This is a test image file for BharathVA" > "$TEST_IMAGE_PATH"
        fi
    else
        print_success "Test image already exists"
    fi
}

# Function to test Cloudinary connection
test_cloudinary_connection() {
    print_status "Testing Cloudinary connection..."
    
    local response=$(curl -s "$BASE_URL/api/feed/test/cloudinary")
    local success=$(echo "$response" | grep -o '"success":[^,]*' | cut -d':' -f2 | tr -d ' "')
    
    if [ "$success" = "true" ]; then
        print_success "Cloudinary connection successful"
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
        return 0
    else
        print_error "Cloudinary connection failed"
        echo "$response"
        return 1
    fi
}

# Function to test MongoDB connection
test_mongodb_connection() {
    print_status "Testing MongoDB connection by checking existing data..."
    
    # Check if we can access the feeds collection
    local response=$(curl -s "$BASE_URL/api/feed/health")
    local status=$(echo "$response" | grep -o '"status":[^,]*' | cut -d':' -f2 | tr -d ' "')
    
    if [ "$status" = "UP" ]; then
        print_success "MongoDB connection successful (service is UP)"
        return 0
    else
        print_error "MongoDB connection failed"
        echo "$response"
        return 1
    fi
}

# Function to test single image upload
test_single_image_upload() {
    print_status "Testing single image upload..."
    
    if [ ! -f "$TEST_IMAGE_PATH" ]; then
        print_error "Test image not found at $TEST_IMAGE_PATH"
        return 1
    fi
    
    # Note: This would require authentication in a real scenario
    # For testing purposes, we'll use the test endpoint if available
    local response=$(curl -s -X POST \
        -F "file=@$TEST_IMAGE_PATH" \
        "$BASE_URL/api/feed/upload/image")
    
    local success=$(echo "$response" | grep -o '"success":[^,]*' | cut -d':' -f2 | tr -d ' "')
    
    if [ "$success" = "true" ]; then
        print_success "Single image upload successful"
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
        return 0
    else
        print_warning "Single image upload failed (might require authentication)"
        echo "$response"
        return 1
    fi
}

# Function to test multiple image upload
test_multiple_image_upload() {
    print_status "Testing multiple image upload..."
    
    # Create additional test images
    local test_image2="./test-image-2.jpg"
    local test_image3="./test-image-3.jpg"
    
    if [ ! -f "$test_image2" ]; then
        cp "$TEST_IMAGE_PATH" "$test_image2"
    fi
    if [ ! -f "$test_image3" ]; then
        cp "$TEST_IMAGE_PATH" "$test_image3"
    fi
    
    local response=$(curl -s -X POST \
        -F "files=@$TEST_IMAGE_PATH" \
        -F "files=@$test_image2" \
        -F "files=@$test_image3" \
        "$BASE_URL/api/feed/upload/images")
    
    local success=$(echo "$response" | grep -o '"success":[^,]*' | cut -d':' -f2 | tr -d ' "')
    
    if [ "$success" = "true" ]; then
        print_success "Multiple image upload successful"
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
        return 0
    else
        print_warning "Multiple image upload failed (might require authentication)"
        echo "$response"
        return 1
    fi
}

# Function to test feed creation with images
test_feed_creation_with_images() {
    print_status "Testing feed creation with images..."
    
    # First upload an image to get the URL
    local upload_response=$(curl -s -X POST \
        -F "file=@$TEST_IMAGE_PATH" \
        "$BASE_URL/api/feed/upload/image")
    
    local image_url=$(echo "$upload_response" | grep -o '"imageUrl":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$image_url" ]; then
        # Create a feed with the image
        local feed_data='{
            "userId": "'$TEST_USER_ID'",
            "message": "Test post with image from automated test",
            "imageUrls": ["'$image_url'"]
        }'
        
        local response=$(curl -s -X POST \
            -H "Content-Type: application/json" \
            -d "$feed_data" \
            "$BASE_URL/api/feed/test/create-feed")
        
        local success=$(echo "$response" | grep -o '"success":[^,]*' | cut -d':' -f2 | tr -d ' "')
        
        if [ "$success" = "true" ]; then
            print_success "Feed creation with image successful"
            echo "$response" | jq '.' 2>/dev/null || echo "$response"
            return 0
        else
            print_warning "Feed creation with image failed"
            echo "$response"
            return 1
        fi
    else
        print_warning "Could not get image URL for feed creation test"
        return 1
    fi
}

# Function to check MongoDB data
check_mongodb_data() {
    print_status "Checking MongoDB data..."
    
    # This would require MongoDB connection tools
    # For now, we'll check if the service can retrieve data
    local response=$(curl -s "$BASE_URL/api/feed/all?page=0&size=5")
    
    if echo "$response" | grep -q "content"; then
        print_success "MongoDB data retrieval successful"
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
        return 0
    else
        print_warning "MongoDB data retrieval failed or no data found"
        echo "$response"
        return 1
    fi
}

# Function to test image URL generation
test_image_url_generation() {
    print_status "Testing image URL generation..."
    
    # This would require a valid public ID from a previous upload
    local test_public_id="bharathva/feeds/test_user/test_image_1234567890_1234"
    
    local response=$(curl -s "$BASE_URL/api/feed/images/$test_public_id/url?width=400&height=300&crop=limit")
    
    local success=$(echo "$response" | grep -o '"success":[^,]*' | cut -d':' -f2 | tr -d ' "')
    
    if [ "$success" = "true" ]; then
        print_success "Image URL generation successful"
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
        return 0
    else
        print_warning "Image URL generation failed (might be expected for test public ID)"
        echo "$response"
        return 1
    fi
}

# Function to clean up test files
cleanup() {
    print_status "Cleaning up test files..."
    
    rm -f "$TEST_IMAGE_PATH"
    rm -f "./test-image-2.jpg"
    rm -f "./test-image-3.jpg"
    
    print_success "Cleanup completed"
}

# Main test execution
main() {
    echo "=========================================="
    echo "BharathVA Feed Service - Image Upload Test"
    echo "=========================================="
    echo ""
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    
    if ! command -v curl > /dev/null 2>&1; then
        print_error "curl is required but not installed"
        exit 1
    fi
    
    if ! command -v jq > /dev/null 2>&1; then
        print_warning "jq is not installed - JSON output will not be formatted"
    fi
    
    # Check services
    if ! check_service "Feed Service" "$BASE_URL/api/feed/health"; then
        print_error "Feed service is not running. Please start the service first."
        exit 1
    fi
    
    # Create test image
    create_test_image
    
    # Run tests
    echo ""
    print_status "Starting comprehensive image upload flow tests..."
    echo ""
    
    # Test 1: Cloudinary connection
    test_cloudinary_connection
    echo ""
    
    # Test 2: MongoDB connection
    test_mongodb_connection
    echo ""
    
    # Test 3: Single image upload
    test_single_image_upload
    echo ""
    
    # Test 4: Multiple image upload
    test_multiple_image_upload
    echo ""
    
    # Test 5: Feed creation with images
    test_feed_creation_with_images
    echo ""
    
    # Test 6: MongoDB data check
    check_mongodb_data
    echo ""
    
    # Test 7: Image URL generation
    test_image_url_generation
    echo ""
    
    # Cleanup
    cleanup
    
    echo ""
    echo "=========================================="
    print_success "Image upload flow test completed!"
    echo "=========================================="
    echo ""
    print_status "Summary:"
    print_status "- Cloudinary integration: Tested"
    print_status "- MongoDB integration: Tested"
    print_status "- Image upload endpoints: Tested"
    print_status "- Feed creation with images: Tested"
    print_status "- Image URL generation: Tested"
    echo ""
    print_status "Note: Some tests may fail due to authentication requirements."
    print_status "In a real scenario, you would need to provide valid JWT tokens."
}

# Run main function
main "$@"
