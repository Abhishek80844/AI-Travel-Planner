package com.travelplanner.service;

import com.travelplanner.dto.AiTripResponse;
import com.travelplanner.dto.CreateTripRequest;
import com.travelplanner.dto.TripResponse;
import com.travelplanner.service.ai.fallback.FallbackAiService;
import com.travelplanner.service.ai.parser.JsonResponseParser;
import com.travelplanner.service.ai.prompt.PromptService;
import com.travelplanner.service.ai.provider.GeminiService;
import com.travelplanner.service.ai.provider.OpenAiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

    private final GeminiService geminiService;
    private final OpenAiService openAiService;
    private final PromptService promptService;
    private final JsonResponseParser parser;
    private final FallbackAiService fallback;

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
        if (openAiService.isConfigured()) {
            int attempts = 0;
            while (attempts <= maxRetries) {
                try {
                    log.info("Calling OpenAI API (Attempt {})...", attempts + 1);
                    return openAiService.generateTrip(request);
                } catch (Exception ex) {
                    log.warn("OpenAI API call attempt {} failed: {}", attempts + 1, ex.getMessage());
                    attempts++;
                }
            }
        }

        // 3. Fallback to smart structured generator
        log.info("Using smart structured fallback generator for destination: {}", request.getDestination());
        return fallback.generateFallbackTrip(request);
    }

    /**
     * Answers user's questions grounded in the current trip's context.
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

        if (openAiService.isConfigured()) {
            try {
                log.info("Generating travel advice via OpenAI API");
                return openAiService.chat(trip, userMessage);
            } catch (Exception e) {
                log.warn("OpenAI chat failed, falling back to local chat assistant", e);
            }
        }

        return fallback.generateLocalChatReply(trip, userMessage);
    }

    /**
     * Provides standalone AI travel advice and tips.
     */
    public String getGeneralTravelAdvice(String query) {
        if (geminiService.isConfigured()) {
            try {
                return geminiService.travelAdvice(query);
            } catch (Exception e) {
                log.warn("Google Gemini standalone travel advice failed: {}", e.getMessage());
            }
        }

        if (openAiService.isConfigured()) {
            try {
                return openAiService.travelAdvice(query);
            } catch (Exception e) {
                log.warn("OpenAI standalone travel advice failed: {}", e.getMessage());
            }
        }

        return "Here is some general travel advice: Always carry digital & paper copies of your documents, check local transit options upon arrival, and keep local currency for small vendors.";
    }
}
