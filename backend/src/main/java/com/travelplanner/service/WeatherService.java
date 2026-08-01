package com.travelplanner.service;

import com.travelplanner.entity.WeatherCache;
import com.travelplanner.repository.WeatherCacheRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class WeatherService {

    @Value("${integrations.openweather.api-key:}")
    private String openWeatherApiKey;

    @Value("${integrations.openweather.base-url:https://api.openweathermap.org/data/2.5}")
    private String baseUrl;

    @Value("${integrations.openweather.cache-ttl-hours:24}")
    private int cacheTtlHours;

    private final WeatherCacheRepository weatherCacheRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Transactional
    public List<WeatherCache> getWeatherForecast(String destination, int days) {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(cacheTtlHours);
        List<WeatherCache> cachedWeather = weatherCacheRepository.findByDestinationIgnoreCaseAndFetchedAtAfter(destination, cutoff);

        if (cachedWeather.size() >= Math.min(days, 5)) {
            log.info("Serving weather forecast from database cache (TTL 24h) for {}", destination);
            return cachedWeather;
        }

        if (StringUtils.hasText(openWeatherApiKey)) {
            try {
                log.info("Fetching fresh weather from OpenWeatherMap API for {}", destination);
                List<WeatherCache> fetchedWeather = fetchFromOpenWeatherApi(destination, days);
                if (!fetchedWeather.isEmpty()) {
                    return weatherCacheRepository.saveAll(fetchedWeather);
                }
            } catch (Exception ex) {
                log.warn("OpenWeatherMap API request failed for {}: {}", destination, ex.getMessage());
            }
        }

        log.info("Generating fallback weather forecast data for {}", destination);
        List<WeatherCache> fallbackForecast = generateFallbackForecast(destination, days);
        return weatherCacheRepository.saveAll(fallbackForecast);
    }

    private List<WeatherCache> fetchFromOpenWeatherApi(String destination, int days) {
        String url = String.format("%s/forecast?q=%s&units=metric&appid=%s", baseUrl, destination, openWeatherApiKey);
        ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);

        List<WeatherCache> results = new ArrayList<>();
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            List<Map<String, Object>> list = (List<Map<String, Object>>) response.getBody().get("list");
            if (list != null) {
                Set<LocalDate> seenDates = new HashSet<>();
                LocalDate today = LocalDate.now();

                for (Map<String, Object> entry : list) {
                    Map<String, Object> main = (Map<String, Object>) entry.get("main");
                    Map<String, Object> windMap = (Map<String, Object>) entry.get("wind");
                    Number pop = (Number) entry.get("pop"); // Probability of precipitation (0 to 1)

                    String dtTxt = (String) entry.get("dt_txt");
                    LocalDate date = dtTxt != null ? LocalDate.parse(dtTxt.split(" ")[0]) : today;

                    if (!seenDates.contains(date) && results.size() < days) {
                        seenDates.add(date);
                        double temp = main != null && main.get("temp") != null ? ((Number) main.get("temp")).doubleValue() : 22.0;
                        double humidity = main != null && main.get("humidity") != null ? ((Number) main.get("humidity")).doubleValue() : 55.0;
                        double wind = windMap != null && windMap.get("speed") != null ? ((Number) windMap.get("speed")).doubleValue() : 12.0;
                        double rainChance = pop != null ? pop.doubleValue() * 100 : 15.0;

                        WeatherCache cache = WeatherCache.builder()
                                .destination(destination)
                                .forecastDate(date)
                                .temperature(BigDecimal.valueOf(temp).setScale(2, RoundingMode.HALF_UP))
                                .rainChance(BigDecimal.valueOf(rainChance).setScale(2, RoundingMode.HALF_UP))
                                .humidity(BigDecimal.valueOf(humidity).setScale(2, RoundingMode.HALF_UP))
                                .wind(BigDecimal.valueOf(wind).setScale(2, RoundingMode.HALF_UP))
                                .build();
                        results.add(cache);
                    }
                }
            }
        }
        return results;
    }

    private List<WeatherCache> generateFallbackForecast(String destination, int days) {
        List<WeatherCache> results = new ArrayList<>();
        LocalDate start = LocalDate.now();
        Random rand = new Random(destination.hashCode());

        for (int i = 0; i < Math.min(days, 7); i++) {
            double temp = 18.0 + rand.nextDouble() * 10.0;
            double rain = rand.nextDouble() * 30.0;
            double humidity = 45.0 + rand.nextDouble() * 25.0;
            double wind = 8.0 + rand.nextDouble() * 10.0;

            WeatherCache cache = WeatherCache.builder()
                    .destination(destination)
                    .forecastDate(start.plusDays(i))
                    .temperature(BigDecimal.valueOf(temp).setScale(2, RoundingMode.HALF_UP))
                    .rainChance(BigDecimal.valueOf(rain).setScale(2, RoundingMode.HALF_UP))
                    .humidity(BigDecimal.valueOf(humidity).setScale(2, RoundingMode.HALF_UP))
                    .wind(BigDecimal.valueOf(wind).setScale(2, RoundingMode.HALF_UP))
                    .build();
            results.add(cache);
        }
        return results;
    }
}
