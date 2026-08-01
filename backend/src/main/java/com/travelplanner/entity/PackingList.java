package com.travelplanner.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "packing_lists")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PackingList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String item;

    @Column(nullable = false, length = 50)
    private String category; // Clothing, Documents, Electronics, Health

    @Column(name = "is_checked", nullable = false)
    @Builder.Default
    private Boolean isChecked = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    @JsonIgnore
    private Trip trip;
}
