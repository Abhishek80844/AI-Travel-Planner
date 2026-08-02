package com.travelplanner.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelplanner.service.ai.fallback.FallbackAiService;
import com.travelplanner.service.ai.parser.JsonResponseParser;
import com.travelplanner.service.ai.prompt.PromptService;
import com.travelplanner.service.ai.provider.GeminiService;
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
    private final FallbackAiService fallbackAiService;
    private final GeminiService geminiService;
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Generates a structured trip response using Gemini, OpenAI, or rich intelligent fallback.
     * Includes up to 2 retries on LLM parsing error.
     */
    public AiTripResponse generateTripItinerary(CreateTripRequest request) {
        int maxRetries = 2;

        // 1. Try Gemini if configured (Primary AI Engine)
        if (geminiService.isConfigured()) {
            int attempts = 0;
            while (attempts <= maxRetries) {
                try {
                    log.info("Calling Google Gemini API (Attempt {})...", attempts + 1);
                    return geminiService.generateTrip(request);
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
        return fallbackAiService.generateFallbackTrip(request);
    }

    /**
     * Answers user's questions grounded in the current trip's context using Google Gemini API.
     */
    public String chatAboutTrip(TripResponse trip, String userMessage) {
        if (geminiService.isConfigured()) {
            try {
                log.info("Generating travel advice via Google Gemini API");
                return geminiService.chat(trip, userMessage);
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

        return fallbackAiService.generateLocalChatReply(trip, userMessage);
    }

    /**
     * Provides standalone AI travel advice and tips powered by Google Gemini API.
     */
    public String getGeneralTravelAdvice(String query) {
        if (geminiService.isConfigured()) {
            try {
                return geminiService.travelAdvice(query);
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
        return fallbackAiService.generateLocalChatReply(trip, userMessage);
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


}

