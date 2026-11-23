package com.dukanai.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private String category;
    private String unit;
    private BigDecimal currentStock;
    private BigDecimal minimumStock;
    private BigDecimal price;
    private boolean lowStock;
    private Long userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
