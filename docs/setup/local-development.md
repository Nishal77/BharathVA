# Local Development Setup

## Prerequisites

### Required Software
- Docker Desktop 20.10 or higher
- Docker Compose 2.0 or higher
- Node.js 18.0 or higher
- npm 9.0 or higher
- Git 2.30 or higher

### Optional Software
- Java 17 (for local backend development without Docker)
- Maven 3.9+ (for building backend services)
- PostgreSQL client (for database access)
- Postman (for API testing)

## Backend Setup

### Option 1: Docker Setup (Recommended)

#### Step 1: Clone Repository
```bash
git clone <repository-url>
cd BharathVA
```

#### Step 2: Configure Environment
```bash
cd backend

# Copy environment templates
cp auth-service/.env.example auth-service/.env
cp gateway-service/.env.example gateway-service/.env
cp discovery-service/.env.example discovery-service/.env
```

#### Step 3: Update Auth Service Configuration
Edit `backend/auth-service/.env`:

```env
# Database Configuration
DB_URL=jdbc:postgresql://your-neon-host/neondb?sslmode=require
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Email SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_minimum_64_characters_long_for_security
JWT_EXPIRATION=3600000
JWT_REFRESH_EXPIRATION=604800000

# Server Configuration
SERVER_PORT=8081

# Eureka Configuration
EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://discovery-service:8761/eureka/
```

#### Step 4: Start Services
```bash
docker-compose up --build
```

Wait for all services to start (approximately 2-3 minutes). You should see:
```
discovery-service | Started DiscoveryServiceApplication
config-service    | Started ConfigServiceApplication
gateway-service   | Started GatewayServiceApplication
auth-service      | Started AuthServiceApplication
```

#### Step 5: Verify Services
```bash
# Check running containers
docker ps

# Verify Eureka dashboard
open http://localhost:8761

# Test health endpoint
curl http://localhost:8080/api/auth/register/health
```

Expected response:
```json
{
  "success": true,
  "message": "Registration service is running",
  "data": "OK"
}
```

### Option 2: Local Development Without Docker

#### Step 1: Install Java 17
```bash
# macOS
brew install openjdk@17

# Verify installation
java -version
```

#### Step 2: Build All Services
```bash
cd backend
mvn clean install -DskipTests
```

#### Step 3: Start Services in Order
```bash
# Terminal 1: Discovery Service
cd discovery-service
mvn spring-boot:run

# Terminal 2: Gateway Service
cd gateway-service
mvn spring-boot:run

# Terminal 3: Auth Service
cd auth-service
mvn spring-boot:run
```

## Mobile Setup

### Step 1: Install Dependencies
```bash
cd apps/mobile
npm install
```

### Step 2: Configure API Endpoint
Edit `apps/mobile/services/api/config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://192.168.0.9:8080/api', // Update with your IP
  TIMEOUT: 30000,
};
```

Replace `192.168.0.9` with your machine's IP address:
```bash
# macOS - Get IP address
ipconfig getifaddr en0
```

### Step 3: Start Development Server
```bash
npm start
```

### Step 4: Run on Device/Simulator
```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Physical device
# Scan QR code from Expo CLI
```

## Database Setup

### Using Neon DB (Cloud PostgreSQL)

#### Step 1: Create Neon Account
1. Visit https://neon.tech
2. Create a new project
3. Note the connection details

#### Step 2: Configure Connection
Update `backend/auth-service/.env`:
```env
DB_URL=jdbc:postgresql://[host]/neondb?sslmode=require
DB_USERNAME=neondb_owner
DB_PASSWORD=your_password
```

#### Step 3: Verify Connection
The database schema will be created automatically via Flyway migrations on first startup.

### Using Local PostgreSQL

#### Step 1: Install PostgreSQL
```bash
# macOS
brew install postgresql@15
brew services start postgresql@15
```

#### Step 2: Create Database
```bash
psql postgres
CREATE DATABASE bharathva;
CREATE USER bharathva_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE bharathva TO bharathva_user;
```

#### Step 3: Update Configuration
```env
DB_URL=jdbc:postgresql://localhost:5432/bharathva
DB_USERNAME=bharathva_user
DB_PASSWORD=your_password
```

## Email Configuration

### Gmail SMTP Setup

#### Step 1: Enable 2-Factor Authentication
1. Go to Google Account Settings
2. Security section
3. Enable 2-Step Verification

#### Step 2: Generate App Password
1. Google Account Settings
2. Security > 2-Step Verification
3. App passwords
4. Select "Mail" and your device
5. Copy the 16-character password

#### Step 3: Configure Service
Update `backend/auth-service/.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_16_char_app_password
```

## JWT Secret Generation

Generate a secure JWT secret:

