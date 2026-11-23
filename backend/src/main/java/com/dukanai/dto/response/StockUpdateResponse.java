package com.dukanai.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockUpdateResponse {
    private String product;
    private String unit;
    private BigDecimal quantity;
    private BigDecimal previousStock;
    private BigDecimal newStock;
    private String operation;
    private boolean lowStock;
    private String message;
}
