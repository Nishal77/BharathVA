# Quick Restoration Guide

This is a condensed guide for quickly restoring the BharathVA project environment.

## Prerequisites Installation (One-time Setup)

```bash
# Install Node.js (if not installed)
# Download from: https://nodejs.org/ (LTS version)

# Install pnpm globally
npm install -g pnpm

# Install Java 17
brew install openjdk@17

# Install Maven
brew install maven

# Install Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop
```

## Quick Restoration (After Laptop Repair)

```bash
# 1. Navigate to project
cd /Users/nishalpoojary/Projects/Codes/ProjectRD/BharathVA

# 2. Install frontend dependencies
pnpm install

# 3. Install backend dependencies
cd backend
mvn clean install
cd ..

# 4. Start Docker services
cd backend
docker-compose up -d
cd ..

# 5. Verify everything is working
./verify-installations.sh
```

## Verification

```bash
# Run the verification script
./verify-installations.sh

# Or check manually:
node --version      # Should show Node.js version
pnpm --version      # Should show pnpm version
java -version       # Should show Java 17
mvn --version       # Should show Maven version
docker --version    # Should show Docker version
```

## Start Development

```bash
# Terminal 1: Start mobile app
pnpm dev:mobile

# Terminal 2: Start backend (if not using Docker)
cd backend
mvn spring-boot:run -pl auth-service
```

## Check Service Health

```bash
# Discovery Service
curl http://localhost:8761/actuator/health

# Gateway
curl http://localhost:8080/actuator/health

# Auth Service
curl http://localhost:8081/auth/register/health

# Feed Service
curl http://localhost:8082/api/feed/health
```

## Important Files

- `INSTALLATION_BACKUP.md` - Complete backup documentation
- `verify-installations.sh` - Installation verification script
- `package.json` - Frontend dependencies
- `backend/pom.xml` - Backend dependencies
- `backend/docker-compose.yml` - Docker services configuration

## Need More Details?

See `INSTALLATION_BACKUP.md` for complete documentation.

