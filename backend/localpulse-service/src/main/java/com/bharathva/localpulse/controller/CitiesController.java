package com.bharathva.localpulse.controller;

import com.bharathva.localpulse.service.CitiesService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/localpulse/cities")
@CrossOrigin(origins = "*")
public class CitiesController {
    
    private static final Logger log = LoggerFactory.getLogger(CitiesController.class);
    
    private final CitiesService citiesService;
    
    public CitiesController(CitiesService citiesService) {
        this.citiesService = citiesService;
    }
    
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllCities(
            @RequestParam(required = false) String search) {
        
        log.info("Cities request: search={}", search);
        
        try {
            List<Map<String, Object>> cities;
            if (search != null && !search.trim().isEmpty()) {
                log.info("Searching cities with query: {}", search);
                cities = citiesService.searchCities(search.trim());
                log.info("Search returned {} cities", cities != null ? cities.size() : 0);
            } else {
                log.info("Fetching all cities");
                cities = citiesService.getAllCities();
                log.info("Returning {} cities", cities != null ? cities.size() : 0);
            }
            
            if (cities == null || cities.isEmpty()) {
                log.warn("No cities found, returning empty list");
                cities = new ArrayList<>();
            }
            
            return ResponseEntity.ok(cities);
        } catch (Exception e) {
            log.error("Error fetching cities", e);
            log.error("Exception details: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<Object> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "cities-service",
                "message", "Cities service is running",
                "timestamp", System.currentTimeMillis()
        ));
    }
}

