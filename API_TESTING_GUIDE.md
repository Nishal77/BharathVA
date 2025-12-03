# BharathVA LocalPulse API Testing Guide

## Postman Collection

Import the file `BharathVA_API_Collection.postman_collection.json` into Postman to test all endpoints.

## API Endpoints

### Base URLs
- **Gateway (Recommended)**: `http://192.168.0.203:8080`
- **Direct Service (Debug)**: `http://192.168.0.203:8085`

---

## 1. Traffic Alerts API

### Endpoint
```
GET /api/localpulse/traffic/alerts
```

### Query Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `latitude` | number | Yes | Latitude coordinate (India: 6.0 - 37.0) | 13.2743 |
| `longitude` | number | Yes | Longitude coordinate (India: 68.0 - 97.0) | 74.7597 |
| `radius` | number | No | Search radius in km (default: 60, max: 60) | 60 |

### Example Requests

#### Udupi (Your Location)
```
GET http://192.168.0.203:8080/api/localpulse/traffic/alerts?latitude=13.2743&longitude=74.7597&radius=60
```

#### Bangalore (Test with Known Incidents)
```
GET http://192.168.0.203:8080/api/localpulse/traffic/alerts?latitude=12.9716&longitude=77.5946&radius=60
```

#### Mumbai
```
GET http://192.168.0.203:8080/api/localpulse/traffic/alerts?latitude=19.0760&longitude=72.8777&radius=60
```

### Response Format
```json
{
  "success": true,
  "message": "Traffic alerts fetched successfully",
  "alerts": [
    {
      "id": "here_532713230950598308",
      "type": "road_closure",
      "title": "Road closure ahead",
      "description": "Road is temporarily closed. Please use alternate routes. (2.3km away)",
      "severity": "high",
      "location": "Closed",
      "city": null,
      "state": null,
      "latitude": 12.96505,
      "longitude": 77.61439,
      "timestamp": 1764680345,
      "roadName": null
    }
  ],
  "totalCount": 3
}
```

### Response Details
- **Returns**: Top 2-3 high-priority traffic alerts within 60km radius
- **Alert Types**: Accident, Traffic Jam, Road Closure, Construction, Diversion, Hazard, etc.
- **Severity**: `high`, `medium`, `low`
- **Distance**: Included in description (e.g., "2.3km away")

### Error Responses

#### Invalid Coordinates (Outside India)
```json
{
  "success": false,
  "message": "Coordinates must be within India",
  "alerts": null,
  "totalCount": 0
}
```

#### No Alerts Found
```json
{
  "success": true,
  "message": "Traffic alerts fetched successfully",
  "alerts": [],
  "totalCount": 0
}
```

---

## 2. Weather Alerts API

### Endpoint
```
GET /api/localpulse/weather-alerts
```

### Query Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `latitude` | number | Yes | Latitude coordinate (India: 6.0 - 37.0) | 13.2743 |
| `longitude` | number | Yes | Longitude coordinate (India: 68.0 - 97.0) | 74.7597 |
| `radius` | number | No | Search radius in km (default: 60, max: 100) | 60 |

### Example Requests

#### Udupi (Your Location)
```
GET http://192.168.0.203:8080/api/localpulse/weather-alerts?latitude=13.2743&longitude=74.7597&radius=60
```

#### Bangalore
```
GET http://192.168.0.203:8080/api/localpulse/weather-alerts?latitude=12.9716&longitude=77.5946&radius=60
```

### Response Format
```json
{
  "success": true,
  "message": "Success",
  "alerts": [
    {
      "id": "temp_warm_1764684290",
      "type": "warm_weather",
      "title": "Warm Weather",
      "description": "Temperature is 28.1 C, feels like 31.9 C. Stay hydrated.",
      "severity": "low",
      "latitude": 13.2743,
      "longitude": 74.7597,
      "timestamp": 1764684290,
      "category": "temperature",
      "icon": "sun",
      "locationName": "Unknown"
    },
    {
      "id": "humidity_1764684290",
      "type": "humidity_advisory",
      "title": "High Humidity",
      "description": "Humidity is 77% with 28.1 C temperature. Stay hydrated and take breaks in shade.",
      "severity": "low",
      "latitude": 13.2743,
      "longitude": 74.7597,
      "timestamp": 1764684290,
      "category": "humidity",
      "icon": "droplets",
      "locationName": "Unknown"
    }
  ],
  "totalCount": 2,
  "locationName": "Unknown"
}
```

