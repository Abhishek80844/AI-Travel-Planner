package com.travelplanner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeatherCacheDto {
    private Long id;
    private String destination;
    private LocalDate forecastDate;
    private BigDecimal temperature;
    private BigDecimal rainChance;
    private BigDecimal humidity;
    private BigDecimal wind;
}
