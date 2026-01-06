#!/bin/bash

# Script to automatically update IP address in mobile app configuration
# This detects your machine's IP and updates the environment.ts file

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Detect IP address
echo -e "${BLUE}Detecting your machine's IP address...${NC}"
DETECTED_IP=$(ifconfig | grep -E "inet " | grep -v "127.0.0.1" | awk '{print $2}' | head -1)

if [ -z "$DETECTED_IP" ]; then
    echo -e "${YELLOW}Could not detect IP address. Please enter it manually:${NC}"
    read -p "IP Address: " DETECTED_IP
fi

echo -e "${GREEN}Detected IP: ${DETECTED_IP}${NC}"
echo ""

# Update mobile app environment.ts
ENV_FILE="$PROJECT_ROOT/apps/mobile/services/api/environment.ts"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}Warning: Environment file not found at $ENV_FILE${NC}"
    exit 1
fi

# Backup original file
cp "$ENV_FILE" "$ENV_FILE.bak"

# Update IP addresses in development configuration
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/http:\/\/192\.168\.0\.[0-9]*:8080/http:\/\/${DETECTED_IP}:8080/g" "$ENV_FILE"
    sed -i '' "s/http:\/\/192\.168\.0\.[0-9]*:8082/http:\/\/${DETECTED_IP}:8082/g" "$ENV_FILE"
    sed -i '' "s/http:\/\/192\.168\.0\.[0-9]*:8084/http:\/\/${DETECTED_IP}:8084/g" "$ENV_FILE"
else
    # Linux
    sed -i "s/http:\/\/192\.168\.0\.[0-9]*:8080/http:\/\/${DETECTED_IP}:8080/g" "$ENV_FILE"
    sed -i "s/http:\/\/192\.168\.0\.[0-9]*:8082/http:\/\/${DETECTED_IP}:8082/g" "$ENV_FILE"
    sed -i "s/http:\/\/192\.168\.0\.[0-9]*:8084/http:\/\/${DETECTED_IP}:8084/g" "$ENV_FILE"
fi

echo -e "${GREEN}✅ Updated mobile app configuration with IP: ${DETECTED_IP}${NC}"
echo ""
echo -e "${YELLOW}Updated file: $ENV_FILE${NC}"
echo -e "${YELLOW}Backup saved to: $ENV_FILE.bak${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Restart your mobile app"
echo "2. Test connection: curl http://${DETECTED_IP}:8080/api/auth/register/health"
echo ""




