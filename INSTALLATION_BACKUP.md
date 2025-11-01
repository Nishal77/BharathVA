# BharathVA Installation Backup

This document contains a complete list of all installations, dependencies, and tools required to restore the BharathVA project environment.

**Generated:** $(date)
**Project Path:** /Users/nishalpoojary/Projects/Codes/ProjectRD/BharathVA

---

## System Requirements

### Operating System
- macOS (darwin 25.0.0)
- Shell: zsh (/bin/zsh)

### Required System Tools

#### Node.js & Package Managers
```bash
# Install Node.js (LTS version recommended)
# Check current version with: node --version

# Install pnpm (package manager used in this project)
npm install -g pnpm

# Verify installation
pnpm --version
```

#### Java Development Kit
```bash
# Required: Java 17
# Check current version: java -version

# On macOS, install via Homebrew:
brew install openjdk@17

# Or download from Oracle/OpenJDK
```

#### Apache Maven
```bash
# Install Maven (required for Java backend)
brew install maven

# Verify installation
mvn --version
```

#### Docker & Docker Compose
```bash
# Install Docker Desktop (includes Docker Compose)
# Download from: https://www.docker.com/products/docker-desktop

# Verify installation
docker --version
docker-compose --version
```

#### Expo CLI (for React Native)
```bash
# Install Expo CLI globally
npm install -g expo-cli

# Or use npx (no global install needed)
# npx expo-cli --version
```

---

## Frontend Dependencies (Node.js/React Native)

### Package Manager
- **pnpm** (primary package manager)
- Lock file: `pnpm-lock.yaml`
- Workspace config: `pnpm-workspace.yaml`

### Root Workspace Configuration
**File:** `package.json`
- Workspace structure with apps and libs
- Package overrides for React 19.1.0 and React Native 0.81.4

### Mobile App Dependencies
**Location:** `apps/mobile/`

**Runtime Dependencies:**
- `@expo/vector-icons`: ^15.0.2
- `@react-native-async-storage/async-storage`: ^2.2.0
- `@react-navigation/native`: ^7.1.8
- `@stomp/stompjs`: ^7.2.1
- `expo`: ~54.0.10
- `expo-av`: ^16.0.7
- `expo-blur`: ~15.0.7
- `expo-calendar`: ~15.0.7
- `expo-constants`: ~18.0.9
- `expo-device`: ^8.0.9
- `expo-font`: ~14.0.8
- `expo-haptics`: ~15.0.7
- `expo-image`: ^3.0.8
- `expo-image-picker`: ^17.0.8
- `expo-linear-gradient`: ^15.0.7
- `expo-linking`: ~8.0.8
- `expo-router`: ~6.0.8
- `expo-secure-store`: ~15.0.7
- `expo-splash-screen`: ~31.0.10
- `expo-status-bar`: ~3.0.8
- `expo-video`: ^3.0.11
- `expo-web-browser`: ^15.0.8
- `lucide-react-native`: ^0.544.0
- `nativewind`: ^4.2.1
- `react`: 19.1.0
- `react-native`: 0.81.4
- `react-native-calendars`: ^1.1313.0
- `react-native-date-picker`: ^5.0.13
- `react-native-device-info`: ^14.1.1
- `react-native-gesture-handler`: ~2.28.0
- `react-native-get-random-values`: ~1.11.0
- `react-native-reanimated`: ~3.17.5
- `react-native-safe-area-context`: ^5.4.0
- `react-native-screens`: ^4.16.0
- `react-native-svg`: 15.12.1
- `react-native-toast-message`: ^2.3.3
- `react-native-webview`: ^13.16.0
- `react-native-worklets`: 0.5.1
- `sockjs-client`: ^1.6.1

**Development Dependencies:**
- `@types/react`: ~19.1.0
- `prettier-plugin-tailwindcss`: ^0.5.14
- `react-test-renderer`: 19.1.0
- `tailwindcss`: ^3.4.18
- `typescript`: ~5.9.2

### Installation Command
```bash
# From project root
cd /Users/nishalpoojary/Projects/Codes/ProjectRD/BharathVA
pnpm install
```

---

## Backend Dependencies (Java/Spring Boot)

### Build System
- **Maven** (primary build tool)
- **Java 17** (required JDK version)

### Parent POM Configuration
**File:** `backend/pom.xml`

**Spring Boot Version:** 3.2.0
**Spring Cloud Version:** 2023.0.0
**Java Version:** 17

### Backend Services

#### 1. Auth Service
**Location:** `backend/auth-service/`
**Port:** 8081

