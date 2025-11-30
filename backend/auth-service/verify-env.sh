#!/bin/bash

# Script to verify .env.local file matches application.yml requirements

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

ENV_FILE=".env.local"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: $ENV_FILE not found${NC}"
    exit 1
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Verifying .env.local Configuration${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Required variables (no defaults in application.yml or critical)
REQUIRED_VARS=(
    "DB_URL"
    "DB_USERNAME"
    "DB_PASSWORD"
    "SMTP_USERNAME"
    "SMTP_PASSWORD"
    "JWT_SECRET"
)

# Optional but recommended variables
OPTIONAL_VARS=(
    "SERVER_PORT"
    "SMTP_HOST"
    "SMTP_PORT"
    "REDIS_HOST"
    "REDIS_PORT"
    "EUREKA_CLIENT_SERVICEURL_DEFAULTZONE"
    "JWT_EXPIRATION"
    "JWT_REFRESH_EXPIRATION"
    "OTP_EXPIRY_MINUTES"
    "OTP_LENGTH"
    "CLOUDINARY_CLOUD_NAME"
    "CLOUDINARY_API_KEY"
    "CLOUDINARY_API_SECRET"
)

MISSING_REQUIRED=()
MISSING_OPTIONAL=()
FOUND_VARS=()

# Check required variables
echo -e "${YELLOW}Checking Required Variables:${NC}"
for var in "${REQUIRED_VARS[@]}"; do
    if grep -q "^${var}=" "$ENV_FILE" 2>/dev/null; then
        value=$(grep "^${var}=" "$ENV_FILE" | cut -d'=' -f2- | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
        if [ -z "$value" ] || [ "$value" = "" ]; then
            echo -e "${RED}  ✗ ${var} is empty${NC}"
            MISSING_REQUIRED+=("$var")
        else
            # Mask sensitive values
            if [[ "$var" == *"PASSWORD"* ]] || [[ "$var" == *"SECRET"* ]]; then
                masked_value="${value:0:4}****"
                echo -e "${GREEN}  ✓ ${var}=${masked_value}${NC}"
            else
                echo -e "${GREEN}  ✓ ${var}=${value:0:50}${NC}"
            fi
            FOUND_VARS+=("$var")
        fi
    else
        echo -e "${RED}  ✗ ${var} is missing${NC}"
        MISSING_REQUIRED+=("$var")
    fi
done

echo ""
echo -e "${YELLOW}Checking Optional Variables:${NC}"
for var in "${OPTIONAL_VARS[@]}"; do
    if grep -q "^${var}=" "$ENV_FILE" 2>/dev/null; then
        value=$(grep "^${var}=" "$ENV_FILE" | cut -d'=' -f2- | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
        if [ -n "$value" ]; then
            echo -e "${GREEN}  ✓ ${var} is set${NC}"
            FOUND_VARS+=("$var")
        fi
    else
        echo -e "${YELLOW}  ⚠ ${var} not set (will use default)${NC}"
        MISSING_OPTIONAL+=("$var")
    fi
done

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Verification Summary:${NC}"
echo -e "${BLUE}========================================${NC}"

if [ ${#MISSING_REQUIRED[@]} -eq 0 ]; then
    echo -e "${GREEN}✓ All required variables are set${NC}"
else
    echo -e "${RED}✗ Missing required variables:${NC}"
    for var in "${MISSING_REQUIRED[@]}"; do
        echo -e "${RED}  - ${var}${NC}"
    done
fi

echo ""
echo -e "Found: ${GREEN}${#FOUND_VARS[@]}${NC} variables"
echo -e "Missing optional: ${YELLOW}${#MISSING_OPTIONAL[@]}${NC} variables"

# Check DB_URL format
echo ""
echo -e "${YELLOW}Checking DB_URL format:${NC}"
if grep -q "^DB_URL=" "$ENV_FILE"; then
    DB_URL=$(grep "^DB_URL=" "$ENV_FILE" | cut -d'=' -f2-)
    if [[ "$DB_URL" == *"sslmode=require"* ]]; then
        echo -e "${GREEN}  ✓ DB_URL contains sslmode=require${NC}"
        if [[ "$DB_URL" == *"sslfactory"* ]]; then
            echo -e "${GREEN}  ✓ DB_URL contains sslfactory${NC}"
        else
            echo -e "${YELLOW}  ⚠ DB_URL missing sslfactory (recommended: org.postgresql.ssl.DefaultJavaSSLFactory)${NC}"
        fi
    else
        echo -e "${YELLOW}  ⚠ DB_URL missing sslmode=require${NC}"
    fi
fi

# Check JWT_SECRET length
echo ""
echo -e "${YELLOW}Checking JWT_SECRET:${NC}"
if grep -q "^JWT_SECRET=" "$ENV_FILE"; then
    JWT_SECRET=$(grep "^JWT_SECRET=" "$ENV_FILE" | cut -d'=' -f2-)
    LENGTH=${#JWT_SECRET}
    if [ $LENGTH -ge 64 ]; then
        echo -e "${GREEN}  ✓ JWT_SECRET length is ${LENGTH} (>= 64)${NC}"
    else
        echo -e "${RED}  ✗ JWT_SECRET length is ${LENGTH} (should be >= 64)${NC}"
    fi
fi

echo ""
if [ ${#MISSING_REQUIRED[@]} -eq 0 ]; then
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Configuration is valid!${NC}"
    echo -e "${GREEN}========================================${NC}"
    exit 0
else
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}Configuration has issues${NC}"
    echo -e "${RED}========================================${NC}"
    exit 1
fi

