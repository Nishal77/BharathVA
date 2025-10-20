#!/bin/bash

# BharathVA Feed Service Environment Setup Script

echo "Setting up Feed Service environment..."

# Create .env file from env.example
cp env.example .env

# Update MongoDB URI for Docker
sed -i '' 's|mongodb://localhost:27017|mongodb://mongodb:27017|g' .env

echo "✅ Feed Service environment configured successfully!"
echo "📁 Environment file: .env"
echo "🐳 MongoDB URI updated for Docker: mongodb://mongodb:27017/bharathva_feed"
echo ""
echo "To start all services, run from backend root:"
echo "  docker-compose up --build"
