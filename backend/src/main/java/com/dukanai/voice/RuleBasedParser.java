package com.dukanai.voice;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Rule-based Telugu+English NLP parser.
 *
 * Handles all demo test cases without requiring an external API.
 * Covers mixed language commands like "Rice 5 bags add cheyyi".
 */
@Component
public class RuleBasedParser {

    private static final Logger log = LoggerFactory.getLogger(RuleBasedParser.class);

    // ADD intent keywords (Telugu + English)
    private static final List<String> ADD_KEYWORDS = List.of(
        "add cheyyi", "add chesay", "vachayi", "vachindi", "ochayi", "ochindi",
        "stock add", "add stock", "add", "stock in", "received", "vachay",
        "vachai", "ochay", "ochai", "stock lo add", "veyyandi", "veyyi"
    );

    // REMOVE intent keywords (Telugu + English)
    private static final List<String> REMOVE_KEYWORDS = List.of(
        "ammamu", "ammay", "ammayyi", "teesey", "teesay", "remove cheyyi",
        "remove chesay", "sold", "remove", "stock out", "issue", "dispatched",
        "ichhamu", "ichi", "amma", "teesi", "tisi"
    );

    // CHECK intent keywords (Telugu + English)
    private static final List<String> CHECK_KEYWORDS = List.of(
        "entha undi", "entundi", "enta undi", "stock unda", "available unda",
        "how much", "check stock", "stock check", "ekkuva unda", "evvaro undi",
        "stock emi undi", "stock chupinchu", "chupinchu", "telupandi"
    );

    // LOW STOCK intent keywords
    private static final List<String> LOW_STOCK_KEYWORDS = List.of(
        "takkuva", "low stock", "low undi", "low products", "which products are low",
        "almost finished", "poyindi", "aipoyindi", "khalas", "finish",
        "reorder", "need to order", "alert", "warning"
    );

    // Unit normalization map
    private static final List<String[]> UNIT_ALIASES = List.of(
        new String[]{"bags", "bag", "sacks", "sack", "gunni", "gunny", "goni"},
        new String[]{"kg", "kilo", "kilos", "kilograms", "kilogram", "kgs"},
        new String[]{"litres", "liter", "liters", "litre", "lts", "lt"},
        new String[]{"ml", "millilitre", "milliliter"},
        new String[]{"grams", "gram", "gm", "gms"},
        new String[]{"boxes", "box", "cartons", "carton"},
        new String[]{"pieces", "piece", "pcs", "pc", "units", "unit"},
        new String[]{"packets", "packet", "pack", "packs"},
        new String[]{"dozens", "dozen", "dz"}
    );

    // Pattern for extracting number (including decimals)
    private static final Pattern NUMBER_PATTERN = Pattern.compile("(\\d+\\.?\\d*)");

    private static final List<String[]> NUMBER_WORDS = List.of(
        new String[]{"zero", "0"}, new String[]{"one", "1"}, new String[]{"two", "2"},
        new String[]{"three", "3"}, new String[]{"four", "4"}, new String[]{"five", "5"},
        new String[]{"six", "6"}, new String[]{"seven", "7"}, new String[]{"eight", "8"},
        new String[]{"nine", "9"}, new String[]{"ten", "10"},
        new String[]{"okati", "1"}, new String[]{"rendu", "2"}, new String[]{"moodu", "3"},
        new String[]{"naalugu", "4"}, new String[]{"aidu", "5"}, new String[]{"aaru", "6"},
        new String[]{"edu", "7"}, new String[]{"enimidi", "8"}, new String[]{"tommidi", "9"},
        new String[]{"padi", "10"}
    );

    public ParsedCommand parse(String text) {
        if (text == null || text.isBlank()) {
            return unknownCommand(text, "Empty command received");
        }

        String normalized = normalizeSpeechText(text);
        log.debug("Parsing command: '{}'", normalized);

        ParsedCommand.Intent intent = detectIntent(normalized);
        log.debug("Detected intent: {}", intent);

        ParsedCommand cmd = new ParsedCommand();
        cmd.setIntent(intent);
        cmd.setOriginalText(text);

        if (intent == ParsedCommand.Intent.LOW_STOCK) {
            return cmd;
        }

        if (intent == ParsedCommand.Intent.UNKNOWN) {
            cmd.setErrorMessage("Could not understand the command. Please try again.");
            return cmd;
        }

        // Extract product name, quantity, unit
        BigDecimal quantity = extractQuantity(normalized);
        String unit = extractUnit(normalized);
        String product = extractProduct(normalized, quantity, unit);

        cmd.setQuantity(quantity);
        cmd.setUnit(unit);
        cmd.setProduct(product);

        log.debug("Parsed — product: {}, qty: {}, unit: {}", product, quantity, unit);

        return cmd;
    }

