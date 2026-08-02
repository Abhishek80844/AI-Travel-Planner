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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class OpenAiService implements AiProvider {

    @Value("${integrations.openai.api-key:}")
    private String openAiApiKey;

    @Value("${integrations.openai.model:gpt-4o}")
    private String openAiModel;

    private final ObjectMapper objectMapper;
    private final PromptService promptService;
    private final JsonResponseParser jsonResponseParser;
    private final WebClient webClient;

    public boolean isConfigured() {
        return StringUtils.hasText(openAiApiKey);
    }

    @Override
    public AiTripResponse generateTrip(CreateTripRequest request) throws Exception {
        String url = "https://api.openai.com/v1/chat/completions";
        String prompt = promptService.buildTripPrompt(request);

        Map<String, Object> body = new HashMap<>();
        body.put("model", openAiModel);
        body.put("response_format", Map.of("type", "json_object"));

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", "You are an expert AI Travel Planner. Always return clean, strict JSON adhering to requested structure."));
        messages.add(Map.of("role", "user", "content", prompt));
        body.put("messages", messages);

        Map responseBody = webClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .headers(h -> h.setBearerAuth(openAiApiKey))
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (responseBody != null) {
            List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
            if (choices != null && !choices.isEmpty()) {
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                String content = (String) message.get("content");
                return objectMapper.readValue(jsonResponseParser.cleanJsonText(content), AiTripResponse.class);
            }
        }
        throw new RuntimeException("Empty or invalid response from OpenAI");
    }

    @Override
    public String chat(TripResponse trip, String userMessage) {
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

        Map responseBody = webClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .headers(h -> h.setBearerAuth(openAiApiKey))
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (responseBody != null) {
            List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
            if (choices != null && !choices.isEmpty()) {
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                return (String) message.get("content");
            }
        }
        throw new RuntimeException("Empty response from OpenAI chat");
    }

    @Override
    public String generalAdvice(String query) throws Exception {
        return travelAdvice(query);
    }

    public String travelAdvice(String query) throws Exception {
        String url = "https://api.openai.com/v1/chat/completions";

        Map<String, Object> body = new HashMap<>();
        body.put("model", openAiModel);

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", "You are an expert AI Travel Advisor. Provide concise, high-value travel tips and advice."));
        messages.add(Map.of("role", "user", "content", query));
        body.put("messages", messages);

        Map responseBody = webClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .headers(h -> h.setBearerAuth(openAiApiKey))
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (responseBody != null) {
            List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
            if (choices != null && !choices.isEmpty()) {
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                return (String) message.get("content");
            }
        }
        throw new RuntimeException("Empty response from OpenAI API for travel advice");
    }
}
