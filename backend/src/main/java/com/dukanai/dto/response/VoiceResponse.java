package com.dukanai.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VoiceResponse {
    private String intent;
    private String product;
    private BigDecimal quantity;
    private String unit;
    private String originalText;
    private boolean executed;
    private StockUpdateResponse stockUpdate;
    private String responseText;
    private String errorCode;
}
