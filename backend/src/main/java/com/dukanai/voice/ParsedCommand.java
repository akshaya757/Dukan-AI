package com.dukanai.voice;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

/**
 * Represents a parsed voice command.
 * Intent + extracted entities.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParsedCommand {

    public enum Intent {
        ADD_STOCK,
        REMOVE_STOCK,
        CHECK_STOCK,
        LOW_STOCK,
        UNKNOWN
    }

    private Intent intent;
    private String product;
    private BigDecimal quantity;
    private String unit;
    private String originalText;
    private String errorMessage;

    public boolean isValid() {
        if (intent == null || intent == Intent.UNKNOWN) return false;
        if (intent == Intent.LOW_STOCK) return true;
        if (intent == Intent.CHECK_STOCK) return product != null && !product.isBlank();
        return product != null && !product.isBlank() && quantity != null && quantity.compareTo(BigDecimal.ZERO) > 0;
    }
}
