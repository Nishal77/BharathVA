# Clean Supabase Database Configuration

## Overview

The news-ai-service now uses a clean, environment-based configuration for Supabase database connection. All connection details are loaded from `.env.local` file.

## Environment Variables

The service expects these variables in `backend/news-ai-service/.env.local`:

```bash
SUPABASE_DB_URL=jdbc:postgresql://[host]:5432/[database]?sslmode=require
SUPABASE_DB_USER=[database-username]
SUPABASE_DB_PASSWORD=[database-password]
SUPABASE_URL=[supabase-project-url]
SUPABASE_SERVICE_KEY=[service-role-key]
```

## Configuration Files

### 1. application.yml

Clean datasource configuration using environment variables:

```yaml
spring:
  datasource:
    url: ${SUPABASE_DB_URL:jdbc:postgresql://localhost:5432/postgres}
    username: ${SUPABASE_DB_USER:postgres}
    password: ${SUPABASE_DB_PASSWORD:postgres}
    driver-class-name: org.postgresql.Driver
```

### 2. DatabaseConfig.java

Minimal configuration class:

```java
@Configuration
@EnableJpaRepositories(basePackages = "com.bharathva.newsai.repository")
@EnableTransactionManagement
public class DatabaseConfig {
    // Spring Boot auto-configures DataSource from environment variables
}
```

### 3. DatabaseInitializationService.java

Handles:
- Database connection verification
- Table creation if needed
- Index creation
- Initial count logging

### 4. NewsStorageService.java

Handles:
- Transactional news article storage
- Duplicate detection
- Batch operations with explicit flush
- Error handling and logging

## Architecture

```
.env.local (Environment Variables)
    ↓
application.yml (Configuration)
    ↓
Spring Boot Auto-Configuration (DataSource)
    ↓
DatabaseConfig (JPA & Transaction Setup)
    ↓
DatabaseInitializationService (Table Setup)
    ↓
NewsStorageService (Data Operations)
```

## Key Features

1. **Environment-Based**: No hardcoded connection strings
2. **Auto-Configuration**: Spring Boot handles DataSource setup
3. **Transaction Management**: Proper @Transactional usage
4. **Error Handling**: Comprehensive logging and error handling
5. **Clean Separation**: Configuration, initialization, and operations are separated

## Benefits

- ✅ Easy to change database without code changes
- ✅ Secure credential management via environment variables
- ✅ Production-ready with proper transaction handling
- ✅ Clean, maintainable code structure
- ✅ Automatic table initialization

## Usage

1. Set environment variables in `.env.local`
2. Start the service
3. Database connection is automatically established
4. Tables are created if they don't exist
5. News articles are stored with proper transactions

## Verification

Check logs for successful initialization:
```
Database configuration initialized - Using Supabase connection from environment variables
Database initialized successfully. Current news count: X
```

