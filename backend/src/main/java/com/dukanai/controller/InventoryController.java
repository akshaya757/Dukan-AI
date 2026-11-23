package com.dukanai.controller;

import com.dukanai.dto.request.StockUpdateRequest;
import com.dukanai.dto.response.ApiResponse;
import com.dukanai.dto.response.DashboardResponse;
import com.dukanai.dto.response.ProductResponse;
import com.dukanai.dto.response.StockUpdateResponse;
import com.dukanai.dto.response.TransactionResponse;
import com.dukanai.service.InventoryService;
import com.dukanai.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;
    private final ProductService productService;

    @Autowired
    public InventoryController(InventoryService inventoryService, ProductService productService) {
        this.inventoryService = inventoryService;
        this.productService = productService;
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<StockUpdateResponse>> addStock(
            @Valid @RequestBody StockUpdateRequest request) {
        StockUpdateResponse result = inventoryService.addStock(
            request.getProductId(), request.getQuantity(),
            request.getSource() != null ? request.getSource() : "MANUAL",
            request.getNotes()
        );
        return ResponseEntity.ok(ApiResponse.success("Stock added successfully", result));
    }

    @PostMapping("/remove")
    public ResponseEntity<ApiResponse<StockUpdateResponse>> removeStock(
            @Valid @RequestBody StockUpdateRequest request) {
        StockUpdateResponse result = inventoryService.removeStock(
            request.getProductId(), request.getQuantity(),
            request.getSource() != null ? request.getSource() : "MANUAL",
            request.getNotes()
        );
        return ResponseEntity.ok(ApiResponse.success("Stock removed successfully", result));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getLowStock() {
        return ResponseEntity.ok(
                ApiResponse.success("Low stock products retrieved", productService.getLowStockProducts()));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getTransactions(
            @RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(
                ApiResponse.success(inventoryService.getAllTransactions(limit)));
    }

    @GetMapping("/transactions/{productId}")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getProductTransactions(
            @PathVariable Long productId) {
        return ResponseEntity.ok(
                ApiResponse.success(inventoryService.getTransactionsByProduct(productId)));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        return ResponseEntity.ok(
                ApiResponse.success(inventoryService.getDashboardStats()));
    }
}
