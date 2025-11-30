package com.bharathva.localpulse.service;

import com.bharathva.localpulse.dto.AirPollutionResponse;
import com.bharathva.localpulse.dto.OpenWeatherResponse;
import com.bharathva.localpulse.dto.WeatherResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
public class WeatherService {
    
    private static final Logger log = LoggerFactory.getLogger(WeatherService.class);

    private final WebClient openWeatherWebClient;
    private final LocationService locationService;

    @Value("${openweather.api.key}")
    private String apiKey;

    @Value("${weather.default.units:metric}")
    private String units;

    @Value("${weather.default.country-code:IN}")
    private String countryCode;

    @Value("${openweather.api.cache.enabled:true}")
    private boolean cacheEnabled;

    public WeatherService(WebClient openWeatherWebClient, LocationService locationService) {
        this.openWeatherWebClient = openWeatherWebClient;
        this.locationService = locationService;
    }

    @Cacheable(value = "weather", key = "#latitude + '_' + #longitude", unless = "#result == null || !#result.success")
    public WeatherResponse getWeatherByCoordinates(Double latitude, Double longitude) {
        if (latitude == null || longitude == null) {
            log.error("Invalid coordinates provided: lat={}, lon={}", latitude, longitude);
            return WeatherResponse.error("Latitude and longitude are required");
        }

        if (!isValidIndianCoordinates(latitude, longitude)) {
            log.warn("Coordinates outside India bounds: lat={}, lon={}", latitude, longitude);
            return WeatherResponse.error("Coordinates must be within India");
        }

        try {
            log.info("Fetching weather for coordinates: lat={}, lon={}", latitude, longitude);

            OpenWeatherResponse openWeatherResponse = fetchWeatherFromAPI(latitude, longitude);
            
            if (openWeatherResponse == null || openWeatherResponse.getCod() == null || openWeatherResponse.getCod() != 200) {
                log.error("Invalid response from OpenWeather API for coordinates: lat={}, lon={}", latitude, longitude);
                return WeatherResponse.error("Failed to fetch weather data");
            }

            LocationService.LocationInfo locationInfo = locationService.getLocationInfo(latitude, longitude);
            
            // Fetch air pollution data
            WeatherResponse.AirPollution airPollution = fetchAirPollution(latitude, longitude);
            
            WeatherResponse.WeatherData weatherData = buildWeatherData(openWeatherResponse, locationInfo, airPollution);

            log.info("Successfully fetched weather for: {}, {}", locationInfo.getCity(), locationInfo.getState());
            return WeatherResponse.success(weatherData);

        } catch (WebClientResponseException e) {
            log.error("OpenWeather API error for coordinates: lat={}, lon={}, status={}, message={}", 
                    latitude, longitude, e.getStatusCode(), e.getMessage());
            
            if (e.getStatusCode().value() == 401) {
                return WeatherResponse.error("Invalid API key. Please check OpenWeather API configuration");
            } else if (e.getStatusCode().value() == 429) {
                return WeatherResponse.error("API rate limit exceeded. Please try again later");
            } else if (e.getStatusCode().is5xxServerError()) {
                return WeatherResponse.error("Weather service temporarily unavailable. Please try again later");
            }
            
            return WeatherResponse.error("Failed to fetch weather data: " + e.getMessage());
            
        } catch (Exception e) {
            log.error("Unexpected error fetching weather for coordinates: lat={}, lon={}", latitude, longitude, e);
            return WeatherResponse.error("An unexpected error occurred while fetching weather data");
        }
    }