**Key Dependencies:**
- Spring Boot Web
- Spring Boot Data JPA
- Spring Boot Security
- Spring Boot Mail
- Spring Boot Cache
- Spring Boot Data Redis
- Spring Cloud Netflix Eureka Client
- PostgreSQL Driver (42.7.1)
- JWT Libraries (jjwt 0.12.3)
- Lombok (1.18.34)
- Caffeine Cache (3.1.8)
- Cloudinary SDK (1.36.0)
- Redis (Lettuce)

#### 2. Feed Service
**Location:** `backend/feed-service/`
**Port:** 8082

**Key Dependencies:**
- Spring Boot Web
- Spring Boot Data MongoDB
- Spring Boot Security
- Spring Boot WebFlux
- Spring Boot WebSocket
- Spring Boot Cache
- Spring Boot Actuator
- Spring Cloud Netflix Eureka Client
- OAuth2 Resource Server
- JWT Libraries (jjwt 0.12.3)
- Cloudinary SDK (1.36.0)
- Embedded MongoDB (for testing)

#### 3. Discovery Service (Eureka Server)
**Location:** `backend/discovery-service/`
**Port:** 8761

#### 4. Config Service
**Location:** `backend/config-service/`

#### 5. Gateway Service
**Location:** `backend/gateway-service/`
**Port:** 8080

#### 6. Shared Module
**Location:** `backend/shared/`

### Installation Command
```bash
# From backend directory
cd /Users/nishalpoojary/Projects/Codes/ProjectRD/BharathVA/backend
mvn clean install
```

---

## Docker Services & Images

### Docker Compose Configuration
**File:** `backend/docker-compose.yml`

### Services Required

#### 1. Redis
- **Image:** redis:7-alpine
- **Port:** 6379
- **Purpose:** Caching layer
- **Data Volume:** redis-data

#### 2. MongoDB
- **Image:** mongo:7.0
- **Port:** 27017
- **Purpose:** Feed service database
- **Database:** bharathva_feed
- **Data Volume:** mongodb_data

#### 3. Discovery Service (Eureka)
- **Container:** bharathva-discovery
- **Port:** 8761
- **Purpose:** Service discovery

#### 4. Gateway Service
- **Container:** bharathva-gateway
- **Port:** 8080
- **Purpose:** API gateway

#### 5. Auth Service
- **Container:** bharathva-auth
- **Port:** 8081
- **Purpose:** Authentication service

#### 6. Feed Service
- **Container:** bharathva-feed
- **Port:** 8082
- **Purpose:** Feed/content service

### Docker Network
- **Network Name:** bharathva-network
- **Driver:** bridge

### Docker Volumes
- redis-data (local driver)
- mongodb_data (local driver)
- logs (local driver)

### Docker Installation Commands
```bash
# Start all services
cd /Users/nishalpoojary/Projects/Codes/ProjectRD/BharathVA/backend
docker-compose up --build -d

# Or use the provided script
./start-all-services-docker.sh

# Stop all services
docker-compose down

# View logs
docker-compose logs -f
```

---

## Database Requirements

### PostgreSQL
- **Required for:** Auth Service
- **Connection:** Managed externally (likely Neon or similar)
- **Driver Version:** 42.7.1

### MongoDB
- **Required for:** Feed Service
- **Version:** 7.0
- **Database Name:** bharathva_feed
- **Port:** 27017
- **Container:** bharathva-mongodb

---

## Development Tools & Configuration

### TypeScript Configuration
- **Location:** `apps/mobile/tsconfig.json`
- **Extends:** expo/tsconfig.base.json
- **Version:** ~5.9.2

### Metro Bundler
- **Config:** `apps/mobile/metro.config.js`
- **Purpose:** React Native bundler

### Babel
- **Config:** `apps/mobile/babel.config.js`
- **Purpose:** JavaScript transpiler

### Tailwind CSS
- **Config:** `apps/mobile/tailwind.config.js`
- **Version:** ^3.4.18
- **Purpose:** Styling framework

### NativeWind
- **Version:** ^4.2.1
- **Purpose:** Tailwind CSS for React Native

---

## External Services & APIs

### Cloudinary
- **SDK Version:** 1.36.0
- **Purpose:** Image/media upload and management
- **Required:** API credentials in environment variables

### WebSocket
- **Library:** @stomp/stompjs (^7.2.1)
- **Purpose:** Real-time communication
- **Library:** sockjs-client (^1.6.1)

---

## Environment Configuration Files

### Backend Services
Each service requires a `.env` file:
- `backend/discovery-service/.env`
- `backend/gateway-service/.env`
- `backend/auth-service/.env`
- `backend/feed-service/.env.local`

### Required Environment Variables

#### Auth Service
- Database connection strings (PostgreSQL)
- JWT secrets
- Redis configuration
- Email service configuration
- Cloudinary credentials

#### Feed Service
- MongoDB connection string
- Auth service URL
- JWT secrets
- Cloudinary credentials
- Cache configuration

