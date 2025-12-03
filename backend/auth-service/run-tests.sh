#!/bin/bash

# BharathVA Auth Service Test Runner
# Runs unit tests for the authentication service

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}BharathVA Auth Service - Unit Tests${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo -e "${RED}Error: Maven is not installed.${NC}"
    echo -e "${YELLOW}Install Maven: brew install maven (macOS) or apt-get install maven (Linux)${NC}"
    exit 1
fi

# Run tests
echo -e "${YELLOW}Running unit tests...${NC}"
echo ""

mvn clean test

TEST_EXIT_CODE=$?

echo ""
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}All tests passed!${NC}"
    echo -e "${GREEN}========================================${NC}"
else
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}Some tests failed!${NC}"
    echo -e "${RED}========================================${NC}"
fi

exit $TEST_EXIT_CODE


