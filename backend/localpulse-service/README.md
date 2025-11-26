# BharathVA LocalPulse Service

A Spring Boot microservice for location-based news, weather, and local updates in India. This service integrates with OpenWeather API to provide real-time weather information based on user's geolocation.

## Features

- **Location-Based Weather**: Real-time weather data based on user's GPS coordinates in India
- **City-Based Weather**: Weather lookup by city name
- **Geolocation Service**: Reverse geocoding to get city, state, and district from coordinates
- **Caching**: Intelligent caching of weather data to reduce API calls
- **Error Handling**: Comprehensive error handling with retry logic
- **India-Specific**: Validates coordinates are within India bounds

## Technology Stack

- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **Database**: PostgreSQL (NeonDB)
- **Weather API**: OpenWeather Map API
- **Geolocation**: OpenStreetMap Nominatim API
- **Caching**: Caffeine Cache
- **HTTP Client**: Spring WebFlux WebClient
- **Service Discovery**: Netflix Eureka

## Configuration

### Environment Variables

Create a `.env.local` file in the `backend/localpulse-service` directory:

```bash
# OpenWeather API Key (Required)
OPENWEATHER_API_KEY=your_openweather_api_key_here

# Database Configuration
NEON_DB_URL=jdbc:postgresql://your-neon-host/neondb?sslmode=require
NEON_DB_USER=your_db_user
NEON_DB_PASSWORD=your_db_password

# Server Configuration
SERVER_PORT=8084

# Eureka Configuration
EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://discovery-service:8761/eureka/
EUREKA_INSTANCE_PREFERIPADDRESS=true
EUREKA_INSTANCE_INSTANCEID=localpulse-service:8084
```

### Getting OpenWeather API Key

1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Get your free API key from the dashboard
3. Add it to `.env.local` as `OPENWEATHER_API_KEY`

## API Endpoints

### Get Weather by Coordinates

```
GET /api/localpulse/weather/coordinates?latitude={lat}&longitude={lon}
```

**Parameters:**
- `latitude` (required): Latitude coordinate (6.0 to 37.0 for India)
- `longitude` (required): Longitude coordinate (68.0 to 97.0 for India)

**Response:**
```json
{
  "success": true,
  "message": "Weather data retrieved successfully",
  "data": {
    "location": {
      "city": "Mumbai",
      "state": "Maharashtra",
      "district": "Mumbai",
      "country": "India",
      "latitude": 19.0760,
      "longitude": 72.8777
    },
    "current": {
      "temperature": 28.5,
      "feelsLike": 30.2,
      "pressure": 1013,
      "humidity": 65,
      "windSpeed": 5.2,
      "windDirection": 180,
      "visibility": 10000,
      "timestamp": 1701234567
    },
    "condition": {
      "main": "Clear",
      "description": "clear sky",
      "icon": "01d",
      "code": 800
    },
    "wind": {
      "speed": 5.2,
      "direction": 180,
      "gust": null
    },
    "temperature": {
      "current": 28.5,
      "feelsLike": 30.2,
      "min": 25.0,
      "max": 32.0
    },
    "humidity": {
      "value": 65,
      "level": "Moderate"
    },
    "visibility": {
      "value": 10000,
      "description": "Excellent"
    },
    "timezone": "19800",
    "sunrise": 1701234000,
    "sunset": 1701276000
  },
  "timestamp": 1701234567
}
```

### Get Weather by City

```
GET /api/localpulse/weather/city?city={cityName}
```

**Parameters:**
- `city` (required): City name (e.g., "Mumbai", "Delhi", "Bangalore")

**Response:** Same format as coordinates endpoint

### Health Check

```
GET /api/localpulse/weather/health
```

## Usage Examples

### From Mobile App (React Native)

```typescript
// Get weather by coordinates
const getWeatherByLocation = async (latitude: number, longitude: number) => {
  const response = await fetch(
    `${API_BASE_URL}/api/localpulse/weather/coordinates?latitude=${latitude}&longitude=${longitude}`
  );
  const data = await response.json();
  return data;
};

// Get weather by city
const getWeatherByCity = async (cityName: string) => {
  const response = await fetch(
    `${API_BASE_URL}/api/localpulse/weather/city?city=${cityName}`
  );
  const data = await response.json();
  return data;
};
```

## Architecture

### Service Components

1. **WeatherService**: Core service that integrates with OpenWeather API
   - Handles API calls with retry logic
   - Implements caching (10-minute TTL)
   - Validates Indian coordinates
   - Error handling and fallback strategies

2. **LocationService**: Reverse geocoding service
   - Converts coordinates to city/state/district
   - Uses OpenStreetMap Nominatim API
   - Validates coordinates are within India

3. **WeatherController**: REST API endpoints
   - `/weather/coordinates` - Get weather by GPS coordinates
   - `/weather/city` - Get weather by city name
   - `/weather/health` - Health check endpoint

### Caching Strategy

- Weather data is cached for 10 minutes per location
- Cache key: `{latitude}_{longitude}`
- Reduces API calls and improves response time
- Cache is automatically invalidated after TTL

### Error Handling

- **Invalid Coordinates**: Returns error if coordinates are outside India
- **API Errors**: Handles 401 (invalid key), 429 (rate limit), 5xx (server errors)
- **Timeout**: 10-second timeout with retry logic
- **Retry Logic**: Automatic retry for 5xx errors and timeouts (max 3 retries)

## Building and Running

### Local Development

```bash
# Build the service
mvn clean package

# Run with environment variables
export OPENWEATHER_API_KEY=your_key_here
java -jar target/localpulse-service-1.0.0.jar
```

### Docker

```bash
# Build Docker image
docker build -t localpulse-service .

# Run container
docker run -p 8084:8084 \
  -e OPENWEATHER_API_KEY=your_key_here \
  localpulse-service
```

## Integration with Gateway

Add to `gateway-service/src/main/resources/application.yml`:

```yaml
routes:
  - id: localpulse-service
    uri: ${LOCALPULSE_SERVICE_URI:lb://LOCALPULSE-SERVICE}
    predicates:
      - Path=/api/localpulse/**
    filters:
      - StripPrefix=0
```

## Performance

- **Response Time**: < 500ms (with cache), < 2s (without cache)
- **Cache Hit Rate**: ~80% (for frequently accessed locations)
- **API Rate Limit**: Respects OpenWeather API limits (60 calls/minute for free tier)
- **Concurrent Requests**: Handles 100+ concurrent requests

## Security

- Input validation for coordinates (India bounds check)
- API key stored in environment variables
- No sensitive data in logs
- CORS enabled for mobile app

## Monitoring

- Health check endpoint: `/api/localpulse/weather/health`
- Actuator endpoints: `/actuator/health`, `/actuator/metrics`
- Logging: Structured logging with SLF4J

## Future Enhancements

- Weather forecasts (5-day, hourly)
- Weather alerts and notifications
- Historical weather data
- Multiple location support
- Weather widgets for different Indian cities

