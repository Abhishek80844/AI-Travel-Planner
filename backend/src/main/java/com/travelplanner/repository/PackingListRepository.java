package com.travelplanner.repository;

import com.travelplanner.entity.PackingList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PackingListRepository extends JpaRepository<PackingList, Long> {
    List<PackingList> findByTripId(Long tripId);
}
