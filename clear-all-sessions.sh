#!/bin/bash

# Script to clear all sessions from NeonDB
# This forces all users to re-login with fresh sessions

echo "🧹 Clearing all user sessions from NeonDB"
echo "=========================================="
echo ""
echo "⚠️  WARNING: This will log out all users!"
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

# Database connection details (update these)
DB_HOST="${DB_HOST:-your-neon-host}"
DB_NAME="${DB_NAME:-neondb}"
DB_USER="${DB_USER:-neondb_owner}"

# SQL to execute
SQL="DELETE FROM user_sessions;"

echo "Executing: $SQL"
echo ""

# Using psql (if available)
if command -v psql &> /dev/null; then
    echo "Using psql..."
    PGPASSWORD="${DB_PASSWORD}" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "$SQL"
else
    echo "psql not found. Please run this SQL manually in NeonDB SQL editor:"
    echo ""
    echo "$SQL"
    echo ""
    echo "Or use the NeonDB web interface to execute:"
    echo "DELETE FROM user_sessions;"
fi

echo ""
echo "✅ Sessions cleared. All users will need to re-login."

