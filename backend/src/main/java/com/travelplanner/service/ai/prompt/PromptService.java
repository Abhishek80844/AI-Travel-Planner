package com.travelplanner.service.ai.prompt;

import com.travelplanner.dto.CreateTripRequest;
import org.springframework.stereotype.Service;

@Service
public class PromptService {

    public String buildTripPrompt(CreateTripRequest request) {

        return String.format(
                "Generate a detailed, realistic %d-day travel itinerary for a %s trip to %s with %d travelers and a total budget of $%s. " +
                        "Respond strictly with a single valid raw JSON object (no markdown, no backticks, no wrapping text) with these exact keys:\n" +
                        "{\n" +
                        "  \"itinerary\": [{\"day\": 1, \"morning\": \"...\", \"afternoon\": \"...\", \"evening\": \"...\"}],\n" +
                        "  \"hotels\": [{\"name\": \"...\", \"price\": 120.0, \"rating\": 4.5, \"address\": \"...\"}],\n" +
                        "  \"restaurants\": [{\"name\": \"...\", \"rating\": 4.7, \"price\": \"$$\", \"location\": \"...\"}],\n" +
                        "  \"packingList\": [{\"item\": \"...\", \"category\": \"Clothing\"}],\n" +
                        "  \"estimatedCostsSummary\": \"...\",\n" +
                        "  \"travelTips\": [\"...\"]\n" +
                        "}",
                request.getDays(),
                request.getTravelStyle(),
                request.getDestination(),
                request.getTravelers(),
                request.getBudget()
        );
    }
}
