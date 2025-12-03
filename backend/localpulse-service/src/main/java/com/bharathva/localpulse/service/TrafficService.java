package com.bharathva.localpulse.service;

import com.bharathva.localpulse.dto.TrafficAlertResponse;
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
import java.util.*;
import java.util.stream.Collectors;

/**
 * Traffic Service that fetches real-time traffic alerts from multiple providers.
 * Uses HERE as primary source with MapMyIndia as fallback.
 * Implements proper error handling, caching, and deduplication.
 * 
 * Supported incident types:
 * - Accident / Crash / Collision
 * - Heavy traffic / Traffic jam / Congestion
 * - Sudden slowdown
 * - Road closure / Lane closure
 * - Diversion / Detour
 * - Construction / Road work
 * - Weather hazards (fog, rain, waterlogging)
 * - Obstructions (tree fallen, broken vehicle, debris)
 * - Police activity / VIP movement
 * - Landslide / Flood
 * - Events causing delays
 */
@Service
public class TrafficService {
    
    private static final Logger log = LoggerFactory.getLogger(TrafficService.class);
    
    // API Keys
    @Value("${mapmyindia.api.key:}")
    private String mapMyIndiaApiKey;
    
    @Value("${here.api.key:}")
    private String hereApiKey;
    
    // WebClients for different providers
    private final WebClient mapMyIndiaClient;
    private final WebClient hereClient;
    
    // API Base URLs
    private static final String MAPMYINDIA_TRAFFIC_BASE_URL = "https://traffic.mapmyindia.com/v1";
    private static final String HERE_TRAFFIC_BASE_URL = "https://data.traffic.hereapi.com/v7";
    
    // Configuration constants
    private static final int API_TIMEOUT_SECONDS = 15;
    private static final double MAX_RADIUS_KM = 150.0; // Support up to 150km radius
    private static final double DEFAULT_RADIUS_KM = 100.0; // Default to 100km for larger coverage
    private static final double HERE_MAX_RADIUS_KM = 50.0; // HERE API max radius is 50km
    private static final double MAPMYINDIA_MAX_RADIUS_KM = 10.0; // MapMyIndia recommends max 10km
    private static final int MAX_ALERTS_TO_RETURN = 5; // Return up to 5 alerts to cover more cities
    private static final double GRID_SEARCH_RADIUS = 50.0; // Use 50km for each grid cell
    
    // High priority incident types (sorted by priority)
    private static final Set<String> HIGH_PRIORITY_TYPES = Set.of(
            "accident", "road_closure", "landslide", "flood", "police_activity",
            "vip_movement", "obstruction", "hazard"
    );
    
    private static final Set<String> MEDIUM_PRIORITY_TYPES = Set.of(
            "traffic_jam", "congestion", "construction", "road_work", "diversion",
            "lane_closure", "weather", "event"
    );
    
    public TrafficService(WebClient.Builder webClientBuilder) {
        this.mapMyIndiaClient = webClientBuilder.clone()
                .baseUrl(MAPMYINDIA_TRAFFIC_BASE_URL)
                .defaultHeader("Accept", "application/json")
                .defaultHeader("User-Agent", "BharathVA-LocalPulse/1.0")
                .build();
        
        this.hereClient = webClientBuilder.clone()
                .baseUrl(HERE_TRAFFIC_BASE_URL)
                .defaultHeader("Accept", "application/json")
                .defaultHeader("User-Agent", "BharathVA-LocalPulse/1.0")
                .build();
    }
    
