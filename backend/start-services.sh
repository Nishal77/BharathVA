#!/bin/bash

# BharathVA Backend Services Startup Script
# This script starts all backend services using Docker Compose

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}BharathVA Backend Services Startup${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running. Please start Docker Desktop.${NC}"
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: docker-compose is not installed.${NC}"
    exit 1
fi

# Use 'docker compose' (v2) if available, otherwise 'docker-compose' (v1)
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

# Check if .env files exist
echo -e "${YELLOW}Checking environment files...${NC}"
MISSING_ENV=false

if [ ! -f "discovery-service/.env" ]; then
    echo -e "${RED}  ✗ discovery-service/.env not found${NC}"
    MISSING_ENV=true
else
    echo -e "${GREEN}  ✓ discovery-service/.env${NC}"
fi

if [ ! -f "gateway-service/.env" ]; then
    echo -e "${RED}  ✗ gateway-service/.env not found${NC}"
    MISSING_ENV=true
else
    echo -e "${GREEN}  ✓ gateway-service/.env${NC}"
fi

if [ ! -f "auth-service/.env" ]; then
    echo -e "${RED}  ✗ auth-service/.env not found${NC}"
    MISSING_ENV=true
else
    echo -e "${GREEN}  ✓ auth-service/.env${NC}"
fi

if [ "$MISSING_ENV" = true ]; then
    echo ""
    echo -e "${YELLOW}Some .env files are missing. Please create them from .env.example files.${NC}"
    exit 1
fi

echo ""

# Stop any existing containers
echo -e "${YELLOW}Stopping existing containers...${NC}"
$DOCKER_COMPOSE down 2>/dev/null || true

# Build and start services
echo -e "${YELLOW}Building and starting services...${NC}"
echo ""

# Start services in detached mode
$DOCKER_COMPOSE up --build -d

echo ""
echo -e "${GREEN}Services are starting...${NC}"
echo ""
echo -e "${YELLOW}Waiting for services to be healthy (this may take 2-3 minutes)...${NC}"

# Wait for services to be healthy
MAX_WAIT=180
ELAPSED=0
INTERVAL=5

while [ $ELAPSED -lt $MAX_WAIT ]; do
    # Check if discovery service is healthy
    if docker ps --format "{{.Names}}" | grep -q "bharathva-discovery"; then
        DISCOVERY_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' bharathva-discovery 2>/dev/null || echo "starting")
        if [ "$DISCOVERY_HEALTH" = "healthy" ]; then
            echo -e "${GREEN}  ✓ Discovery Service is healthy${NC}"
            break
        fi
    fi
    sleep $INTERVAL
    ELAPSED=$((ELAPSED + INTERVAL))
    echo -e "${YELLOW}  Waiting... (${ELAPSED}s/${MAX_WAIT}s)${NC}"
done

if [ $ELAPSED -ge $MAX_WAIT ]; then
    echo -e "${RED}  ✗ Timeout waiting for services to start${NC}"
    echo ""
    echo -e "${YELLOW}Checking service logs...${NC}"
    $DOCKER_COMPOSE logs --tail=50
    exit 1
fi

# Wait a bit more for other services
sleep 30

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Services Status:${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check service status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep bharathva || true

echo ""
echo -e "${GREEN}Service URLs:${NC}"
echo -e "  Discovery:  http://localhost:8761"
echo -e "  Gateway:   http://localhost:8080"
echo -e "  Auth:      http://localhost:8081"
echo ""

# Test health endpoint
echo -e "${YELLOW}Testing health endpoint...${NC}"
sleep 5

if curl -s -f http://localhost:8080/api/auth/register/health > /dev/null 2>&1; then
    echo -e "${GREEN}  ✓ Gateway health check passed${NC}"
else
    echo -e "${YELLOW}  ⚠ Gateway health check failed (service may still be starting)${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Services started successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}To view logs:${NC}"
echo -e "  $DOCKER_COMPOSE logs -f"
echo ""
echo -e "${YELLOW}To stop services:${NC}"
echo -e "  $DOCKER_COMPOSE down"
echo ""


