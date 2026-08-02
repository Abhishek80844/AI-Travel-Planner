package com.travelplanner.service.ai.parser;

import org.springframework.stereotype.Component;

@Component
public class JsonResponseParser {

    /**
     * Removes markdown code blocks and returns clean JSON.
     */
    public String cleanJsonText(String rawText) {

        if (rawText == null) {
            return "";
        }

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