---

## Project Scripts

### Root Package.json Scripts
```json
{
  "dev:mobile": "pnpm --filter mobile start",
  "dev:web": "pnpm --filter web dev",
  "dev:backend": "cd backend && ./gradlew bootRun",
  "dev:infra": "cd infra && docker-compose up -d"
}
```

### Mobile App Scripts
```json
{
  "start": "expo start",
  "android": "expo start --android",
  "ios": "expo start --ios",
  "web": "expo start --web"
}
```

---

## Complete Restoration Steps

### 1. Install System Tools
```bash
# Install Node.js (if not already installed)
# Visit: https://nodejs.org/

# Install pnpm
npm install -g pnpm

# Install Java 17
brew install openjdk@17

# Install Maven
brew install maven

# Install Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop
```

### 2. Clone/Restore Project
```bash
# Navigate to project directory
cd /Users/nishalpoojary/Projects/Codes/ProjectRD/BharathVA
```

### 3. Install Frontend Dependencies
```bash
# From project root
pnpm install
```

### 4. Install Backend Dependencies
```bash
# From backend directory
cd backend
mvn clean install
```

### 5. Setup Environment Variables
```bash
# Copy example files and configure
# Set up .env files for each backend service
# Configure database connections
# Configure API keys (Cloudinary, etc.)
```

### 6. Start Docker Services
```bash
# From backend directory
docker-compose up --build -d

# Or use provided script
./start-all-services-docker.sh
```

### 7. Verify Installation
```bash
# Check Node.js
node --version
pnpm --version

# Check Java
java -version
mvn --version

# Check Docker
docker --version
docker-compose --version

# Check services
docker-compose ps

# Check backend services health
curl http://localhost:8761/actuator/health  # Discovery
curl http://localhost:8080/actuator/health  # Gateway
curl http://localhost:8081/auth/register/health  # Auth
curl http://localhost:8082/api/feed/health  # Feed
```

---

## Important Files to Backup

### Package Manager Files
- `/package.json`
- `/pnpm-lock.yaml`
- `/pnpm-workspace.yaml`
- `/apps/mobile/package.json`

### Maven Files
- `/backend/pom.xml`
- `/backend/*/pom.xml` (all service POMs)

### Docker Configuration
- `/backend/docker-compose.yml`
- `/backend/*/Dockerfile` (all service Dockerfiles)

### Environment Files
- All `.env` files (create from `.env.example` if available)
- `/backend/feed-service/env.example`

### Configuration Files
- `/apps/mobile/tsconfig.json`
- `/apps/mobile/tailwind.config.js`
- `/apps/mobile/babel.config.js`
- `/apps/mobile/metro.config.js`
- `/apps/mobile/app.json`

---

## Version Pinning Summary

### Critical Versions
- **React:** 19.1.0
- **React Native:** 0.81.4
- **Expo:** ~54.0.10
- **TypeScript:** ~5.9.2
- **Java:** 17
- **Spring Boot:** 3.2.0
- **Spring Cloud:** 2023.0.0
- **MongoDB:** 7.0
- **Redis:** 7-alpine
- **PostgreSQL Driver:** 42.7.1
- **JWT (jjwt):** 0.12.3
- **Cloudinary SDK:** 1.36.0
- **NativeWind:** ^4.2.1

---

## Quick Restoration Checklist

- [ ] Node.js installed
- [ ] pnpm installed globally
- [ ] Java 17 installed
- [ ] Maven installed
- [ ] Docker Desktop installed and running
- [ ] Project files restored to: `/Users/nishalpoojary/Projects/Codes/ProjectRD/BharathVA`
- [ ] Frontend dependencies installed (`pnpm install`)
- [ ] Backend dependencies installed (`mvn clean install`)
- [ ] Environment variables configured
- [ ] Docker services started (`docker-compose up -d`)
- [ ] All services healthy (verified via health checks)
- [ ] Mobile app can start (`pnpm dev:mobile`)

---

## Support Resources

### Documentation Files in Project
- `/apps/mobile/MOBILE_DEVELOPMENT_SETUP.md`
- `/backend/DOCKER_SETUP.md`
- `/backend/README.md`
- `/docs/setup/local-development.md`

### Service Health Endpoints
- Discovery: http://localhost:8761/actuator/health
- Gateway: http://localhost:8080/actuator/health
- Auth: http://localhost:8081/auth/register/health
- Feed: http://localhost:8082/api/feed/health
- Eureka Dashboard: http://localhost:8761

---

**Note:** This backup document should be kept alongside your project files. All package lock files (`pnpm-lock.yaml`) and Maven POM files contain exact version information for complete restoration.

**Last Updated:** Generated automatically from current project state

