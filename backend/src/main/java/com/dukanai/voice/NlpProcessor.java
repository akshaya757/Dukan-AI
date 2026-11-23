package com.dukanai.voice;

/**
 * Abstraction for NLP processing.
 * Implementations can use rule-based parsing, Gemini API, or a hybrid approach.
 */
public interface NlpProcessor {

    /**
     * Parse a natural language command (Telugu/English/mixed) into a structured ParsedCommand.
     *
     * @param text The raw text from speech-to-text
     * @return A ParsedCommand with intent, product, quantity, and unit
     */
    ParsedCommand parse(String text);
}