    public WeatherResponse getWeatherByCity(String cityName) {
        if (cityName == null || cityName.trim().isEmpty()) {
            return WeatherResponse.error("City name is required");
        }

        try {
            log.info("Fetching weather for city: {}", cityName);

            OpenWeatherResponse openWeatherResponse = fetchWeatherByCityName(cityName);
            
            if (openWeatherResponse == null || openWeatherResponse.getCod() == null || openWeatherResponse.getCod() != 200) {
                log.error("Invalid response from OpenWeather API for city: {}", cityName);
                return WeatherResponse.error("Failed to fetch weather data for city: " + cityName);
            }

            // Try to get location info from coordinates if available
            LocationService.LocationInfo locationInfo;
            if (openWeatherResponse.getCoord() != null && 
                openWeatherResponse.getCoord().getLat() != null && 
                openWeatherResponse.getCoord().getLon() != null) {
                Double lat = openWeatherResponse.getCoord().getLat();
                Double lon = openWeatherResponse.getCoord().getLon();
                
                // Only use location service if coordinates are within India
                if (isValidIndianCoordinates(lat, lon)) {
                    try {
                        locationInfo = locationService.getLocationInfo(lat, lon);
                    } catch (Exception e) {
                        log.warn("Failed to get location info from coordinates, using defaults: {}", e.getMessage());
                        locationInfo = LocationService.LocationInfo.builder()
                                .city(openWeatherResponse.getName())
                                .country(openWeatherResponse.getSys() != null ? openWeatherResponse.getSys().getCountry() : countryCode)
                                .latitude(lat)
                                .longitude(lon)
                                .state("Unknown")
                                .district("Unknown")
                                .build();
                    }
                } else {
                    locationInfo = LocationService.LocationInfo.builder()
                            .city(openWeatherResponse.getName())
                            .country(openWeatherResponse.getSys() != null ? openWeatherResponse.getSys().getCountry() : countryCode)
                            .latitude(lat)
                            .longitude(lon)
                            .state("Unknown")
                            .district("Unknown")
                            .build();
                }
            } else {
                locationInfo = LocationService.LocationInfo.builder()
                        .city(openWeatherResponse.getName())
                        .country(openWeatherResponse.getSys() != null ? openWeatherResponse.getSys().getCountry() : countryCode)
                        .latitude(null)
                        .longitude(null)
                        .state("Unknown")
                        .district("Unknown")
                        .build();
            }

            // Fetch air pollution data if coordinates are available
            WeatherResponse.AirPollution airPollution = null;
            if (locationInfo.getLatitude() != null && locationInfo.getLongitude() != null) {
                airPollution = fetchAirPollution(locationInfo.getLatitude(), locationInfo.getLongitude());
            }

            WeatherResponse.WeatherData weatherData = buildWeatherData(openWeatherResponse, locationInfo, airPollution);

            log.info("Successfully fetched weather for city: {}", cityName);
            return WeatherResponse.success(weatherData);

        } catch (WebClientResponseException e) {
            log.error("OpenWeather API error for city: {}, status={}, message={}", 
                    cityName, e.getStatusCode(), e.getMessage());
            
            if (e.getStatusCode().value() == 404) {
                return WeatherResponse.error("City not found: " + cityName);
            } else if (e.getStatusCode().value() == 401) {
                return WeatherResponse.error("Invalid API key. Please check OpenWeather API configuration");
            } else if (e.getStatusCode().value() == 429) {
                return WeatherResponse.error("API rate limit exceeded. Please try again later");
            }
            
            return WeatherResponse.error("Failed to fetch weather data: " + e.getMessage());
            
        } catch (Exception e) {
            log.error("Unexpected error fetching weather for city: {}", cityName, e);
            return WeatherResponse.error("An unexpected error occurred while fetching weather data");
        }
    }

