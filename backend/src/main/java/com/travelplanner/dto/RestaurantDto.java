package com.travelplanner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantDto {
    private Long id;
    private String name;
    private BigDecimal rating;
    private String price;
    private String location;
}
