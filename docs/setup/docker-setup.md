# Docker Setup Guide

## Overview

BharathVA backend uses Docker and Docker Compose for containerized deployment. This approach ensures consistent environments across development, staging, and production.

## Prerequisites

### Install Docker Desktop
**macOS**:
```bash
brew install --cask docker
```

**Linux**:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

**Windows**:
Download from https://www.docker.com/products/docker-desktop

### Verify Installation
```bash
docker --version          # Should be 20.10 or higher
docker-compose --version  # Should be 2.0 or higher
```

### Start Docker Desktop
```bash
# macOS
open /Applications/Docker.app

# Verify Docker is running
docker info
```

## Docker Architecture

### Multi-Stage Builds
All services use multi-stage Docker builds for optimization:

**Stage 1: Build**
- Base image: maven:3.9.6-eclipse-temurin-17
- Compile Java source code
- Create JAR file

**Stage 2: Runtime**
- Base image: eclipse-temurin:17-jre
- Copy JAR from build stage
- Minimal runtime environment
- Non-root user execution

### Service Configuration

**Discovery Service**:
```dockerfile
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /build
COPY . .
RUN mvn clean install -DskipTests -pl discovery-service -am

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /build/discovery-service/target/*.jar app.jar
EXPOSE 8761
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

**Similar structure for**: Gateway Service, Auth Service, Config Service

## Docker Compose Configuration

### Services Definition
```yaml
services:
  discovery-service:
    build:
      context: .
      dockerfile: discovery-service/Dockerfile
    container_name: bharathva-discovery
    ports:
      - "8761:8761"
    env_file:
      - ./discovery-service/.env
    networks:
      - bharathva-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:8761/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 40s
    restart: unless-stopped

  gateway-service:
    build:
      context: .
      dockerfile: gateway-service/Dockerfile
    depends_on:
      discovery-service:
        condition: service_healthy
    # ... similar configuration

  auth-service:
    build:
      context: .
      dockerfile: auth-service/Dockerfile
    depends_on:
      discovery-service:
        condition: service_healthy
    # ... similar configuration
```

### Network Configuration
```yaml
networks:
  bharathva-network:
    driver: bridge
```

All services run on the same Docker network, enabling inter-service communication using service names.

### Health Checks
Each service includes health checks to ensure:
- Service started successfully
- Dependencies are available
- Application is responding to requests

Health check configuration:
- Interval: 30 seconds
- Timeout: 10 seconds
- Retries: 5 attempts
- Start period: 40-60 seconds (service startup time)

## Running Services

### Start All Services
```bash
cd backend
docker-compose up
```

This command:
1. Builds all service images (first time only)
2. Creates network and volumes
3. Starts services in dependency order
4. Streams logs to terminal

### Start in Detached Mode
```bash
docker-compose up -d
```

Services run in background. View logs:
```bash
docker-compose logs -f
```

### Rebuild and Start
```bash
docker-compose up --build
```

Forces rebuild of all images before starting.

### Start Specific Service
```bash
docker-compose up auth-service
```

Starts only specified service and its dependencies.

## Managing Services

### View Running Containers
```bash
docker ps
```

Expected output:
```
CONTAINER ID   IMAGE                    STATUS                    PORTS
abc123         bharathva-discovery      Up (healthy)              0.0.0.0:8761->8761/tcp
def456         bharathva-gateway        Up (healthy)              0.0.0.0:8080->8080/tcp
ghi789         bharathva-auth           Up (healthy)              0.0.0.0:8081->8081/tcp
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f auth-service

# Last 100 lines
docker-compose logs --tail=100 auth-service

# Follow logs in real-time
docker-compose logs -f --tail=50 auth-service
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Stop without removing containers
docker-compose stop
```

### Restart Services
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart auth-service
```

### Rebuild Specific Service
```bash
# Rebuild and restart
docker-compose up --build auth-service

# Force complete rebuild
docker-compose build --no-cache auth-service
docker-compose up auth-service
```

## Environment Configuration

### Environment Files
Each service has its own `.env` file:
```
backend/
├── discovery-service/.env
├── gateway-service/.env
└── auth-service/.env
```

### Example: Auth Service .env
```env
# Database
DB_URL=jdbc:postgresql://host:5432/neondb?sslmode=require
DB_USERNAME=neondb_owner
DB_PASSWORD=your_secure_password

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# JWT
JWT_SECRET=your_secret_key_minimum_64_characters_for_security
JWT_EXPIRATION=3600000
JWT_REFRESH_EXPIRATION=604800000

# Server
SERVER_PORT=8081

# Eureka
EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://discovery-service:8761/eureka/
```

### Security Best Practices
- Never commit `.env` files to version control
- Use `.env.example` as template
- Rotate secrets regularly
- Use strong, unique passwords
- Enable 2FA for email accounts

## Volume Management

### Persistent Volumes
```yaml
volumes:
  logs:
    driver: local
```

### View Volumes
```bash
docker volume ls
```

### Remove Volumes
```bash
# Remove all unused volumes
docker volume prune

# Remove specific volume
docker volume rm bharathva_logs
```

