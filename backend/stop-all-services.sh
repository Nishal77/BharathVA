#!/bin/bash

# BharathVA Backend - Stop All Services Script

echo "🛑 Stopping BharathVA Backend Services..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# Function to kill process on port
kill_port() {
    local port=$1
    local service=$2
    
    echo -n "Stopping $service on port $port... "
    
    PID=$(lsof -ti:$port)
    if [ ! -z "$PID" ]; then
        kill -9 $PID 2>/dev/null
        echo -e "${GREEN}✓${NC}"
    else
        echo "not running"
    fi
}

# Stop all services
kill_port 8081 "Auth Service"
kill_port 8080 "Gateway Service"
kill_port 8888 "Config Service"
kill_port 8761 "Discovery Service"

# Alternative: Kill all spring-boot processes
# echo "Killing all Spring Boot processes..."
# pkill -f spring-boot

echo ""
echo -e "${GREEN}All services stopped!${NC}"

