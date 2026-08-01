package com.travelplanner.controller;

import com.travelplanner.dto.GoogleMapsDto.*;
import com.travelplanner.service.GoogleMapsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maps")
@RequiredArgsConstructor
@Tag(name = "Google Maps", description = "Google Maps API Integration: Search, Autocomplete, Geocoding, Directions & Nearby Places")
public class GoogleMapsController {

    private final GoogleMapsService googleMapsService;

    @GetMapping("/search")
    @Operation(summary = "Search Destinations / Autocomplete", description = "Searches places with region bias (default 'in' for India).")
    public ResponseEntity<List<PlaceSearchResult>> searchDestination(
            @RequestParam(required = false, defaultValue = "") String query,
            @RequestParam(required = false, defaultValue = "in") String region) {
        List<PlaceSearchResult> results = googleMapsService.searchDestination(query, region);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/geocode")
    @Operation(summary = "Geocode Address to Coordinates", description = "Converts address or city name into latitude/longitude coordinates.")
    public ResponseEntity<GeocodeResponse> geocodeAddress(
            @RequestParam String address) {
        GeocodeResponse response = googleMapsService.geocodeAddress(address);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/directions")
    @Operation(summary = "Get Route Directions & Travel Duration", description = "Calculates route distance (km), duration, and turn-by-turn steps.")
    public ResponseEntity<RouteDirections> getDirections(
            @RequestParam String origin,
            @RequestParam String destination,
            @RequestParam(required = false, defaultValue = "driving") String mode) {
        RouteDirections response = googleMapsService.getDirections(origin, destination, mode);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/nearby")
    @Operation(summary = "Get Nearby Places & Attractions", description = "Finds nearby attractions, hotels, and dining options around a location.")
    public ResponseEntity<List<NearbyPlace>> getNearbyPlaces(
            @RequestParam String location,
            @RequestParam(required = false, defaultValue = "5000") Integer radius,
            @RequestParam(required = false, defaultValue = "tourist_attraction") String type) {
        List<NearbyPlace> results = googleMapsService.getNearbyPlaces(location, radius, type);
        return ResponseEntity.ok(results);
    }
}