    private OpenWeatherResponse fetchWeatherFromAPI(Double latitude, Double longitude) {
        return openWeatherWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/weather")
                        .queryParam("lat", latitude)
                        .queryParam("lon", longitude)
                        .queryParam("appid", apiKey)
                        .queryParam("units", units)
                        .queryParam("lang", "en")
                        .build())
                .retrieve()
                .bodyToMono(OpenWeatherResponse.class)
                .timeout(Duration.ofSeconds(10))
                .retryWhen(Retry.backoff(3, Duration.ofMillis(500))
                        .filter(throwable -> {
                            if (throwable instanceof WebClientResponseException) {
                                WebClientResponseException ex = (WebClientResponseException) throwable;
                                return ex.getStatusCode().is5xxServerError();
                            }
                            return throwable instanceof java.util.concurrent.TimeoutException;
                        })
                        .doBeforeRetry(retrySignal -> 
                            log.warn("Retrying weather API call. Attempt: {}", retrySignal.totalRetries() + 1)))
                .block();
    }

    private OpenWeatherResponse fetchWeatherByCityName(String cityName) {
        return openWeatherWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/weather")
                        .queryParam("q", cityName + "," + countryCode)
                        .queryParam("appid", apiKey)
                        .queryParam("units", units)
                        .queryParam("lang", "en")
                        .build())
                .retrieve()
                .bodyToMono(OpenWeatherResponse.class)
                .timeout(Duration.ofSeconds(10))
                .retryWhen(Retry.backoff(3, Duration.ofMillis(500))
                        .filter(throwable -> {
                            if (throwable instanceof WebClientResponseException) {
                                WebClientResponseException ex = (WebClientResponseException) throwable;
                                return ex.getStatusCode().is5xxServerError();
                            }
                            return throwable instanceof java.util.concurrent.TimeoutException;
                        })
                        .doBeforeRetry(retrySignal -> 
                            log.warn("Retrying weather API call for city: {}. Attempt: {}", 
                                    cityName, retrySignal.totalRetries() + 1)))
                .block();
    }

    private WeatherResponse.AirPollution fetchAirPollution(Double latitude, Double longitude) {
        try {
            log.info("Fetching air pollution data for coordinates: lat={}, lon={}", latitude, longitude);
            
            AirPollutionResponse airPollutionResponse = openWeatherWebClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/air_pollution")
                            .queryParam("lat", latitude)
                            .queryParam("lon", longitude)
                            .queryParam("appid", apiKey)
                            .build())
                    .retrieve()
                    .bodyToMono(AirPollutionResponse.class)
                    .timeout(Duration.ofSeconds(10))
                    .retryWhen(Retry.backoff(2, Duration.ofMillis(500))
                            .filter(throwable -> {
                                if (throwable instanceof WebClientResponseException) {
                                    WebClientResponseException ex = (WebClientResponseException) throwable;
                                    return ex.getStatusCode().is5xxServerError();
                                }
                                return throwable instanceof java.util.concurrent.TimeoutException;
                            }))
                    .onErrorReturn(null)
                    .block();

            if (airPollutionResponse != null && 
                airPollutionResponse.getList() != null && 
                !airPollutionResponse.getList().isEmpty()) {
                
                AirPollutionResponse.AirPollutionData data = airPollutionResponse.getList().get(0);
                AirPollutionResponse.Main main = data.getMain();
                AirPollutionResponse.Components components = data.getComponents();

                if (main != null && components != null) {
                    Integer aqi = main.getAqi();
                    String aqiLevel = getAQILevel(aqi);
                    
                    return new WeatherResponse.AirPollution(
                            aqi,
                            aqiLevel,
                            components.getCo(),
                            components.getNo2(),
                            components.getO3(),
                            components.getSo2(),
                            components.getPm2_5(),
                            components.getPm10()
                    );
                }
            }
            
            log.warn("No air pollution data available for coordinates: lat={}, lon={}", latitude, longitude);
            return null;
            
        } catch (Exception e) {
            log.error("Error fetching air pollution data: {}", e.getMessage());
            return null;
        }
    }

    private String getAQILevel(Integer aqi) {
        if (aqi == null) return "Unknown";
        switch (aqi) {
            case 1: return "Good";
            case 2: return "Fair";
            case 3: return "Moderate";
            case 4: return "Poor";
            case 5: return "Very Poor";
            default: return "Unknown";
        }
    }

    private WeatherResponse.WeatherData buildWeatherData(
            OpenWeatherResponse openWeatherResponse, 
            LocationService.LocationInfo locationInfo,
            WeatherResponse.AirPollution airPollution) {
        
        OpenWeatherResponse.Main main = openWeatherResponse.getMain();
        List<OpenWeatherResponse.Weather> weatherList = openWeatherResponse.getWeather();
        OpenWeatherResponse.Wind wind = openWeatherResponse.getWind();
        OpenWeatherResponse.Sys sys = openWeatherResponse.getSys();

        WeatherResponse.WeatherCondition condition = null;
        if (weatherList != null && !weatherList.isEmpty()) {
            OpenWeatherResponse.Weather weather = weatherList.get(0);
            condition = new WeatherResponse.WeatherCondition(
                    weather.getMain(),
                    weather.getDescription(),
                    weather.getIcon(),
                    weather.getId()
            );
        }

        WeatherResponse.Wind windData = null;
        if (wind != null) {
            windData = new WeatherResponse.Wind(
                    wind.getSpeed(),
                    wind.getDeg(),
                    wind.getGust()
            );
        }

        WeatherResponse.Temperature temperature = null;
        if (main != null) {
            temperature = new WeatherResponse.Temperature(
                    main.getTemp(),
                    main.getFeelsLike(),
                    main.getTempMin(),
                    main.getTempMax()
            );
        }

        WeatherResponse.Humidity humidity = null;
        if (main != null) {
            humidity = new WeatherResponse.Humidity(
                    main.getHumidity(),
                    getHumidityLevel(main.getHumidity())
            );
        }

        WeatherResponse.Visibility visibility = null;
        if (openWeatherResponse.getVisibility() != null) {
            visibility = new WeatherResponse.Visibility(
                    openWeatherResponse.getVisibility(),
                    getVisibilityDescription(openWeatherResponse.getVisibility())
            );
        }

        WeatherResponse.Location location = new WeatherResponse.Location(
                locationInfo.getCity(),
                locationInfo.getState(),
                locationInfo.getDistrict(),
                locationInfo.getCountry(),
                locationInfo.getLatitude(),
                locationInfo.getLongitude()
        );

        WeatherResponse.CurrentWeather currentWeather = new WeatherResponse.CurrentWeather(
                main != null ? main.getTemp() : null,
                main != null ? main.getFeelsLike() : null,
                main != null ? main.getPressure() : null,
                main != null ? main.getHumidity() : null,
                wind != null ? wind.getSpeed() : null,
                wind != null ? wind.getDeg() : null,
                openWeatherResponse.getVisibility(),
                null,
                openWeatherResponse.getDt() != null ? openWeatherResponse.getDt() : Instant.now().getEpochSecond()
        );

        return new WeatherResponse.WeatherData(
                location,
                currentWeather,
                condition,
                windData,
                temperature,
                humidity,
                visibility,
                airPollution,
                openWeatherResponse.getTimezone() != null ? 
                        String.valueOf(openWeatherResponse.getTimezone()) : null,
                sys != null ? sys.getSunrise() : null,
                sys != null ? sys.getSunset() : null
        );
    }

    private boolean isValidIndianCoordinates(Double latitude, Double longitude) {
        return latitude >= 6.0 && latitude <= 37.0 &&
               longitude >= 68.0 && longitude <= 97.0;
    }

    /**
     * Determines humidity level based on percentage value.
     * Provides consistent categorization for UI display.
     * 
     * @param humidity Humidity percentage (0-100)
     * @return Human-readable humidity level
     */
    private String getHumidityLevel(Integer humidity) {
        if (humidity == null) {
            return "Unknown";
        }
        
        // Standard humidity level categorization
        if (humidity < 30) {
            return "Low";
        } else if (humidity < 50) {
            return "Moderate";
        } else if (humidity < 70) {
            return "Comfortable";
        } else if (humidity < 85) {
            return "High";
        } else {
            return "Very High";
        }
    }

    private String getVisibilityDescription(Integer visibility) {
        if (visibility == null) return "Unknown";
        int visibilityKm = visibility / 1000;
        if (visibilityKm >= 10) return "Excellent";
        if (visibilityKm >= 5) return "Good";
        if (visibilityKm >= 2) return "Moderate";
        return "Poor";
    }
}

