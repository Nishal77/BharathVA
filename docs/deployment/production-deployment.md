# Production Deployment Guide

## Overview

This guide covers deployment procedures for BharathVA platform to production environments. Follow these procedures for safe, reliable deployments.

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (unit, integration, e2e)
- [ ] Code reviewed and approved
- [ ] No console.log or debug statements
- [ ] Security audit completed
- [ ] Performance testing completed
- [ ] Documentation updated

### Environment
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] SSL certificates valid
- [ ] DNS records configured
- [ ] Monitoring and alerting setup
- [ ] Backup procedures verified

### Infrastructure
- [ ] Resources provisioned
- [ ] Load balancers configured
- [ ] Auto-scaling policies set
- [ ] Database replicas ready
- [ ] CDN configured
- [ ] Logging infrastructure ready

## Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────────┐
│              Load Balancer                   │
│         (SSL Termination)                    │
└────────────────┬────────────────────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
┌───▼────┐  ┌───▼────┐  ┌───▼────┐
│Gateway │  │Gateway │  │Gateway │
│Instance│  │Instance│  │Instance│
│   1    │  │   2    │  │   3    │
└───┬────┘  └───┬────┘  └───┬────┘
    │           │            │
    └───────────┼────────────┘
                │
    ┌───────────┼────────────┐
    │           │            │
┌───▼─────┐ ┌──▼──────┐ ┌──▼──────┐
│  Auth   │ │ Tweet   │ │  User   │
│ Service │ │ Service │ │ Service │
│ Cluster │ │ Cluster │ │ Cluster │
└───┬─────┘ └──┬──────┘ └──┬──────┘
    │          │           │
    └──────────┼───────────┘
               │
        ┌──────▼───────┐
        │  PostgreSQL  │
        │   (Primary)  │
        └──────┬───────┘
               │
        ┌──────▼───────┐
        │  PostgreSQL  │
        │  (Replica)   │
        └──────────────┘
```

## Deployment Procedures

### Backend Deployment

#### Step 1: Prepare Release
```bash
# Tag release version
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Build production artifacts
mvn clean package -Pprod -DskipTests
```

#### Step 2: Build Docker Images
```bash
# Build images with version tag
docker build -t bharathva/discovery-service:1.0.0 -f discovery-service/Dockerfile .
docker build -t bharathva/gateway-service:1.0.0 -f gateway-service/Dockerfile .
docker build -t bharathva/auth-service:1.0.0 -f auth-service/Dockerfile .

# Tag as latest
docker tag bharathva/auth-service:1.0.0 bharathva/auth-service:latest

# Push to registry
docker push bharathva/auth-service:1.0.0
docker push bharathva/auth-service:latest
```

#### Step 3: Database Migration
```bash
# Backup production database
pg_dump -h production-host -U user -d bharathva > backup-$(date +%Y%m%d).sql

# Test migration on staging
flyway -url=jdbc:postgresql://staging-host/bharathva migrate

# Apply to production
flyway -url=jdbc:postgresql://production-host/bharathva migrate
```

#### Step 4: Deploy Services
```bash
# Using Docker Compose
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Using Kubernetes
kubectl apply -f k8s/deployment.yaml
kubectl rollout status deployment/auth-service
```

#### Step 5: Verify Deployment
```bash
# Health checks
curl https://api.bharathva.com/api/auth/register/health

# Smoke tests
./scripts/smoke-test-prod.sh

# Monitor logs
kubectl logs -f deployment/auth-service
```

### Mobile Deployment

#### iOS Deployment

**Step 1: Prepare Build**
```bash
cd apps/mobile

# Update version
npm version patch  # or minor, major

# Install dependencies
npm install
```

**Step 2: Build for iOS**
```bash
# Using EAS Build
eas build --platform ios --profile production

# Or using Expo
expo build:ios
```

**Step 3: Submit to App Store**
```bash
# Download build
eas build:submit -p ios

# Or manual submission via App Store Connect
```

#### Android Deployment

**Step 1: Build APK/AAB**
```bash
# Using EAS Build
eas build --platform android --profile production

# Build AAB for Google Play
eas build --platform android --profile production --type app-bundle
```

**Step 2: Submit to Play Store**
```bash
# Submit via EAS
eas build:submit -p android

# Or manual upload to Play Console
```

## Environment Configuration

### Production Environment Variables

**Backend (auth-service)**:
```env
# Database
DB_URL=jdbc:postgresql://production-host:5432/bharathva?sslmode=require
DB_USERNAME=bharathva_prod_user
DB_PASSWORD=${DB_PASSWORD_SECRET}

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=${SMTP_USERNAME_SECRET}
SMTP_PASSWORD=${SMTP_PASSWORD_SECRET}

# JWT
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRATION=3600000
JWT_REFRESH_EXPIRATION=604800000

