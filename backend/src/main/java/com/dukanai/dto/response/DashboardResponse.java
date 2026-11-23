package com.dukanai.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private long totalProducts;
    private long lowStockCount;
    private long stockInCount;
    private long stockOutCount;
    private String shopName;
}
