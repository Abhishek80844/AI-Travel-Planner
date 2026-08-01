package com.travelplanner.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "trips")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String destination;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal budget;

    @Column(nullable = false)
    private Integer days;

    @Column(name = "travel_style", nullable = false, length = 50)
    private String travelStyle; // Solo, Couple, Family, Friends

    @Column(nullable = false)
    @Builder.Default
    private Integer travelers = 1;

    @Column(name = "created_date", updatable = false)
    private LocalDateTime createdDate;

    @Column(name = "share_token", unique = true, length = 64)
    private String shareToken;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Itinerary> itineraries = new ArrayList<>();

    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Hotel> hotels = new ArrayList<>();

    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Restaurant> restaurants = new ArrayList<>();

    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PackingList> packingLists = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createdDate = LocalDateTime.now();
    }
}
