# Docker Microservices Setup

This document explains the Docker and microservices architecture for BharathVA backend.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Compose (Main)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐              │
│  │ Discovery Service│  │  Gateway Service  │              │
│  │   (Eureka)       │  │   (API Gateway)   │              │
│  │   Port: 8761     │  │   Port: 8080      │              │
│  │   .env file      │  │   .env file       │              │
│  └────────┬─────────┘  └────────┬──────────┘              │
│           │                     │                          │
│           └──────────┬──────────┘                          │
│                      │                                     │
│         ┌────────────┴────────────┐                       │
│         │                         │                       │
│  ┌──────▼──────────┐   ┌─────────▼────────┐             │
│  │  Auth Service   │   │  Tweet Service    │             │
│  │  Port: 8081     │   │  Port: 8082       │             │
│  │  .env file      │   │  .env file        │             │
│  └─────────────────┘   └──────────────────┘             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
backend/
├── docker-compose.yml          # Main orchestration file
│
├── discovery-service/
│   ├── Dockerfile             # Discovery service Docker build
│   ├── .env                   # Service-specific environment variables
│   ├── .env.example           # Template for .env
│   └── src/                   # Service source code
│
├── gateway-service/
│   ├── Dockerfile             # Gateway service Docker build
│   ├── .env                   # Service-specific environment variables
│   ├── .env.example           # Template for .env
│   └── src/                   # Service source code
│
├── auth-service/
│   ├── Dockerfile             # Auth service Docker build
│   ├── .env                   # Service-specific environment variables
│   ├── .env.example           # Template for .env
│   └── src/                   # Service source code
│
└── shared/                    # Shared modules/libraries
```

## Key Features

### 1. Individual Service Contexts
Each service has its own build context and Dockerfile:
```yaml
auth-service:
  build:
    context: ./auth-service    # Build from service directory
```

### 2. Environment File Isolation
Each service loads its own `.env` file:
```yaml
auth-service:
  env_file:
    - ./auth-service/.env      # Service-specific configuration
```

### 3. No Hardcoded Credentials
All sensitive data is stored in `.env` files:
- Database credentials
- SMTP passwords
- JWT secrets
- API keys

### 4. Service Dependencies
Services start in proper order:
```yaml
auth-service:
  depends_on:
    discovery-service:
      condition: service_healthy
```

### 5. Health Checks
Each service has health checks to ensure proper startup:
```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:8081/auth/register/health"]
  interval: 30s
  timeout: 10s
  retries: 5
  start_period: 60s
```

## Setup Instructions

### Step 1: Create Environment Files

Run the setup script:
```bash
cd backend
./setup-env.sh
```

Or manually copy templates:
```bash
cp discovery-service/.env.example discovery-service/.env
cp gateway-service/.env.example gateway-service/.env
cp auth-service/.env.example auth-service/.env
```

### Step 2: Configure Services

Edit each `.env` file with your credentials:

**auth-service/.env**:
```env
DB_URL=jdbc:postgresql://your-db-url/neondb?sslmode=require
DB_USERNAME=your_username
DB_PASSWORD=your_password
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
JWT_SECRET=your_64_char_secret
```

### Step 3: Build and Run

Start all services with one command:
```bash
docker-compose up --build
```

Or run in detached mode:
```bash
docker-compose up -d --build
```

## Docker Commands Reference

### Start Services
```bash
docker-compose up                    # Start with logs
docker-compose up -d                 # Start detached (background)
docker-compose up --build            # Rebuild and start
```

### Stop Services
```bash
docker-compose down                  # Stop and remove containers
docker-compose down -v               # Also remove volumes
docker-compose stop                  # Stop without removing
```

### View Logs
```bash
docker-compose logs                  # All services
docker-compose logs auth-service     # Specific service
docker-compose logs -f               # Follow logs (live)
docker-compose logs --tail=100       # Last 100 lines
```

### Service Management
```bash
docker-compose ps                    # List running services
docker-compose restart auth-service  # Restart specific service
docker-compose exec auth-service sh  # Access service shell
```

### Cleanup
```bash
docker-compose down --rmi all        # Remove images too
docker system prune -a               # Clean everything
docker volume prune                  # Remove unused volumes
```

## Dockerfile Explanation

Each service uses a multi-stage build:

### Stage 1: Build
```dockerfile
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /build

