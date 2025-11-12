#!/bin/bash

# BharathVA Backend - Neon Database Connection Verifier
# This script verifies that the Neon PostgreSQL database is accessible

echo "========================================"
echo "BharathVA - Neon DB Connection Verifier"
echo "========================================"
echo ""

# Neon DB Connection String
NEON_CONNECTION="postgresql://neondb_owner:npg_Dtqy63pieawz@ep-summer-bar-a1bv6p9u-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

echo "Testing Neon PostgreSQL connection..."
echo ""

# Test 1: Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo "❌ ERROR: psql is not installed"
    echo "   Install PostgreSQL client tools to use this script"
    echo ""
    echo "   macOS: brew install postgresql"
    echo "   Ubuntu: sudo apt-get install postgresql-client"
    echo ""
    exit 1
fi

# Test 2: Test connection to Neon DB
echo "Testing connection to Neon database..."
psql "$NEON_CONNECTION" -c "SELECT version();" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ SUCCESS: Connected to Neon database"
    echo ""
    
    # Display database info
    echo "Database Information:"
    psql "$NEON_CONNECTION" -c "SELECT version();" 2>/dev/null | head -n 3
    echo ""
    
    # Check if required tables exist
    echo "Checking required tables..."
    
    TABLES=("users" "user_sessions" "registration_sessions")
    
    for table in "${TABLES[@]}"; do
        TABLE_EXISTS=$(psql "$NEON_CONNECTION" -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '$table');" 2>/dev/null | xargs)
        
        if [ "$TABLE_EXISTS" = "t" ]; then
            echo "  ✅ Table '$table' exists"
        else
            echo "  ⚠️  Table '$table' does not exist"
        fi
    done
    
    echo ""
    echo "========================================"
    echo "Neon DB Connection: VERIFIED"
    echo "========================================"
    
else
    echo "❌ ERROR: Could not connect to Neon database"
    echo ""
    echo "Possible issues:"
    echo "  1. Network connectivity - check your internet connection"
    echo "  2. Firewall blocking connection - check firewall settings"
    echo "  3. Invalid credentials - verify database credentials"
    echo "  4. Database server down - check Neon console"
    echo ""
    echo "Connection string used:"
    echo "  Host: ep-summer-bar-a1bv6p9u-pooler.ap-southeast-1.aws.neon.tech"
    echo "  Database: neondb"
    echo "  User: neondb_owner"
    echo ""
    exit 1
fi

echo ""
echo "To connect manually, use:"
echo "psql '$NEON_CONNECTION'"
echo ""

