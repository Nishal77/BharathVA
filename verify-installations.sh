#!/bin/bash

# BharathVA Installation Verification Script
# This script verifies all required tools and dependencies are installed

echo "=========================================="
echo "BharathVA Installation Verification"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_installation() {
    if command -v $1 &> /dev/null; then
        VERSION=$($1 $2 2>&1 | head -n 1)
        echo -e "${GREEN}✓${NC} $1 installed: $VERSION"
        return 0
    else
        echo -e "${RED}✗${NC} $1 is NOT installed"
        return 1
    fi
}

check_version() {
    if command -v $1 &> /dev/null; then
        VERSION=$($1 $2 2>&1)
        echo -e "${GREEN}✓${NC} $1: $VERSION"
        return 0
    else
        echo -e "${RED}✗${NC} $1 is NOT installed"
        return 1
    fi
}

# System Checks
echo "=== System Tools ==="
check_installation "node" "--version"
check_installation "pnpm" "--version"
check_installation "java" "-version"
check_installation "mvn" "--version"
check_installation "docker" "--version"
check_installation "docker-compose" "--version"
echo ""

# Node.js Dependencies
echo "=== Node.js Project Dependencies ==="
if [ -f "package.json" ]; then
    echo -e "${GREEN}✓${NC} Root package.json found"
    if [ -f "pnpm-lock.yaml" ]; then
        echo -e "${GREEN}✓${NC} pnpm-lock.yaml found"
    else
        echo -e "${YELLOW}⚠${NC} pnpm-lock.yaml not found (run: pnpm install)"
    fi
else
    echo -e "${RED}✗${NC} package.json not found in current directory"
fi

if [ -f "apps/mobile/package.json" ]; then
    echo -e "${GREEN}✓${NC} Mobile app package.json found"
else
    echo -e "${RED}✗${NC} Mobile app package.json not found"
fi
echo ""

# Java/Maven Dependencies
echo "=== Java/Maven Project Dependencies ==="
if [ -f "backend/pom.xml" ]; then
    echo -e "${GREEN}✓${NC} Backend parent pom.xml found"
    
    # Check service POMs
    SERVICES=("auth-service" "feed-service" "discovery-service" "config-service" "gateway-service" "shared")
    for service in "${SERVICES[@]}"; do
        if [ -f "backend/$service/pom.xml" ]; then
            echo -e "${GREEN}✓${NC} $service/pom.xml found"
        else
            echo -e "${YELLOW}⚠${NC} $service/pom.xml not found"
        fi
    done
else
    echo -e "${RED}✗${NC} Backend pom.xml not found"
fi
echo ""

# Docker Services
echo "=== Docker Configuration ==="
if [ -f "backend/docker-compose.yml" ]; then
    echo -e "${GREEN}✓${NC} docker-compose.yml found"
    
    if docker info &> /dev/null; then
        echo -e "${GREEN}✓${NC} Docker daemon is running"
        
        # Check if services are running
        if docker-compose -f backend/docker-compose.yml ps &> /dev/null; then
            RUNNING_SERVICES=$(docker-compose -f backend/docker-compose.yml ps --services --filter "status=running" 2>/dev/null | wc -l | tr -d ' ')
            if [ "$RUNNING_SERVICES" -gt "0" ]; then
                echo -e "${GREEN}✓${NC} $RUNNING_SERVICES Docker service(s) running"
            else
                echo -e "${YELLOW}⚠${NC} No Docker services running (start with: cd backend && docker-compose up -d)"
            fi
        fi
    else
        echo -e "${YELLOW}⚠${NC} Docker daemon is not running"
    fi
else
    echo -e "${RED}✗${NC} docker-compose.yml not found"
fi
echo ""

# Directory Structure
echo "=== Project Structure ==="
DIRS=("apps/mobile" "backend" "backend/auth-service" "backend/feed-service" "backend/discovery-service" "backend/config-service" "backend/gateway-service")
for dir in "${DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $dir/ exists"
    else
        echo -e "${RED}✗${NC} $dir/ missing"
    fi
done
echo ""

# Configuration Files
echo "=== Configuration Files ==="
CONFIG_FILES=(
    "apps/mobile/tsconfig.json"
    "apps/mobile/tailwind.config.js"
    "apps/mobile/babel.config.js"
    "apps/mobile/metro.config.js"
    "apps/mobile/app.json"
)
for file in "${CONFIG_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file exists"
    else
        echo -e "${YELLOW}⚠${NC} $file missing"
    fi
done
echo ""

# Summary
echo "=========================================="
echo "Verification Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Install any missing tools listed above"
echo "2. Run 'pnpm install' from project root"
echo "3. Run 'mvn clean install' from backend directory"
echo "4. Configure environment variables (.env files)"
echo "5. Start Docker services: cd backend && docker-compose up -d"
echo ""
echo "See INSTALLATION_BACKUP.md for complete setup instructions"

