package com.travelplanner.service.ai.provider;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelplanner.dto.AiTripResponse;
import com.travelplanner.dto.CreateTripRequest;
import com.travelplanner.dto.TripResponse;
import com.travelplanner.service.ai.parser.JsonResponseParser;
import com.travelplanner.service.ai.prompt.PromptService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiService {

    @Value("${integrations.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${integrations.gemini.model:gemini-1.5-flash}")
    private String geminiModel;

    private final ObjectMapper objectMapper;
    private final PromptService promptService;
    private final JsonResponseParser jsonResponseParser;
    private final WebClient webClient;

    public boolean isConfigured() {
        return StringUtils.hasText(geminiApiKey);
    }

    public AiTripResponse generateTrip(CreateTripRequest request) throws Exception {
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

        Map responseBody = webClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (responseBody != null) {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
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

    public String chat(TripResponse trip, String userMessage) {
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

        Map responseBody = webClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (responseBody != null) {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
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
        throw new RuntimeException("Empty or invalid chat response from Gemini API");
    }

    public String travelAdvice(String userMessage) throws Exception {
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

        Map responseBody = webClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (responseBody != null) {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
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
}
