package com.travelplanner.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "itineraries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Itinerary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "\"day\"", nullable = false)
    private Integer day;

    @Column(columnDefinition = "TEXT")
    private String morning;

    @Column(columnDefinition = "TEXT")
    private String afternoon;

    @Column(columnDefinition = "TEXT")
    private String evening;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    @JsonIgnore
    private Trip trip;
}
