# BharathVA Backend Docker Setup

This document explains how to run all BharathVA backend services using Docker Compose.

## 🏗️ Architecture

The BharathVA backend consists of the following microservices:

- **Discovery Service** (Eureka Server) - Port 8761
- **Gateway Service** (Spring Cloud Gateway) - Port 8080
- **Auth Service** (Authentication & User Management) - Port 8081
- **Feed Service** (Content & Feed Management) - Port 8082
- **Redis** (Caching) - Port 6379
- **MongoDB** (Feed Service Database) - Port 27017

## 🚀 Quick Start

### Prerequisites

- Docker Desktop installed and running
- Docker Compose installed

### Start All Services

```bash
# From the backend directory
./start-all-services-docker.sh
```

This script will:
1. Check Docker is running
2. Create environment files for all services
3. Build and start all services
4. Wait for services to be healthy
5. Display service URLs and health check endpoints

### Stop All Services

```bash
# From the backend directory
./stop-all-services-docker.sh
```

## 📋 Manual Commands

### Start Services
```bash
docker-compose up --build -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f auth-service
docker-compose logs -f feed-service
```

### Check Service Health
```bash
# Discovery Service
curl http://localhost:8761/actuator/health

# Gateway Service
curl http://localhost:8080/actuator/health

# Auth Service
curl http://localhost:8081/auth/register/health

# Feed Service
curl http://localhost:8082/api/feed/health
```

## 🔧 Service Configuration

Each service has its own `.env` file for configuration:

- `discovery-service/.env`
- `gateway-service/.env`
- `auth-service/.env`
- `feed-service/.env`

### Feed Service Environment Variables

```bash
# MongoDB Configuration
MONGO_URI=mongodb://mongodb:27017/bharathva_feed
MONGO_DATABASE=bharathva_feed

# Auth Service Configuration
AUTH_SERVICE_URL=http://auth-service:8081
AUTH_SERVICE_LOCAL_URL=http://localhost:8081

# JWT Configuration
JWT_SECRET=your-64-character-secret-key-for-feed-service-jwt-validation-only
JWT_EXPIRATION=3600000

# Server Configuration
SERVER_PORT=8082

# Eureka Configuration
EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://discovery-service:8761/eureka/

# Cache Configuration
CACHE_TTL=300

# Feed Configuration
MAX_FEED_ITEMS=50
DEFAULT_PAGE_SIZE=20
```

## 🌐 Service URLs

| Service | URL | Health Check |
|---------|-----|--------------|
| Discovery | http://localhost:8761 | http://localhost:8761/actuator/health |
| Gateway | http://localhost:8080 | http://localhost:8080/actuator/health |
| Auth | http://localhost:8081 | http://localhost:8081/auth/register/health |
| Feed | http://localhost:8082 | http://localhost:8082/api/feed/health |

## 🗄️ Data Persistence

- **Redis Data**: Stored in `redis-data` volume
- **MongoDB Data**: Stored in `mongodb_data` volume
- **Logs**: Stored in `logs` volume

### Remove All Data
```bash
docker-compose down -v
```

## 🔍 Troubleshooting

### Services Not Starting
1. Check Docker is running: `docker info`
2. Check logs: `docker-compose logs [service-name]`
3. Check service health endpoints
4. Ensure ports are not in use by other applications

### Database Connection Issues
1. Verify MongoDB is running: `docker-compose ps`
2. Check MongoDB logs: `docker-compose logs mongodb`
3. Verify connection string in `.env` files

### Service Discovery Issues
1. Ensure Discovery Service is healthy first
2. Check Eureka dashboard: http://localhost:8761
3. Verify service registration in logs

## 📊 Monitoring

### Eureka Dashboard
Visit http://localhost:8761 to see registered services.

### Service Logs
```bash
# Real-time logs for all services
docker-compose logs -f

# Logs for specific service
docker-compose logs -f feed-service
```

### Container Status
```bash
docker-compose ps
```

## 🔄 Development Workflow

1. **Start Services**: `./start-all-services-docker.sh`
2. **Make Changes**: Edit code in your IDE
3. **Rebuild Service**: `docker-compose up --build -d [service-name]`
4. **View Logs**: `docker-compose logs -f [service-name]`
5. **Stop Services**: `./stop-all-services-docker.sh`

## 📝 Notes

- The feed-service now only contains a `Dockerfile` (no separate docker-compose.yml)
- All services are orchestrated through the main `docker-compose.yml` in the backend root
- Environment variables are managed through individual `.env` files
- Services have proper health checks and dependency management
- All services are connected through a custom Docker network (`bharathva-network`)
