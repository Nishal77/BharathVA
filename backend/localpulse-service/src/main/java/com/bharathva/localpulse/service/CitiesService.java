package com.bharathva.localpulse.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CitiesService {
    
    private static final Logger log = LoggerFactory.getLogger(CitiesService.class);
    
    private List<Map<String, Object>> allCities = new ArrayList<>();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @PostConstruct
    public void loadCities() {
        try {
            ClassPathResource resource = new ClassPathResource("data/cities.json");
            if (!resource.exists()) {
                log.error("cities.json file not found in classpath: data/cities.json");
                allCities = new ArrayList<>();
                return;
            }
            
            log.info("Loading cities from cities.json...");
            InputStream inputStream = resource.getInputStream();
            
            allCities = objectMapper.readValue(
                inputStream, 
                new TypeReference<List<Map<String, Object>>>() {}
            );
            
            log.info("Successfully loaded {} cities from cities.json", allCities.size());
            
            if (allCities.isEmpty()) {
                log.warn("cities.json is empty or contains no valid cities");
            }
        } catch (Exception e) {
            log.error("Error loading cities.json", e);
            log.error("Exception details: {}", e.getMessage(), e);
            allCities = new ArrayList<>();
        }
    }
    
    public List<Map<String, Object>> getAllCities() {
        if (allCities == null || allCities.isEmpty()) {
            log.warn("getAllCities called but cities list is empty or null");
            return new ArrayList<>();
        }
        log.debug("Returning {} cities from getAllCities", allCities.size());
        return new ArrayList<>(allCities);
    }
    
    public List<Map<String, Object>> searchCities(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllCities();
        }
        
        if (allCities == null || allCities.isEmpty()) {
            log.warn("searchCities called but cities list is empty or null");
            return new ArrayList<>();
        }
        
        String lowerQuery = query.toLowerCase().trim();
        log.debug("Searching {} cities with query: {}", allCities.size(), lowerQuery);
        
        return allCities.stream()
            .filter(city -> {
                String cityName = getStringValue(city, "city", "").toLowerCase();
                String district = getStringValue(city, "district", "").toLowerCase();
                String state = getStringValue(city, "state", "").toLowerCase();
                
                return cityName.contains(lowerQuery) ||
                       district.contains(lowerQuery) ||
                       state.contains(lowerQuery);
            })
            .sorted((a, b) -> {
                // Prioritize exact city name matches
                String aCity = getStringValue(a, "city", "").toLowerCase();
                String bCity = getStringValue(b, "city", "").toLowerCase();
                
                boolean aExact = aCity.equals(lowerQuery);
                boolean bExact = bCity.equals(lowerQuery);
                if (aExact && !bExact) return -1;
                if (!aExact && bExact) return 1;
                
                // Then prioritize city name starts with query
                boolean aStarts = aCity.startsWith(lowerQuery);
                boolean bStarts = bCity.startsWith(lowerQuery);
                if (aStarts && !bStarts) return -1;
                if (!aStarts && bStarts) return 1;
                
                // Then by population (higher first)
                Integer aPop = getIntegerValue(a, "population", 0);
                Integer bPop = getIntegerValue(b, "population", 0);
                return bPop.compareTo(aPop);
            })
            .collect(Collectors.toList());
    }
    
    private String getStringValue(Map<String, Object> map, String key, String defaultValue) {
        Object value = map.get(key);
        return value != null ? value.toString() : defaultValue;
    }
    
    private Integer getIntegerValue(Map<String, Object> map, String key, Integer defaultValue) {
        Object value = map.get(key);
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        return defaultValue;
    }
}

