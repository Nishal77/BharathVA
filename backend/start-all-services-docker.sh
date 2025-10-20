#!/bin/bash

# BharathVA Backend Services Startup Script
# This script starts all microservices using Docker Compose

set -e  # Exit on any error

echo "🚀 Starting BharathVA Backend Services..."
echo "=========================================="

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

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

print_status "Setting up environment files..."

# Setup environment files for each service
services=("discovery-service" "gateway-service" "auth-service" "feed-service")

for service in "${services[@]}"; do
    if [ -d "$service" ]; then
        if [ -f "$service/env.example" ] && [ ! -f "$service/.env" ]; then
            print_status "Creating .env file for $service..."
            cp "$service/env.example" "$service/.env"
            
            # Update specific configurations for Docker
            if [ "$service" = "feed-service" ]; then
                sed -i '' 's|mongodb://localhost:27017|mongodb://mongodb:27017|g' "$service/.env"
            fi
            
            print_success "Environment file created for $service"
        elif [ -f "$service/.env" ]; then
            print_status "Environment file already exists for $service"
        else
            print_warning "No env.example found for $service"
        fi
    else
        print_warning "Service directory $service not found"
    fi
done

print_status "Building and starting all services..."

# Stop any existing containers
print_status "Stopping existing containers..."
docker-compose down --remove-orphans

# Build and start all services
print_status "Building and starting services with Docker Compose..."
docker-compose up --build -d

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."

# Function to check service health
check_service_health() {
    local service_name=$1
    local health_url=$2
    local max_attempts=30
    local attempt=1
    
    print_status "Checking health of $service_name..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$health_url" > /dev/null 2>&1; then
            print_success "$service_name is healthy!"
            return 0
        fi
        
        print_status "Waiting for $service_name... (attempt $attempt/$max_attempts)"
        sleep 5
        ((attempt++))
    done
    
    print_error "$service_name failed to become healthy after $max_attempts attempts"
    return 1
}

# Check service health
services_health=(
    "discovery-service:http://localhost:8761/actuator/health"
    "gateway-service:http://localhost:8080/actuator/health"
    "auth-service:http://localhost:8081/auth/register/health"
    "feed-service:http://localhost:8082/api/feed/health"
)

all_healthy=true

for service_health in "${services_health[@]}"; do
    IFS=':' read -r service_name health_url <<< "$service_health"
    if ! check_service_health "$service_name" "$health_url"; then
        all_healthy=false
    fi
done

echo ""
echo "=========================================="

if [ "$all_healthy" = true ]; then
    print_success "All services are running and healthy! 🎉"
    echo ""
    echo "📋 Service URLs:"
    echo "  • Discovery Service: http://localhost:8761"
    echo "  • Gateway Service:   http://localhost:8080"
    echo "  • Auth Service:      http://localhost:8081"
    echo "  • Feed Service:      http://localhost:8082"
    echo ""
    echo "🔍 Health Check URLs:"
    echo "  • Discovery: http://localhost:8761/actuator/health"
    echo "  • Gateway:   http://localhost:8080/actuator/health"
    echo "  • Auth:      http://localhost:8081/auth/register/health"
    echo "  • Feed:      http://localhost:8082/api/feed/health"
    echo ""
    echo "📊 To view logs: docker-compose logs -f [service-name]"
    echo "🛑 To stop all:  docker-compose down"
else
    print_error "Some services failed to start properly. Check logs with: docker-compose logs"
    exit 1
fi