    private ParsedCommand.Intent detectIntent(String text) {
        // Check LOW_STOCK first (multi-word phrases)
        for (String kw : LOW_STOCK_KEYWORDS) {
            if (text.contains(kw)) return ParsedCommand.Intent.LOW_STOCK;
        }
        // Check CHECK before ADD/REMOVE to avoid false positives
        for (String kw : CHECK_KEYWORDS) {
            if (text.contains(kw)) return ParsedCommand.Intent.CHECK_STOCK;
        }
        // Check ADD
        for (String kw : ADD_KEYWORDS) {
            if (text.contains(kw)) return ParsedCommand.Intent.ADD_STOCK;
        }
        // Check REMOVE
        for (String kw : REMOVE_KEYWORDS) {
            if (text.contains(kw)) return ParsedCommand.Intent.REMOVE_STOCK;
        }
        return ParsedCommand.Intent.UNKNOWN;
    }

    private BigDecimal extractQuantity(String text) {
        Matcher m = NUMBER_PATTERN.matcher(text);
        if (m.find()) {
            try {
                return new BigDecimal(m.group(1));
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    private String normalizeSpeechText(String text) {
        String normalized = text.toLowerCase().replaceAll("[?!.,;:]", " ").trim();
        for (String[] numberWord : NUMBER_WORDS) {
            normalized = normalized.replaceAll("\\b" + Pattern.quote(numberWord[0]) + "\\b", numberWord[1]);
        }
        return normalized.replaceAll("\\s+", " ");
    }

    private String extractUnit(String text) {
        for (String[] aliases : UNIT_ALIASES) {
            String canonical = aliases[0]; // first = canonical name
            for (String alias : aliases) {
                // Match as whole word
                if (text.matches(".*\\b" + Pattern.quote(alias) + "\\b.*")) {
                    return canonical;
                }
            }
        }
        return null;
    }

    private String extractProduct(String text, BigDecimal quantity, String unit) {
        // Remove number
        String cleaned = text.replaceAll("\\d+\\.?\\d*", "").trim();

        // Remove unit words
        if (unit != null) {
            for (String[] aliases : UNIT_ALIASES) {
                for (String alias : aliases) {
                    cleaned = cleaned.replaceAll("\\b" + Pattern.quote(alias) + "\\b", "").trim();
                }
            }
        }

        // Remove known intent keywords
        List<String> allKeywords = new java.util.ArrayList<>();
        allKeywords.addAll(ADD_KEYWORDS);
        allKeywords.addAll(REMOVE_KEYWORDS);
        allKeywords.addAll(CHECK_KEYWORDS);
        allKeywords.addAll(LOW_STOCK_KEYWORDS);

        for (String kw : allKeywords) {
            cleaned = cleaned.replaceAll("\\b" + Pattern.quote(kw.trim()) + "\\b", " ").trim();
        }

        // Remove common stopwords
        cleaned = cleaned.replaceAll("\\b(cheyyi|chesay|undi|undo|lo|ki|ni|nu|ga|ra|please|okay|ok|the|a|an|of|in|is|are)\\b", "").trim();

        // Remove punctuation
        cleaned = cleaned.replaceAll("[?!.,;:]", "").trim();

        // Collapse spaces and capitalize first letter of each word
        String[] words = cleaned.split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String w : words) {
            if (!w.isBlank()) {
                sb.append(Character.toUpperCase(w.charAt(0))).append(w.substring(1)).append(" ");
            }
        }

        String result = sb.toString().trim();
        return result.isEmpty() ? null : result;
    }

    private ParsedCommand unknownCommand(String text, String error) {
        ParsedCommand cmd = new ParsedCommand();
        cmd.setIntent(ParsedCommand.Intent.UNKNOWN);
        cmd.setOriginalText(text);
        cmd.setErrorMessage(error);
        return cmd;
    }
}
