package com.travelplanner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmergencyLocationDto {
    private String name;
    private String type; // Hospital, Police Station, Embassy
    private String address;
    private String phone;
    private Double distanceKm;
}
