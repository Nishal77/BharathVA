# News AI Service - Database Connection

## Active Connection String

**PostgreSQL URI:**
```
postgresql://postgres:Nishal@bharthva@db.trawrzkanhvxtupbjkcc.supabase.co:5432/postgres
```

**JDBC Format (Spring Boot):**
```
jdbc:postgresql://db.trawrzkanhvxtupbjkcc.supabase.co:5432/postgres?sslmode=require
```

## Configuration

### Environment File
Location: `backend/news-ai/.env.local`

```bash
SUPABASE_URL=jdbc:postgresql://db.trawrzkanhvxtupbjkcc.supabase.co:5432/postgres?sslmode=require
SUPABASE_USER=postgres
SUPABASE_PASSWORD=Nishal@bharthva
```

### Application Configuration
The `application.yml` is configured to automatically load `.env.local` files:

```yaml
spring:
  config:
    import: optional:file:.env[.properties],optional:file:.env.local[.properties]
  
  datasource:
    url: ${SUPABASE_URL:jdbc:postgresql://localhost:5432/postgres}
    username: ${SUPABASE_USER:postgres}
    password: ${SUPABASE_PASSWORD:postgres}
```

## Quick Test

### Test Connection
```bash
psql "postgresql://postgres:Nishal%40bharthva@db.trawrzkanhvxtupbjkcc.supabase.co:5432/postgres?sslmode=require"
```

**Note**: Password `@` must be URL-encoded as `%40` in connection URI.

### Check News Table
```sql
SELECT COUNT(*) FROM news;
SELECT id, title, source, pub_date FROM news ORDER BY pub_date DESC LIMIT 10;
```

## Status

✅ Configuration loaded from `.env.local`
✅ Connection string: Supabase (`db.trawrzkanhvxtupbjkcc.supabase.co`)
✅ Application ready to connect

