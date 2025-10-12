#!/bin/bash

# BharathVA Backend Environment Setup Script
# This script helps set up .env files for all microservices

set -e

echo "========================================="
echo "BharathVA Backend Environment Setup"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to check if .env file exists
check_env_file() {
    local service=$1
    local env_file="${service}/.env"
    local example_file="${service}/.env.example"
    
    if [ -f "$env_file" ]; then
        echo -e "${YELLOW}[WARNING]${NC} ${service}/.env already exists"
        read -p "Do you want to overwrite it? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${GREEN}[SKIP]${NC} Skipping ${service}"
            return 1
        fi
    fi
    return 0
}

# Function to copy .env.example to .env
setup_service_env() {
    local service=$1
    local example_file="${service}/.env.example"
    local env_file="${service}/.env"
    
    if [ ! -f "$example_file" ]; then
        echo -e "${RED}[ERROR]${NC} ${example_file} not found"
        return 1
    fi
    
    if check_env_file "$service"; then
        cp "$example_file" "$env_file"
        echo -e "${GREEN}[SUCCESS]${NC} Created ${service}/.env"
        return 0
    fi
    return 1
}

# Create .env files for each service
echo "Setting up environment files for all services..."
echo ""

# Discovery Service
echo "1. Discovery Service"
if setup_service_env "discovery-service"; then
    echo "   No additional configuration needed for Discovery Service"
fi
echo ""

# Gateway Service
echo "2. Gateway Service"
if setup_service_env "gateway-service"; then
    echo "   No additional configuration needed for Gateway Service"
fi
echo ""

# Auth Service
echo "3. Auth Service"
if setup_service_env "auth-service"; then
    echo -e "${YELLOW}[ACTION REQUIRED]${NC} Please configure auth-service/.env with:"
    echo "   - Database credentials (Neon PostgreSQL)"
    echo "   - SMTP credentials (Gmail App Password)"
    echo "   - JWT secret (generate using: openssl rand -base64 64)"
fi
echo ""

echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Edit auth-service/.env with your credentials"
echo "2. Run: docker-compose up --build"
echo ""
echo "For detailed instructions, see: ENV_SETUP_GUIDE.md"
echo ""

