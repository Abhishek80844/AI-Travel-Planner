package com.travelplanner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripResponse {
    private Long id;
    private String destination;
    private BigDecimal budget;
    private Integer days;
    private String travelStyle;
    private Integer travelers;
    private LocalDateTime createdDate;
    private String shareToken;
    private List<ItineraryDto> itineraries;
    private List<HotelDto> hotels;
    private List<RestaurantDto> restaurants;
    private List<PackingListDto> packingLists;
    private List<WeatherCacheDto> weatherForecasts;
}