# Copy parent pom and shared modules
COPY ../pom.xml ./pom.xml
COPY ../shared ./shared

# Copy service code
COPY . ./auth-service

# Build only this service and its dependencies
RUN mvn clean install -DskipTests -pl auth-service -am
```

### Stage 2: Runtime
```dockerfile
FROM eclipse-temurin:17-jre
WORKDIR /app

# Create non-root user for security
RUN groupadd -r spring && useradd -r -g spring spring

# Copy JAR from build stage
COPY --from=build /build/auth-service/target/*.jar app.jar

# Run as non-root user
USER spring:spring

# Start application
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

## Network Configuration

All services run on the same Docker network:
```yaml
networks:
  bharathva-network:
    driver: bridge
```

This allows services to communicate using service names:
- `http://discovery-service:8761`
- `http://gateway-service:8080`
- `http://auth-service:8081`

## Port Mapping

| Service | Internal Port | External Port | Purpose |
|---------|--------------|---------------|---------|
| Discovery | 8761 | 8761 | Eureka Dashboard |
| Gateway | 8080 | 8080 | API Gateway |
| Auth | 8081 | 8081 | Auth Service |

Access services from host:
- Eureka: http://localhost:8761
- API Gateway: http://localhost:8080
- Auth Service: http://localhost:8081

## Adding New Services

To add a new microservice (e.g., tweet-service):

### 1. Create Service Structure
```bash
mkdir tweet-service
cd tweet-service
```

### 2. Create Dockerfile
```dockerfile
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /build

COPY ../pom.xml ./pom.xml
COPY ../shared ./shared
COPY . ./tweet-service

WORKDIR /build
RUN mvn clean install -DskipTests -pl tweet-service -am

FROM eclipse-temurin:17-jre
WORKDIR /app
RUN groupadd -r spring && useradd -r -g spring spring
COPY --from=build /build/tweet-service/target/*.jar app.jar
RUN chown spring:spring app.jar
USER spring:spring
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

### 3. Create .env Files
```bash
# Create .env.example
cat > .env.example << 'EOF'
SERVER_PORT=8082
EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://discovery-service:8761/eureka/
EOF

# Copy to .env
cp .env.example .env
```

### 4. Add to docker-compose.yml
```yaml
tweet-service:
  build:
    context: ./tweet-service
  container_name: bharathva-tweet
  ports:
    - "8082:8082"
  env_file:
    - ./tweet-service/.env
  depends_on:
    - discovery-service
  networks:
    - bharathva-network
  restart: unless-stopped
```

## Troubleshooting

### Service Won't Start
```bash
# Check logs
docker-compose logs service-name

# Check if .env exists
ls -la service-name/.env

# Verify environment variables
docker-compose config
```

### Build Failures
```bash
# Clean rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Network Issues
```bash
# Recreate network
docker-compose down
docker network prune
docker-compose up
```

### Port Conflicts
```bash
# Check port usage
lsof -i :8080
lsof -i :8081
lsof -i :8761

# Kill processes
kill -9 <PID>
```

## Production Considerations

1. **Use Docker Secrets** instead of .env files
2. **Enable SSL/TLS** for all services
3. **Set resource limits** (CPU, memory)
4. **Use health checks** for all services
5. **Implement logging** aggregation
6. **Monitor** container metrics
7. **Use Docker Swarm** or Kubernetes for orchestration
8. **Implement backup** strategies for volumes

## Security Best Practices

1. Never commit `.env` files
2. Use non-root users in containers
3. Scan images for vulnerabilities
4. Keep base images updated
5. Use multi-stage builds to reduce attack surface
6. Implement network policies
7. Use secrets management (Vault, AWS Secrets Manager)
8. Enable Docker Content Trust

## Performance Optimization

1. Use `.dockerignore` to reduce build context
2. Layer caching for faster builds
3. Multi-stage builds for smaller images
4. Resource limits to prevent resource exhaustion
5. Health checks for reliable deployments
6. Horizontal scaling with multiple replicas

## References

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Spring Boot with Docker](https://spring.io/guides/gs/spring-boot-docker/)
- [Microservices Architecture](https://microservices.io/)
- [Eureka Service Discovery](https://spring.io/guides/gs/service-registration-and-discovery/)

