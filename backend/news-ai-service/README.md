# BharathVA News AI Service

A Spring Boot microservice for aggregating news from multiple RSS feeds, summarizing content using Google Gemini AI, and serving news articles to the BharathVA mobile application.

## Features

- **RSS Feed Aggregation**: Fetches news from multiple Indian news sources
- **AI Summarization**: Uses Google Gemini API to generate summaries of news articles
- **Scheduled Processing**: Automatically fetches and processes news every 15 minutes
- **Automatic Cleanup**: Removes old news articles based on retention policy
- **REST API**: Provides endpoints for fetching news with pagination, filtering, and search
- **Supabase Integration**: Uses PostgreSQL database for persistent storage

## Architecture

### RSS Feeds
- India Today (General News)
- India Today (Video)
- Indian Express
- NDTV Top Stories
- Times of India Top Stories
- Hindustan Times Top News

### Technology Stack
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **Database**: PostgreSQL (Supabase)
- **RSS Parsing**: ROME Tools
- **AI Summarization**: Google Gemini API
- **HTTP Client**: Spring WebFlux WebClient
- **Service Discovery**: Netflix Eureka

## Configuration

### Environment Variables

Create a `.env` file in the `backend/news-ai` directory with the following variables:

```bash
# Supabase Database Configuration
SUPABASE_DB_URL=jdbc:postgresql://db.xxxxx.supabase.co:5432/postgres
SUPABASE_DB_USERNAME=postgres
SUPABASE_DB_PASSWORD=your_password

# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
GEMINI_TIMEOUT_SECONDS=30
GEMINI_MAX_RETRIES=3

# RSS Feed Configuration
RSS_FETCH_INTERVAL_MINUTES=900000  # 15 minutes in milliseconds
RSS_CONNECTION_TIMEOUT_SECONDS=10
RSS_READ_TIMEOUT_SECONDS=30
RSS_USER_AGENT=BharathVA-NewsBot/1.0

# News Cleanup Configuration
NEWS_CLEANUP_ENABLED=true
NEWS_RETENTION_DAYS=30
NEWS_CLEANUP_INTERVAL_HOURS=24

# Summarization Configuration
SUMMARIZATION_ENABLED=true
SUMMARIZATION_MAX_CONTENT_LENGTH=5000
SUMMARIZATION_LENGTH_WORDS=100

# Server Configuration
SERVER_PORT=8083

# Eureka Configuration
EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://discovery-service:8761/eureka/
EUREKA_INSTANCE_PREFERIPADDRESS=true
EUREKA_INSTANCE_INSTANCEID=news-ai-service:8083
```

## Database Schema

The service automatically creates the `news` table with the following structure:

- `id`: Primary key (auto-generated)
- `url`: Unique URL of the news article
- `title`: Article title
- `description`: Article description
- `content`: Full article content
- `summary`: AI-generated summary
- `imageUrl`: Article image URL
- `author`: Article author
- `category`: News category
- `source`: News source name
- `publishedAt`: Publication date
- `createdAt`: Record creation timestamp
- `updatedAt`: Record update timestamp

## API Endpoints

### Get All News
```
GET /api/news?page=0&size=20&category=Technology&source=India Today&search=keyword
```

**Query Parameters:**
- `page`: Page number (default: 0)
- `size`: Page size (default: 20)
- `category`: Filter by category (optional)
- `source`: Filter by source (optional)
- `search`: Search keyword (optional)

**Response:**
```json
{
  "content": [...],
  "totalElements": 100,
  "totalPages": 5,
  "currentPage": 0,
  "size": 20,
  "hasNext": true,
  "hasPrevious": false
}
```

### Get News by ID
```
GET /api/news/{id}
```

### Get Recent News
```
GET /api/news/recent?page=0&size=20&hours=24
```

**Query Parameters:**
- `page`: Page number (default: 0)
- `size`: Page size (default: 20)
- `hours`: Hours back to fetch (default: 24)

### Get Trending News
```
GET /api/news/trending?page=0&size=20
```

**Query Parameters:**
- `page`: Page number (default: 0)
- `size`: Page size (default: 20)

## Scheduled Tasks

### RSS Feed Fetching
- **Frequency**: Every 15 minutes (configurable)
- **Task**: Fetches news from all configured RSS feeds
- **Action**: Saves new articles to database and generates summaries

### News Cleanup
- **Frequency**: Daily at 2:00 AM
- **Task**: Removes news articles older than retention period (default: 30 days)
- **Configurable**: Can be disabled via `NEWS_CLEANUP_ENABLED`

## Building and Running

### Prerequisites
- Java 17+
- Maven 3.9+
- PostgreSQL database (Supabase)
- Google Gemini API key

### Build
```bash
cd backend/news-ai
mvn clean install
```

### Run
```bash
mvn spring-boot:run
```

Or run the JAR:
```bash
java -jar target/news-ai-1.0.0.jar
```

### Docker
```bash
docker build -t news-ai-service .
docker run -p 8083:8083 --env-file .env news-ai-service
```

## Development

### Project Structure
```
news-ai/
├── src/
│   ├── main/
│   │   ├── java/com/bharathva/newsai/
│   │   │   ├── config/          # Configuration classes
│   │   │   ├── controller/      # REST controllers
│   │   │   ├── model/           # Entity models
│   │   │   ├── repository/      # Data access layer
│   │   │   ├── service/         # Business logic
│   │   │   └── NewsAiApplication.java
│   │   └── resources/
│   │       └── application.yml  # Application configuration
│   └── test/                    # Test files
├── pom.xml                      # Maven dependencies
└── README.md                    # This file
```

## Integration with Mobile App

The mobile app (`apps/mobile`) uses the `newsService` to fetch news from this backend service. The service is configured in `apps/mobile/services/api/environment.ts`:

```typescript
newsServiceUrl: 'http://192.168.0.121:8083'  // Development
```

The mobile app's `ForYou.tsx` component fetches trending news and displays them in a card-based UI.

## Monitoring

### Health Check
```
GET /actuator/health
```

### Metrics
```
GET /actuator/metrics
```

## Troubleshooting

### RSS Feed Fetching Issues
- Check network connectivity
- Verify RSS feed URLs are accessible
- Check logs for specific feed errors
- Ensure User-Agent header is set correctly

### Gemini API Issues
- Verify API key is correct
- Check API quota limits
- Review timeout settings
- Check network connectivity to Google APIs

### Database Issues
- Verify Supabase connection string
- Check database credentials
- Ensure database exists and is accessible
- Review connection pool settings

## License

Part of the BharathVA platform.

