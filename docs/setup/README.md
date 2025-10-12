# Setup Documentation

## Overview

This directory contains setup and configuration guides for BharathVA platform development and deployment.

## Quick Start

### For First-Time Setup
1. [Local Development Setup](local-development.md) - Complete development environment setup
2. [Docker Setup](docker-setup.md) - Running services with Docker
3. [Environment Configuration](environment-configuration.md) - Configure environment variables

### For Specific Tasks
- Setting up backend services: [Docker Setup](docker-setup.md)
- Configuring database: [Database Setup](database-setup.md)
- Resolving issues: [Troubleshooting](troubleshooting.md)

## Contents

### Local Development Setup
[Local Development Setup](local-development.md) - Comprehensive guide for setting up local development environment.

**Covers**:
- Prerequisites and required software
- Backend setup with Docker
- Mobile application setup
- Database configuration
- Email service configuration
- JWT secret generation
- Verification procedures

### Docker Setup
[Docker Setup](docker-setup.md) - Detailed guide for Docker-based development and deployment.

**Covers**:
- Docker installation and configuration
- Docker Compose architecture
- Service configuration
- Container management
- Volume and network management
- Resource allocation
- Troubleshooting Docker issues

### Environment Configuration
Environment variable configuration for all services (to be documented).

**Planned Topics**:
- Environment file structure
- Service-specific variables
- Secrets management
- Environment-specific configurations
- Production vs development settings

### Database Setup
Database installation and configuration (to be documented).

**Planned Topics**:
- PostgreSQL installation
- Neon DB setup
- Connection configuration
- Migration execution
- Backup procedures

### Troubleshooting
[Troubleshooting](troubleshooting.md) - Common issues and solutions (to be documented).

**Planned Topics**:
- Service startup issues
- Database connection problems
- Port conflicts
- Build failures
- Network issues
- Performance problems

## Setup Workflow

### Initial Setup (New Developer)

1. **Clone Repository**
```bash
git clone <repository-url>
cd BharathVA
```

2. **Backend Setup**
```bash
cd backend
cp auth-service/.env.example auth-service/.env
# Edit .env with your credentials
docker-compose up --build
```

3. **Mobile Setup**
```bash
cd apps/mobile
npm install
# Update API_CONFIG with your IP
npm start
```

4. **Verify Setup**
```bash
# Backend health check
curl http://localhost:8080/api/auth/register/health

# Mobile app should load on simulator/device
```

### Configuration Steps

**Database**:
1. Create Neon DB account
2. Create new project
3. Copy connection string
4. Update auth-service/.env
5. Verify connection

**Email Service**:
1. Enable 2FA on Gmail account
2. Generate app password
3. Update SMTP credentials in .env
4. Test email sending

**JWT Configuration**:
1. Generate secure secret (64+ characters)
2. Update JWT_SECRET in .env
3. Configure token expiration times

## Environment Types

### Development
- Local database or Neon DB development instance
- All services running locally
- Debug logging enabled
- CORS open for all origins
- Hot reload enabled

### Staging
- Staging database instance
- Production-like configuration
- INFO level logging
- Restricted CORS
- Performance monitoring

### Production
- Production database with replicas
- Optimized configuration
- WARN/ERROR level logging
- Strict CORS policy
- Full monitoring and alerting

## Prerequisites by Role

### Backend Developer
- Docker Desktop
- Java 17 JDK
- Maven 3.9+
- PostgreSQL client
- Git

### Mobile Developer
- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator
- Git

### DevOps Engineer
- Docker and Docker Compose
- Kubernetes CLI (kubectl)
- Cloud provider CLI
- Database administration tools
- Monitoring tools

### QA Engineer
- Postman or similar API testing tool
- Mobile testing devices
- Database query tools
- Log analysis tools

## Verification Checklist

### Backend Verification
- [ ] All Docker containers running
- [ ] Eureka shows all services registered
- [ ] Health endpoints return 200
- [ ] Database connection successful
- [ ] Email service configured and tested
- [ ] API Gateway routing correctly

### Mobile Verification
- [ ] Dependencies installed successfully
- [ ] Development server starts without errors
- [ ] App loads on simulator/device
- [ ] API connection working
- [ ] Authentication flow functional
- [ ] SecureStore persisting tokens

### Database Verification
- [ ] Connection established
- [ ] Tables created via migration
- [ ] Indexes present
- [ ] Foreign keys working
- [ ] Sample data inserted successfully

## Next Steps

After completing setup:
1. Review [API Documentation](../api/authentication.md)
2. Understand [System Architecture](../architecture/system-architecture.md)
3. Read [Development Guidelines](../development/guidelines.md)
4. Start developing features

## Support Resources

### Documentation
- Architecture: `docs/architecture/`
- API specs: `docs/api/`
- Development: `docs/development/`
- Deployment: `docs/deployment/`

### Scripts and Tools
- Docker Compose: `backend/docker-compose.yml`
- Postman Collection: `backend/POSTMAN_COLLECTION.json`
- Test Scripts: `backend/*.sh`

### Getting Help
1. Check troubleshooting guide
2. Review service logs
3. Verify configuration
4. Test with provided scripts
5. Contact development team

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Review and rotate secrets quarterly
- Clean up old Docker images weekly
- Monitor disk space usage
- Review and optimize performance

### Periodic Reviews
- Architecture review: Quarterly
- Security audit: Quarterly
- Performance review: Monthly
- Documentation update: As needed
- Dependency audit: Monthly

