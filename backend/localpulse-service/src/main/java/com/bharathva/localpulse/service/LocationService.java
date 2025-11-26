package com.bharathva.localpulse.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.Map;

@Service
public class LocationService {
    
    private static final Logger log = LoggerFactory.getLogger(LocationService.class);

    private static final String NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/reverse";
    private static final String USER_AGENT = "BharathVA-LocalPulse/1.0";

    private final WebClient webClient;

    public LocationService() {
        this.webClient = WebClient.builder()
                .baseUrl(NOMINATIM_BASE_URL)
                .defaultHeader("User-Agent", USER_AGENT)
                .build();
    }

    public LocationInfo getLocationInfo(Double latitude, Double longitude) {
        if (latitude == null || longitude == null) {
            throw new IllegalArgumentException("Latitude and longitude are required");
        }

        if (!isValidIndianCoordinates(latitude, longitude)) {
            throw new IllegalArgumentException("Coordinates are not within India bounds");
        }

        try {
            log.info("Fetching location info for coordinates: lat={}, lon={}", latitude, longitude);

            Map<String, Object> response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .queryParam("format", "json")
                            .queryParam("lat", latitude)
                            .queryParam("lon", longitude)
                            .queryParam("zoom", "10")
                            .queryParam("addressdetails", "1")
                            .build())
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(5))
                    .retryWhen(Retry.backoff(2, Duration.ofMillis(500))
                            .filter(throwable -> throwable instanceof java.util.concurrent.TimeoutException))
                    .block();

            if (response == null) {
                log.warn("No location data found for coordinates: lat={}, lon={}", latitude, longitude);
                return LocationInfo.unknown();
            }

            return parseLocationInfo(response, latitude, longitude);

        } catch (Exception e) {
            log.error("Error fetching location info for coordinates: lat={}, lon={}", latitude, longitude, e);
            return LocationInfo.unknown();
        }
    }

    private boolean isValidIndianCoordinates(Double latitude, Double longitude) {
        return latitude >= 6.0 && latitude <= 37.0 &&
               longitude >= 68.0 && longitude <= 97.0;
    }

    @SuppressWarnings("unchecked")
    private LocationInfo parseLocationInfo(Map<String, Object> response, Double latitude, Double longitude) {
        Map<String, Object> address = (Map<String, Object>) response.get("address");
        
        if (address == null) {
            return LocationInfo.unknown();
        }

        String city = extractField(address, "city", "town", "village", "municipality");
        String state = extractField(address, "state", "region");
        String district = extractField(address, "district", "county", "state_district");
        String country = (String) address.getOrDefault("country", "India");

        return LocationInfo.builder()
                .city(city != null ? city : "Unknown")
                .state(state != null ? state : "Unknown")
                .district(district != null ? district : "Unknown")
                .country(country)
                .latitude(latitude)
                .longitude(longitude)
                .build();
    }

    @SuppressWarnings("unchecked")
    private String extractField(Map<String, Object> address, String... fieldNames) {
        for (String fieldName : fieldNames) {
            Object value = address.get(fieldName);
            if (value != null && !value.toString().isEmpty()) {
                return value.toString();
            }
        }
        return null;
    }

    public static class LocationInfo {
        private String city;
        private String state;
        private String district;
        private String country;
        private Double latitude;
        private Double longitude;

        public static LocationInfo unknown() {
            LocationInfo info = new LocationInfo();
            info.city = "Unknown";
            info.state = "Unknown";
            info.district = "Unknown";
            info.country = "India";
            return info;
        }

        public static LocationInfoBuilder builder() {
            return new LocationInfoBuilder();
        }

        public String getCity() { return city; }
        public String getState() { return state; }
        public String getDistrict() { return district; }
        public String getCountry() { return country; }
        public Double getLatitude() { return latitude; }
        public Double getLongitude() { return longitude; }

        public static class LocationInfoBuilder {
            private LocationInfo info = new LocationInfo();

            public LocationInfoBuilder city(String city) {
                info.city = city;
                return this;
            }

            public LocationInfoBuilder state(String state) {
                info.state = state;
                return this;
            }

            public LocationInfoBuilder district(String district) {
                info.district = district;
                return this;
            }

            public LocationInfoBuilder country(String country) {
                info.country = country;
                return this;
            }

            public LocationInfoBuilder latitude(Double latitude) {
                info.latitude = latitude;
                return this;
            }

            public LocationInfoBuilder longitude(Double longitude) {
                info.longitude = longitude;
                return this;
            }

            public LocationInfo build() {
                return info;
            }
        }
    }
}