### Response Details
- **Returns**: 1-3 weather alerts based on current conditions
- **Alert Types**: Warm Weather, High Humidity, Extreme Heat, Cold Warning, Rain, etc.
- **Severity**: `high`, `medium`, `low`

---

## Testing Checklist

### ✅ Traffic Alerts
- [ ] Test with Udupi coordinates (your location)
- [ ] Test with Bangalore coordinates (known to have incidents)
- [ ] Test with invalid coordinates (outside India)
- [ ] Verify response contains 0-3 high-priority alerts
- [ ] Check that alerts include distance information
- [ ] Verify alert types (accident, jam, closure, etc.)

### ✅ Weather Alerts
- [ ] Test with Udupi coordinates
- [ ] Test with Bangalore coordinates
- [ ] Verify response contains 1-3 weather alerts
- [ ] Check alert types (temperature, humidity, etc.)
- [ ] Verify severity levels

### ✅ Error Handling
- [ ] Test with coordinates outside India bounds
- [ ] Test with missing parameters
- [ ] Verify error messages are clear

---

## Quick Test Commands (cURL)

### Traffic Alerts - Udupi
```bash
curl "http://192.168.0.203:8080/api/localpulse/traffic/alerts?latitude=13.2743&longitude=74.7597&radius=60"
```

### Traffic Alerts - Bangalore (Has incidents)
```bash
curl "http://192.168.0.203:8080/api/localpulse/traffic/alerts?latitude=12.9716&longitude=77.5946&radius=60"
```

### Weather Alerts - Udupi
```bash
curl "http://192.168.0.203:8080/api/localpulse/weather-alerts?latitude=13.2743&longitude=74.7597&radius=60"
```

### Pretty Print JSON
```bash
curl "http://192.168.0.203:8080/api/localpulse/traffic/alerts?latitude=12.9716&longitude=77.5946&radius=60" | jq .
```

---

## Common India City Coordinates

| City | Latitude | Longitude |
|------|----------|-----------|
| Udupi | 13.2743 | 74.7597 |
| Bangalore | 12.9716 | 77.5946 |
| Mumbai | 19.0760 | 72.8777 |
| Delhi | 28.6139 | 77.2090 |
| Chennai | 13.0827 | 80.2707 |
| Kolkata | 22.5726 | 88.3639 |
| Hyderabad | 17.3850 | 78.4867 |
| Pune | 18.5204 | 73.8567 |

---

## Notes

1. **Traffic Alerts**: Uses both HERE API (primary) and MapMyIndia (fallback)
   - HERE API: Max 50km radius
   - MapMyIndia: Max 10km radius
   - Returns top 3 high-priority alerts

2. **Weather Alerts**: Uses Tomorrow.io API
   - Default 60km radius
   - Returns 1-3 alerts based on current conditions

3. **Coordinate Validation**: 
   - Must be within India bounds (lat: 6-37, lng: 68-97)
   - Invalid coordinates return error response

4. **Caching**: Responses are cached for 5 minutes

---

## Troubleshooting

### No Traffic Alerts
- **Udupi**: Normal - smaller cities may have no incidents
- **Bangalore/Mumbai**: Should have alerts - if not, check API keys

### Invalid Coordinates Error
- Ensure coordinates are within India bounds
- Check if using simulator/emulator with default location
- Use real device or set valid India coordinates in simulator

### 503 Service Unavailable
- Check if gateway service is running
- Check if localpulse-service is registered with Eureka
- Try direct service URL (port 8085)

### 404 Not Found
- Verify endpoint path is correct
- Check if service is running
- Verify gateway routing configuration

