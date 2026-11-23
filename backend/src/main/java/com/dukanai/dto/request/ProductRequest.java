package com.dukanai.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductRequest {

    @NotBlank(message = "Product name is required")
    private String name;

    private String category;

    @NotBlank(message = "Unit is required")
    private String unit;

    @NotNull(message = "Current stock is required")
    @DecimalMin(value = "0.0", message = "Current stock cannot be negative")
    private BigDecimal currentStock = BigDecimal.ZERO;

    @NotNull(message = "Minimum stock is required")
    @DecimalMin(value = "0.0", message = "Minimum stock cannot be negative")
    private BigDecimal minimumStock = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "Price cannot be negative")
    private BigDecimal price;

    private Long userId = 1L; // Default user for MVP
}
