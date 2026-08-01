package com.travelplanner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class GoogleMapsDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LocationCoordinates {
        private Double lat;
        private Double lng;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlaceSearchResult {
        private String placeId;
        private String name;
        private String formattedAddress;
        private LocationCoordinates location;
        private Double rating;
        private String category;
        private String region;
        private String photoUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GeocodeResponse {
        private String formattedAddress;
        private LocationCoordinates location;
        private String placeId;
        private String city;
        private String state;
        private String country;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RouteStep {
        private Integer stepNumber;
        private String instruction;
        private String distanceText;
        private Double distanceKm;
        private String durationText;
        private LocationCoordinates startLocation;
        private LocationCoordinates endLocation;
        private String travelMode;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RouteDirections {
        private String origin;
        private String destination;
        private LocationCoordinates originLocation;
        private LocationCoordinates destinationLocation;
        private String totalDistanceText;
        private Double totalDistanceKm;
        private String totalDurationText;
        private Integer totalDurationMinutes;
        private String travelMode; // driving, transit, walking, bicycling
        private List<RouteStep> steps;
        private String encodedPolyline;
        private List<LocationCoordinates> routePath;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NearbyPlace {
        private String placeId;
        private String name;
        private String category;
        private String address;
        private LocationCoordinates location;
        private Double distanceKm;
        private Double rating;
        private String priceLevel;
        private String openNow;
    }
}