# Server
SERVER_PORT=8081

# Eureka
EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://discovery-service:8761/eureka/

# Logging
LOGGING_LEVEL_ROOT=INFO
LOGGING_LEVEL_COM_BHARATHVA=INFO
```

**Mobile**:
```typescript
// config.prod.ts
export const API_CONFIG = {
  BASE_URL: 'https://api.bharathva.com/api',
  TIMEOUT: 30000,
};
```

### Secrets Management

#### Using Docker Secrets
```bash
# Create secrets
echo "db_password" | docker secret create db_password -

# Use in docker-compose
services:
  auth-service:
    secrets:
      - db_password
secrets:
  db_password:
    external: true
```

#### Using Kubernetes Secrets
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: auth-secrets
type: Opaque
data:
  db-password: <base64-encoded>
  jwt-secret: <base64-encoded>
```

## Database Management

### Production Database Setup

**Primary Database**:
- Provider: Neon DB
- Region: ap-southeast-1 (Singapore)
- Instance type: Production tier
- Connection pooling: Enabled
- SSL: Required

**Read Replicas**:
- Count: 2 replicas
- Purpose: Read-heavy operations
- Lag tolerance: < 1 second
- Failover: Automatic

### Backup Strategy

**Automated Backups**:
- Full backup: Daily at 2 AM UTC
- Incremental: Every 6 hours
- Transaction logs: Every 15 minutes
- Retention: 30 days

**Manual Backup**:
```bash
# Before major changes
pg_dump -h host -U user -d bharathva > backup-before-deployment-$(date +%Y%m%d-%H%M%S).sql
```

**Restore Procedure**:
```bash
# Restore from backup
psql -h host -U user -d bharathva < backup-file.sql
```

### Migration Process

**Pre-Migration**:
1. Review migration scripts
2. Test on staging environment
3. Create database backup
4. Schedule maintenance window
5. Notify stakeholders

**Execute Migration**:
```bash
# Using Flyway
flyway -url=jdbc:postgresql://production-host/bharathva \
       -user=user \
       -password=password \
       migrate

# Verify migration
flyway -url=jdbc:postgresql://production-host/bharathva info
```

**Post-Migration**:
1. Verify schema changes
2. Run data validation queries
3. Check application logs
4. Monitor performance metrics
5. Confirm backup completed

## Monitoring and Observability

### Health Checks

**Endpoint Health**:
```bash
# Service health
curl https://api.bharathva.com/api/auth/register/health

# Detailed health (internal only)
curl http://internal-endpoint:8081/actuator/health
```

**Database Health**:
```sql
-- Check connection count
SELECT count(*) FROM pg_stat_activity;

-- Check replication lag
SELECT * FROM pg_stat_replication;
```

### Monitoring Setup

**Metrics Collection**:
- Prometheus for metrics collection
- Grafana for visualization
- Custom dashboards for each service
- Alert rules for critical metrics

**Key Metrics**:
- Request rate (requests per second)
- Error rate (errors per second)
- Response time (p50, p95, p99)
- Active sessions count
- Database connections
- JVM memory usage
- CPU utilization

**Alerting Rules**:
- Error rate > 1%
- Response time p95 > 500ms
- Database connections > 80% of pool
- Failed login attempts > 100 per minute
- Service down for > 1 minute

### Logging

**Centralized Logging**:
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Structured JSON logging
- Log retention: 30 days
- Log levels: INFO and above

**Log Aggregation**:
```bash
# Configure Logstash
input {
  docker {
    host => "unix:///var/run/docker.sock"
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
  }
}
```

## Scaling Procedures

### Horizontal Scaling

**Add Service Instances**:
```bash
# Docker Compose
docker-compose up --scale auth-service=3

# Kubernetes
kubectl scale deployment auth-service --replicas=3
```

**Auto-Scaling Configuration**:
```yaml
# Kubernetes HPA
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: auth-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: auth-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### Database Scaling

**Read Scaling**:
- Add read replicas for read-heavy operations
- Route read queries to replicas
- Monitor replication lag

**Write Scaling**:
- Optimize queries and indexes
- Implement write batching
- Consider sharding for extreme scale

## Rollback Procedures

### Application Rollback
```bash
# Docker
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build <previous-version>

# Kubernetes
kubectl rollout undo deployment/auth-service
kubectl rollout status deployment/auth-service
```

### Database Rollback
```bash
# Restore from backup
psql -h host -U user -d bharathva < backup-before-deployment.sql

