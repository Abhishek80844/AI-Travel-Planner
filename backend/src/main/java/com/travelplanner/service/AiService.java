package com.travelplanner.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelplanner.service.ai.parser.JsonResponseParser;
import com.travelplanner.service.ai.prompt.PromptService;
import com.travelplanner.dto.AiTripResponse;
import com.travelplanner.dto.CreateTripRequest;
import com.travelplanner.dto.TripResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

    @Value("${integrations.openai.api-key:}")
    private String openAiApiKey;

    @Value("${integrations.openai.model:gpt-4o}")
    private String openAiModel;

    @Value("${integrations.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${integrations.gemini.model:gemini-1.5-flash}")
    private String geminiModel;

    private final ObjectMapper objectMapper;
    private final PromptService promptService;
    private final JsonResponseParser jsonResponseParser;
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Generates a structured trip response using Gemini, OpenAI, or rich intelligent fallback.
     * Includes up to 2 retries on LLM parsing error.
     */
    public AiTripResponse generateTripItinerary(CreateTripRequest request) {
        int maxRetries = 2;

        // 1. Try Gemini if configured (Primary AI Engine)
        if (StringUtils.hasText(geminiApiKey)) {
            int attempts = 0;
            while (attempts <= maxRetries) {
                try {
                    log.info("Calling Google Gemini API ({}) Attempt {}...", geminiModel, attempts + 1);
                    return callGeminiApi(request);
                } catch (Exception ex) {
                    log.warn("Gemini API call attempt {} failed: {}", attempts + 1, ex.getMessage());
                    attempts++;
                }
            }
        }

        // 2. Try OpenAI if configured
        if (StringUtils.hasText(openAiApiKey)) {
            int attempts = 0;
            while (attempts <= maxRetries) {
                try {
                    log.info("Calling OpenAI API (Attempt {})...", attempts + 1);
                    return callOpenAiApi(request);
                } catch (Exception ex) {
                    log.warn("OpenAI API call attempt {} failed: {}", attempts + 1, ex.getMessage());
                    attempts++;
                }
            }
        }

        // 3. Fallback to smart structured generator
        log.info("Using smart structured fallback generator for destination: {}", request.getDestination());
        return generateFallbackTrip(request);
    }

    /**
     * Answers user's questions grounded in the current trip's context using Google Gemini API.
     */
    public String chatAboutTrip(TripResponse trip, String userMessage) {
        if (StringUtils.hasText(geminiApiKey)) {
            try {
                log.info("Generating travel advice via Google Gemini API ({})", geminiModel);
                return callGeminiChat(trip, userMessage);
            } catch (Exception e) {
                log.warn("Gemini chat failed, trying OpenAI or falling back to local assistant", e);
            }
        }

        if (StringUtils.hasText(openAiApiKey)) {
            try {
                return callOpenAiChat(trip, userMessage);
            } catch (Exception e) {
                log.warn("OpenAI chat failed, falling back to local chat assistant", e);
            }
        }

        return generateLocalChatReply(trip, userMessage);
    }

    /**
     * Provides standalone AI travel advice and tips powered by Google Gemini API.
     */
    public String getGeneralTravelAdvice(String query) {
        if (StringUtils.hasText(geminiApiKey)) {
            try {
                return callGeminiStandaloneAdvice(query);
            } catch (Exception e) {
                log.warn("Google Gemini standalone travel advice failed: {}", e.getMessage());
            }
        }

        if (StringUtils.hasText(openAiApiKey)) {
            try {
                return callOpenAiStandaloneAdvice(query);
            } catch (Exception e) {
                log.warn("OpenAI standalone travel advice failed: {}", e.getMessage());
            }
        }

        return "Here is some general travel advice: Always carry digital & paper copies of your documents, check local transit options upon arrival, and keep local currency for small vendors.";
    }

    private AiTripResponse callOpenAiApi(CreateTripRequest request) throws Exception {
        String url = "https://api.openai.com/v1/chat/completions";

        String prompt = promptService.buildTripPrompt(request);

        Map<String, Object> body = new HashMap<>();
        body.put("model", openAiModel);
        body.put("response_format", Map.of("type", "json_object"));

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", "You are an expert AI Travel Planner. Always return clean, strict JSON adhering to requested structure."));
        messages.add(Map.of("role", "user", "content", prompt));
        body.put("messages", messages);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiApiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
            if (choices != null && !choices.isEmpty()) {
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                String content = (String) message.get("content");
                return objectMapper.readValue(jsonResponseParser.cleanJsonText(content), AiTripResponse.class);
            }
        }
        throw new RuntimeException("Empty or invalid response from OpenAI");
    }

    private AiTripResponse callGeminiApi(CreateTripRequest request) throws Exception {
        String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                StringUtils.hasText(geminiModel) ? geminiModel : "gemini-1.5-flash", geminiApiKey);

        String prompt = "You are an expert AI Travel Planner. "
                + promptService.buildTripPrompt(request);

        Map<String, Object> part = Map.of("text", prompt);
        Map<String, Object> content = Map.of("parts", List.of(part));
        Map<String, Object> generationConfig = Map.of("response_mime_type", "application/json");

        Map<String, Object> body = Map.of(
                "contents", List.of(content),
                "generationConfig", generationConfig
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<String, Object> candidateContent = (Map<String, Object>) candidates.get(0).get("content");
                if (candidateContent != null) {
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) candidateContent.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        String jsonText = (String) parts.get(0).get("text");
                        return objectMapper.readValue(jsonResponseParser.cleanJsonText(jsonText), AiTripResponse.class);
                    }
                }
            }
        }
        throw new RuntimeException("Empty or invalid response from Gemini API");
    }

    private String callOpenAiChat(TripResponse trip, String userMessage) {
        String url = "https://api.openai.com/v1/chat/completions";

        String context = String.format(
                "Current Trip Context: Destination: %s, Days: %d, Budget: $%s, Travel Style: %s, Travelers: %d.",
                trip.getDestination(), trip.getDays(), trip.getBudget(), trip.getTravelStyle(), trip.getTravelers()
        );

        Map<String, Object> body = new HashMap<>();
        body.put("model", openAiModel);

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", "You are a helpful travel assistant. Answer questions concisely based on the trip context:\n" + context));
        messages.add(Map.of("role", "user", "content", userMessage));
        body.put("messages", messages);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiApiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
            if (choices != null && !choices.isEmpty()) {
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                return (String) message.get("content");
            }
        }
        return generateLocalChatReply(trip, userMessage);
    }

    private String callGeminiChat(TripResponse trip, String userMessage) {
        String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                StringUtils.hasText(geminiModel) ? geminiModel : "gemini-1.5-flash", geminiApiKey);

        String prompt = """
                You are an expert AI Travel Planner.

                Your job is to help users with:
                - Tourist attractions
                - Historical information
                - Nearby places
                - Hotels
                - Restaurants
                - Weather
                - Local food
                - Travel routes
                - Budget planning
                - Safety tips
                - Travel itinerary

                Current Trip Context: Destination: %s, Days: %d, Budget: $%s, Travel Style: %s, Travelers: %d.

                Always provide accurate, up-to-date, concise, and helpful travel information.
                If the question is not related to travel or tourism, politely respond that you only assist with travel-related queries.

                User Question:
                """.formatted(trip.getDestination(), trip.getDays(), trip.getBudget(), trip.getTravelStyle(), trip.getTravelers()) + userMessage;

        Map<String, Object> part = Map.of("text", prompt);
        Map<String, Object> content = Map.of("parts", List.of(part));
        Map<String, Object> body = Map.of("contents", List.of(content));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<String, Object> candidateContent = (Map<String, Object>) candidates.get(0).get("content");
                if (candidateContent != null) {
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) candidateContent.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        return (String) parts.get(0).get("text");
                    }
                }
            }
        }
        return generateLocalChatReply(trip, userMessage);
    }

    private String callGeminiStandaloneAdvice(String userMessage) throws Exception {
        String modelName = StringUtils.hasText(geminiModel) ? geminiModel : "gemini-1.5-flash";
        String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                modelName, geminiApiKey);

        String prompt = """
                You are an expert AI Travel Planner.

                Your job is to help users with:
                - Tourist attractions
                - Historical information
                - Nearby places
                - Hotels
                - Restaurants
                - Weather
                - Local food
                - Travel routes
                - Budget planning
                - Safety tips
                - Travel itinerary

                Always provide accurate, up-to-date, concise, and helpful travel information.
                If the question is not related to travel or tourism, politely respond that you only assist with travel-related queries.

                User Question:
                """ + userMessage;

        Map<String, Object> part = Map.of("text", prompt);
        Map<String, Object> content = Map.of("parts", List.of(part));
        Map<String, Object> body = Map.of("contents", List.of(content));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<String, Object> candidateContent = (Map<String, Object>) candidates.get(0).get("content");
                if (candidateContent != null) {
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) candidateContent.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        return (String) parts.get(0).get("text");
                    }
                }
            }
        }
        throw new RuntimeException("Empty response from Google Gemini API for travel advice");
    }

    private String callOpenAiStandaloneAdvice(String query) throws Exception {
        String url = "https://api.openai.com/v1/chat/completions";

        Map<String, Object> body = new HashMap<>();
        body.put("model", openAiModel);

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", "You are an expert AI Travel Advisor. Provide concise, high-value travel tips and advice."));
        messages.add(Map.of("role", "user", "content", query));
        body.put("messages", messages);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiApiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
            if (choices != null && !choices.isEmpty()) {
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                return (String) message.get("content");
            }
        }
        throw new RuntimeException("Empty response from OpenAI API for travel advice");
    }

    private String buildPromptText(CreateTripRequest request) {
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
                request.getDays(), request.getTravelStyle(), request.getDestination(), request.getTravelers(), request.getBudget()
        );
    }

    private String cleanJsonText(String rawText) {
        if (rawText == null) return "";
        String cleaned = rawText.trim();
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        return cleaned.trim();
    }

    public AiTripResponse generateFallbackTrip(CreateTripRequest request) {
        String dest = request.getDestination();
        int days = request.getDays();
        String style = request.getTravelStyle();

        List<AiTripResponse.DayItinerary> itineraries = new ArrayList<>();
        for (int i = 1; i <= days; i++) {
            itineraries.add(new AiTripResponse.DayItinerary(
                    i,
                    String.format("Day %d Morning: Explore top historic landmarks and central square in %s. Enjoy fresh coffee and local pastries.", i, dest),
                    String.format("Day %d Afternoon: Guided cultural tour, visit iconic museums and popular shopping quarters tailored for %s travelers.", i, style.toLowerCase()),
                    String.format("Day %d Evening: Sunset viewpoints followed by authentic dining experience at a renowned local spot.", i)
            ));
        }

        List<AiTripResponse.HotelItem> hotels = List.of(
                new AiTripResponse.HotelItem("Grand Central Resort & Spa " + dest, request.getBudget().doubleValue() * 0.25 / days, 4.7, "Central Downtown District, " + dest),
                new AiTripResponse.HotelItem("The Boutique Suites " + dest, request.getBudget().doubleValue() * 0.18 / days, 4.5, "Historic Quarter, " + dest),
                new AiTripResponse.HotelItem("Eco-Stay Haven " + dest, request.getBudget().doubleValue() * 0.12 / days, 4.3, "Waterfront Promenade, " + dest)
        );

        List<AiTripResponse.RestaurantItem> restaurants = List.of(
                new AiTripResponse.RestaurantItem("La Trattoria " + dest, 4.8, "$$$", "Downtown Main St, " + dest),
                new AiTripResponse.RestaurantItem("Bistro de L'Ocean", 4.6, "$$", "Harbor View Avenue, " + dest),
                new AiTripResponse.RestaurantItem("Spice & Flavors Kitchen", 4.7, "$$", "Cultural Village, " + dest)
        );

        List<AiTripResponse.PackingItem> packing = new ArrayList<>(List.of(
                new AiTripResponse.PackingItem("Comfortable Walking Shoes", "Clothing"),
                new AiTripResponse.PackingItem("Passport & Travel Insurance Docs", "Documents"),
                new AiTripResponse.PackingItem("Universal Power Adapter & Powerbank", "Electronics"),
                new AiTripResponse.PackingItem("First-Aid & Personal Medication Kit", "Health"),
                new AiTripResponse.PackingItem("Weather-appropriate Outerwear / Jacket", "Clothing"),
                new AiTripResponse.PackingItem("Sunscreen & Sunglasses", "Health")
        ));

        if ("Family".equalsIgnoreCase(style)) {
            packing.add(new AiTripResponse.PackingItem("Kids Snacks & Entertainment Games", "Electronics"));
        } else if ("Solo".equalsIgnoreCase(style)) {
            packing.add(new AiTripResponse.PackingItem("Travel Journal & Noise Canceling Headphones", "Electronics"));
        }

        return AiTripResponse.builder()
                .itinerary(itineraries)
                .hotels(hotels)
                .restaurants(restaurants)
                .packingList(packing)
                .estimatedCostsSummary(String.format("Estimated Total: $%s for %d travelers over %d days.", request.getBudget(), request.getTravelers(), days))
                .travelTips(List.of(
                        "Purchase local transit passes on Day 1 for discounted transport.",
                        "Reserve top restaurants 24-48 hours in advance during peak season.",
                        "Keep digital backups of important travel documents stored safely."
                ))
                .build();
    }

    private String generateLocalChatReply(TripResponse trip, String userMessage) {
        String msg = userMessage.toLowerCase();
        if (msg.contains("restaurant") || msg.contains("food") || msg.contains("eat")) {
            return String.format("For great food in %s, check out local dining options listed in your trip view! Top picks include local bistros near the city center.", trip.getDestination());
        } else if (msg.contains("hotel") || msg.contains("stay") || msg.contains("lodging")) {
            return String.format("We have curated 3 great hotel options for %s fitting your $%s budget allocation.", trip.getDestination(), trip.getBudget());
        } else if (msg.contains("weather") || msg.contains("rain") || msg.contains("pack")) {
            return String.format("Be sure to check your weather forecast widget and packing list tab for %s to pack the right clothing!", trip.getDestination());
        }
        return String.format("Great question about your %d-day trip to %s! Feel free to customize your daily itinerary or check our emergency lookup tool for local assistance.", trip.getDays(), trip.getDestination());
    }
}

