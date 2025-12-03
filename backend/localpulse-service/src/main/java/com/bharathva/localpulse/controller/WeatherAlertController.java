package com.bharathva.localpulse.controller;

import com.bharathva.localpulse.service.WeatherAlertService;
import com.bharathva.localpulse.service.WeatherAlertService.WeatherAlertResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/localpulse/weather-alerts")
@CrossOrigin(origins = "*")
public class WeatherAlertController {
    
    private static final Logger log = LoggerFactory.getLogger(WeatherAlertController.class);
    
    private final WeatherAlertService weatherAlertService;
    
    public WeatherAlertController(WeatherAlertService weatherAlertService) {
        this.weatherAlertService = weatherAlertService;
    }
    
    @GetMapping
    public ResponseEntity<WeatherAlertResponse> getWeatherAlerts(
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(required = false, defaultValue = "60.0") Double radius) {
        
        log.info("Weather alerts request: lat={}, lon={}, radius={}km", latitude, longitude, radius);
        
        if (latitude == null || longitude == null) {
            WeatherAlertResponse errorResponse = WeatherAlertResponse.error(
                    "Both latitude and longitude parameters are required");
            return ResponseEntity.badRequest().body(errorResponse);
        }
        
        // Cap radius at 100km for performance
        Double effectiveRadius = Math.min(radius, 100.0);
        
        WeatherAlertResponse response = weatherAlertService.getWeatherAlerts(latitude, longitude, effectiveRadius);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/health")
    public ResponseEntity<Object> health() {
        return ResponseEntity.ok(java.util.Map.of(
                "status", "UP",
                "service", "weather-alert-service",
                "message", "Weather alert service is running",
                "timestamp", System.currentTimeMillis()
        ));
    }
}
