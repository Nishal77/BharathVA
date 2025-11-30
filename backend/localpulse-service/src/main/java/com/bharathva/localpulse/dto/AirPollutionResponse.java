package com.bharathva.localpulse.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class AirPollutionResponse {
    private Coord coord;
    private List<AirPollutionData> list;

    public AirPollutionResponse() {
    }

    public AirPollutionResponse(Coord coord, List<AirPollutionData> list) {
        this.coord = coord;
        this.list = list;
    }

    public Coord getCoord() {
        return coord;
    }

    public void setCoord(Coord coord) {
        this.coord = coord;
    }

    public List<AirPollutionData> getList() {
        return list;
    }

    public void setList(List<AirPollutionData> list) {
        this.list = list;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Coord {
        private Double lon;
        private Double lat;

        public Coord() {
        }

        public Coord(Double lon, Double lat) {
            this.lon = lon;
            this.lat = lat;
        }

        public Double getLon() {
            return lon;
        }

        public void setLon(Double lon) {
            this.lon = lon;
        }

        public Double getLat() {
            return lat;
        }

        public void setLat(Double lat) {
            this.lat = lat;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AirPollutionData {
        private Long dt;
        private Main main;
        private Components components;

        public AirPollutionData() {
        }

        public AirPollutionData(Long dt, Main main, Components components) {
            this.dt = dt;
            this.main = main;
            this.components = components;
        }

        public Long getDt() {
            return dt;
        }

        public void setDt(Long dt) {
            this.dt = dt;
        }

        public Main getMain() {
            return main;
        }

        public void setMain(Main main) {
            this.main = main;
        }

        public Components getComponents() {
            return components;
        }

        public void setComponents(Components components) {
            this.components = components;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Main {
        private Integer aqi;

        public Main() {
        }

        public Main(Integer aqi) {
            this.aqi = aqi;
        }

        public Integer getAqi() {
            return aqi;
        }

        public void setAqi(Integer aqi) {
            this.aqi = aqi;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Components {
        private Double co;
        private Double no;
        private Double no2;
        private Double o3;
        private Double so2;
        private Double pm2_5;
        private Double pm10;
        private Double nh3;

        public Components() {
        }

        public Components(Double co, Double no, Double no2, Double o3, Double so2, Double pm2_5, Double pm10, Double nh3) {
            this.co = co;
            this.no = no;
            this.no2 = no2;
            this.o3 = o3;
            this.so2 = so2;
            this.pm2_5 = pm2_5;
            this.pm10 = pm10;
            this.nh3 = nh3;
        }

        public Double getCo() {
            return co;
        }

        public void setCo(Double co) {
            this.co = co;
        }

        public Double getNo() {
            return no;
        }

        public void setNo(Double no) {
            this.no = no;
        }

        public Double getNo2() {
            return no2;
        }

        public void setNo2(Double no2) {
            this.no2 = no2;
        }

        public Double getO3() {
            return o3;
        }

        public void setO3(Double o3) {
            this.o3 = o3;
        }

        public Double getSo2() {
            return so2;
        }

        public void setSo2(Double so2) {
            this.so2 = so2;
        }

        public Double getPm2_5() {
            return pm2_5;
        }

        public void setPm2_5(Double pm2_5) {
            this.pm2_5 = pm2_5;
        }

        public Double getPm10() {
            return pm10;
        }

        public void setPm10(Double pm10) {
            this.pm10 = pm10;
        }

        public Double getNh3() {
            return nh3;
        }

        public void setNh3(Double nh3) {
            this.nh3 = nh3;
        }
    }
}


