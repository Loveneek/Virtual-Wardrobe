package com.virtualtryon.Backend.shared.replicate;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpStatusCodeException;
import java.util.Map;
import java.util.List;

@Service
public class ReplicateService {

    @Value("${replicate.api.token}")
    private String apiToken;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String REPLICATE_URL = "https://api.replicate.com/v1/predictions";
    private static final String MODEL_VERSION = "c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4";

    public String runTryOn(String personImageUrl, String clothingImageUrl) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiToken);

        Map<String, Object> input = Map.of(
                "human_img", personImageUrl,
                "garm_img", clothingImageUrl,
                "garment_des", "clothing item"
        );

        Map<String, Object> body = Map.of(
                "version", MODEL_VERSION,
                "input", input
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        
        ResponseEntity<Map> response;
        try {
            response = restTemplate.postForEntity(REPLICATE_URL, request, Map.class);
        } catch (HttpStatusCodeException e) {
            if (e.getStatusCode() == HttpStatus.PAYMENT_REQUIRED) {
                throw new RuntimeException("Insufficient Replicate credits to run this model. Please top up your Replicate account.");
            }
            throw new RuntimeException("Replicate API error: " + e.getResponseBodyAsString());
        }

        String predictionId = (String) response.getBody().get("id");
        return pollForResult(predictionId);
    }

    private String pollForResult(String predictionId) throws Exception {
        String url = REPLICATE_URL + "/" + predictionId;
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiToken);
        HttpEntity<Void> request = new HttpEntity<>(headers);

        for (int i = 0; i < 30; i++) {
            Thread.sleep(3000);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, request, Map.class);
            Map body = response.getBody();
            String status = (String) body.get("status");

            if ("succeeded".equals(status)) {
                Object output = body.get("output");
                if (output instanceof String) {
                    return (String) output;
                } else if (output instanceof List) {
                    List<String> outputList = (List<String>) output;
                    return outputList.isEmpty() ? null : outputList.get(0);
                }
                throw new RuntimeException("Unexpected output format from Replicate");
            } else if ("failed".equals(status)) {
                String errorMsg = (String) body.get("error");
                System.err.println("Replicate prediction failed: " + errorMsg);
                throw new RuntimeException("Try-on failed: " + (errorMsg != null ? errorMsg : "Unknown error"));
            }
        }
        throw new RuntimeException("Try-on timed out");
    }
}