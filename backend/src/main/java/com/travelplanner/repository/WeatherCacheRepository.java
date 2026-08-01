package com.travelplanner.repository;

import com.travelplanner.entity.WeatherCache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WeatherCacheRepository extends JpaRepository<WeatherCache, Long> {
    List<WeatherCache> findByDestinationIgnoreCaseAndFetchedAtAfter(String destination, LocalDateTime cutoff);
    List<WeatherCache> findByDestinationIgnoreCaseAndForecastDate(String destination, LocalDate forecastDate);
}