## Network Management

### View Networks
```bash
docker network ls
```

### Inspect Network
```bash
docker network inspect bharathva_bharathva-network
```

### Network Troubleshooting
```bash
# Verify service connectivity
docker exec bharathva-auth ping discovery-service

# Check network configuration
docker network inspect bharathva_bharathva-network
```

## Resource Management

### Allocate Resources
Edit Docker Desktop settings:
- CPUs: 4 or more
- Memory: 8 GB or more
- Swap: 2 GB or more
- Disk: 60 GB or more

### Monitor Resource Usage
```bash
# Real-time stats
docker stats

# Specific container
docker stats bharathva-auth
```

### Resource Limits
Add to docker-compose.yml:
```yaml
services:
  auth-service:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

## Troubleshooting

### Port Conflicts
```bash
# Check what's using a port
lsof -i :8080

# Kill process
kill -9 <PID>

# Or use docker-compose to stop
docker-compose down
```

### Build Failures
```bash
# Clean build cache
docker builder prune -a

# Remove all images
docker rmi $(docker images -q)

# Rebuild from scratch
docker-compose build --no-cache
```

### Service Unhealthy
```bash
# Check logs
docker-compose logs auth-service

# Check health status
docker inspect bharathva-auth | grep -A 10 Health

# Restart service
docker-compose restart auth-service
```

### Database Connection Issues
```bash
# Verify environment variables loaded
docker-compose config

# Check auth-service logs for connection errors
docker-compose logs auth-service | grep -i "database\|connection"

# Test database connectivity
docker exec bharathva-auth wget -O- http://your-db-host:5432
```

### Network Issues
```bash
# Recreate network
docker-compose down
docker network prune
docker-compose up
```

### Disk Space Issues
```bash
# Check disk usage
docker system df

# Clean up
docker system prune -a --volumes
```

## Advanced Configuration

### Custom Docker Network
```bash
# Create external network
docker network create bharathva-prod

# Use in docker-compose.yml
networks:
  default:
    external: true
    name: bharathva-prod
```

### Environment Variables Override
```bash
# Override at runtime
docker-compose up -e DB_PASSWORD=newpassword
```

### Multi-Environment Setup
```bash
# Development
docker-compose -f docker-compose.yml up

# Staging
docker-compose -f docker-compose.staging.yml up

# Production
docker-compose -f docker-compose.prod.yml up
```

## Production Considerations

### Security
- Use Docker secrets instead of environment files
- Run containers as non-root users (already implemented)
- Scan images for vulnerabilities
- Keep base images updated
- Enable Docker Content Trust

### Performance
- Use multi-stage builds (already implemented)
- Minimize layer count
- Use .dockerignore to reduce build context
- Implement health checks (already implemented)
- Set appropriate resource limits

### Monitoring
- Integrate with monitoring tools (Prometheus, Grafana)
- Export container metrics
- Centralized logging (ELK stack)
- Alert on container failures

### High Availability
- Use Docker Swarm or Kubernetes for orchestration
- Deploy multiple replicas of each service
- Implement load balancing
- Configure automatic restart policies

## Docker Commands Reference

### Container Management
```bash
# List containers
docker ps                    # Running only
docker ps -a                 # All containers

# Start/Stop containers
docker start <container>
docker stop <container>
docker restart <container>

# Remove containers
docker rm <container>
docker rm -f <container>     # Force remove
```

### Image Management
```bash
# List images
docker images

# Remove image
docker rmi <image>

# Pull image
docker pull <image>

# Build image
docker build -t <tag> .
```

### System Cleanup
```bash
# Remove unused data
docker system prune

# Remove everything (use with caution)
docker system prune -a --volumes

# Remove stopped containers
docker container prune

# Remove unused images
docker image prune -a
```

### Debugging
```bash
# Execute command in container
docker exec -it bharathva-auth sh

# View container details
docker inspect bharathva-auth

# Copy files from container
docker cp bharathva-auth:/app/logs ./logs

# View real-time events
docker events
```

## Development Workflow

### Typical Development Cycle
```bash
# 1. Make code changes
# Edit files in auth-service/

# 2. Rebuild service
docker-compose up --build auth-service

# 3. View logs
docker-compose logs -f auth-service

# 4. Test changes
curl http://localhost:8080/api/auth/register/health

# 5. Stop when done
docker-compose down
```

### Quick Restart
```bash
# For config changes
docker-compose restart auth-service

# For code changes
docker-compose up --build auth-service
```

## Optimization Tips

### Faster Builds
- Use .dockerignore effectively
- Leverage Docker layer caching
- Parallel builds with docker-compose
- Local Maven repository caching

### Reduced Image Size
- Multi-stage builds (already implemented)
- Use JRE instead of JDK for runtime
- Remove unnecessary files
- Compress layers

### Better Performance
- Allocate adequate resources
- Use volume mounts for development
- Enable BuildKit for faster builds
- Optimize Dockerfile layer order

## Next Steps

After successful Docker setup:
1. Verify all services are healthy
2. Test API endpoints
3. Review service logs
4. Configure monitoring
5. Set up CI/CD pipeline