# Or use point-in-time recovery
# (Neon DB specific procedure)
```

## Security Hardening

### Production Security

**SSL/TLS Configuration**:
- Use TLS 1.3
- Strong cipher suites only
- HSTS enabled
- Certificate pinning for mobile

**Network Security**:
- Firewall rules restricting access
- VPC/Private network for services
- No direct database access from internet
- DDoS protection enabled

**Application Security**:
- Rate limiting on all endpoints
- Request validation and sanitization
- SQL injection prevention
- XSS protection headers
- CSRF protection

**Secrets Management**:
- Use vault or secrets manager
- Rotate secrets regularly
- Never commit secrets to Git
- Audit access to secrets

## Disaster Recovery

### Recovery Procedures

**Service Failure**:
1. Automatic restart via container orchestration
2. Health checks route traffic away from failed instances
3. Alert on-call team
4. Investigate and resolve root cause

**Database Failure**:
1. Automatic failover to replica (if configured)
2. Restore from latest backup
3. Apply transaction logs for point-in-time recovery
4. Verify data integrity

**Complete System Failure**:
1. Activate disaster recovery plan
2. Restore from latest backups
3. Bring up services in correct order
4. Verify all integrations working
5. Conduct post-incident review

### Recovery Time Objectives

- **RTO (Recovery Time Objective)**: 1 hour
- **RPO (Recovery Point Objective)**: 15 minutes
- **Data Loss Tolerance**: Maximum 15 minutes

## Compliance and Auditing

### Audit Logging
- All authentication events logged
- User data access tracked
- Admin actions recorded
- Logs immutable and tamper-proof

### Data Retention
- User data: Indefinite (unless deleted by user)
- Logs: 90 days
- Backups: 30 days
- Session data: 7 days

### Compliance Requirements
- GDPR compliance for EU users
- Data localization for Indian users
- Right to data deletion
- Data export capabilities

## Performance Optimization

### Production Optimizations
- JVM tuning for memory and GC
- Database query optimization
- Connection pooling configuration
- CDN for static assets
- Caching layer implementation

### JVM Configuration
```bash
JAVA_OPTS="-Xmx2G -Xms1G \
           -XX:+UseG1GC \
           -XX:MaxGCPauseMillis=200 \
           -XX:+HeapDumpOnOutOfMemoryError \
           -XX:HeapDumpPath=/logs/heap-dump.hprof"
```

## Maintenance Windows

### Scheduled Maintenance
- Day: Sunday
- Time: 2:00 AM - 4:00 AM UTC
- Frequency: Monthly
- Notification: 7 days advance notice

### Zero-Downtime Deployment
- Blue-green deployment strategy
- Rolling updates with health checks
- Database migrations compatible with running code
- Feature flags for gradual rollout

## Cost Optimization

### Resource Right-Sizing
- Monitor actual resource usage
- Scale down during off-peak hours
- Use spot instances where applicable
- Implement auto-scaling policies

### Database Optimization
- Connection pooling
- Query optimization
- Index maintenance
- Data archival strategy

## Support and Incident Response

### On-Call Procedures
- 24/7 on-call rotation
- Incident response playbooks
- Escalation procedures
- Post-incident reviews

### Incident Response
1. Detect and alert
2. Assess severity
3. Mitigate immediate impact
4. Investigate root cause
5. Implement permanent fix
6. Document and review

## Post-Deployment

### Verification Steps
1. Health check all services
2. Run smoke tests
3. Verify database migrations
4. Check monitoring dashboards
5. Review error logs
6. Test critical user flows
7. Monitor performance metrics

### Monitoring Period
- Intensive monitoring for first 24 hours
- On-call team ready for issues
- Gradual traffic increase if needed
- Rollback plan ready

### Success Criteria
- All health checks passing
- Error rate < 0.1%
- Response time within SLA
- No critical alerts
- User feedback positive

## Rollout Strategy

### Phased Rollout
1. Deploy to 5% of traffic
2. Monitor for 1 hour
3. Increase to 25% if stable
4. Monitor for 2 hours
5. Increase to 50% if stable
6. Monitor for 4 hours
7. Full rollout if all metrics normal

### Feature Flags
```java
@ConditionalOnProperty(name = "feature.new-auth-flow.enabled", havingValue = "true")
public class NewAuthService {
    // New implementation
}
```

## Documentation Requirements

### Deployment Documentation
- Deployment date and time
- Version deployed
- Database changes
- Configuration changes
- Known issues
- Rollback procedure

### Change Log
Maintain CHANGELOG.md with:
- Added features
- Fixed bugs
- Breaking changes
- Deprecated features
- Security updates

## Contact Information

### Production Support
- On-Call: on-call@bharathva.com
- DevOps Team: devops@bharathva.com
- Emergency: +91-xxx-xxx-xxxx

### Escalation Path
1. On-Call Engineer
2. Senior DevOps Engineer
3. Engineering Manager
4. CTO

## Additional Resources
- [Monitoring Setup](monitoring.md)
- [Backup and Recovery](backup-recovery.md)
- [Docker Deployment](docker-deployment.md)
- [Environment Management](environment-management.md)

