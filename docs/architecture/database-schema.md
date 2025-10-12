# Database Schema

## Overview

BharathVA uses PostgreSQL as its primary database, hosted on Neon DB for production. The schema is designed for high performance, data integrity, and scalability.

## Schema Management

### Migration Tool
- **Flyway** for version-controlled database migrations
- Migrations located in `backend/auth-service/src/main/resources/db/migration/`
- Automatic execution on service startup
- Version tracking in `flyway_schema_history` table

### Naming Conventions
- **Tables**: snake_case (e.g., `user_sessions`)
- **Columns**: snake_case (e.g., `full_name`, `created_at`)
- **Primary Keys**: `id` (UUID type)
- **Foreign Keys**: `{table_name}_id` (e.g., `user_id`)
- **Indexes**: `idx_{table}_{column}` (e.g., `idx_users_email`)

## Core Tables

### users
Stores registered user account information.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone_number VARCHAR(15),
    country_code VARCHAR(5),
    date_of_birth DATE,
    password_hash VARCHAR(255) NOT NULL,
    is_email_verified BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

**Columns**:
- `id`: Unique identifier (UUID v4)
- `full_name`: User's full name
- `username`: Unique username (3-50 characters, lowercase, alphanumeric + underscore)
- `email`: Unique email address
- `phone_number`: Phone number without country code
- `country_code`: International dialing code (e.g., +91)
- `date_of_birth`: User's date of birth
- `password_hash`: BCrypt hashed password (strength 12)
- `is_email_verified`: Email verification status
- `created_at`: Account creation timestamp
- `updated_at`: Last modification timestamp