    /**
     * Main entry point for fetching traffic alerts.
     * Tries HERE first (better coverage), then MapMyIndia as fallback.
     * Returns only high-priority alerts (2-3 max).
     */
    @Cacheable(value = "traffic", key = "#latitude + '_' + #longitude + '_' + #radius", unless = "#result == null || !#result.isSuccess()")
    public TrafficAlertResponse getTrafficAlerts(Double latitude, Double longitude, Double radius) {
        // Validate input coordinates
        if (latitude == null || longitude == null) {
            log.error("Invalid coordinates: lat={}, lon={}", latitude, longitude);
            return TrafficAlertResponse.error("Latitude and longitude are required");
        }
        
        if (!isValidIndianCoordinates(latitude, longitude)) {
            log.warn("Coordinates outside India: lat={}, lon={}", latitude, longitude);
            return TrafficAlertResponse.error("Coordinates must be within India");
        }
        
        // Normalize radius (default 60km, max 60km)
        double searchRadius = normalizeRadius(radius);
        
        log.info("Fetching traffic alerts: lat={}, lon={}, radius={}km", latitude, longitude, searchRadius);
        
        List<TrafficAlertResponse.TrafficAlert> allAlerts = new ArrayList<>();
        boolean hereSuccess = false;
        boolean mapMyIndiaSuccess = false;
        
        // Try HERE API first (better coverage for India)
        // For areas larger than 50km, use grid-based search
        if (isApiKeyValid(hereApiKey)) {
            try {
                List<TrafficAlertResponse.TrafficAlert> hereAlerts;
                
                if (searchRadius > HERE_MAX_RADIUS_KM) {
                    // Use grid-based approach for larger areas
                    log.info("Search radius {}km exceeds HERE limit (50km), using grid-based search", searchRadius);
                    hereAlerts = fetchFromHereGrid(latitude, longitude, searchRadius);
                } else {
                    // Single API call for smaller areas
                    hereAlerts = fetchFromHere(latitude, longitude, searchRadius);
                }
                
                if (hereAlerts != null && !hereAlerts.isEmpty()) {
                    allAlerts.addAll(hereAlerts);
                    hereSuccess = true;
                    log.info("HERE returned {} alerts (from {}km radius)", hereAlerts.size(), searchRadius);
                } else {
                    log.info("HERE returned no alerts");
                }
            } catch (Exception e) {
                log.warn("HERE API failed: {}", e.getMessage());
            }
        }
        
        // Try MapMyIndia as fallback or complementary source
        // MapMyIndia recommends max 10km radius
        if (isApiKeyValid(mapMyIndiaApiKey)) {
            try {
                double mapMyIndiaRadius = Math.min(searchRadius, MAPMYINDIA_MAX_RADIUS_KM);
                List<TrafficAlertResponse.TrafficAlert> mapMyIndiaAlerts = 
                    fetchFromMapMyIndia(latitude, longitude, mapMyIndiaRadius);
                if (mapMyIndiaAlerts != null && !mapMyIndiaAlerts.isEmpty()) {
                    allAlerts.addAll(mapMyIndiaAlerts);
                    mapMyIndiaSuccess = true;
                    log.info("MapMyIndia returned {} alerts", mapMyIndiaAlerts.size());
                } else {
                    log.info("MapMyIndia returned no alerts");
                }
            } catch (Exception e) {
                log.warn("MapMyIndia API failed: {}", e.getMessage());
            }
        }
        
        // If no API keys configured
        if (!isApiKeyValid(hereApiKey) && !isApiKeyValid(mapMyIndiaApiKey)) {
            log.warn("No traffic API keys configured");
            return TrafficAlertResponse.success(new ArrayList<>());
        }
        
        // If both APIs failed, return empty success
        if (!hereSuccess && !mapMyIndiaSuccess && allAlerts.isEmpty()) {
            log.info("No alerts from any API source");
            return TrafficAlertResponse.success(new ArrayList<>());
        }
        
        // Process: filter high-priority, deduplicate, sort, limit to 3
        List<TrafficAlertResponse.TrafficAlert> processedAlerts = processAlerts(allAlerts, latitude, longitude);
        
        log.info("Returning {} high-priority traffic alerts", processedAlerts.size());
        return TrafficAlertResponse.success(processedAlerts);
    }
    
