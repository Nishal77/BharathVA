package com.bharathva.localpulse.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WeatherAlertService {
    
    private static final Logger log = LoggerFactory.getLogger(WeatherAlertService.class);
    
    private final WebClient tomorrowWebClient;
    private final LocationService locationService;
    
    @Value("${tomorrow.api.key:}")
    private String apiKey;
    
    private static final String TOMORROW_API_BASE_URL = "https://api.tomorrow.io/v4";
    private static final double DEFAULT_RADIUS_KM = 60.0;
    
    public WeatherAlertService(WebClient.Builder webClientBuilder, LocationService locationService) {
        this.tomorrowWebClient = webClientBuilder
                .baseUrl(TOMORROW_API_BASE_URL)
                .defaultHeader("Accept", "application/json")
                .defaultHeader("Content-Type", "application/json")
                .build();
        this.locationService = locationService;
    }
    
    @Cacheable(value = "weatherAlerts", key = "#latitude + '_' + #longitude + '_' + #radius", unless = "#result == null || !#result.isSuccess()")
    public WeatherAlertResponse getWeatherAlerts(Double latitude, Double longitude, Double radius) {
        if (latitude == null || longitude == null) {
            log.error("Invalid coordinates provided: lat={}, lon={}", latitude, longitude);
            return WeatherAlertResponse.error("Latitude and longitude are required");
        }
        
        if (!isValidIndianCoordinates(latitude, longitude)) {
            log.warn("Coordinates outside India bounds: lat={}, lon={}", latitude, longitude);
            return WeatherAlertResponse.error("Coordinates must be within India");
        }
        
        if (apiKey == null || apiKey.isEmpty()) {
            log.warn("Tomorrow.io API key is not configured. Returning empty results.");
            return WeatherAlertResponse.success(new ArrayList<>(), null);
        }
        
        Double searchRadius = radius != null ? radius : DEFAULT_RADIUS_KM;
        
        try {
            // Get location info for the user's current position
            LocationService.LocationInfo locationInfo = locationService.getLocationInfo(latitude, longitude);
            String locationName = locationInfo.getCity() != null ? locationInfo.getCity() : 
                                 (locationInfo.getDistrict() != null ? locationInfo.getDistrict() : "Your Area");
            
            log.info("Fetching weather alerts for: {} (lat={}, lon={}, radius={}km)", 
                    locationName, latitude, longitude, searchRadius);
            
            // Fetch weather data for the user's location
            List<WeatherAlert> alerts = fetchWeatherAlerts(latitude, longitude, locationName);
            
            // If radius > 30km, also check nearby major points for regional alerts
            if (searchRadius >= 30) {
                alerts.addAll(fetchRegionalAlerts(latitude, longitude, searchRadius, locationName));
            }
            
            // Remove duplicates and sort by severity
            List<WeatherAlert> uniqueAlerts = alerts.stream()
                    .collect(Collectors.toMap(
                            WeatherAlert::getType,
                            alert -> alert,
                            (existing, replacement) -> 
                                getSeverityWeight(replacement.getSeverity()) > getSeverityWeight(existing.getSeverity()) 
                                    ? replacement : existing
                    ))
                    .values()
                    .stream()
                    .sorted((a, b) -> getSeverityWeight(b.getSeverity()) - getSeverityWeight(a.getSeverity()))
                    .limit(5) // Increased to 5 to show alerts from more cities
                    .collect(Collectors.toList());
            
            log.info("Successfully fetched {} weather alerts for {}", uniqueAlerts.size(), locationName);
            return WeatherAlertResponse.success(uniqueAlerts, locationName);
            
        } catch (WebClientResponseException e) {
            log.warn("Tomorrow.io API error: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            return WeatherAlertResponse.success(new ArrayList<>(), null);
            
        } catch (Exception e) {
            log.warn("Error fetching weather alerts: {}. Returning empty results.", e.getMessage());
            return WeatherAlertResponse.success(new ArrayList<>(), null);
        }
    }
    
    private List<WeatherAlert> fetchWeatherAlerts(Double latitude, Double longitude, String locationName) {
        List<WeatherAlert> alerts = new ArrayList<>();
        
        try {
            log.info("Calling Tomorrow.io API: lat={}, lon={}", latitude, longitude);
            
            // Fetch realtime weather data
            TomorrowRealtimeResponse response = tomorrowWebClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/weather/realtime")
                            .queryParam("location", latitude + "," + longitude)
                            .queryParam("apikey", apiKey)
                            .queryParam("units", "metric")
                            .build())
                    .retrieve()
                    .bodyToMono(TomorrowRealtimeResponse.class)
                    .timeout(Duration.ofSeconds(15))
                    .block();
            
            if (response != null && response.getData() != null && response.getData().getValues() != null) {
                TomorrowValues values = response.getData().getValues();
                alerts.addAll(generateWeatherAlerts(values, latitude, longitude, locationName));
            }
            
            return alerts;
            
        } catch (WebClientResponseException e) {
            log.warn("Tomorrow.io API returned status {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            return alerts;
        } catch (Exception e) {
            log.warn("Error fetching from Tomorrow.io API: {}", e.getMessage());
            return alerts;
        }
    }
    
    private List<WeatherAlert> fetchRegionalAlerts(Double centerLat, Double centerLon, Double radiusKm, String centerLocationName) {
        List<WeatherAlert> regionalAlerts = new ArrayList<>();
        
        // Calculate points at cardinal directions within radius
        // 1 degree latitude ~ 111 km
        double latDelta = (radiusKm * 0.7) / 111.0; // 70% of radius for sampling
        double lonDelta = (radiusKm * 0.7) / (111.0 * Math.cos(Math.toRadians(centerLat)));
        
        // Sample points: North, South, East, West (if within 60km radius)
        double[][] samplePoints = {
                {centerLat + latDelta, centerLon},      // North
                {centerLat - latDelta, centerLon},      // South
                {centerLat, centerLon + lonDelta},      // East
                {centerLat, centerLon - lonDelta},      // West
        };
        
        for (double[] point : samplePoints) {
            double lat = point[0];
            double lon = point[1];
            
            // Skip if outside India bounds
            if (!isValidIndianCoordinates(lat, lon)) {
                continue;
            }
            
            // Calculate distance from center
            double distance = calculateDistance(centerLat, centerLon, lat, lon);
            if (distance > radiusKm) {
                continue;
            }
            
            try {
                // Get location name for this point
                LocationService.LocationInfo pointLocation = locationService.getLocationInfo(lat, lon);
                String pointLocationName = pointLocation.getCity() != null ? pointLocation.getCity() : 
                                          (pointLocation.getDistrict() != null ? pointLocation.getDistrict() : null);
                
                // Skip if same location as center
                if (pointLocationName == null || pointLocationName.equalsIgnoreCase(centerLocationName)) {
                    continue;
                }
                
                // Fetch weather for this point
                TomorrowRealtimeResponse response = tomorrowWebClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/weather/realtime")
                                .queryParam("location", lat + "," + lon)
                                .queryParam("apikey", apiKey)
                                .queryParam("units", "metric")
                                .build())
                        .retrieve()
                        .bodyToMono(TomorrowRealtimeResponse.class)
                        .timeout(Duration.ofSeconds(10))
                        .block();
                
                if (response != null && response.getData() != null && response.getData().getValues() != null) {
                    TomorrowValues values = response.getData().getValues();
                    
                    // Only add high severity alerts from regional points
                    List<WeatherAlert> pointAlerts = generateWeatherAlerts(values, lat, lon, pointLocationName);
                    for (WeatherAlert alert : pointAlerts) {
                        if ("high".equalsIgnoreCase(alert.getSeverity())) {
                            alert.setDescription(alert.getDescription() + 
                                    String.format(" (%.0f km away in %s)", distance, pointLocationName));
                            regionalAlerts.add(alert);
                        }
                    }
                }
                
            } catch (Exception e) {
                log.debug("Error fetching regional weather for point ({}, {}): {}", lat, lon, e.getMessage());
            }
        }
        
        return regionalAlerts;
    }
    
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        // Haversine formula for distance calculation
        double R = 6371; // Earth's radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    
    private List<WeatherAlert> generateWeatherAlerts(TomorrowValues values, Double latitude, Double longitude, String locationName) {
        List<WeatherAlert> alerts = new ArrayList<>();
        long timestamp = Instant.now().getEpochSecond();
        String locSuffix = locationName != null && !locationName.equals("Unknown") ? " in " + locationName : "";
        
        // Check for extreme temperature
        Double temperature = values.getTemperature();
        Double temperatureApparent = values.getTemperatureApparent();
        if (temperature != null) {
            if (temperature >= 38) {
                alerts.add(new WeatherAlert(
                        "temp_extreme_high_" + timestamp,
                        "extreme_heat",
                        "Extreme Heat Warning" + locSuffix,
                        String.format("Temperature is %.1f C. Stay hydrated and avoid outdoor activities during peak hours.", temperature),
                        "high",
                        latitude,
                        longitude,
                        timestamp,
                        "temperature",
                        locationName
                ));
            } else if (temperature >= 32) {
                alerts.add(new WeatherAlert(
                        "temp_high_" + timestamp,
                        "heat_advisory",
                        "Heat Advisory" + locSuffix,
                        String.format("High temperature of %.1f C expected. Take precautions against heat.", temperature),
                        "medium",
                        latitude,
                        longitude,
                        timestamp,
                        "temperature",
                        locationName
                ));
            } else if (temperature >= 28 && temperatureApparent != null && temperatureApparent >= 30) {
                // Warm weather with high feels-like temperature
                alerts.add(new WeatherAlert(
                        "temp_warm_" + timestamp,
                        "warm_weather",
                        "Warm Weather" + locSuffix,
                        String.format("Temperature is %.1f C, feels like %.1f C. Stay hydrated.", temperature, temperatureApparent),
                        "low",
                        latitude,
                        longitude,
                        timestamp,
                        "temperature",
                        locationName
                ));
            } else if (temperature <= 10) {
                alerts.add(new WeatherAlert(
                        "temp_low_" + timestamp,
                        "cold_warning",
                        "Cold Weather Alert" + locSuffix,
                        String.format("Temperature is %.1f C. Dress warmly and protect from cold.", temperature),
                        "medium",
                        latitude,
                        longitude,
                        timestamp,
                        "temperature",
                        locationName
                ));
            }
        }
        
        // Check for heavy rain
        Double precipitationProbability = values.getPrecipitationProbability();
        Double rainIntensity = values.getRainIntensity();
        if (precipitationProbability != null && precipitationProbability >= 70) {
            String severity = precipitationProbability >= 90 ? "high" : "medium";
            String title = precipitationProbability >= 90 ? "Heavy Rain Warning" : "Rain Expected";
            alerts.add(new WeatherAlert(
                    "rain_" + timestamp,
                    "rain",
                    title + locSuffix,
                    String.format("%.0f%% chance of rain. Carry an umbrella and plan accordingly.", precipitationProbability),
                    severity,
                    latitude,
                    longitude,
                    timestamp,
                    "precipitation",
                    locationName
            ));
        } else if (rainIntensity != null && rainIntensity > 4) {
            alerts.add(new WeatherAlert(
                    "heavy_rain_" + timestamp,
                    "heavy_rain",
                    "Heavy Rainfall Alert" + locSuffix,
                    "Heavy rainfall detected. Expect waterlogging in low-lying areas.",
                    "high",
                    latitude,
                    longitude,
                    timestamp,
                    "precipitation",
                    locationName
            ));
        }
        
        // Check for high wind speed
        Double windSpeed = values.getWindSpeed();
        if (windSpeed != null) {
            if (windSpeed >= 50) {
                alerts.add(new WeatherAlert(
                        "wind_extreme_" + timestamp,
                        "wind_warning",
                        "Strong Wind Warning" + locSuffix,
                        String.format("Wind speed is %.1f km/h. Secure loose objects and avoid travel if possible.", windSpeed),
                        "high",
                        latitude,
                        longitude,
                        timestamp,
                        "wind",
                        locationName
                ));
            } else if (windSpeed >= 30) {
                alerts.add(new WeatherAlert(
                        "wind_high_" + timestamp,
                        "wind_advisory",
                        "Wind Advisory" + locSuffix,
                        String.format("Gusty winds of %.1f km/h expected. Drive carefully.", windSpeed),
                        "medium",
                        latitude,
                        longitude,
                        timestamp,
                        "wind",
                        locationName
                ));
            }
        }
        
        // Check for poor visibility
        Double visibility = values.getVisibility();
        if (visibility != null && visibility < 2) {
            String severity = visibility < 0.5 ? "high" : "medium";
            alerts.add(new WeatherAlert(
                    "visibility_" + timestamp,
                    "fog",
                    "Low Visibility Alert" + locSuffix,
                    String.format("Visibility is %.1f km. Drive with caution and use fog lights.", visibility),
                    severity,
                    latitude,
                    longitude,
                    timestamp,
                    "visibility",
                    locationName
            ));
        }
        
        // Check for high UV index
        Double uvIndex = values.getUvIndex();
        if (uvIndex != null && uvIndex >= 8) {
            String severity = uvIndex >= 11 ? "high" : "medium";
            alerts.add(new WeatherAlert(
                    "uv_" + timestamp,
                    "uv_warning",
                    "High UV Index Warning" + locSuffix,
                    String.format("UV index is %.0f. Use sunscreen and avoid prolonged sun exposure.", uvIndex),
                    severity,
                    latitude,
                    longitude,
                    timestamp,
                    "uv",
                    locationName
            ));
        }
        
        // Check for high humidity with heat
        Double humidity = values.getHumidity();
        if (humidity != null && humidity >= 75 && temperature != null && temperature >= 27) {
            String severity = (humidity >= 85 && temperature >= 30) ? "medium" : "low";
            alerts.add(new WeatherAlert(
                    "humidity_" + timestamp,
                    "humidity_advisory",
                    "High Humidity" + locSuffix,
                    String.format("Humidity is %.0f%% with %.1f C temperature. Stay hydrated and take breaks in shade.", humidity, temperature),
                    severity,
                    latitude,
                    longitude,
                    timestamp,
                    "humidity",
                    locationName
            ));
        }
        
        return alerts;
    }
    
    private int getSeverityWeight(String severity) {
        if (severity == null) return 0;
        switch (severity.toLowerCase()) {
            case "high": return 3;
            case "medium": return 2;
            case "low": return 1;
            default: return 0;
        }
    }
    
    private boolean isValidIndianCoordinates(Double latitude, Double longitude) {
        return latitude >= 6.0 && latitude <= 37.0 &&
               longitude >= 68.0 && longitude <= 97.0;
    }
    
    // Response DTOs
    public static class WeatherAlertResponse {
        private boolean success;
        private String message;
        private List<WeatherAlert> alerts;
        private int totalCount;
        private String locationName;
        
        public WeatherAlertResponse() {}
        
        public WeatherAlertResponse(boolean success, String message, List<WeatherAlert> alerts, String locationName) {
            this.success = success;
            this.message = message;
            this.alerts = alerts;
            this.totalCount = alerts != null ? alerts.size() : 0;
            this.locationName = locationName;
        }
        
        public static WeatherAlertResponse success(List<WeatherAlert> alerts, String locationName) {
            return new WeatherAlertResponse(true, "Success", alerts, locationName);
        }
        
        public static WeatherAlertResponse error(String message) {
            return new WeatherAlertResponse(false, message, new ArrayList<>(), null);
        }
        
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public List<WeatherAlert> getAlerts() { return alerts; }
        public void setAlerts(List<WeatherAlert> alerts) { this.alerts = alerts; }
        public int getTotalCount() { return totalCount; }
        public void setTotalCount(int totalCount) { this.totalCount = totalCount; }
        public String getLocationName() { return locationName; }
        public void setLocationName(String locationName) { this.locationName = locationName; }
    }
    
    public static class WeatherAlert {
        private String id;
        private String type;
        private String title;
        private String description;
        private String severity;
        private Double latitude;
        private Double longitude;
        private Long timestamp;
        private String category;
        private String icon;
        private String locationName;
        
        public WeatherAlert() {}
        
        public WeatherAlert(String id, String type, String title, String description, 
                           String severity, Double latitude, Double longitude, 
                           Long timestamp, String category, String locationName) {
            this.id = id;
            this.type = type;
            this.title = title;
            this.description = description;
            this.severity = severity;
            this.latitude = latitude;
            this.longitude = longitude;
            this.timestamp = timestamp;
            this.category = category;
            this.locationName = locationName;
            this.icon = getIconForType(type);
        }
        
        private String getIconForType(String type) {
            if (type == null) return "weather";
            switch (type.toLowerCase()) {
                case "extreme_heat":
                case "heat_advisory":
                    return "thermometer-sun";
                case "warm_weather":
                    return "sun";
                case "cold_warning":
                    return "thermometer-snowflake";
                case "rain":
                case "heavy_rain":
                    return "cloud-rain";
                case "wind_warning":
                case "wind_advisory":
                    return "wind";
                case "fog":
                    return "cloud-fog";
                case "uv_warning":
                    return "sun";
                case "humidity_advisory":
                    return "droplets";
                default:
                    return "cloud";
            }
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getSeverity() { return severity; }
        public void setSeverity(String severity) { this.severity = severity; }
        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }
        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }
        public Long getTimestamp() { return timestamp; }
        public void setTimestamp(Long timestamp) { this.timestamp = timestamp; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getIcon() { return icon; }
        public void setIcon(String icon) { this.icon = icon; }
        public String getLocationName() { return locationName; }
        public void setLocationName(String locationName) { this.locationName = locationName; }
    }
    
    // Tomorrow.io API Response DTOs
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TomorrowRealtimeResponse {
        @JsonProperty("data")
        private TomorrowData data;
        
        @JsonProperty("location")
        private TomorrowLocation location;
        
        public TomorrowData getData() { return data; }
        public void setData(TomorrowData data) { this.data = data; }
        public TomorrowLocation getLocation() { return location; }
        public void setLocation(TomorrowLocation location) { this.location = location; }
    }
    
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TomorrowData {
        @JsonProperty("time")
        private String time;
        
        @JsonProperty("values")
        private TomorrowValues values;
        
        public String getTime() { return time; }
        public void setTime(String time) { this.time = time; }
        public TomorrowValues getValues() { return values; }
        public void setValues(TomorrowValues values) { this.values = values; }
    }
    
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TomorrowValues {
        @JsonProperty("temperature")
        private Double temperature;
        
        @JsonProperty("temperatureApparent")
        private Double temperatureApparent;
        
        @JsonProperty("humidity")
        private Double humidity;
        
        @JsonProperty("windSpeed")
        private Double windSpeed;
        
        @JsonProperty("windGust")
        private Double windGust;
        
        @JsonProperty("precipitationProbability")
        private Double precipitationProbability;
        
        @JsonProperty("rainIntensity")
        private Double rainIntensity;
        
        @JsonProperty("visibility")
        private Double visibility;
        
        @JsonProperty("uvIndex")
        private Double uvIndex;
        
        @JsonProperty("cloudCover")
        private Double cloudCover;
        
        @JsonProperty("weatherCode")
        private Integer weatherCode;
        
        // Getters and setters
        public Double getTemperature() { return temperature; }
        public void setTemperature(Double temperature) { this.temperature = temperature; }
        public Double getTemperatureApparent() { return temperatureApparent; }
        public void setTemperatureApparent(Double temperatureApparent) { this.temperatureApparent = temperatureApparent; }
        public Double getHumidity() { return humidity; }
        public void setHumidity(Double humidity) { this.humidity = humidity; }
        public Double getWindSpeed() { return windSpeed; }
        public void setWindSpeed(Double windSpeed) { this.windSpeed = windSpeed; }
        public Double getWindGust() { return windGust; }
        public void setWindGust(Double windGust) { this.windGust = windGust; }
        public Double getPrecipitationProbability() { return precipitationProbability; }
        public void setPrecipitationProbability(Double precipitationProbability) { this.precipitationProbability = precipitationProbability; }
        public Double getRainIntensity() { return rainIntensity; }
        public void setRainIntensity(Double rainIntensity) { this.rainIntensity = rainIntensity; }
        public Double getVisibility() { return visibility; }
        public void setVisibility(Double visibility) { this.visibility = visibility; }
        public Double getUvIndex() { return uvIndex; }
        public void setUvIndex(Double uvIndex) { this.uvIndex = uvIndex; }
        public Double getCloudCover() { return cloudCover; }
        public void setCloudCover(Double cloudCover) { this.cloudCover = cloudCover; }
        public Integer getWeatherCode() { return weatherCode; }
        public void setWeatherCode(Integer weatherCode) { this.weatherCode = weatherCode; }
    }
    
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TomorrowLocation {
        @JsonProperty("lat")
        private Double lat;
        
        @JsonProperty("lon")
        private Double lon;
        
        public Double getLat() { return lat; }
        public void setLat(Double lat) { this.lat = lat; }
        public Double getLon() { return lon; }
        public void setLon(Double lon) { this.lon = lon; }
    }
}
