# Supabase Database Configuration

## Environment Variables

The service uses the following environment variables from `.env.local`:

```bash
SUPABASE_DB_URL=jdbc:postgresql://[host]:5432/[database]?sslmode=require
SUPABASE_DB_USER=[username]
SUPABASE_DB_PASSWORD=[password]
SUPABASE_URL=[supabase-project-url]
SUPABASE_SERVICE_KEY=[service-role-key]
```

## Configuration

### application.yml

The datasource configuration reads from environment variables:

```yaml
spring:
  datasource:
    url: ${SUPABASE_DB_URL:jdbc:postgresql://localhost:5432/postgres}
    username: ${SUPABASE_DB_USER:postgres}
    password: ${SUPABASE_DB_PASSWORD:postgres}
```

### DatabaseConfig.java

Clean configuration class that:
- Enables JPA repositories
- Enables transaction management
- Uses Spring Boot auto-configuration for DataSource

## Connection Flow

1. Environment variables loaded from `.env.local`
2. Spring Boot auto-configures DataSource using variables
3. DatabaseInitializationService verifies connection and creates table if needed
4. NewsStorageService handles all database operations with proper transactions

## Clean Architecture

- **Configuration**: Environment-based, no hardcoded values
- **Connection**: Managed by Spring Boot auto-configuration
- **Transactions**: Properly managed with @Transactional
- **Error Handling**: Comprehensive logging and error handling
- **Initialization**: Automatic table creation on startup

## Verification

After starting the service, check logs for:
```
Database configuration initialized - Using Supabase connection from environment variables
Database initialized successfully. Current news count: X
```

