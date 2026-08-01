package com.travelplanner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiTripResponse {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DayItinerary {
        private Integer day;
        private String morning;
        private String afternoon;
        private String evening;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HotelItem {
        private String name;
        private Double price;
        private Double rating;
        private String address;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RestaurantItem {
        private String name;
        private Double rating;
        private String price;
        private String location;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PackingItem {
        private String item;
        private String category; // Clothing, Documents, Electronics, Health
    }

    private List<DayItinerary> itinerary;
    private List<HotelItem> hotels;
    private List<RestaurantItem> restaurants;
    private List<PackingItem> packingList;
    private String estimatedCostsSummary;
    private List<String> travelTips;
}
