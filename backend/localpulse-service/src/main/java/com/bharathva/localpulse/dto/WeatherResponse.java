package com.bharathva.localpulse.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.Instant;

@JsonIgnoreProperties(ignoreUnknown = true)
public class WeatherResponse {
    private boolean success;
    private String message;
    private WeatherData data;
    private Long timestamp;

    public WeatherResponse() {
    }

    public WeatherResponse(boolean success, String message, WeatherData data, Long timestamp) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.timestamp = timestamp;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public WeatherData getData() {
        return data;
    }

    public void setData(WeatherData data) {
        this.data = data;
    }

    public Long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Long timestamp) {
        this.timestamp = timestamp;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class WeatherData {
        private Location location;
        private CurrentWeather current;
        private WeatherCondition condition;
        private Wind wind;
        private Temperature temperature;
        private Humidity humidity;
        private Visibility visibility;
        private AirPollution airPollution;
        private String timezone;
        private Long sunrise;
        private Long sunset;

        public WeatherData() {
        }

        public WeatherData(Location location, CurrentWeather current, WeatherCondition condition, Wind wind, Temperature temperature, Humidity humidity, Visibility visibility, AirPollution airPollution, String timezone, Long sunrise, Long sunset) {
            this.location = location;
            this.current = current;
            this.condition = condition;
            this.wind = wind;
            this.temperature = temperature;
            this.humidity = humidity;
            this.visibility = visibility;
            this.airPollution = airPollution;
            this.timezone = timezone;
            this.sunrise = sunrise;
            this.sunset = sunset;
        }

        public Location getLocation() { return location; }
        public void setLocation(Location location) { this.location = location; }
        public CurrentWeather getCurrent() { return current; }
        public void setCurrent(CurrentWeather current) { this.current = current; }
        public WeatherCondition getCondition() { return condition; }
        public void setCondition(WeatherCondition condition) { this.condition = condition; }
        public Wind getWind() { return wind; }
        public void setWind(Wind wind) { this.wind = wind; }
        public Temperature getTemperature() { return temperature; }
        public void setTemperature(Temperature temperature) { this.temperature = temperature; }
        public Humidity getHumidity() { return humidity; }
        public void setHumidity(Humidity humidity) { this.humidity = humidity; }
        public Visibility getVisibility() { return visibility; }
        public void setVisibility(Visibility visibility) { this.visibility = visibility; }
        public AirPollution getAirPollution() { return airPollution; }
        public void setAirPollution(AirPollution airPollution) { this.airPollution = airPollution; }
        public String getTimezone() { return timezone; }
        public void setTimezone(String timezone) { this.timezone = timezone; }
        public Long getSunrise() { return sunrise; }
        public void setSunrise(Long sunrise) { this.sunrise = sunrise; }
        public Long getSunset() { return sunset; }
        public void setSunset(Long sunset) { this.sunset = sunset; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Location {
        private String city;
        private String state;
        private String district;
        private String country;
        private Double latitude;
        private Double longitude;

        public Location() {
        }

        public Location(String city, String state, String district, String country, Double latitude, Double longitude) {
            this.city = city;
            this.state = state;
            this.district = district;
            this.country = country;
            this.latitude = latitude;
            this.longitude = longitude;
        }

        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getState() { return state; }
        public void setState(String state) { this.state = state; }
        public String getDistrict() { return district; }
        public void setDistrict(String district) { this.district = district; }
        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }
        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CurrentWeather {
        private Double temperature;
        private Double feelsLike;
        private Integer pressure;
        private Integer humidity;
        private Double windSpeed;
        private Integer windDirection;
        private Integer visibility;
        private Double uvIndex;
        private Long timestamp;

        public CurrentWeather() {
        }

        public CurrentWeather(Double temperature, Double feelsLike, Integer pressure, Integer humidity, Double windSpeed, Integer windDirection, Integer visibility, Double uvIndex, Long timestamp) {
            this.temperature = temperature;
            this.feelsLike = feelsLike;
            this.pressure = pressure;
            this.humidity = humidity;
            this.windSpeed = windSpeed;
            this.windDirection = windDirection;
            this.visibility = visibility;
            this.uvIndex = uvIndex;
            this.timestamp = timestamp;
        }

        public Double getTemperature() { return temperature; }
        public void setTemperature(Double temperature) { this.temperature = temperature; }
        public Double getFeelsLike() { return feelsLike; }
        public void setFeelsLike(Double feelsLike) { this.feelsLike = feelsLike; }
        public Integer getPressure() { return pressure; }
        public void setPressure(Integer pressure) { this.pressure = pressure; }
        public Integer getHumidity() { return humidity; }
        public void setHumidity(Integer humidity) { this.humidity = humidity; }
        public Double getWindSpeed() { return windSpeed; }
        public void setWindSpeed(Double windSpeed) { this.windSpeed = windSpeed; }
        public Integer getWindDirection() { return windDirection; }
        public void setWindDirection(Integer windDirection) { this.windDirection = windDirection; }
        public Integer getVisibility() { return visibility; }
        public void setVisibility(Integer visibility) { this.visibility = visibility; }
        public Double getUvIndex() { return uvIndex; }
        public void setUvIndex(Double uvIndex) { this.uvIndex = uvIndex; }
        public Long getTimestamp() { return timestamp; }
        public void setTimestamp(Long timestamp) { this.timestamp = timestamp; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class WeatherCondition {
        private String main;
        private String description;
        private String icon;
        private Integer code;

        public WeatherCondition() {
        }

        public WeatherCondition(String main, String description, String icon, Integer code) {
            this.main = main;
            this.description = description;
            this.icon = icon;
            this.code = code;
        }

        public String getMain() { return main; }
        public void setMain(String main) { this.main = main; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getIcon() { return icon; }
        public void setIcon(String icon) { this.icon = icon; }
        public Integer getCode() { return code; }
        public void setCode(Integer code) { this.code = code; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Wind {
        private Double speed;
        private Integer direction;
        private Double gust;

        public Wind() {
        }

        public Wind(Double speed, Integer direction, Double gust) {
            this.speed = speed;
            this.direction = direction;
            this.gust = gust;
        }

        public Double getSpeed() { return speed; }
        public void setSpeed(Double speed) { this.speed = speed; }
        public Integer getDirection() { return direction; }
        public void setDirection(Integer direction) { this.direction = direction; }
        public Double getGust() { return gust; }
        public void setGust(Double gust) { this.gust = gust; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Temperature {
        private Double current;
        private Double feelsLike;
        private Double min;
        private Double max;

        public Temperature() {
        }

        public Temperature(Double current, Double feelsLike, Double min, Double max) {
            this.current = current;
            this.feelsLike = feelsLike;
            this.min = min;
            this.max = max;
        }

        public Double getCurrent() { return current; }
        public void setCurrent(Double current) { this.current = current; }
        public Double getFeelsLike() { return feelsLike; }
        public void setFeelsLike(Double feelsLike) { this.feelsLike = feelsLike; }
        public Double getMin() { return min; }
        public void setMin(Double min) { this.min = min; }
        public Double getMax() { return max; }
        public void setMax(Double max) { this.max = max; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Humidity {
        private Integer value;
        private String level;

        public Humidity() {
        }

        public Humidity(Integer value, String level) {
            this.value = value;
            this.level = level;
        }

        public Integer getValue() { return value; }
        public void setValue(Integer value) { this.value = value; }
        public String getLevel() { return level; }
        public void setLevel(String level) { this.level = level; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Visibility {
        private Integer value;
        private String description;

        public Visibility() {
        }

        public Visibility(Integer value, String description) {
            this.value = value;
            this.description = description;
        }

        public Integer getValue() { return value; }
        public void setValue(Integer value) { this.value = value; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AirPollution {
        private Integer aqi;
        private String aqiLevel;
        private Double co;
        private Double no2;
        private Double o3;
        private Double so2;
        private Double pm2_5;
        private Double pm10;

        public AirPollution() {
        }

        public AirPollution(Integer aqi, String aqiLevel, Double co, Double no2, Double o3, Double so2, Double pm2_5, Double pm10) {
            this.aqi = aqi;
            this.aqiLevel = aqiLevel;
            this.co = co;
            this.no2 = no2;
            this.o3 = o3;
            this.so2 = so2;
            this.pm2_5 = pm2_5;
            this.pm10 = pm10;
        }

        public Integer getAqi() { return aqi; }
        public void setAqi(Integer aqi) { this.aqi = aqi; }
        public String getAqiLevel() { return aqiLevel; }
        public void setAqiLevel(String aqiLevel) { this.aqiLevel = aqiLevel; }
        public Double getCo() { return co; }
        public void setCo(Double co) { this.co = co; }
        public Double getNo2() { return no2; }
        public void setNo2(Double no2) { this.no2 = no2; }
        public Double getO3() { return o3; }
        public void setO3(Double o3) { this.o3 = o3; }
        public Double getSo2() { return so2; }
        public void setSo2(Double so2) { this.so2 = so2; }
        public Double getPm2_5() { return pm2_5; }
        public void setPm2_5(Double pm2_5) { this.pm2_5 = pm2_5; }
        public Double getPm10() { return pm10; }
        public void setPm10(Double pm10) { this.pm10 = pm10; }
    }

    public static WeatherResponse success(WeatherData data) {
        WeatherResponse response = new WeatherResponse();
        response.setSuccess(true);
        response.setMessage("Weather data retrieved successfully");
        response.setData(data);
        response.setTimestamp(Instant.now().getEpochSecond());
        return response;
    }

    public static WeatherResponse error(String message) {
        WeatherResponse response = new WeatherResponse();
        response.setSuccess(false);
        response.setMessage(message);
        response.setData(null);
        response.setTimestamp(Instant.now().getEpochSecond());
        return response;
    }
}