    /**
     * Fetch traffic incidents from HERE Traffic API.
     * HERE has better coverage for India and supports larger radius.
     */
    private List<TrafficAlertResponse.TrafficAlert> fetchFromHere(Double latitude, Double longitude, Double radiusKm) {
        // HERE uses circle with center and radius in meters
        String location = String.format("%.6f,%.6f", latitude, longitude);
        int radiusMeters = (int) (radiusKm * 1000);
        
        log.debug("HERE request: location={}, radius={}m", location, radiusMeters);
        
        try {
            HereResponse response = hereClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/incidents")
                            .queryParam("in", "circle:" + location + ";r=" + radiusMeters)
                            .queryParam("apiKey", hereApiKey)
                            .queryParam("locationReferencing", "shape")
                            .build())
                    .retrieve()
                    .bodyToMono(HereResponse.class)
                    .timeout(Duration.ofSeconds(API_TIMEOUT_SECONDS))
                    .block();
            
            if (response != null && response.getResults() != null) {
                return response.getResults().stream()
                        .filter(Objects::nonNull)
                        .map(incident -> convertHereIncident(incident, latitude, longitude))
                        .filter(Objects::nonNull)
                        .collect(Collectors.toList());
            }
            
            return new ArrayList<>();
            
        } catch (WebClientResponseException e) {
            int status = e.getStatusCode().value();
            String body = e.getResponseBodyAsString();
            
            if (status == 401 || status == 403) {
                log.warn("HERE authentication failed");
            } else if (status == 429) {
                log.warn("HERE rate limit exceeded");
            } else {
                log.warn("HERE API error {}: {}", status, body);
            }
            return new ArrayList<>();
            
        } catch (Exception e) {
            log.warn("HERE request failed: {}", e.getMessage());
            return new ArrayList<>();
        }
    }
    
    /**
     * Fetch traffic incidents from HERE API using grid-based approach for large areas.
     * Makes multiple API calls in a strategic pattern to cover areas larger than 50km.
     */
    private List<TrafficAlertResponse.TrafficAlert> fetchFromHereGrid(Double latitude, Double longitude, Double radiusKm) {
        List<TrafficAlertResponse.TrafficAlert> allAlerts = new ArrayList<>();
        
        // Use strategic points: center + 4 cardinal directions + 4 diagonal directions
        // This gives good coverage with minimal API calls (9 calls max)
        List<double[]> gridPoints = new ArrayList<>();
        
        // Calculate offset distance - use 60% of radius for spacing to ensure overlap
        double offsetKm = radiusKm * 0.6;
        double deltaLat = offsetKm / 111.0; // ~111 km per degree latitude
        double deltaLng = offsetKm / (111.0 * Math.cos(Math.toRadians(latitude)));
        
        // Center point
        gridPoints.add(new double[]{latitude, longitude});
        
        // Cardinal directions (N, S, E, W)
        gridPoints.add(new double[]{latitude + deltaLat, longitude}); // North
        gridPoints.add(new double[]{latitude - deltaLat, longitude}); // South
        gridPoints.add(new double[]{latitude, longitude + deltaLng}); // East
        gridPoints.add(new double[]{latitude, longitude - deltaLng}); // West
        
        // Diagonal directions (NE, NW, SE, SW) - use smaller offset
        double diagOffset = offsetKm * 0.7;
        double diagDeltaLat = diagOffset / 111.0;
        double diagDeltaLng = diagOffset / (111.0 * Math.cos(Math.toRadians(latitude)));
        
        gridPoints.add(new double[]{latitude + diagDeltaLat, longitude + diagDeltaLng}); // NE
        gridPoints.add(new double[]{latitude + diagDeltaLat, longitude - diagDeltaLng}); // NW
        gridPoints.add(new double[]{latitude - diagDeltaLat, longitude + diagDeltaLng}); // SE
        gridPoints.add(new double[]{latitude - diagDeltaLat, longitude - diagDeltaLng}); // SW
        
        // Filter to only valid India coordinates
        gridPoints.removeIf(point -> !isValidIndianCoordinates(point[0], point[1]));
        
        log.info("Grid search: {}km radius using {} strategic points", radiusKm, gridPoints.size());
        
        // Make API calls for each grid point
        for (double[] point : gridPoints) {
            try {
                List<TrafficAlertResponse.TrafficAlert> cellAlerts = 
                    fetchFromHere(point[0], point[1], GRID_SEARCH_RADIUS);
                if (cellAlerts != null && !cellAlerts.isEmpty()) {
                    allAlerts.addAll(cellAlerts);
                }
            } catch (Exception e) {
                log.warn("HERE grid cell fetch failed for ({}, {}): {}", 
                        point[0], point[1], e.getMessage());
            }
        }
        
        log.info("Grid search completed: collected {} total alerts from {} cells", 
                allAlerts.size(), gridPoints.size());
        
        return allAlerts;
    }
    
    /**
     * Fetch traffic incidents from MapMyIndia Traffic API.
     * MapMyIndia recommends smaller radius (max 10km).
     */
    private List<TrafficAlertResponse.TrafficAlert> fetchFromMapMyIndia(Double latitude, Double longitude, Double radiusKm) {
        String bbox = createBoundingBox(latitude, longitude, radiusKm);
        
        log.debug("MapMyIndia request: bbox={}", bbox);
        
        try {
            MapMyIndiaResponse response = mapMyIndiaClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/{apiKey}/incidents")
                            .queryParam("bbox", bbox)
                            .queryParam("t", "1")
                            .build(mapMyIndiaApiKey))
                    .retrieve()
                    .bodyToMono(MapMyIndiaResponse.class)
                    .timeout(Duration.ofSeconds(API_TIMEOUT_SECONDS))
                    .block();
            
            if (response != null && response.getIncidents() != null) {
                return response.getIncidents().stream()
                        .filter(Objects::nonNull)
                        .map(incident -> convertMapMyIndiaIncident(incident, latitude, longitude))
                        .filter(Objects::nonNull)
                        .collect(Collectors.toList());
            }
            
            return new ArrayList<>();
            
        } catch (WebClientResponseException e) {
            int status = e.getStatusCode().value();
            if (status == 401 || status == 403 || status == 412) {
                log.warn("MapMyIndia authentication/precondition failed");
            } else if (status == 429) {
                log.warn("MapMyIndia rate limit exceeded");
            } else {
                log.warn("MapMyIndia API error {}", status);
            }
            return new ArrayList<>();
            
        } catch (Exception e) {
            log.warn("MapMyIndia request failed: {}", e.getMessage());
            return new ArrayList<>();
        }
    }
    
    /**
     * Convert HERE incident to TrafficAlert with comprehensive type mapping.
     */
    private TrafficAlertResponse.TrafficAlert convertHereIncident(HereIncident incident, Double userLat, Double userLng) {
        if (incident == null || incident.getIncidentDetails() == null) return null;
        
        HereIncidentDetails details = incident.getIncidentDetails();
        
        // Get coordinates from location shape
        Double lat = userLat;
        Double lng = userLng;
        if (incident.getLocation() != null && incident.getLocation().getShape() != null) {
            HereShape shape = incident.getLocation().getShape();
            if (shape.getLinks() != null && !shape.getLinks().isEmpty()) {
                HereLink link = shape.getLinks().get(0);
                if (link.getPoints() != null && !link.getPoints().isEmpty()) {
                    HerePoint point = link.getPoints().get(0);
                    lat = point.getLat();
                    lng = point.getLng();
                }
            }
        }
        
        // Map HERE incident type to our normalized type
        String type = normalizeHereIncidentType(details.getType(), details.getRoadClosed());
        String severity = normalizeHereSeverity(details.getCriticality());
        
        // Get description text
        String descriptionText = details.getDescriptionText();
        
        // Generate human-readable title and description
        String title = generateHereTitle(type, descriptionText, details.getRoadClosed());
        String description = generateHereDescription(type, descriptionText, severity);
        
        // Calculate distance from user
        double distanceKm = calculateDistance(userLat, userLng, lat, lng);
        
        // Add distance context to description
        if (distanceKm > 0) {
            String distanceText = distanceKm < 1 ? 
                    String.format("%.0fm away", distanceKm * 1000) : 
                    String.format("%.1fkm away", distanceKm);
            description = description + " (" + distanceText + ")";
        }
        
        String incidentId = details.getId() != null ? details.getId() : 
                           (incident.getIncidentId() != null ? incident.getIncidentId() : UUID.randomUUID().toString());
        
        return new TrafficAlertResponse.TrafficAlert(
                "here_" + incidentId,
                type,
                title,
                description,
                severity,
                descriptionText != null ? descriptionText : "Area",
                null,
                null,
                lat,
                lng,
                details.getStartTime() != null ? parseHereTime(details.getStartTime()) : Instant.now().getEpochSecond(),
                null
        );
    }
    
    /**
     * Convert MapMyIndia incident to TrafficAlert.
     */
    private TrafficAlertResponse.TrafficAlert convertMapMyIndiaIncident(MapMyIndiaIncident incident, Double userLat, Double userLng) {
        if (incident == null) return null;
        
        Double lat = incident.getLatitude() != null ? incident.getLatitude() : userLat;
        Double lng = incident.getLongitude() != null ? incident.getLongitude() : userLng;
        
        String type = normalizeIncidentType(incident.getType());
        String severity = normalizeSeverity(incident.getSeverity());
        String location = getLocationString(incident.getStreet(), incident.getLocation(), incident.getCity());
        
        String title = generateTitle(type, location);
        String description = incident.getDescription() != null ? 
                incident.getDescription() : generateDescription(type, severity);
        
        // Calculate distance
        double distanceKm = calculateDistance(userLat, userLng, lat, lng);
        if (distanceKm > 0) {
            String distanceText = distanceKm < 1 ? 
                    String.format("%.0fm away", distanceKm * 1000) : 
                    String.format("%.1fkm away", distanceKm);
            description = description + " (" + distanceText + ")";
        }
        
        return new TrafficAlertResponse.TrafficAlert(
                "mmi_" + (incident.getId() != null ? incident.getId() : UUID.randomUUID().toString()),
                type,
                title,
                description,
                severity,
                location,
                incident.getCity(),
                incident.getState(),
                lat,
                lng,
                incident.getStartTime() != null ? incident.getStartTime() : Instant.now().getEpochSecond(),
                incident.getStreet()
        );
    }
    
    /**
     * Process alerts: filter high-priority, deduplicate, sort, limit to 3.
     */
    private List<TrafficAlertResponse.TrafficAlert> processAlerts(
            List<TrafficAlertResponse.TrafficAlert> alerts, Double userLat, Double userLng) {
        
        if (alerts == null || alerts.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Include all alerts regardless of priority to show alerts from all cities
        // Filter only invalid/null alerts
        List<TrafficAlertResponse.TrafficAlert> priorityAlerts = alerts.stream()
                .filter(alert -> {
                    if (alert == null || alert.getType() == null || alert.getSeverity() == null) {
                        return false;
                    }
                    String type = alert.getType().toLowerCase();
                    String severity = alert.getSeverity().toLowerCase();
                    // Include all valid alerts - high, medium, and low priority
                    // This ensures alerts from all cities in cities.json are shown
                    return HIGH_PRIORITY_TYPES.contains(type) || 
                           MEDIUM_PRIORITY_TYPES.contains(type) ||
                           "high".equals(severity) || 
                           "medium".equals(severity) ||
                           "low".equals(severity);
                })
                .collect(Collectors.toList());
        
        // Deduplicate by location proximity (500m threshold)
        List<TrafficAlertResponse.TrafficAlert> deduplicated = new ArrayList<>();
        for (TrafficAlertResponse.TrafficAlert alert : priorityAlerts) {
            boolean isDuplicate = false;
            for (TrafficAlertResponse.TrafficAlert existing : deduplicated) {
                if (areNearby(alert, existing, 0.5)) { // 500m threshold
                    // Keep the one with higher priority
                    if (getAlertPriority(alert) > getAlertPriority(existing)) {
                        deduplicated.remove(existing);
                        deduplicated.add(alert);
                    }
                    isDuplicate = true;
                    break;
                }
            }
            if (!isDuplicate) {
                deduplicated.add(alert);
            }
        }
        
        // Sort by priority (type + severity) then by distance
        deduplicated.sort((a, b) -> {
            int priorityCompare = getAlertPriority(b) - getAlertPriority(a);
            if (priorityCompare != 0) return priorityCompare;
            
            double distA = calculateDistance(userLat, userLng, a.getLatitude(), a.getLongitude());
            double distB = calculateDistance(userLat, userLng, b.getLatitude(), b.getLongitude());
            return Double.compare(distA, distB);
        });
        
        // Return top alerts sorted by priority and distance
        // This ensures alerts from all cities in cities.json are included if they exist
        return deduplicated.stream()
                .limit(MAX_ALERTS_TO_RETURN)
                .collect(Collectors.toList());
    }
    
    /**
     * Calculate alert priority score based on type and severity.
     */
    private int getAlertPriority(TrafficAlertResponse.TrafficAlert alert) {
        int score = 0;
        String type = alert.getType().toLowerCase();
        String severity = alert.getSeverity().toLowerCase();
        
        // Type-based priority
        if (HIGH_PRIORITY_TYPES.contains(type)) {
            score += 100;
        } else if (MEDIUM_PRIORITY_TYPES.contains(type)) {
            score += 50;
        }
        
        // Severity-based priority
        switch (severity) {
            case "high":
            case "critical":
                score += 30;
                break;
            case "medium":
            case "major":
                score += 20;
                break;
            case "low":
            case "minor":
                score += 10;
                break;
        }
        
        return score;
    }
    
    // ==================== HERE Type Mapping ====================
    
    private String normalizeHereIncidentType(String type, Boolean roadClosed) {
        if (roadClosed != null && roadClosed) {
            return "road_closure";
        }
        
        if (type == null) return "traffic";
        String lower = type.toLowerCase();
        
        switch (lower) {
            case "accident":
                return "accident";
            case "congestion":
            case "flow":
                return "traffic_jam";
            case "construction":
            case "road_work":
                return "construction";
            case "road_closure":
            case "lane_restriction":
                return "road_closure";
            case "weather":
                return "weather";
            case "disabled_vehicle":
                return "obstruction";
            case "mass_transit":
            case "planned_event":
                return "event";
            case "police":
                return "police_activity";
            case "hazard":
                return "hazard";
            default:
                return "traffic";
        }
    }
    
    private String generateHereTitle(String type, String descriptionText, Boolean roadClosed) {
        // Use description if it contains meaningful road info
        if (descriptionText != null && !descriptionText.equalsIgnoreCase("Closed") && descriptionText.length() > 5) {
            // Clean up the description for title
            String cleanDesc = descriptionText.replace(" - Closed", "").replace(" - closed", "");
            if (cleanDesc.length() > 50) {
                cleanDesc = cleanDesc.substring(0, 47) + "...";
            }
            return getTypePrefix(type) + " at " + cleanDesc;
        }
        
        // Generate generic title based on type
        switch (type) {
            case "accident":
                return "Accident reported nearby";
            case "road_closure":
                return "Road closure ahead";
            case "traffic_jam":
                return "Heavy traffic congestion";
            case "construction":
                return "Road work in progress";
            case "weather":
                return "Weather affecting traffic";
            case "obstruction":
                return "Obstruction on road";
            case "police_activity":
                return "Police activity ahead";
            case "event":
                return "Event causing delays";
            case "hazard":
                return "Road hazard detected";
            default:
                return "Traffic alert in your area";
        }
    }
    
    private String getTypePrefix(String type) {
        switch (type) {
            case "accident":
                return "Accident";
            case "road_closure":
                return "Road closed";
            case "traffic_jam":
                return "Heavy traffic";
            case "construction":
                return "Construction";
            case "weather":
                return "Weather hazard";
            case "obstruction":
                return "Obstruction";
            case "police_activity":
                return "Police activity";
            case "event":
                return "Event";
            case "hazard":
                return "Hazard";
            default:
                return "Traffic alert";
        }
    }
    
    private String generateHereDescription(String type, String descriptionText, String severity) {
        // Use original description if meaningful
        if (descriptionText != null && !descriptionText.equalsIgnoreCase("Closed") && descriptionText.length() > 10) {
            return descriptionText;
        }
        
        // Generate description based on type
        switch (type) {
            case "accident":
                return "An accident has been reported. Traffic may be affected. Consider alternate routes.";
            case "road_closure":
                return "Road is temporarily closed. Please use alternate routes.";
            case "traffic_jam":
                return "Heavy traffic congestion. Expect delays of 15-30 minutes.";
            case "construction":
                return "Road work in progress. Drive carefully and expect minor delays.";
            case "weather":
                return "Weather conditions affecting traffic. Drive with caution.";
            case "obstruction":
                return "Obstruction on road. Traffic may be slow.";
            case "police_activity":
                return "Police activity in the area. Follow instructions.";
            case "event":
                return "An event is causing traffic delays. Plan your route accordingly.";
            case "hazard":
                return "Road hazard detected. Drive carefully.";
            default:
                return "Traffic incident reported. Please drive carefully.";
        }
    }
    
    private String normalizeHereSeverity(Object criticality) {
        if (criticality == null) return "medium";
        
        if (criticality instanceof String) {
            String critStr = ((String) criticality).toLowerCase();
            if (critStr.contains("critical") || critStr.contains("major") || critStr.contains("high")) {
                return "high";
            } else if (critStr.contains("minor") || critStr.contains("low")) {
                return "low";
            }
            return "medium";
        }
        
        if (criticality instanceof Number) {
            int critInt = ((Number) criticality).intValue();
            if (critInt >= 3) return "high";
            if (critInt <= 1) return "low";
            return "medium";
        }
        
        return "medium";
    }
    
    // ==================== MapMyIndia Type Mapping ====================
    
    private String normalizeIncidentType(String type) {
        if (type == null) return "traffic";
        String lower = type.toLowerCase().trim();
        
        if (lower.contains("accident") || lower.contains("crash") || lower.contains("collision")) {
            return "accident";
        } else if (lower.contains("jam") || lower.contains("congestion") || lower.contains("slow")) {
            return "traffic_jam";
        } else if (lower.contains("road_work") || lower.contains("construction") || lower.contains("work")) {
            return "construction";
        } else if (lower.contains("closure") || lower.contains("closed") || lower.contains("blocked")) {
            return "road_closure";
        } else if (lower.contains("hazard") || lower.contains("danger")) {
            return "hazard";
        } else if (lower.contains("event") || lower.contains("rally") || lower.contains("procession")) {
            return "event";
        } else if (lower.contains("diversion") || lower.contains("detour")) {
            return "diversion";
        } else if (lower.contains("police") || lower.contains("vip")) {
            return "police_activity";
        } else if (lower.contains("weather") || lower.contains("fog") || lower.contains("rain") || lower.contains("flood")) {
            return "weather";
        } else if (lower.contains("landslide") || lower.contains("land")) {
            return "landslide";
        } else if (lower.contains("obstruction") || lower.contains("tree") || lower.contains("vehicle") || lower.contains("debris")) {
            return "obstruction";
        }
        return "traffic";
    }
    
    private String normalizeSeverity(String severity) {
        if (severity == null) return "medium";
        String lower = severity.toLowerCase().trim();
        
        if (lower.contains("high") || lower.contains("severe") || lower.contains("critical") || lower.equals("3") || lower.equals("4")) {
            return "high";
        } else if (lower.contains("low") || lower.contains("minor") || lower.equals("1")) {
            return "low";
        }
        return "medium";
    }
    
    private String getLocationString(String street, String location, String city) {
        if (street != null && !street.isEmpty()) return street;
        if (location != null && !location.isEmpty()) return location;
        if (city != null && !city.isEmpty()) return city + " area";
        return "Area";
    }
    
    private String generateTitle(String type, String location) {
        switch (type) {
            case "accident":
                return "Accident reported near " + location;
            case "traffic_jam":
                return "Heavy traffic at " + location;
            case "construction":
                return "Road work at " + location;
            case "road_closure":
                return "Road closure at " + location;
            case "hazard":
                return "Road hazard at " + location;
            case "event":
                return "Event causing delays at " + location;
            case "diversion":
                return "Traffic diversion at " + location;
            case "police_activity":
                return "Police activity at " + location;
            case "weather":
                return "Weather affecting " + location;
            case "landslide":
                return "Landslide alert at " + location;
            case "obstruction":
                return "Obstruction at " + location;
            default:
                return "Traffic alert at " + location;
        }
    }
    
    private String generateDescription(String type, String severity) {
        switch (type) {
            case "accident":
                return "An accident has been reported. Traffic is affected. Consider alternate routes.";
            case "traffic_jam":
                return "Heavy traffic congestion. Expect delays of 15-30 minutes.";
            case "construction":
                return "Road work in progress. Drive carefully and expect minor delays.";
            case "road_closure":
                return "Road is temporarily closed. Please use alternate routes.";
            case "hazard":
                return "Road hazard detected. Drive with caution.";
            case "event":
                return "An event is causing traffic delays. Plan your route accordingly.";
            case "diversion":
                return "Traffic diversion in place. Follow traffic signs.";
            case "police_activity":
                return "Police activity in the area. Follow instructions.";
            case "weather":
                return "Weather conditions affecting traffic. Drive carefully.";
            case "landslide":
                return "Landslide reported. Road may be partially blocked.";
            case "obstruction":
                return "Obstruction on road. Traffic may be slow.";
            default:
                return "Traffic incident reported. Please drive carefully.";
        }
    }
    
    // ==================== Helper Methods ====================
    
    private String createBoundingBox(Double lat, Double lng, Double radiusKm) {
        double deltaLat = radiusKm / 111.0;
        double deltaLng = radiusKm / (111.0 * Math.cos(Math.toRadians(lat)));
        
        double minLng = lng - deltaLng;
        double minLat = lat - deltaLat;
        double maxLng = lng + deltaLng;
        double maxLat = lat + deltaLat;
        
        return String.format("%.6f,%.6f,%.6f,%.6f", minLng, minLat, maxLng, maxLat);
    }
    
    private double normalizeRadius(Double radius) {
        if (radius == null || radius <= 0) return DEFAULT_RADIUS_KM;
        return Math.min(radius, MAX_RADIUS_KM);
    }
    
    private boolean isApiKeyValid(String apiKey) {
        return apiKey != null && !apiKey.trim().isEmpty();
    }
    
    private boolean isValidIndianCoordinates(Double lat, Double lng) {
        return lat >= 6.0 && lat <= 37.0 && lng >= 68.0 && lng <= 97.0;
    }
    
    private boolean areNearby(TrafficAlertResponse.TrafficAlert a, TrafficAlertResponse.TrafficAlert b, double thresholdKm) {
        if (a.getLatitude() == null || a.getLongitude() == null || 
            b.getLatitude() == null || b.getLongitude() == null) {
            return false;
        }
        double distance = calculateDistance(a.getLatitude(), a.getLongitude(), b.getLatitude(), b.getLongitude());
        return distance <= thresholdKm;
    }
    
    private double calculateDistance(Double lat1, Double lng1, Double lat2, Double lng2) {
        if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) return Double.MAX_VALUE;
        
        double earthRadius = 6371.0; // km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadius * c;
    }
    
    private long parseHereTime(String timeString) {
        try {
            return Instant.parse(timeString).getEpochSecond();
        } catch (Exception e) {
            return Instant.now().getEpochSecond();
        }
    }
    
    // ==================== DTO Classes for MapMyIndia ====================
    
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class MapMyIndiaResponse {
        @JsonProperty("incidents")
        private List<MapMyIndiaIncident> incidents;
        
        @JsonProperty("total")
        private Integer total;
        
        public List<MapMyIndiaIncident> getIncidents() { return incidents; }
        public void setIncidents(List<MapMyIndiaIncident> incidents) { this.incidents = incidents; }
        public Integer getTotal() { return total; }
        public void setTotal(Integer total) { this.total = total; }
    }
    
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class MapMyIndiaIncident {
        @JsonProperty("id")
        private String id;
        
        @JsonProperty("type")
        private String type;
        
        @JsonProperty("severity")
        private String severity;
        
        @JsonProperty("description")
        private String description;
        
        @JsonProperty("lat")
        private Double latitude;
        
        @JsonProperty("lng")
        private Double longitude;
        
        @JsonProperty("street")
        private String street;
        
        @JsonProperty("location")
        private String location;
        
        @JsonProperty("city")
        private String city;
        
        @JsonProperty("state")
        private String state;
        
        @JsonProperty("start_time")
        private Long startTime;
        
        @JsonProperty("end_time")
        private Long endTime;
        
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getSeverity() { return severity; }
        public void setSeverity(String severity) { this.severity = severity; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }
        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }
        public String getStreet() { return street; }
        public void setStreet(String street) { this.street = street; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getState() { return state; }
        public void setState(String state) { this.state = state; }
        public Long getStartTime() { return startTime; }
        public void setStartTime(Long startTime) { this.startTime = startTime; }
        public Long getEndTime() { return endTime; }
        public void setEndTime(Long endTime) { this.endTime = endTime; }
    }
    
    // ==================== DTO Classes for HERE ====================
    
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class HereResponse {
        @JsonProperty("results")
        private List<HereIncident> results;
        
        public List<HereIncident> getResults() { return results; }
        public void setResults(List<HereIncident> results) { this.results = results; }
    }
    
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class HereIncident {
        @JsonProperty("incidentId")
        private String incidentId;
        
        @JsonProperty("incidentDetails")
        private HereIncidentDetails incidentDetails;
        
        @JsonProperty("location")
        private HereLocation location;
        
        public String getIncidentId() { return incidentId; }
        public void setIncidentId(String incidentId) { this.incidentId = incidentId; }
        public HereIncidentDetails getIncidentDetails() { return incidentDetails; }
        public void setIncidentDetails(HereIncidentDetails incidentDetails) { this.incidentDetails = incidentDetails; }
        public HereLocation getLocation() { return location; }
        public void setLocation(HereLocation location) { this.location = location; }
    }
    
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class HereIncidentDetails {
        @JsonProperty("id")
        private String id;
        
        @JsonProperty("type")
        private String type;
        
        @JsonProperty("description")
        private HereLocalizedText description;
        
        @JsonProperty("summary")
        private HereLocalizedText summary;
        
        @JsonProperty("typeDescription")
        private HereLocalizedText typeDescription;
        
        @JsonProperty("criticality")
        private Object criticality;
        
        @JsonProperty("roadClosed")
        private Boolean roadClosed;
        
        @JsonProperty("startTime")
        private String startTime;
        
        @JsonProperty("endTime")
        private String endTime;
        
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public HereLocalizedText getDescription() { return description; }
        public void setDescription(HereLocalizedText description) { this.description = description; }
        public HereLocalizedText getSummary() { return summary; }
        public void setSummary(HereLocalizedText summary) { this.summary = summary; }
        public HereLocalizedText getTypeDescription() { return typeDescription; }
        public void setTypeDescription(HereLocalizedText typeDescription) { this.typeDescription = typeDescription; }
        public Object getCriticality() { return criticality; }
        public void setCriticality(Object criticality) { this.criticality = criticality; }
        public Boolean getRoadClosed() { return roadClosed; }
        public void setRoadClosed(Boolean roadClosed) { this.roadClosed = roadClosed; }
        public String getStartTime() { return startTime; }
        public void setStartTime(String startTime) { this.startTime = startTime; }
        public String getEndTime() { return endTime; }
        public void setEndTime(String endTime) { this.endTime = endTime; }
        
        public String getDescriptionText() {
            if (description != null && description.getValue() != null) {
                return description.getValue();
            }
            if (summary != null && summary.getValue() != null) {
                return summary.getValue();
            }
            if (typeDescription != null && typeDescription.getValue() != null) {
                return typeDescription.getValue();
            }
            return null;
        }
    }
    
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class HereLocalizedText {
        @JsonProperty("value")
        private String value;
        
        @JsonProperty("language")
        private String language;
        
        public String getValue() { return value; }
        public void setValue(String value) { this.value = value; }
        public String getLanguage() { return language; }
        public void setLanguage(String language) { this.language = language; }
    }
    
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class HereLocation {
        @JsonProperty("shape")
        private HereShape shape;
        
        public HereShape getShape() { return shape; }
        public void setShape(HereShape shape) { this.shape = shape; }
    }
    
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class HereShape {
        @JsonProperty("links")
        private List<HereLink> links;
        
        public List<HereLink> getLinks() { return links; }
        public void setLinks(List<HereLink> links) { this.links = links; }
    }
    
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class HereLink {
        @JsonProperty("points")
        private List<HerePoint> points;
        
        public List<HerePoint> getPoints() { return points; }
        public void setPoints(List<HerePoint> points) { this.points = points; }
    }
    
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class HerePoint {
        @JsonProperty("lat")
        private Double lat;
        
        @JsonProperty("lng")
        private Double lng;
        
        public Double getLat() { return lat; }
        public void setLat(Double lat) { this.lat = lat; }
        public Double getLng() { return lng; }
        public void setLng(Double lng) { this.lng = lng; }
    }
}
