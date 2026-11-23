package com.dukanai.voice;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Hybrid NLP processor: tries Gemini first, falls back to rule-based parser.
 * This is the primary NlpProcessor bean used throughout the application.
 */
@Component
public class HybridNlpProcessor implements NlpProcessor {

    private static final Logger log = LoggerFactory.getLogger(HybridNlpProcessor.class);

    private final GeminiNlpClient geminiClient;
    private final RuleBasedParser ruleBasedParser;

    @Autowired
    public HybridNlpProcessor(GeminiNlpClient geminiClient, RuleBasedParser ruleBasedParser) {
        this.geminiClient = geminiClient;
        this.ruleBasedParser = ruleBasedParser;
    }

    @Override
    public ParsedCommand parse(String text) {
        log.info("Processing voice command: '{}'", text);

        // Try Gemini first for best accuracy
        ParsedCommand geminiResult = geminiClient.parse(text);
        if (geminiResult != null && geminiResult.getIntent() != ParsedCommand.Intent.UNKNOWN) {
            log.info("Using Gemini result: {}", geminiResult.getIntent());
            return geminiResult;
        }

        // Fall back to rule-based parser
        log.info("Using rule-based parser fallback");
        ParsedCommand ruleResult = ruleBasedParser.parse(text);
        return ruleResult;
    }
}