```bash
# Using OpenSSL
openssl rand -base64 64

# Using Python
python3 -c "import secrets; print(secrets.token_urlsafe(64))"
```

Update `backend/auth-service/.env`:
```env
JWT_SECRET=generated_secret_key_here
```

## Development Workflow

### Backend Development Cycle
1. Make code changes
2. Rebuild specific service: `docker-compose up --build auth-service`
3. View logs: `docker-compose logs -f auth-service`
4. Test endpoints with Postman or curl
5. Verify database changes

### Mobile Development Cycle
1. Make code changes
2. Expo automatically reloads
3. Test on simulator/device
4. Check console logs for errors
5. Verify API integration

## Port Configuration

### Default Ports
| Service | Port | Purpose |
|---------|------|---------|
| Eureka Discovery | 8761 | Service registry dashboard |
| Config Server | 8888 | Configuration management |
| API Gateway | 8080 | Main API entry point |
| Auth Service | 8081 | Authentication service |
| Tweet Service | 8082 | Tweet management (future) |
| User Service | 8083 | User management (future) |
| PostgreSQL | 5432 | Database (local only) |

### Changing Ports
Update the respective `.env` files:
```env
SERVER_PORT=new_port_number
```

## Troubleshooting

### Backend Issues

#### Services Won't Start
```bash
# Check if ports are in use
lsof -i :8080
lsof -i :8081
lsof -i :8761

# Kill processes if needed
kill -9 <PID>

# Clean Docker state
docker-compose down -v
docker system prune -a
docker-compose up --build
```

#### Database Connection Failed
```bash
# Verify database credentials in .env file
# Test connection directly
psql 'postgresql://user:password@host/database?sslmode=require'

# Check service logs
docker-compose logs auth-service
```

#### Service Registration Failed
```bash
# Ensure Discovery Service started first
docker-compose logs discovery-service

# Restart dependent services
docker-compose restart gateway-service auth-service
```

### Mobile Issues

#### Metro Bundler Issues
```bash
# Clear cache
npm start -- --clear

# Reset completely
rm -rf node_modules
npm install
npm start
```

#### API Connection Failed
```bash
# Verify backend is running
curl http://localhost:8080/api/auth/register/health

# Check IP address in config.ts matches your machine
ipconfig getifaddr en0

# Ensure mobile device/simulator is on same network
```

#### Expo Build Failed
```bash
# Clear Expo cache
expo start -c

# Reinstall dependencies
rm -rf node_modules
npm install
```

## Verification Checklist

### Backend Verification
- [ ] All Docker containers running: `docker ps`
- [ ] Eureka shows registered services: http://localhost:8761
- [ ] Health check succeeds: `curl http://localhost:8080/api/auth/register/health`
- [ ] Database connection successful (check logs)
- [ ] Email service configured (test OTP sending)

### Mobile Verification
- [ ] Dependencies installed: `npm install`
- [ ] Development server starts: `npm start`
- [ ] App loads on simulator/device
- [ ] API connection works (test login)
- [ ] SecureStore working (tokens persist)

## Next Steps

After successful setup:
1. Review [API Documentation](../api/authentication.md)
2. Understand [Database Schema](../architecture/database-schema.md)
3. Read [Development Guidelines](../development/guidelines.md)
4. Test with [Postman Collection](../../backend/POSTMAN_COLLECTION.json)

## Getting Help

If you encounter issues:
1. Check logs: `docker-compose logs -f [service-name]`
2. Review [Troubleshooting Guide](troubleshooting.md)
3. Verify environment configuration
4. Check service health endpoints

## Development Tools

### Recommended IDE Setup
- **Backend**: IntelliJ IDEA or VS Code with Java extensions
- **Mobile**: VS Code with React Native extensions
- **Database**: DBeaver or pgAdmin
- **API Testing**: Postman or Insomnia

### VS Code Extensions
- Java Extension Pack
- Spring Boot Extension Pack
- React Native Tools
- ESLint
- Prettier
- GitLens

### IntelliJ IDEA Plugins
- Spring Boot
- Lombok
- Docker
- Database Tools

## Performance Optimization

### Local Development
- Allocate sufficient Docker resources (4GB+ RAM)
- Use Docker layer caching
- Enable JVM optimization flags
- Use development profiles for faster startup

### Database Performance
- Run database on SSD storage
- Configure appropriate connection pool size
- Use database indexes effectively
- Monitor query performance

## Security Best Practices

### Development Environment
- Never commit `.env` files
- Use strong passwords for local databases
- Rotate JWT secrets periodically
- Keep dependencies updated
- Use HTTPS for production-like testing

### Code Security
- Validate all input data
- Use parameterized queries
- Implement proper error handling
- Avoid logging sensitive information
- Follow secure coding guidelines

