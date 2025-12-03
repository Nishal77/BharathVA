package com.bharathva.localpulse.controller;

import com.bharathva.localpulse.dto.TrafficAlertResponse;
import com.bharathva.localpulse.service.TrafficService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/localpulse/traffic")
@CrossOrigin(origins = "*")
public class TrafficController {
    
    private static final Logger log = LoggerFactory.getLogger(TrafficController.class);
    
    private final TrafficService trafficService;
    
    public TrafficController(TrafficService trafficService) {
        this.trafficService = trafficService;
    }
    
    @GetMapping("/alerts")
    public ResponseEntity<TrafficAlertResponse> getTrafficAlerts(
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(required = false, defaultValue = "60.0") Double radius) {
        
        log.info("Traffic alerts request: lat={}, lon={}, radius={}km", latitude, longitude, radius);
        
        if (latitude == null || longitude == null) {
            TrafficAlertResponse errorResponse = TrafficAlertResponse.error(
                    "Both latitude and longitude parameters are required");
            return ResponseEntity.badRequest().body(errorResponse);
        }
        
        TrafficAlertResponse response = trafficService.getTrafficAlerts(latitude, longitude, radius);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<Object> health() {
        return ResponseEntity.ok(java.util.Map.of(
                "status", "UP",
                "service", "localpulse-traffic-service",
                "message", "Traffic service is running",
                "timestamp", System.currentTimeMillis()
        ));
    }
}