**Indexes**:
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_created_at ON users(created_at);
```

**Constraints**:
- `email` must be unique and valid email format
- `username` must be unique, 3-50 characters
- `password_hash` required and non-empty
- `full_name` required

### user_sessions
Tracks active login sessions with refresh tokens and device information.

```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    refresh_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    device_info VARCHAR(500),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_user_sessions_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
);
```

**Columns**:
- `id`: Unique session identifier
- `user_id`: Reference to users table
- `refresh_token`: Secure random token for token refresh
- `ip_address`: Client IP address (IPv4 or IPv6)
- `device_info`: Device and browser information
- `expires_at`: Session expiration timestamp
- `created_at`: Session creation timestamp
- `last_used_at`: Last token refresh timestamp

**Indexes**:
```sql
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_refresh_token ON user_sessions(refresh_token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_last_used_at ON user_sessions(last_used_at);
CREATE INDEX idx_user_sessions_ip_address ON user_sessions(ip_address);
CREATE INDEX idx_user_sessions_user_active ON user_sessions(user_id, expires_at);
```

**Foreign Keys**:
- `user_id` → `users(id)` with CASCADE DELETE

**Business Rules**:
- Each session has a unique refresh token
- Sessions expire after 7 days by default
- Multiple active sessions allowed per user
- Deleting user cascades to all sessions

### email_otps
Stores email verification OTPs with expiration.

```sql
CREATE TABLE email_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(150) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expiry TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

**Columns**:
- `id`: Unique OTP record identifier
- `email`: Email address for OTP
- `otp_code`: 6-digit verification code
- `expiry`: OTP expiration timestamp
- `is_used`: Flag indicating if OTP was used
- `created_at`: OTP generation timestamp

**Indexes**:
```sql
CREATE INDEX idx_email_otps_email ON email_otps(email);
CREATE INDEX idx_email_otps_expiry ON email_otps(expiry);
CREATE INDEX idx_email_otps_email_expiry ON email_otps(email, expiry);
```

**Business Rules**:
- OTPs expire after 10 minutes
- Can only be used once (is_used flag)
- Old OTPs deleted after verification
- Automatic cleanup of expired OTPs

### registration_sessions
Stores temporary data during multi-step registration process.

```sql
CREATE TABLE registration_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(150) NOT NULL,
    full_name VARCHAR(100),
    phone_number VARCHAR(15),
    country_code VARCHAR(5),
    date_of_birth DATE,
    password_hash VARCHAR(255),
    username VARCHAR(50),
    is_email_verified BOOLEAN DEFAULT FALSE NOT NULL,
    current_step VARCHAR(50) NOT NULL,
    expiry TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

**Columns**:
- `id`: Unique session identifier
- `session_token`: Token for tracking registration progress
- `email`: User's email address
- `full_name`: Full name (populated in step 3)
- `phone_number`: Phone number (populated in step 3)
- `country_code`: Country code (populated in step 3)
- `date_of_birth`: Date of birth (populated in step 3)
- `password_hash`: Hashed password (populated in step 4)
- `username`: Chosen username (populated in step 5)
- `is_email_verified`: Email verification status
- `current_step`: Current registration step (EMAIL, OTP, DETAILS, PASSWORD, USERNAME, COMPLETED)
- `expiry`: Session expiration (24 hours)
- `created_at`: Session start timestamp
- `updated_at`: Last update timestamp

**Indexes**:
```sql
CREATE INDEX idx_registration_sessions_token ON registration_sessions(session_token);
CREATE INDEX idx_registration_sessions_email ON registration_sessions(email);
CREATE INDEX idx_registration_sessions_expiry ON registration_sessions(expiry);
```

**Business Rules**:
- Sessions expire after 24 hours
- Only one active session per email
- Session deleted after successful registration
- Session deleted if user already exists

## Relationships

### Entity Relationship Diagram

```
┌─────────────────┐
│     users       │
│  PK: id (UUID)  │
└────────┬────────┘
         │ 1
         │
         │ N
    ┌────▼─────────────────┐
    │   user_sessions      │
    │   PK: id (UUID)      │
    │   FK: user_id        │
    └──────────────────────┘

┌──────────────────────────┐
│   email_otps             │
│   PK: id (UUID)          │
│   - No FK relationships  │
└──────────────────────────┘

┌──────────────────────────┐
│ registration_sessions    │
│   PK: id (UUID)          │
│   - No FK relationships  │
└──────────────────────────┘
```

### Foreign Key Relationships

**user_sessions.user_id → users.id**
- Type: Many-to-One
- On Delete: CASCADE
- Purpose: Each session belongs to one user; user can have multiple sessions

## Data Types

### UUID Generation
All primary keys use PostgreSQL's `gen_random_uuid()` function:
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```

### Timestamps
All timestamp columns use PostgreSQL TIMESTAMP type:
- `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` for creation timestamps
- Automatically updated by JPA annotations (@CreationTimestamp, @UpdateTimestamp)

### String Lengths
- Email: 150 characters (supports long email addresses)
- Username: 50 characters
- Full name: 100 characters
- Password hash: 255 characters (BCrypt hash)
- Phone number: 15 characters (international format)

## Indexes and Performance

### Index Strategy
- Primary keys automatically indexed
- Foreign keys indexed for join performance
- Frequently queried columns indexed
- Composite indexes for common query patterns

### Query Optimization
```sql
-- Optimized for user lookup
SELECT * FROM users WHERE email = ?;  -- Uses idx_users_email

-- Optimized for active sessions
SELECT * FROM user_sessions 
WHERE user_id = ? AND expires_at > NOW();  -- Uses idx_user_sessions_user_active

-- Optimized for OTP verification
SELECT * FROM email_otps 
WHERE email = ? AND expiry > NOW();  -- Uses idx_email_otps_email_expiry
```

## Data Retention

### Automatic Cleanup
- **email_otps**: Deleted after verification or expiration
- **registration_sessions**: Deleted after completion or 24-hour expiry
- **user_sessions**: Deleted on logout or 7-day expiry

### Cleanup Procedures
Implement scheduled cleanup jobs:
```sql
-- Delete expired OTPs
DELETE FROM email_otps WHERE expiry < NOW();

-- Delete expired registration sessions
DELETE FROM registration_sessions WHERE expiry < NOW();

-- Delete expired user sessions
DELETE FROM user_sessions WHERE expires_at < NOW();
```

## Backup and Recovery

### Backup Strategy
- Full backup: Daily at 2 AM UTC
- Incremental backup: Every 6 hours
- Transaction log backup: Every 15 minutes
- Retention: 30 days for full backups

### Point-in-Time Recovery
Neon DB supports point-in-time recovery:
- Recovery window: Last 7 days
- RPO (Recovery Point Objective): 15 minutes
- RTO (Recovery Time Objective): 1 hour

## Security Considerations

### Password Storage
- BCrypt hashing with strength 12
- Salted automatically by BCrypt
- Never store plain text passwords
- Password validation on registration

### Token Storage
- Refresh tokens stored as secure random strings
- Access tokens (JWT) not stored in database
- Session expiration enforced
- Revocation through session deletion

### Data Encryption
- SSL/TLS for database connections
- Encrypted backups
- No sensitive data in logs
- Secure token generation

## Scaling Considerations

### Read Scaling
- Read replicas for read-heavy operations
- Caching layer for frequently accessed data
- Connection pooling (HikariCP)

### Write Scaling
- Partitioning by user_id for large tables
- Batch operations for bulk updates
- Asynchronous processing for non-critical writes

### Storage Optimization
- Regular VACUUM and ANALYZE
- Partition large tables by date
- Archive old data to separate storage

## Migration History

### V1: Initial Schema
- Created users table
- Created user_sessions table
- Created email_otps table
- Created registration_sessions table
- Added all indexes and constraints

### Future Migrations
- V2: Add user profile features
- V3: Add tweet-related tables
- V4: Add notification tables
- V5: Add analytics tables

## Monitoring

### Key Metrics
- Table sizes and growth rates
- Index usage statistics
- Query performance
- Connection pool utilization
- Lock contention
- Transaction rates

### Monitoring Queries
```sql
-- Table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Active connections
SELECT count(*) FROM pg_stat_activity;
```

## Best Practices

### Query Guidelines
1. Always use prepared statements
2. Add WHERE clauses to limit result sets
3. Use LIMIT for pagination
4. Create indexes for frequently filtered columns
5. Avoid SELECT * in production code

### Schema Modifications
1. Create migration script
2. Test in development environment
3. Backup production database
4. Execute during maintenance window
5. Verify migration success
6. Monitor performance impact

### Data Integrity
1. Use foreign key constraints
2. Implement NOT NULL where applicable
3. Use CHECK constraints for data validation
4. Maintain referential integrity
5. Regular data validation audits

