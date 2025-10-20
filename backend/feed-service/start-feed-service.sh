#!/bin/bash

# BharathVA Feed Service Startup Script
# This script starts the feed service with proper dependencies

echo "=========================================="
echo "BharathVA Feed Service Startup"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

echo -e "${BLUE}Step 1: Checking Docker status${NC}"
echo -e "${GREEN}✅ Docker is running${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ docker-compose.yml not found. Please run this script from the backend directory.${NC}"
    exit 1
fi

echo -e "${BLUE}Step 2: Starting Feed Service with dependencies${NC}"

# Start MongoDB first
echo "Starting MongoDB..."
docker-compose up -d mongodb

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to be ready..."
sleep 10

# Check MongoDB health
MONGODB_HEALTH=$(docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" --quiet 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ MongoDB is ready${NC}"
else
    echo -e "${YELLOW}⚠️  MongoDB might still be starting up...${NC}"
fi

# Start Discovery Service
echo "Starting Discovery Service..."
docker-compose up -d discovery-service

# Wait for Discovery Service
echo "Waiting for Discovery Service to be ready..."
sleep 15

# Start Auth Service
echo "Starting Auth Service..."
docker-compose up -d auth-service

# Wait for Auth Service
echo "Waiting for Auth Service to be ready..."
sleep 20

# Start Feed Service
echo "Starting Feed Service..."
docker-compose up -d feed-service

echo ""
echo -e "${BLUE}Step 3: Checking service status${NC}"

# Wait for services to be ready
sleep 15

# Check Feed Service health
FEED_HEALTH=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:8082/api/feed/health)
if [ "$FEED_HEALTH" = "200" ]; then
    echo -e "${GREEN}✅ Feed Service is running and healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Feed Service might still be starting up...${NC}"
fi

# Check Auth Service health
AUTH_HEALTH=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:8081/api/auth/register/health)
if [ "$AUTH_HEALTH" = "200" ]; then
    echo -e "${GREEN}✅ Auth Service is running and healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Auth Service might still be starting up...${NC}"
fi

# Check Discovery Service
DISCOVERY_HEALTH=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:8761/actuator/health)
if [ "$DISCOVERY_HEALTH" = "200" ]; then
    echo -e "${GREEN}✅ Discovery Service is running and healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Discovery Service might still be starting up...${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}Feed Service Startup Complete${NC}"
echo "=========================================="
echo ""
echo "Service URLs:"
echo "  📱 Feed Service:     http://localhost:8082"
echo "  🔐 Auth Service:     http://localhost:8081"
echo "  🔍 Discovery Service: http://localhost:8761"
echo "  🗄️  MongoDB:          mongodb://localhost:27017"
echo ""
echo "API Endpoints:"
echo "  📊 Health Check:     http://localhost:8082/api/feed/health"
echo "  📝 Create Feed:      POST http://localhost:8082/api/feed/create"
echo "  📖 Get Feeds:        GET http://localhost:8082/api/feed/public"
echo ""
echo "Testing:"
echo "  🧪 Run tests:        ./TEST_FEED_SERVICE.sh"
echo "  📋 Postman:          Import POSTMAN_FEED_COLLECTION.json"
echo ""
echo "Monitoring:"
echo "  📊 View logs:        docker-compose logs -f feed-service"
echo "  🗄️  MongoDB logs:     docker-compose logs -f mongodb"
echo ""
echo -e "${GREEN}🎉 Feed Service is ready for use!${NC}"
echo ""
