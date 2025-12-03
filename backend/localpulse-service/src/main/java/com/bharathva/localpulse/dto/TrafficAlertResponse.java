package com.bharathva.localpulse.dto;

import java.util.List;

public class TrafficAlertResponse {
    
    private boolean success;
    private String message;
    private List<TrafficAlert> alerts;
    private Integer totalCount;
    
    public TrafficAlertResponse() {}
    
    public static TrafficAlertResponse success(List<TrafficAlert> alerts) {
        TrafficAlertResponse response = new TrafficAlertResponse();
        response.success = true;
        response.message = "Traffic alerts fetched successfully";
        response.alerts = alerts;
        response.totalCount = alerts != null ? alerts.size() : 0;
        return response;
    }
    
    public static TrafficAlertResponse error(String message) {
        TrafficAlertResponse response = new TrafficAlertResponse();
        response.success = false;
        response.message = message;
        response.alerts = null;
        response.totalCount = 0;
        return response;
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
    
    public List<TrafficAlert> getAlerts() {
        return alerts;
    }
    
    public void setAlerts(List<TrafficAlert> alerts) {
        this.alerts = alerts;
    }
    
    public Integer getTotalCount() {
        return totalCount;
    }
    
    public void setTotalCount(Integer totalCount) {
        this.totalCount = totalCount;
    }
    
    public static class TrafficAlert {
        private String id;
        private String type;
        private String title;
        private String description;
        private String severity;
        private String location;
        private String city;
        private String state;
        private Double latitude;
        private Double longitude;
        private Long timestamp;
        private String roadName;
        private String icon;
        
        public TrafficAlert() {}
        
        public TrafficAlert(String id, String type, String title, String description, 
                          String severity, String location, String city, String state,
                          Double latitude, Double longitude, Long timestamp, String roadName) {
            this.id = id;
            this.type = type;
            this.title = title;
            this.description = description;
            this.severity = severity;
            this.location = location;
            this.city = city;
            this.state = state;
            this.latitude = latitude;
            this.longitude = longitude;
            this.timestamp = timestamp;
            this.roadName = roadName;
            this.icon = getIconForType(type);
        }
        
        private String getIconForType(String type) {
            if (type == null) return "🚦";
            switch (type.toLowerCase()) {
                case "accident":
                case "crash":
                    return "🚨";
                case "road_work":
                case "construction":
                    return "🚧";
                case "traffic_jam":
                case "congestion":
                    return "🚦";
                case "road_closure":
                case "closure":
                    return "🚫";
                case "diversion":
                    return "🔄";
                default:
                    return "🚦";
            }
        }
        
        public String getId() {
            return id;
        }
        
        public void setId(String id) {
            this.id = id;
        }
        
        public String getType() {
            return type;
        }
        
        public void setType(String type) {
            this.type = type;
        }
        
        public String getTitle() {
            return title;
        }
        
        public void setTitle(String title) {
            this.title = title;
        }
        
        public String getDescription() {
            return description;
        }
        
        public void setDescription(String description) {
            this.description = description;
        }
        
        public String getSeverity() {
            return severity;
        }
        
        public void setSeverity(String severity) {
            this.severity = severity;
        }
        
        public String getLocation() {
            return location;
        }
        
        public void setLocation(String location) {
            this.location = location;
        }
        
        public String getCity() {
            return city;
        }
        
        public void setCity(String city) {
            this.city = city;
        }
        
        public String getState() {
            return state;
        }
        
        public void setState(String state) {
            this.state = state;
        }
        
        public Double getLatitude() {
            return latitude;
        }
        
        public void setLatitude(Double latitude) {
            this.latitude = latitude;
        }
        
        public Double getLongitude() {
            return longitude;
        }
        
        public void setLongitude(Double longitude) {
            this.longitude = longitude;
        }
        
        public Long getTimestamp() {
            return timestamp;
        }
        
        public void setTimestamp(Long timestamp) {
            this.timestamp = timestamp;
        }
        
        public String getRoadName() {
            return roadName;
        }
        
        public void setRoadName(String roadName) {
            this.roadName = roadName;
        }
        
        public String getIcon() {
            return icon;
        }
        
        public void setIcon(String icon) {
            this.icon = icon;
        }
    }
}


