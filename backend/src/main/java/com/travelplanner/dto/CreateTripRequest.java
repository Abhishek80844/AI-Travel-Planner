package com.travelplanner.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreateTripRequest {

    @NotBlank(message = "Destination is required")
    @Size(max = 150, message = "Destination must not exceed 150 characters")
    private String destination;

    @NotNull(message = "Budget is required")
    @DecimalMin(value = "50.00", message = "Budget must be at least $50")
    private BigDecimal budget;

    @NotNull(message = "Days is required")
    @Min(value = 1, message = "Trip must be at least 1 day")
    @Max(value = 30, message = "Trip length cannot exceed 30 days")
    private Integer days;

    @NotBlank(message = "Travel style is required")
    private String travelStyle; // Solo, Couple, Family, Friends

    @NotNull(message = "Travelers count is required")
    @Min(value = 1, message = "Must have at least 1 traveler")
    @Max(value = 20, message = "Maximum 20 travelers allowed")
    private Integer travelers = 1;
}
