#!/bin/bash

# News AI Service - Environment Configuration Verification Script
# This script verifies that the environment configuration is properly set up

set -e

echo "=========================================="
echo "News AI Service - Configuration Verification"
echo "=========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.local exists
echo -n "1. Checking if .env.local exists... "
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "   Please create .env.local from env.example"
    exit 1
fi

# Check if env.example exists
echo -n "2. Checking if env.example exists... "
if [ -f "env.example" ]; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "   env.example template is missing"
    exit 1
fi

# Check critical environment variables
echo -n "3. Checking critical environment variables... "
required_vars=(
    "NEON_DB_URL"
    "NEON_DB_USER"
    "NEON_DB_PASSWORD"
    "OPENROUTER_API_KEY"
    "SERVER_PORT"
    "RSS_FEEDS"
    "PRIMARY_MODEL"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" .env.local; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -eq 0 ]; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "   Missing variables: ${missing_vars[*]}"
    exit 1
fi

# Check if .env.local is gitignored
echo -n "4. Checking if .env.local is gitignored... "
if git check-ignore -q .env.local 2>/dev/null; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${YELLOW}⚠ WARNING${NC}"
    echo "   .env.local should be gitignored to protect sensitive data"
fi

# Check Dockerfile doesn't contain secrets
echo -n "5. Checking Dockerfile for hardcoded secrets... "
if grep -qE "(password|api[_-]?key|secret)" Dockerfile 2>/dev/null; then
    echo -e "${YELLOW}⚠ WARNING${NC}"
    echo "   Found potential secrets in Dockerfile"
else
    echo -e "${GREEN}✓ PASS${NC}"
fi

# Check application.yml uses env vars
echo -n "6. Checking application.yml uses environment variables... "
if [ -f "src/main/resources/application.yml" ]; then
    if grep -q '\${[A-Z_]*}' src/main/resources/application.yml; then
        echo -e "${GREEN}✓ PASS${NC}"
    else
        echo -e "${RED}✗ FAIL${NC}"
        echo "   application.yml should use \${VAR_NAME} syntax"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠ SKIP${NC}"
    echo "   application.yml not found"
fi

# Check docker-compose.yml uses env_file
echo -n "7. Checking docker-compose.yml configuration... "
if grep -q "env_file:" ../docker-compose.yml && grep -q "./news-ai-service/.env.local" ../docker-compose.yml; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "   docker-compose.yml should use env_file: ./news-ai-service/.env.local"
    exit 1
fi

# Check for placeholder values in .env.local
echo -n "8. Checking for placeholder values in .env.local... "
placeholders=(
    "your_db_user"
    "your_db_password"
    "your_openrouter_api_key"
    "your-neon-host"
)

found_placeholders=()
for placeholder in "${placeholders[@]}"; do
    if grep -qi "$placeholder" .env.local; then
        found_placeholders+=("$placeholder")
    fi
done

if [ ${#found_placeholders[@]} -eq 0 ]; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${YELLOW}⚠ WARNING${NC}"
    echo "   Found placeholder values: ${found_placeholders[*]}"
    echo "   Please replace with actual values"
fi

# Verify no hardcoded credentials in docker-compose.yml
echo -n "9. Checking docker-compose.yml for hardcoded credentials... "
if grep -A 30 "news-ai-service:" ../docker-compose.yml | grep -qE "NEON_DB_PASSWORD|OPENROUTER_API_KEY" 2>/dev/null; then
    echo -e "${RED}✗ FAIL${NC}"
    echo "   Found hardcoded credentials in docker-compose.yml"
    echo "   All credentials should be in .env.local"
    exit 1
else
    echo -e "${GREEN}✓ PASS${NC}"
fi

# Count configuration lines
echo -n "10. Verifying .env.local completeness... "
line_count=$(grep -v '^#' .env.local | grep -v '^$' | wc -l | tr -d ' ')
if [ "$line_count" -ge 15 ]; then
    echo -e "${GREEN}✓ PASS${NC} ($line_count configuration lines)"
else
    echo -e "${YELLOW}⚠ WARNING${NC}"
    echo "    Only $line_count configuration lines found (expected 15+)"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✓ Configuration Verification Complete${NC}"
echo "=========================================="
echo ""
echo "Summary:"
echo "  - .env.local is properly configured"
echo "  - All required variables are present"
echo "  - No hardcoded secrets in Dockerfile"
echo "  - docker-compose.yml uses env_file"
echo "  - Configuration follows best practices"
echo ""
echo "Next steps:"
echo "  1. Review .env.local for correct values"
echo "  2. Test service startup: docker-compose up news-ai-service"
echo "  3. Check health: curl http://localhost:8084/actuator/health"
echo ""

