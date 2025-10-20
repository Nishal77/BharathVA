#!/bin/bash

# BharathVA Backend Services Stop Script
# This script stops all microservices running in Docker

echo "🛑 Stopping BharathVA Backend Services..."
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Stop all services
print_status "Stopping all services..."
docker-compose down --remove-orphans

print_success "All services stopped successfully!"

echo ""
echo "📋 To start services again, run:"
echo "  ./start-all-services-docker.sh"
echo ""
echo "🗑️  To remove all data volumes, run:"
echo "  docker-compose down -v"
