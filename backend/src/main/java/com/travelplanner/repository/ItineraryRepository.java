package com.travelplanner.repository;

import com.travelplanner.entity.Itinerary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ItineraryRepository extends JpaRepository<Itinerary, Long> {
    List<Itinerary> findByTripIdOrderByDayAsc(Long tripId);
    Optional<Itinerary> findByTripIdAndDay(Long tripId, Integer day);
}
