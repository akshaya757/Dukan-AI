package com.dukanai.service;

import com.dukanai.dto.response.DashboardResponse;
import com.dukanai.dto.response.StockUpdateResponse;
import com.dukanai.dto.response.TransactionResponse;
import com.dukanai.entity.InventoryTransaction;
import com.dukanai.entity.Product;
import com.dukanai.exception.InsufficientStockException;
import com.dukanai.exception.ProductNotFoundException;
import com.dukanai.repository.InventoryTransactionRepository;
import com.dukanai.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventoryService {

    private static final Logger log = LoggerFactory.getLogger(InventoryService.class);

    private final ProductRepository productRepository;
    private final InventoryTransactionRepository transactionRepository;

    @Autowired
    public InventoryService(ProductRepository productRepository,
                            InventoryTransactionRepository transactionRepository) {
        this.productRepository = productRepository;
        this.transactionRepository = transactionRepository;
    }

    /**
     * Add stock to a product. Creates a transaction record atomically.
     */
    @Transactional
    public StockUpdateResponse addStock(Long productId, BigDecimal quantity, String source, String notes) {
        validateQuantity(quantity);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));

        BigDecimal previousStock = product.getCurrentStock();
        BigDecimal newStock = previousStock.add(quantity);

        product.setCurrentStock(newStock);
        productRepository.save(product);

        // Record transaction
        InventoryTransaction tx = new InventoryTransaction();
        tx.setProduct(product);
        tx.setQuantity(quantity);
        tx.setOperation(InventoryTransaction.Operation.ADD);
        tx.setSource(InventoryTransaction.Source.valueOf(source.toUpperCase()));
        tx.setPreviousStock(previousStock);
        tx.setNewStock(newStock);
        tx.setNotes(notes);
        transactionRepository.save(tx);

        log.info("Stock ADD: {} {} {} → {}", product.getName(), previousStock, quantity, newStock);

        return buildStockUpdateResponse(product, quantity, previousStock, newStock, "ADD");
    }

    /**
     * Remove stock from a product. Validates sufficient stock. Atomic with transaction record.
     */
    @Transactional
    public StockUpdateResponse removeStock(Long productId, BigDecimal quantity, String source, String notes) {
        validateQuantity(quantity);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));

        BigDecimal previousStock = product.getCurrentStock();

        if (previousStock.compareTo(quantity) < 0) {
            throw new InsufficientStockException(
                String.format("Only %.2f %s of %s is available. Cannot remove %.2f %s.",
                    previousStock, product.getUnit(), product.getName(),
                    quantity, product.getUnit())
            );
        }

        BigDecimal newStock = previousStock.subtract(quantity);
        product.setCurrentStock(newStock);
        productRepository.save(product);

        // Record transaction
        InventoryTransaction tx = new InventoryTransaction();
        tx.setProduct(product);
        tx.setQuantity(quantity);
        tx.setOperation(InventoryTransaction.Operation.REMOVE);
        tx.setSource(InventoryTransaction.Source.valueOf(source.toUpperCase()));
        tx.setPreviousStock(previousStock);
        tx.setNewStock(newStock);
        tx.setNotes(notes);
        transactionRepository.save(tx);

        log.info("Stock REMOVE: {} {} − {} → {}", product.getName(), previousStock, quantity, newStock);

        return buildStockUpdateResponse(product, quantity, previousStock, newStock, "REMOVE");
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getAllTransactions(int limit) {
        return transactionRepository.findRecentTransactions(PageRequest.of(0, limit))
                .stream()
                .map(this::toTransactionResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactionsByProduct(Long productId) {
        return transactionRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream()
                .map(this::toTransactionResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboardStats() {
        long totalProducts = productRepository.count();
        long lowStockCount = productRepository.countLowStock();
        long stockIn = transactionRepository.countStockIn();
        long stockOut = transactionRepository.countStockOut();

        return new DashboardResponse(totalProducts, lowStockCount, stockIn, stockOut,
                "Sri Lakshmi General Store");
    }

    private void validateQuantity(BigDecimal quantity) {
        if (quantity == null || quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero.");
        }
    }

    private StockUpdateResponse buildStockUpdateResponse(Product product, BigDecimal quantity,
            BigDecimal previousStock, BigDecimal newStock, String operation) {
        String message;
        if ("ADD".equals(operation)) {
            message = String.format("%s stock is now %.2f %s.", product.getName(), newStock, product.getUnit());
        } else {
            message = String.format("%s stock updated to %.2f %s.", product.getName(), newStock, product.getUnit());
        }

        return new StockUpdateResponse(
            product.getName(), product.getUnit(), quantity,
            previousStock, newStock, operation, product.isLowStock(), message
        );
    }

    private TransactionResponse toTransactionResponse(InventoryTransaction tx) {
        TransactionResponse resp = new TransactionResponse();
        resp.setId(tx.getId());
        resp.setProductId(tx.getProduct().getId());
        resp.setProductName(tx.getProduct().getName());
        resp.setUnit(tx.getProduct().getUnit());
        resp.setQuantity(tx.getQuantity());
        resp.setOperation(tx.getOperation().name());
        resp.setSource(tx.getSource().name());
        resp.setPreviousStock(tx.getPreviousStock());
        resp.setNewStock(tx.getNewStock());
        resp.setNotes(tx.getNotes());
        resp.setCreatedAt(tx.getCreatedAt());
        return resp;
    }
}
