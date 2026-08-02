package com.travelplanner.service.ai.fallback;

import com.travelplanner.dto.AiTripResponse;
import com.travelplanner.dto.CreateTripRequest;
import com.travelplanner.dto.TripResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class FallbackAiService {

    public AiTripResponse generateFallbackTrip(CreateTripRequest request) {

        String destination = request.getDestination();
        int days = request.getDays();
        String style = request.getTravelStyle();

        List<AiTripResponse.DayItinerary> itineraries = new ArrayList<>();

        for (int i = 1; i <= days; i++) {

            itineraries.add(
                    new AiTripResponse.DayItinerary(
                            i,
                            String.format(
                                    "Day %d Morning: Explore top historic landmarks and central square in %s. Enjoy fresh coffee and local pastries.",
                                    i,
                                    destination
                            ),
                            String.format(
                                    "Day %d Afternoon: Guided cultural tour, visit iconic museums and popular shopping quarters tailored for %s travelers.",
                                    i,
                                    style.toLowerCase()
                            ),
                            String.format(
                                    "Day %d Evening: Sunset viewpoints followed by authentic dining experience at a renowned local spot.",
                                    i
                            )
                    )
            );
        }

        List<AiTripResponse.HotelItem> hotels = List.of(

                new AiTripResponse.HotelItem(
                        "Grand Central Resort & Spa " + destination,
                        request.getBudget().doubleValue() * 0.25 / days,
                        4.7,
                        "Central Downtown District, " + destination
                ),

                new AiTripResponse.HotelItem(
                        "The Boutique Suites " + destination,
                        request.getBudget().doubleValue() * 0.18 / days,
                        4.5,
                        "Historic Quarter, " + destination
                ),

                new AiTripResponse.HotelItem(
                        "Eco-Stay Haven " + destination,
                        request.getBudget().doubleValue() * 0.12 / days,
                        4.3,
                        "Waterfront Promenade, " + destination
                )
        );

        List<AiTripResponse.RestaurantItem> restaurants = List.of(

                new AiTripResponse.RestaurantItem(
                        "La Trattoria " + destination,
                        4.8,
                        "$$$",
                        "Downtown Main St, " + destination
                ),

                new AiTripResponse.RestaurantItem(
                        "Bistro de L'Ocean",
                        4.6,
                        "$$",
                        "Harbor View Avenue, " + destination
                ),

                new AiTripResponse.RestaurantItem(
                        "Spice & Flavors Kitchen",
                        4.7,
                        "$$",
                        "Cultural Village, " + destination
                )
        );

        List<AiTripResponse.PackingItem> packing = new ArrayList<>(
                List.of(
                        new AiTripResponse.PackingItem("Comfortable Walking Shoes", "Clothing"),
                        new AiTripResponse.PackingItem("Passport & Travel Insurance Docs", "Documents"),
                        new AiTripResponse.PackingItem("Universal Power Adapter & Powerbank", "Electronics"),
                        new AiTripResponse.PackingItem("First-Aid & Personal Medication Kit", "Health"),
                        new AiTripResponse.PackingItem("Weather-appropriate Outerwear / Jacket", "Clothing"),
                        new AiTripResponse.PackingItem("Sunscreen & Sunglasses", "Health")
                )
        );

        if ("Family".equalsIgnoreCase(style)) {

            packing.add(
                    new AiTripResponse.PackingItem(
                            "Kids Snacks & Entertainment Games",
                            "Electronics"
                    )
            );

        } else if ("Solo".equalsIgnoreCase(style)) {

            packing.add(
                    new AiTripResponse.PackingItem(
                            "Travel Journal & Noise Canceling Headphones",
                            "Electronics"
                    )
            );
        }

        return AiTripResponse.builder()
                .itinerary(itineraries)
                .hotels(hotels)
                .restaurants(restaurants)
                .packingList(packing)
                .estimatedCostsSummary(
                        String.format(
                                "Estimated Total: $%s for %d travelers over %d days.",
                                request.getBudget(),
                                request.getTravelers(),
                                days
                        )
                )
                .travelTips(
                        List.of(
                                "Purchase local transit passes on Day 1 for discounted transport.",
                                "Reserve top restaurants 24-48 hours in advance during peak season.",
                                "Keep digital backups of important travel documents stored safely."
                        )
                )
                .build();
    }

    public String generateLocalChatReply(
            TripResponse trip,
            String userMessage
    ) {

        String msg = userMessage.toLowerCase();

        if (msg.contains("restaurant")
                || msg.contains("food")
                || msg.contains("eat")) {

            return String.format(
                    "For great food in %s, check out local dining options listed in your trip view! Top picks include local bistros near the city center.",
                    trip.getDestination()
            );
        }

        if (msg.contains("hotel")
                || msg.contains("stay")
                || msg.contains("lodging")) {

            return String.format(
                    "We have curated 3 great hotel options for %s fitting your $%s budget allocation.",
                    trip.getDestination(),
                    trip.getBudget()
            );
        }

        if (msg.contains("weather")
                || msg.contains("rain")
                || msg.contains("pack")) {

            return String.format(
                    "Be sure to check your weather forecast widget and packing list tab for %s to pack the right clothing!",
                    trip.getDestination()
            );
        }

        return String.format(
                "Great question about your %d-day trip to %s! Feel free to customize your daily itinerary or check our emergency lookup tool for local assistance.",
                trip.getDays(),
                trip.getDestination()
        );
    }
}
