#!/bin/bash

# BharathVA Backend - Start All Services Script
# This script starts all microservices in the correct order

echo "🇮🇳 Starting BharathVA Backend Services 🇮🇳"
echo "================================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}Port $1 is already in use!${NC}"
        echo "Please stop the process or change the port."
        return 1
    else
        echo -e "${GREEN}Port $1 is available${NC}"
        return 0
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local port=$1
    local service_name=$2
    local max_attempts=30
    local attempt=0

    echo -e "${YELLOW}Waiting for $service_name to be ready on port $port...${NC}"
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s http://localhost:$port/actuator/health > /dev/null 2>&1 || \
           curl -s http://localhost:$port > /dev/null 2>&1; then
            echo -e "${GREEN}$service_name is ready!${NC}"
            return 0
        fi
        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done
    
    echo -e "${RED}$service_name failed to start!${NC}"
    return 1
}

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo -e "${RED}Maven is not installed. Please install Maven first.${NC}"
    exit 1
fi

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo -e "${RED}Java is not installed. Please install Java 17 or higher.${NC}"
    exit 1
fi

echo "Checking Java version..."
java -version

# Check required ports
echo ""
echo "Checking if required ports are available..."
check_port 8761 || exit 1  # Discovery Service
check_port 8888 || exit 1  # Config Service
check_port 8080 || exit 1  # Gateway Service
check_port 8081 || exit 1  # Auth Service

echo ""
echo "================================================"
echo "Starting services in correct order..."
echo "================================================"

# Start Discovery Service (Eureka)
echo ""
echo -e "${YELLOW}1. Starting Discovery Service (Port: 8761)${NC}"
cd discovery-service
mvn spring-boot:run > ../logs/discovery-service.log 2>&1 &
DISCOVERY_PID=$!
cd ..
sleep 5
wait_for_service 8761 "Discovery Service"

# Start Config Service
echo ""
echo -e "${YELLOW}2. Starting Config Service (Port: 8888)${NC}"
cd config-service
mvn spring-boot:run > ../logs/config-service.log 2>&1 &
CONFIG_PID=$!
cd ..
sleep 5
wait_for_service 8888 "Config Service"

# Start Gateway Service
echo ""
echo -e "${YELLOW}3. Starting Gateway Service (Port: 8080)${NC}"
cd gateway-service
mvn spring-boot:run > ../logs/gateway-service.log 2>&1 &
GATEWAY_PID=$!
cd ..
sleep 5
wait_for_service 8080 "Gateway Service"

# Start Auth Service
echo ""
echo -e "${YELLOW}4. Starting Auth Service (Port: 8081)${NC}"
cd auth-service
mvn spring-boot:run > ../logs/auth-service.log 2>&1 &
AUTH_PID=$!
cd ..
sleep 5
wait_for_service 8081 "Auth Service"

echo ""
echo "================================================"
echo -e "${GREEN}✅ All services started successfully!${NC}"
echo "================================================"
echo ""
echo "Service URLs:"
echo "  • Eureka Dashboard: http://localhost:8761"
echo "  • API Gateway:      http://localhost:8080"
echo "  • Auth Service:     http://localhost:8081"
echo ""
echo "Process IDs:"
echo "  • Discovery Service: $DISCOVERY_PID"
echo "  • Config Service:    $CONFIG_PID"
echo "  • Gateway Service:   $GATEWAY_PID"
echo "  • Auth Service:      $AUTH_PID"
echo ""
echo "Logs are available in the 'logs' directory"
echo ""
echo "To stop all services, run:"
echo "  kill $DISCOVERY_PID $CONFIG_PID $GATEWAY_PID $AUTH_PID"
echo ""
echo "Or use: pkill -f spring-boot"
echo ""
echo -e "${GREEN}Happy Coding! 🚀${NC}"
echo -e "${GREEN}Jai Hind! 🇮🇳${NC}"

