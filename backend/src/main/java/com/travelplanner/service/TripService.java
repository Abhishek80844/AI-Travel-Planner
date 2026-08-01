package com.travelplanner.service;

import com.travelplanner.dto.*;
import com.travelplanner.entity.*;
import com.travelplanner.exception.ResourceNotFoundException;
import com.travelplanner.repository.*;
import com.travelplanner.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final ItineraryRepository itineraryRepository;
    private final PackingListRepository packingListRepository;
    private final AiService aiService;
    private final WeatherService weatherService;

    @Transactional
    public TripResponse createTrip(CreateTripRequest request, UserPrincipal currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // 1. Generate AI Itinerary, Hotels, Restaurants, Packing
        AiTripResponse aiResponse = aiService.generateTripItinerary(request);

        // 2. Fetch/Cache Weather Forecast
        List<WeatherCache> weatherForecasts = weatherService.getWeatherForecast(request.getDestination(), request.getDays());

        // 3. Construct Trip Entity
        String shareToken = UUID.randomUUID().toString().replace("-", "");
        Trip trip = Trip.builder()
                .destination(request.getDestination())
                .budget(request.getBudget())
                .days(request.getDays())
                .travelStyle(request.getTravelStyle())
                .travelers(request.getTravelers())
                .shareToken(shareToken)
                .user(user)
                .build();

        // 4. Map Itineraries
        if (aiResponse.getItinerary() != null) {
            for (AiTripResponse.DayItinerary dayItem : aiResponse.getItinerary()) {
                Itinerary itinerary = Itinerary.builder()
                        .day(dayItem.getDay())
                        .morning(dayItem.getMorning())
                        .afternoon(dayItem.getAfternoon())
                        .evening(dayItem.getEvening())
                        .trip(trip)
                        .build();
                trip.getItineraries().add(itinerary);
            }
        }

        // 5. Map Hotels
        if (aiResponse.getHotels() != null) {
            for (AiTripResponse.HotelItem hotelItem : aiResponse.getHotels()) {
                Hotel hotel = Hotel.builder()
                        .name(hotelItem.getName())
                        .price(BigDecimal.valueOf(hotelItem.getPrice() != null ? hotelItem.getPrice() : 100.0))
                        .rating(BigDecimal.valueOf(hotelItem.getRating() != null ? hotelItem.getRating() : 4.5))
                        .address(hotelItem.getAddress())
                        .trip(trip)
                        .build();
                trip.getHotels().add(hotel);
            }
        }

        // 6. Map Restaurants
        if (aiResponse.getRestaurants() != null) {
            for (AiTripResponse.RestaurantItem restItem : aiResponse.getRestaurants()) {
                Restaurant restaurant = Restaurant.builder()
                        .name(restItem.getName())
                        .rating(BigDecimal.valueOf(restItem.getRating() != null ? restItem.getRating() : 4.5))
                        .price(restItem.getPrice() != null ? restItem.getPrice() : "$$")
                        .location(restItem.getLocation())
                        .trip(trip)
                        .build();
                trip.getRestaurants().add(restaurant);
            }
        }

        // 7. Map Packing Items
        if (aiResponse.getPackingList() != null) {
            for (AiTripResponse.PackingItem packItem : aiResponse.getPackingList()) {
                PackingList packingList = PackingList.builder()
                        .item(packItem.getItem())
                        .category(packItem.getCategory() != null ? packItem.getCategory() : "Clothing")
                        .isChecked(false)
                        .trip(trip)
                        .build();
                trip.getPackingLists().add(packingList);
            }
        }

        Trip savedTrip = tripRepository.save(trip);
        return mapToTripResponse(savedTrip, weatherForecasts);
    }

    @Transactional(readOnly = true)
    public List<TripResponse> getUserTrips(UserPrincipal currentUser) {
        List<Trip> trips = tripRepository.findByUserIdOrderByCreatedDateDesc(currentUser.getId());
        return trips.stream()
                .map(trip -> {
                    List<WeatherCache> weather = weatherService.getWeatherForecast(trip.getDestination(), trip.getDays());
                    return mapToTripResponse(trip, weather);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TripResponse getTripById(Long tripId, UserPrincipal currentUser) {
        Trip trip = tripRepository.findByIdAndUserId(tripId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));
        List<WeatherCache> weather = weatherService.getWeatherForecast(trip.getDestination(), trip.getDays());
        return mapToTripResponse(trip, weather);
    }

    @Transactional(readOnly = true)
    public TripResponse getTripByShareToken(String shareToken) {
        Trip trip = tripRepository.findByShareToken(shareToken)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found or invalid share token"));
        List<WeatherCache> weather = weatherService.getWeatherForecast(trip.getDestination(), trip.getDays());
        return mapToTripResponse(trip, weather);
    }

    @Transactional
    public void deleteTrip(Long tripId, UserPrincipal currentUser) {
        Trip trip = tripRepository.findByIdAndUserId(tripId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));
        tripRepository.delete(trip);
    }

    @Transactional
    public ItineraryDto updateItineraryDay(Long tripId, Long itineraryId, ItineraryDto request, UserPrincipal currentUser) {
        Trip trip = tripRepository.findByIdAndUserId(tripId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new ResourceNotFoundException("Itinerary day not found"));

        if (request.getMorning() != null) itinerary.setMorning(request.getMorning());
        if (request.getAfternoon() != null) itinerary.setAfternoon(request.getAfternoon());
        if (request.getEvening() != null) itinerary.setEvening(request.getEvening());

        Itinerary updated = itineraryRepository.save(itinerary);
        return mapToItineraryDto(updated);
    }

    @Transactional
    public PackingListDto togglePackingItem(Long tripId, Long itemId, UserPrincipal currentUser) {
        Trip trip = tripRepository.findByIdAndUserId(tripId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        PackingList item = packingListRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Packing item not found"));

        item.setIsChecked(!item.getIsChecked());
        PackingList updated = packingListRepository.save(item);
        return mapToPackingListDto(updated);
    }

    @Transactional
    public PackingListDto addPackingItem(Long tripId, PackingListDto request, UserPrincipal currentUser) {
        Trip trip = tripRepository.findByIdAndUserId(tripId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        PackingList item = PackingList.builder()
                .item(request.getItem())
                .category(request.getCategory() != null ? request.getCategory() : "Clothing")
                .isChecked(false)
                .trip(trip)
                .build();

        PackingList saved = packingListRepository.save(item);
        return mapToPackingListDto(saved);
    }

    @Transactional
    public void deletePackingItem(Long tripId, Long itemId, UserPrincipal currentUser) {
        Trip trip = tripRepository.findByIdAndUserId(tripId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        PackingList item = packingListRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Packing item not found"));

        packingListRepository.delete(item);
    }

    private TripResponse mapToTripResponse(Trip trip, List<WeatherCache> weather) {
        return TripResponse.builder()
                .id(trip.getId())
                .destination(trip.getDestination())
                .budget(trip.getBudget())
                .days(trip.getDays())
                .travelStyle(trip.getTravelStyle())
                .travelers(trip.getTravelers())
                .createdDate(trip.getCreatedDate())
                .shareToken(trip.getShareToken())
                .itineraries(trip.getItineraries().stream().map(this::mapToItineraryDto).collect(Collectors.toList()))
                .hotels(trip.getHotels().stream().map(this::mapToHotelDto).collect(Collectors.toList()))
                .restaurants(trip.getRestaurants().stream().map(this::mapToRestaurantDto).collect(Collectors.toList()))
                .packingLists(trip.getPackingLists().stream().map(this::mapToPackingListDto).collect(Collectors.toList()))
                .weatherForecasts(weather != null ? weather.stream().map(this::mapToWeatherDto).collect(Collectors.toList()) : List.of())
                .build();
    }

    private ItineraryDto mapToItineraryDto(Itinerary i) {
        return ItineraryDto.builder()
                .id(i.getId())
                .day(i.getDay())
                .morning(i.getMorning())
                .afternoon(i.getAfternoon())
                .evening(i.getEvening())
                .build();
    }

    private HotelDto mapToHotelDto(Hotel h) {
        return HotelDto.builder()
                .id(h.getId())
                .name(h.getName())
                .price(h.getPrice())
                .rating(h.getRating())
                .address(h.getAddress())
                .build();
    }

    private RestaurantDto mapToRestaurantDto(Restaurant r) {
        return RestaurantDto.builder()
                .id(r.getId())
                .name(r.getName())
                .rating(r.getRating())
                .price(r.getPrice())
                .location(r.getLocation())
                .build();
    }

    private PackingListDto mapToPackingListDto(PackingList p) {
        return PackingListDto.builder()
                .id(p.getId())
                .item(p.getItem())
                .category(p.getCategory())
                .isChecked(p.getIsChecked())
                .build();
    }

    private WeatherCacheDto mapToWeatherDto(WeatherCache w) {
        return WeatherCacheDto.builder()
                .id(w.getId())
                .destination(w.getDestination())
                .forecastDate(w.getForecastDate())
                .temperature(w.getTemperature())
                .rainChance(w.getRainChance())
                .humidity(w.getHumidity())
                .wind(w.getWind())
                .build();
    }
}
