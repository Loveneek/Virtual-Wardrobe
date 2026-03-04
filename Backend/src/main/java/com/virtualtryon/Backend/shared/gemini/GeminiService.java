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

    public String detectCategory(byte[] imageBytes, String mimeType) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;

        String base64Image = Base64.getEncoder().encodeToString(imageBytes);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = Map.of(
            "contents", List.of(Map.of(
                "parts", List.of(
                    Map.of("text", "Look carefully at this clothing item image. Classify it into exactly one of these categories: Shirts, T-Shirts, Pants, Shoes, Jackets. Reply with only the category name, nothing else. No punctuation, no explanation."),
                    Map.of("inline_data", Map.of(
                        "mime_type", mimeType,
                        "data", base64Image
                    ))
                )
            ))
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            Map candidates = (Map) ((List) response.getBody().get("candidates")).get(0);
            Map content = (Map) candidates.get("content");
            Map part = (Map) ((List) content.get("parts")).get(0);
            String detectedCategory = part.get("text").toString().trim();

            // Validate response is one of our categories
            List<String> validCategories = List.of("Shirts", "T-Shirts", "Pants", "Shoes", "Jackets");
            for (String cat : validCategories) {
                if (detectedCategory.equalsIgnoreCase(cat)) {
                    return cat;
                }
            }
            return "Shirts"; // fallback
        } catch (Exception e) {
            System.err.println("Gemini error: " + e.getMessage());
            return "Shirts";
        }
    }
}
