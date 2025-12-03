# BharathVA Backend Testing Guide

## Running Unit Tests

### Auth Service Tests

#### Run All Tests
```bash
cd backend/auth-service
./run-tests.sh
```

Or using Maven directly:
```bash
cd backend/auth-service
mvn clean test
```

#### Run Specific Test Class
```bash
cd backend/auth-service
mvn test -Dtest=AuthenticationServiceTest
mvn test -Dtest=AuthenticationControllerTest
```

#### Run Tests with Coverage
```bash
cd backend/auth-service
mvn clean test jacoco:report
```

## Test Structure

### Unit Tests
- **AuthenticationServiceTest**: Tests the core login logic
  - Valid credentials
  - Invalid credentials
  - Email normalization
  - Session management
  - Error handling

- **AuthenticationControllerTest**: Tests the REST API endpoints
  - Successful login
  - Invalid credentials
  - Request validation
  - Header extraction

### Integration Tests
- **ProfileImageUploadIntegrationTest**: Tests file upload functionality

## Test Coverage

The tests cover:
- ✅ Email normalization (lowercase, trim)
- ✅ Password validation
- ✅ Email verification check
- ✅ Session creation and cleanup
- ✅ Token generation
- ✅ Error handling
- ✅ IP address and device info extraction
- ✅ Request validation

## Running Backend Services

### Start All Services
```bash
cd backend
./start-services.sh
```

### Check Service Health
```bash
cd backend
./health-check.sh
```

### View Service Logs
```bash
cd backend
docker-compose logs -f auth-service
```

## Manual Testing

### Test Login Endpoint
```bash
# Local
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-IP-Address: 192.168.0.49" \
  -H "X-Device-Info: iOS 18.6 | iPhone" \
  -d '{
    "email": "nishal08@gmail.com",
    "password": "YourPassword123"
  }'

# Network (for mobile app)
curl -X POST http://192.168.0.49:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-IP-Address: 192.168.0.49" \
  -H "X-Device-Info: iOS 18.6 | iPhone" \
  -d '{
    "email": "nishal08@gmail.com",
    "password": "YourPassword123"
  }'
```

### Test Health Endpoint
```bash
curl http://localhost:8080/api/auth/register/health
```

## Troubleshooting

### Tests Fail to Compile
```bash
# Clean and rebuild
cd backend/auth-service
mvn clean install
```

### Services Won't Start
```bash
# Check Docker
docker ps

# Check logs
cd backend
docker-compose logs

# Restart services
docker-compose down
docker-compose up --build
```

### Database Connection Issues
```bash
# Test database connection
psql 'postgresql://neondb_owner:npg_Dtqy63pieawz@ep-summer-bar-a1bv6p9u-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'

# Check database URL in application.yml
cat backend/auth-service/src/main/resources/application.yml | grep datasource
```


