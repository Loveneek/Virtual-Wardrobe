package com.virtualtryon.Backend.shared.gemini;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${google.gemini.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, String> detectCategory(byte[] imageBytes, String mimeType) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key="
                + apiKey;

        String base64Image = Base64.getEncoder().encodeToString(imageBytes);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = Map.of(
                "contents", List.of(Map.of(
                        "parts", List.of(
                                Map.of("text",
                                        "Look carefully at this clothing item image. Classify it. Reply strictly with JSON containing exactly two keys: 'category' (one of: Shirts, T-Shirts, Pants, Shoes, Jackets) and 'bodyPart' (one of: upper_body, lower_body, footwear). No markdown blocks or other text."),
                                Map.of("inline_data", Map.of(
                                        "mime_type", mimeType,
                                        "data", base64Image))))));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            Map candidates = (Map) ((List) response.getBody().get("candidates")).get(0);
            Map content = (Map) candidates.get("content");
            Map part = (Map) ((List) content.get("parts")).get(0);
            String responseText = part.get("text").toString().trim();

            if (responseText.startsWith("```json")) {
                responseText = responseText.replace("```json", "");
                if (responseText.endsWith("```")) {
                    responseText = responseText.substring(0, responseText.length() - 3);
                }
                responseText = responseText.trim();
            } else if (responseText.startsWith("```")) {
                responseText = responseText.replace("```", "").trim();
            }

            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            Map<String, String> result = mapper.readValue(responseText,
                    new com.fasterxml.jackson.core.type.TypeReference<Map<String, String>>() {
                    });

            String detectedCategory = result.getOrDefault("category", "Shirts");
            String detectedBodyPart = result.getOrDefault("bodyPart", "upper_body");

            // Validate response is one of our categories
            List<String> validCategories = List.of("Shirts", "T-Shirts", "Pants", "Shoes", "Jackets");
            boolean valid = false;
            for (String cat : validCategories) {
                if (detectedCategory.equalsIgnoreCase(cat)) {
                    detectedCategory = cat;
                    valid = true;
                    break;
                }
            }
            if (!valid)
                detectedCategory = "Shirts";

            return Map.of("category", detectedCategory, "bodyPart", detectedBodyPart, "rawText", responseText);
        } catch (Exception e) {
            System.err.println("Gemini error: " + e.getMessage());
            return Map.of("category", "Shirts", "bodyPart", "upper_body", "error", e.getMessage());
        }
    }
}
