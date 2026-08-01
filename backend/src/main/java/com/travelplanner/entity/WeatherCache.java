package com.travelplanner.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "weather_caches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeatherCache {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String destination;

    @Column(name = "forecast_date", nullable = false)
    private LocalDate forecastDate;

    @Column(precision = 5, scale = 2)
    private BigDecimal temperature;

    @Column(name = "rain_chance", precision = 5, scale = 2)
    private BigDecimal rainChance;

    @Column(precision = 5, scale = 2)
    private BigDecimal humidity;

    @Column(precision = 5, scale = 2)
    private BigDecimal wind;

    @Column(name = "fetched_at")
    private LocalDateTime fetchedAt;

    @PrePersist
    @PreUpdate
    protected void onSave() {
        this.fetchedAt = LocalDateTime.now();
    }
}
