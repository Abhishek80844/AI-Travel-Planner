package com.travelplanner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItineraryDto {
    private Long id;
    private Integer day;
    private String morning;
    private String afternoon;
    private String evening;
}
