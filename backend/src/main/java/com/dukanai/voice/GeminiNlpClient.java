package com.dukanai.voice;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.Map;

/**
 * Uses Gemini API for high-quality Telugu+English NLP parsing.
 * Falls back gracefully if API key is not configured.
 */
@Component
public class GeminiNlpClient {

    private static final Logger log = LoggerFactory.getLogger(GeminiNlpClient.class);

    @Value("${gemini.api.key:}")
    private String apiKey;

    private static final String GEMINI_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

    private static final String SYSTEM_PROMPT = """
        You are a bilingual inventory assistant for Indian small businesses.
        Parse Telugu-English mixed inventory commands into structured JSON.
        
        Intents:
        - ADD_STOCK: adding stock (add, vachayi, ochayi, vachindi, add cheyyi, stock in)
        - REMOVE_STOCK: removing stock (remove, ammamu, teesey, sold, issued)
        - CHECK_STOCK: checking quantity (entha undi, how much, stock unda, available)
        - LOW_STOCK: asking which products are low (takkuva, low stock, which products are low)
        - UNKNOWN: cannot determine intent
        
        Units to recognize: bags, kg, litres, ml, grams, boxes, pieces, packets, dozens
        
        Return ONLY valid JSON, no markdown, no explanation:
        {"intent":"ADD_STOCK","product":"Rice","quantity":5.0,"unit":"bags"}
        
        If intent is LOW_STOCK:
        {"intent":"LOW_STOCK"}
        
        If intent is CHECK_STOCK:
        {"intent":"CHECK_STOCK","product":"Rice"}
        
        If unknown:
        {"intent":"UNKNOWN","error":"reason"}
        """;

    public ParsedCommand parse(String text) {
        if (apiKey == null || apiKey.isBlank()) {
            log.debug("Gemini API key not configured, skipping");
            return null;
        }

        try {
            WebClient client = WebClient.create();

            Map<String, Object> requestBody = Map.of(
                "contents", new Object[]{
                    Map.of("role", "user", "parts", new Object[]{
                        Map.of("text", SYSTEM_PROMPT + "\n\nParse: " + text)
                    })
                }
            );

            String response = client.post()
                .uri(GEMINI_URL + "?key=" + apiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(8))
                .onErrorResume(e -> {
                    log.warn("Gemini API error/timeout: {}", e.getMessage());
                    return Mono.empty();
                })
                .block();

            if (response == null) return null;
            return parseGeminiResponse(response, text);

        } catch (Exception e) {
            log.warn("Gemini API call failed: {}", e.getMessage());
            return null;
        }
    }

    private ParsedCommand parseGeminiResponse(String response, String originalText) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response);
            String content = root.path("candidates").get(0)
                .path("content").path("parts").get(0)
                .path("text").asText();

            // Strip markdown code blocks if present
            content = content.replaceAll("```json", "").replaceAll("```", "").trim();

            JsonNode parsed = mapper.readTree(content);
            String intentStr = parsed.path("intent").asText("UNKNOWN");

            ParsedCommand cmd = new ParsedCommand();
            cmd.setOriginalText(originalText);
            cmd.setIntent(ParsedCommand.Intent.valueOf(intentStr));

            if (parsed.has("product")) cmd.setProduct(parsed.path("product").asText());
            if (parsed.has("quantity") && !parsed.path("quantity").isNull()) {
                cmd.setQuantity(new BigDecimal(parsed.path("quantity").asText()));
            }
            if (parsed.has("unit")) cmd.setUnit(parsed.path("unit").asText());
            if (parsed.has("error")) cmd.setErrorMessage(parsed.path("error").asText());

            log.info("Gemini parsed: intent={}, product={}, qty={}, unit={}",
                cmd.getIntent(), cmd.getProduct(), cmd.getQuantity(), cmd.getUnit());

            return cmd;

        } catch (Exception e) {
            log.warn("Failed to parse Gemini response: {}", e.getMessage());
            return null;
        }
    }
}
