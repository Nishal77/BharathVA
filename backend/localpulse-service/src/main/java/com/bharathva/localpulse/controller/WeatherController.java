package com.bharathva.localpulse.controller;

import com.bharathva.localpulse.dto.WeatherResponse;
import com.bharathva.localpulse.service.WeatherService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/localpulse/weather")
@CrossOrigin(origins = "*")
public class WeatherController {
    
    private static final Logger log = LoggerFactory.getLogger(WeatherController.class);

    private final WeatherService weatherService;

    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @GetMapping("/coordinates")
    public ResponseEntity<WeatherResponse> getWeatherByCoordinates(
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude) {
        
        log.info("Weather request by coordinates: lat={}, lon={}", latitude, longitude);

        if (latitude == null || longitude == null) {
            WeatherResponse errorResponse = WeatherResponse.error(
                    "Both latitude and longitude parameters are required");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        WeatherResponse response = weatherService.getWeatherByCoordinates(latitude, longitude);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/city")
    public ResponseEntity<WeatherResponse> getWeatherByCity(
            @RequestParam(required = false) String city) {
        
        log.info("Weather request by city: {}", city);

        if (city == null || city.trim().isEmpty()) {
            WeatherResponse errorResponse = WeatherResponse.error("City name parameter is required");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        WeatherResponse response = weatherService.getWeatherByCity(city.trim());
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            HttpStatus status = response.getMessage().contains("not found") ? 
                    HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR;
            return ResponseEntity.status(status).body(response);
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Object> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "localpulse-weather-service",
                "message", "Weather service is running",
                "timestamp", System.currentTimeMillis()
        ));
    }
}

