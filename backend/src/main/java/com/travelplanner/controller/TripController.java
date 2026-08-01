package com.travelplanner.controller;

import com.travelplanner.dto.*;
import com.travelplanner.security.UserPrincipal;
import com.travelplanner.service.AiService;
import com.travelplanner.service.PlacesService;
import com.travelplanner.service.TripService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/trips")
@RequiredArgsConstructor
@Tag(name = "Trips", description = "AI Trip Planning, Itinerary Management, Weather & Emergency Endpoints")
public class TripController {

    private final TripService tripService;
    private final AiService aiService;
    private final PlacesService placesService;

    @PostMapping
    @Operation(summary = "Generate & Create AI Trip", description = "Triggers AI itinerary creation, fetches weather and venue recommendations.")
    public ResponseEntity<TripResponse> createTrip(@Valid @RequestBody CreateTripRequest request,
                                                  @AuthenticationPrincipal UserPrincipal currentUser) {
        TripResponse response = tripService.createTrip(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Get User Saved Trips", description = "Returns all trips created by authenticated user.")
    public ResponseEntity<List<TripResponse>> getUserTrips(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<TripResponse> trips = tripService.getUserTrips(currentUser);
        return ResponseEntity.ok(trips);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Trip Details by ID", description = "Retrieves trip details including weather, hotels, and packing list.")
    public ResponseEntity<TripResponse> getTripById(@PathVariable Long id,
                                                    @AuthenticationPrincipal UserPrincipal currentUser) {
        TripResponse trip = tripService.getTripById(id, currentUser);
        return ResponseEntity.ok(trip);
    }

    @GetMapping("/share/{shareToken}")
    @Operation(summary = "Get Shared Trip (Public Read-Only)", description = "Public access to shared trip via token.")
    public ResponseEntity<TripResponse> getTripByShareToken(@PathVariable String shareToken) {
        TripResponse trip = tripService.getTripByShareToken(shareToken);
        return ResponseEntity.ok(trip);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Trip", description = "Deletes a saved trip.")
    public ResponseEntity<Void> deleteTrip(@PathVariable Long id,
                                           @AuthenticationPrincipal UserPrincipal currentUser) {
        tripService.deleteTrip(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{tripId}/itineraries/{itineraryId}")
    @Operation(summary = "Update Itinerary Activity", description = "Allows manual editing of morning, afternoon, or evening activities.")
    public ResponseEntity<ItineraryDto> updateItineraryDay(@PathVariable Long tripId,
                                                           @PathVariable Long itineraryId,
                                                           @RequestBody ItineraryDto request,
                                                           @AuthenticationPrincipal UserPrincipal currentUser) {
        ItineraryDto updated = tripService.updateItineraryDay(tripId, itineraryId, request, currentUser);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{tripId}/packing-lists/{itemId}/toggle")
    @Operation(summary = "Toggle Packing Item Checked Status")
    public ResponseEntity<PackingListDto> togglePackingItem(@PathVariable Long tripId,
                                                            @PathVariable Long itemId,
                                                            @AuthenticationPrincipal UserPrincipal currentUser) {
        PackingListDto updated = tripService.togglePackingItem(tripId, itemId, currentUser);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{tripId}/packing-lists")
    @Operation(summary = "Add Custom Item to Packing List")
    public ResponseEntity<PackingListDto> addPackingItem(@PathVariable Long tripId,
                                                         @RequestBody PackingListDto request,
                                                         @AuthenticationPrincipal UserPrincipal currentUser) {
        PackingListDto saved = tripService.addPackingItem(tripId, request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/{tripId}/packing-lists/{itemId}")
    @Operation(summary = "Delete Item from Packing List")
    public ResponseEntity<Void> deletePackingItem(@PathVariable Long tripId,
                                                  @PathVariable Long itemId,
                                                  @AuthenticationPrincipal UserPrincipal currentUser) {
        tripService.deletePackingItem(tripId, itemId, currentUser);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/chat")
    @Operation(summary = "Conversational AI Trip Assistant", description = "Grounded AI chat based on the current trip's context powered by Google Gemini API.")
    public ResponseEntity<ChatResponse> chatAboutTrip(@PathVariable Long id,
                                                      @Valid @RequestBody ChatRequest request,
                                                      @AuthenticationPrincipal UserPrincipal currentUser) {
        TripResponse trip = tripService.getTripById(id, currentUser);
        String reply = aiService.chatAboutTrip(trip, request.getMessage());
        return ResponseEntity.ok(ChatResponse.builder()
                .reply(reply)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @PostMapping("/advice")
    @Operation(summary = "Standalone AI Travel Advice", description = "Generates instant travel advice and tips powered by Google Gemini API.")
    public ResponseEntity<ChatResponse> getTravelAdvice(@Valid @RequestBody ChatRequest request) {
        String reply = aiService.getGeneralTravelAdvice(request.getMessage());
        return ResponseEntity.ok(ChatResponse.builder()
                .reply(reply)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @GetMapping("/{id}/emergency")
    @Operation(summary = "Emergency Lookup Services", description = "Finds nearby Hospitals, Police Stations, and Embassies for current trip destination.")
    public ResponseEntity<List<EmergencyLocationDto>> getEmergencyLocations(@PathVariable Long id,
                                                                             @AuthenticationPrincipal UserPrincipal currentUser) {
        TripResponse trip = tripService.getTripById(id, currentUser);
        List<EmergencyLocationDto> locations = placesService.getEmergencyLocations(trip.getDestination());
        return ResponseEntity.ok(locations);
    }
}
