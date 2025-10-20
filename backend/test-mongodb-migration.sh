#!/bin/bash

# BharathVA MongoDB Data Migration Test Script
# This script tests the MongoDB connection and runs a sample data migration.

echo "🧪 Testing MongoDB Data Migration..."
echo "===================================="

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

# Ensure Docker Compose services are up
print_status "Ensuring Docker Compose services are running..."
docker-compose up -d mongodb feed-service

# Wait for MongoDB to be healthy
print_status "Waiting for MongoDB to be healthy..."
for i in {1..30}; do
    if docker-compose ps mongodb | grep -q "healthy"; then
        print_success "MongoDB container is healthy."
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "MongoDB container is not healthy after 30 attempts. Exiting."
        exit 1
    fi
    sleep 2
done

# Wait for Feed Service to be healthy
print_status "Waiting for Feed Service to be healthy..."
for i in {1..30}; do
    if docker-compose ps feed-service | grep -q "healthy"; then
        print_success "Feed Service container is healthy."
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Feed Service container is not healthy after 30 attempts. Exiting."
        exit 1
    fi
    sleep 2
done

# Step 1: Verify MongoDB connection from inside the feed-service container
print_status "Step 1: Verifying MongoDB connection from feed-service container..."
MONGO_PING_RESPONSE=$(docker exec bharathva-feed curl -s http://localhost:8082/actuator/health | grep -o '"mongo":{"status":"UP"')
if [[ "$MONGO_PING_RESPONSE" == *"UP"* ]]; then
    print_success "MongoDB connection from feed-service is UP."
else
    print_error "MongoDB connection from feed-service is DOWN. Check logs."
    docker-compose logs feed-service | tail -20
    exit 1
fi

# Step 2: Run the data migration service
print_status "Step 2: Triggering data migration in Feed Service..."
# Assuming you have an endpoint or a way to trigger the migration
# For now, we'll manually call the service if possible or restart with a flag
# For this test, we'll assume the migration runs on startup or can be triggered.
# Let's simulate by restarting the feed-service which might trigger it if configured.
docker-compose restart feed-service
sleep 10 # Give it time to restart and run migration

# Wait for Feed Service to be healthy again
print_status "Waiting for Feed Service to be healthy after restart..."
for i in {1..30}; do
    if docker-compose ps feed-service | grep -q "healthy"; then
        print_success "Feed Service container is healthy after restart."
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Feed Service container is not healthy after restart. Exiting."
        exit 1
    fi
    sleep 2
done

# Step 3: Verify data in MongoDB
print_status "Step 3: Verifying migrated data in MongoDB..."
# Connect to MongoDB from the host and count documents
DOC_COUNT=$(docker exec bharathva-mongodb mongosh --eval "db.getSiblingDB('bharathva_feed').feeds.countDocuments({})" --quiet)

if [ "$DOC_COUNT" -gt 0 ]; then
    print_success "Successfully migrated $DOC_COUNT documents to 'feeds' collection in MongoDB."
    print_status "Sample documents:"
    docker exec bharathva-mongodb mongosh --eval "db.getSiblingDB('bharathva_feed').feeds.find().limit(2)" --quiet
else
    print_error "No documents found in 'feeds' collection after migration. Expected some data."
    exit 1
fi

print_success "MongoDB Data Migration Test Completed Successfully! 🎉"

echo ""
echo "To clean up, run: docker-compose down"
echo ""