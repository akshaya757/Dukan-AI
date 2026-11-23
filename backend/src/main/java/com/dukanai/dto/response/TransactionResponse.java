package com.dukanai.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String unit;
    private BigDecimal quantity;
    private String operation;
    private String source;
    private BigDecimal previousStock;
    private BigDecimal newStock;
    private String notes;
    private LocalDateTime createdAt;
}
